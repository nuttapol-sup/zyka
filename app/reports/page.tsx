"use client";

import { getApiPath } from "@/app/utils/apiPath";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Calendar,
  RefreshCw,
  Printer,
  Users,
  Clock,
  Activity,
  Search,
  Filter,
  CheckCircle2,
  PieChart as PieIcon,
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  FileSpreadsheet,
  XCircle,
  Truck,
  ArrowUpRight,
  ShoppingBag,
  BarChart3,
  UserCheck,
} from "lucide-react";
import SalesDashboardCharts from "@/app/components/SalesDashboardCharts";

interface SalesSummary {
  totalSales: number;
  paidSales: number;
  pendingSales: number;
  totalOrdersCount: number;
  paidOrdersCount: number;
  pendingOrdersCount: number;
  cancelledOrdersCount: number;
}

interface CustomerSales {
  customerName: string;
  taxId?: string;
  totalOrders: number;
  paidAmount: number;
  pendingAmount: number;
  grandTotal: number;
  orders?: {
    _id: string;
    orderNo: string;
    orderDate: string;
    deliveryStatus: string;
    paymentStatus: string;
    grandTotal: number;
    itemsCount: number;
  }[];
  purchasedProducts?: {
    code: string;
    name: string;
    unit: string;
    totalQty: number;
    totalAmount: number;
  }[];
}

interface ProductSales {
  code: string;
  name: string;
  unit: string;
  totalQty: number;
  totalAmount: number;
}

interface SalespersonSales {
  salespersonName: string;
  totalOrders: number;
  paidAmount: number;
  pendingAmount: number;
  totalSales: number;
  orders?: {
    _id: string;
    orderNo: string;
    customerName: string;
    orderDate: string;
    grandTotal: number;
    paymentStatus: string;
  }[];
}

interface OrderReportItem {
  _id: string;
  orderNo: string;
  orderDate: string;
  billingDate?: string;
  customerName: string;
  customerPhone?: string;
  deliveryStatus: string;
  paymentStatus: string;
  grandTotal: number;
  createdByName?: string;
}

interface UserSummary {
  username: string;
  name: string;
  role: string;
  sessionCount: number;
  topPage: string;
  lastLogin: string;
  lastActive: string;
  isOnline: boolean;
}

interface LogItem {
  _id: string;
  username: string;
  name: string;
  role: string;
  currentPath: string;
  status: string;
  loginTime: string;
  lastActive: string;
}

interface DailySales {
  date: string;
  total: number;
  paid: number;
  pending: number;
}

function ReportsPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"sales" | "charts" | "customer" | "product" | "salesperson" | "user">("sales");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const res = await fetch(getApiPath("/api/auth/me"), { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserSession();
  }, []);

  const isTabAllowed = (tabKey: string) => {
    if (!currentUser) return true;
    if (currentUser.role === "admin") return true;
    if (!Array.isArray(currentUser.allowedPages)) return false;

    if (currentUser.allowedPages.includes("/reports")) return true;
    return currentUser.allowedPages.includes(`/reports?tab=${tabKey}`);
  };

  useEffect(() => {
    if (tabParam === "charts" || tabParam === "customer" || tabParam === "product" || tabParam === "salesperson" || tabParam === "user" || tabParam === "sales") {
      if (tabParam === "user" && currentUser && !isTabAllowed("user")) {
        setActiveTab("sales");
      } else {
        setActiveTab(tabParam as any);
      }
    }
  }, [tabParam, currentUser]);
  const [preset, setPreset] = useState<"7days" | "this_week" | "this_month" | "30days" | "this_year" | "custom">("7days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCustomerName, setExpandedCustomerName] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // Sales Report State
  const [dateRange, setDateRange] = useState({ preset: "7days", startDate: "", endDate: "" });
  const [salesSummary, setSalesSummary] = useState<SalesSummary>({
    totalSales: 0,
    paidSales: 0,
    pendingSales: 0,
    totalOrdersCount: 0,
    paidOrdersCount: 0,
    pendingOrdersCount: 0,
    cancelledOrdersCount: 0,
  });
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [customerSales, setCustomerSales] = useState<CustomerSales[]>([]);
  const [productSales, setProductSales] = useState<ProductSales[]>([]);
  const [salespersonSales, setSalespersonSales] = useState<SalespersonSales[]>([]);
  const [ordersList, setOrdersList] = useState<OrderReportItem[]>([]);

  // User Usage State
  const [userSummaries, setUserSummaries] = useState<UserSummary[]>([]);
  const [userLogs, setUserLogs] = useState<LogItem[]>([]);

  const printRef = useRef<HTMLDivElement>(null);

  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("preset", preset);
      if (preset === "custom") {
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
      }
      if (paymentStatusFilter !== "all") {
        params.append("paymentStatus", paymentStatusFilter);
      }

      const res = await fetch(getApiPath(`/api/reports/sales?${params.toString()}`), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setDateRange(data.dateRange || {});
        setSalesSummary(data.summary || {});
        setDailySales(data.dailySales || []);
        setCustomerSales(data.customerSales || []);
        setProductSales(data.productSales || []);
        setSalespersonSales(data.salespersonSales || []);
        setOrdersList(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserUsageReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiPath(`/api/reports/user-usage?preset=${preset}`), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUserSummaries(data.userSummaries || []);
        setUserLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "user") {
      if (currentUser && !isTabAllowed("user")) {
        setActiveTab("sales");
        return;
      }
      fetchUserUsageReport();
    } else {
      fetchSalesReport();
    }
  }, [activeTab, preset, paymentStatusFilter, currentUser]);

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPreset("custom");
    if (activeTab === "user") {
      fetchUserUsageReport();
    } else {
      fetchSalesReport();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Percent Calculations
  const totalMoney = salesSummary.totalSales || 1;
  const paidPercent = Math.round((salesSummary.paidSales / totalMoney) * 100);
  const pendingPercent = Math.round((salesSummary.pendingSales / totalMoney) * 100);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f3efe6] flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#98c9a3]" />
            รายงานและสรุปภาพรวม (Reports & Analytics)
          </h1>
          <p className="text-xs sm:text-sm text-[#a39b8b] mt-1">
            สรุปยอดขาย แยกตามสัปดาห์/เดือน ช่วงวันที่ และติดตามสถานะการเก็บเงิน
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="btn-earth-primary px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 self-start md:self-auto shadow-lg print:hidden transition-all hover:scale-105"
          title="กดเพื่อส่งพิมพ์ หรือ เลือกบันทึกเป็นไฟล์ PDF (Save as PDF)"
        >
          <Printer className="w-4 h-4" />
          <span>📄 บันทึกเป็น PDF / พิมพ์รายงาน (Print & Export PDF)</span>
        </button>
      </div>

      {/* Period & Filter Control Bar (Print Hidden) */}
      <div className="glass-earth-card p-4 sm:p-5 rounded-3xl border border-[#2d4734] space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#e6dfd3] flex items-center gap-1.5 mr-1">
              <Calendar className="w-3.5 h-3.5 text-[#98c9a3]" />
              ช่วงเวลา:
            </span>

            <button
              onClick={() => setPreset("7days")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                preset === "7days"
                  ? "bg-[#98c9a3] text-[#0f1712] font-bold"
                  : "bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734]"
              }`}
            >
              รายสัปดาห์ (7 วัน)
            </button>

            <button
              onClick={() => setPreset("this_week")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                preset === "this_week"
                  ? "bg-[#98c9a3] text-[#0f1712] font-bold"
                  : "bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734]"
              }`}
            >
              สัปดาห์นี้
            </button>

            <button
              onClick={() => setPreset("this_month")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                preset === "this_month"
                  ? "bg-[#98c9a3] text-[#0f1712] font-bold"
                  : "bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734]"
              }`}
            >
              เดือนนี้
            </button>

            <button
              onClick={() => setPreset("30days")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                preset === "30days"
                  ? "bg-[#98c9a3] text-[#0f1712] font-bold"
                  : "bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734]"
              }`}
            >
              รายเดือน (30 วัน)
            </button>

            <button
              onClick={() => setPreset("this_year")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                preset === "this_year"
                  ? "bg-[#98c9a3] text-[#0f1712] font-bold"
                  : "bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734]"
              }`}
            >
              ปีนี้
            </button>

            <button
              onClick={() => setPreset("custom")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                preset === "custom"
                  ? "bg-[#98c9a3] text-[#0f1712] font-bold"
                  : "bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734]"
              }`}
            >
              ระบุช่วงวันที่เอง
            </button>
          </div>

          {/* Payment Status Selector */}
          {activeTab !== "user" && (
            <div className="flex items-center gap-2 text-xs text-[#a39b8b]">
              <Filter className="w-3.5 h-3.5 text-[#98c9a3]" />
              <span className="font-semibold text-[#e6dfd3]">สถานะชำระ:</span>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="bg-[#121c15] text-[#f3efe6] text-xs px-3 py-1.5 rounded-xl border border-[#2d4734] focus:outline-none focus:border-[#98c9a3]"
              >
                <option value="all">ทุกสถานะชำระเงิน</option>
                <option value="PAID">🟢 เก็บเงินแล้ว (PAID)</option>
                <option value="PENDING_COLLECTION">⏳ รอเก็บเงิน / รอวางบิล (Pending Collection)</option>
                <option value="UNPAID">รอวางบิล / รอชำระ (UNPAID)</option>
                <option value="BILLED">วางบิลแล้ว (BILLED)</option>
                <option value="OVERDUE">เกินกำหนดชำระ (OVERDUE)</option>
              </select>
            </div>
          )}
        </div>

        {/* Custom Date Form */}
        {preset === "custom" && (
          <form onSubmit={handleCustomDateSubmit} className="pt-3 border-t border-[#2d4734]/60 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#a39b8b]">จากวันที่:</span>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#a39b8b]">ถึงวันที่:</span>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6]"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#1e3425] text-[#98c9a3] border border-[#98c9a3]/40 text-xs font-bold flex items-center gap-1.5 hover:bg-[#284532]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>ค้นหาช่วงวันที่</span>
            </button>
          </form>
        )}
      </div>

      {/* PRINT AREA CONTAINER */}
      <div ref={printRef} className="space-y-6 print:text-black">
        {/* Print Only Title Header */}
        <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-black uppercase">รายงานสรุปยอดขายและการชำระเงิน</h1>
              <p className="text-xs text-gray-600 mt-1">
                ช่วงเวลาข้อมูล: {dateRange.startDate} ถึง {dateRange.endDate} (พรีเซ็ต: {dateRange.preset})
              </p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>วันที่พิมพ์: {new Date().toLocaleDateString("th-TH")}</p>
              <p>ผู้ออกรายงาน: Admin</p>
            </div>
          </div>
        </div>

        {/* FINANCIAL SUMMARY KPI CARDS */}
        {activeTab !== "user" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sales */}
            <div className="glass-earth-card p-5 rounded-3xl border border-[#2d4734] relative overflow-hidden print:bg-white print:border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#a39b8b] uppercase print:text-gray-600">ยอดขายรวมสุทธิ</p>
                  <h3 className="text-2xl font-extrabold text-[#f3efe6] mt-1 font-mono print:text-black">
                    ฿{salesSummary.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3] print:hidden">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-[#a39b8b] mt-3 print:text-gray-500">
                รวม {salesSummary.totalOrdersCount} คำสั่งซื้อในระบบ
              </p>
            </div>

            {/* Collected / Paid Sales */}
            <div className="glass-earth-card p-5 rounded-3xl border border-emerald-800/40 bg-emerald-950/20 relative overflow-hidden print:bg-white print:border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-400 uppercase print:text-gray-600">🟢 เก็บเงินแล้ว (Paid)</p>
                  <h3 className="text-2xl font-extrabold text-emerald-300 mt-1 font-mono print:text-black">
                    ฿{salesSummary.paidSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-900/40 border border-emerald-600/40 flex items-center justify-center text-emerald-300 print:hidden">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-emerald-400/80 mt-3 print:text-gray-500">
                คิดเป็น {paidPercent}% ({salesSummary.paidOrdersCount} คำสั่งซื้อ)
              </p>
            </div>

            {/* Pending Collection Sales */}
            <div className="glass-earth-card p-5 rounded-3xl border border-amber-800/40 bg-amber-950/20 relative overflow-hidden print:bg-white print:border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-400 uppercase print:text-gray-600">⏳ รอเก็บเงิน (Pending)</p>
                  <h3 className="text-2xl font-extrabold text-amber-300 mt-1 font-mono print:text-black">
                    ฿{salesSummary.pendingSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-900/40 border border-amber-600/40 flex items-center justify-center text-amber-300 print:hidden">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-amber-400/80 mt-3 print:text-gray-500">
                คิดเป็น {pendingPercent}% ({salesSummary.pendingOrdersCount} คำสั่งซื้อ)
              </p>
            </div>

            {/* Orders Breakdown */}
            <div className="glass-earth-card p-5 rounded-3xl border border-[#2d4734] relative overflow-hidden print:bg-white print:border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#a39b8b] uppercase print:text-gray-600">จำนวนรายการสั่งซื้อ</p>
                  <h3 className="text-2xl font-extrabold text-[#f3efe6] mt-1 font-mono print:text-black">
                    {salesSummary.totalOrdersCount} <span className="text-xs font-normal">รายการ</span>
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3] print:hidden">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-[#a39b8b] mt-3 print:text-gray-500">
                ยกเลิก: {salesSummary.cancelledOrdersCount} รายการ
              </p>
            </div>
          </div>
        )}

        {/* TAB: VISUAL SALES CHARTS */}
        {activeTab === "charts" && <SalesDashboardCharts />}

        {/* TAB 1: SALES SUMMARY & ORDERS LIST */}
        {activeTab === "sales" && (
          <div className="space-y-6">
            {/* Visual Payment Collection Ratio Progress Bar */}
            <div className="glass-earth-card p-6 rounded-3xl border border-[#2d4734] space-y-3 print:hidden">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#f3efe6]">สัดส่วนการชำระเงิน (Collected vs Pending Collection)</span>
                <span className="text-[#a39b8b] font-mono">
                  เก็บเงินแล้ว: {paidPercent}% | รอเก็บเงิน: {pendingPercent}%
                </span>
              </div>
              <div className="w-full h-4 rounded-full bg-[#121c15] border border-[#2d4734] overflow-hidden flex">
                <div
                  style={{ width: `${paidPercent}%` }}
                  className="h-full bg-emerald-500 transition-all duration-500"
                  title={`เก็บเงินแล้ว: ${paidPercent}%`}
                />
                <div
                  style={{ width: `${pendingPercent}%` }}
                  className="h-full bg-amber-500 transition-all duration-500"
                  title={`รอเก็บเงิน: ${pendingPercent}%`}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#a39b8b] pt-1">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  ชำระเงินแล้ว: ฿{salesSummary.paidSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  รอเก็บเงิน / วางบิล: ฿{salesSummary.pendingSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Orders Detailed Table */}
            <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734] print:border-black">
              <div className="p-4 sm:p-6 border-b border-[#2d4734] flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border-black">
                <div>
                  <h3 className="text-lg font-bold text-[#f3efe6] print:text-black">
                    รายการคำสั่งซื้อในช่วงเวลา ({ordersList.length} รายการ)
                  </h3>
                  <p className="text-xs text-[#a39b8b] print:text-gray-600">
                    แสดงสถานะการจัดส่งและการชำระเงินย่อยทุกคำสั่งซื้อ
                  </p>
                </div>

                <div className="relative print:hidden">
                  <Search className="w-4 h-4 text-[#a39b8b] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาเลขที่สั่งซื้อ / ลูกค้า..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-1.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse print:text-xs">
                  <thead>
                    <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase print:bg-gray-100 print:text-black print:border-black">
                      <th className="py-3.5 px-6">รหัสสั่งซื้อ / วันที่</th>
                      <th className="py-3.5 px-6">ชื่อลูกค้า</th>
                      <th className="py-3.5 px-4 text-center">สถานะจัดส่ง</th>
                      <th className="py-3.5 px-4 text-center">สถานะชำระเงิน</th>
                      <th className="py-3.5 px-6 text-right">ยอดเงินสุทธิ</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#2d4734]/50 text-sm print:divide-gray-300 print:text-black">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#a39b8b]">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#98c9a3]" />
                          กำลังโหลดข้อมูลรายงาน...
                        </td>
                      </tr>
                    ) : ordersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#a39b8b]">
                          ไม่พบรายการสั่งซื้อตามเงื่อนไข
                        </td>
                      </tr>
                    ) : (
                      ordersList
                        .filter(
                          (o) =>
                            o.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((o) => (
                          <tr key={o._id} className="hover:bg-[#18241c]/50 transition-colors">
                            <td className="py-3.5 px-6 font-mono text-xs">
                              <span className="font-bold text-[#98c9a3] print:text-black">{o.orderNo}</span>
                              <span className="text-[#a39b8b] block text-[11px] print:text-gray-600">
                                สั่งซื้อ: {new Date(o.orderDate).toLocaleDateString("th-TH")}
                              </span>
                              {o.billingDate && (
                                <span className="text-[#98c9a3] block text-[11px] print:text-gray-800 font-medium">
                                  วางบิล: {new Date(o.billingDate).toLocaleDateString("th-TH")}
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-6">
                              <span className="font-bold text-[#f3efe6] print:text-black">{o.customerName}</span>
                            </td>

                            <td className="py-3.5 px-4 text-center text-xs">
                              {o.deliveryStatus === "PENDING" ? (
                                <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-600/40 print:text-black">
                                  รอจัดส่ง
                                </span>
                              ) : o.deliveryStatus === "SHIPPED" ? (
                                <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-600/40 print:text-black">
                                  กำลังจัดส่ง
                                </span>
                              ) : o.deliveryStatus === "DELIVERED" ? (
                                <span className="px-2 py-0.5 rounded bg-[#1e3425] text-[#98c9a3] border border-[#98c9a3]/30 print:text-black">
                                  ส่งมอบสำเร็จ
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40 print:text-black">
                                  ยกเลิก
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-center text-xs">
                              {o.paymentStatus === "PAID" ? (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-600/40 print:text-black">
                                  🟢 เก็บเงินแล้ว (PAID)
                                </span>
                              ) : o.paymentStatus === "BILLED" ? (
                                <span className="px-2.5 py-1 rounded-full bg-blue-950/60 text-blue-300 font-bold border border-blue-600/40 print:text-black">
                                  ⏳ วางบิลแล้ว (BILLED)
                                </span>
                              ) : o.paymentStatus === "OVERDUE" ? (
                                <span className="px-2.5 py-1 rounded-full bg-red-950/60 text-red-300 font-bold border border-red-800/40 print:text-black">
                                  ⚠️ เกินกำหนด (OVERDUE)
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 font-bold border border-amber-600/40 print:text-black">
                                  ⏳ รอเก็บเงิน (UNPAID)
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-6 text-right font-mono font-bold text-[#98c9a3] print:text-black">
                              ฿{o.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SALES BY CUSTOMER & CORPORATE PURCHASE BREAKDOWN */}
        {activeTab === "customer" && (
          <div className="space-y-6">
            {/* KPI Summary Cards for Customer Orders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
              <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#a39b8b] font-medium block uppercase">
                    บริษัท / ลูกค้าทั้งหมดที่สั่งซื้อ
                  </span>
                  <span className="text-2xl font-extrabold text-[#f3efe6]">
                    {customerSales.length} <span className="text-xs font-normal text-[#a39b8b]">ราย</span>
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#a39b8b] font-medium block uppercase">
                    จำนวนบิลคำสั่งซื้อรวมทั้งหมด
                  </span>
                  <span className="text-2xl font-extrabold text-[#98c9a3] font-mono">
                    {customerSales.reduce((acc, c) => acc + c.totalOrders, 0)}{" "}
                    <span className="text-xs font-normal text-[#a39b8b]">บิล</span>
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>

              <div className="glass-earth-card p-5 rounded-2xl border border-[#98c9a3]/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#a39b8b] font-medium block uppercase">
                    ยอดซื้อรวมทุกบริษัทสุทธิ
                  </span>
                  <span className="text-2xl font-extrabold text-[#98c9a3] font-mono">
                    ฿{customerSales.reduce((acc, c) => acc + c.grandTotal, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Customers & Products Ordered Table */}
            <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734] print:border-black">
              <div className="p-4 sm:p-6 border-b border-[#2d4734] flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border-black">
                <div>
                  <h3 className="text-lg font-bold text-[#f3efe6] print:text-black">
                    สรุปการสั่งซื้อสินค้าแยกตามบริษัท / ลูกค้า (Corporate & Customer Orders)
                  </h3>
                  <p className="text-xs text-[#a39b8b] print:text-gray-600">
                    แสดงรายการสินค้าที่แต่ละบริษัทสั่งซื้อ จำนวนบิลทั้งหมด ยอดชำระ และยอดค้างชำระ
                  </p>
                </div>

                <div className="relative print:hidden">
                  <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อบริษัท / ลูกค้า / เลขผู้เสียภาษี..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse print:text-xs">
                  <thead>
                    <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase print:bg-gray-100 print:text-black">
                      <th className="py-3.5 px-6">#</th>
                      <th className="py-3.5 px-6">ชื่อบริษัท / ลูกค้า</th>
                      <th className="py-3.5 px-4 text-center">จำนวนบิล</th>
                      <th className="py-3.5 px-6 text-right">ยอดชำระแล้ว (PAID)</th>
                      <th className="py-3.5 px-6 text-right">ยอดรอเก็บเงิน (PENDING)</th>
                      <th className="py-3.5 px-6 text-right">ยอดซื้อรวมสุทธิ</th>
                      <th className="py-3.5 px-6 text-center print:hidden">ดูรายละเอียดสินค้า & บิล</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#2d4734]/50 text-sm print:divide-gray-300 print:text-black">
                    {customerSales.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#a39b8b]">
                          ไม่พบข้อมูลสรุปการสั่งซื้อของลูกค้า
                        </td>
                      </tr>
                    ) : (
                      customerSales
                        .filter((c) => {
                          if (!searchTerm) return true;
                          const q = searchTerm.toLowerCase();
                          return (
                            c.customerName.toLowerCase().includes(q) ||
                            (c.taxId && c.taxId.toLowerCase().includes(q))
                          );
                        })
                        .map((c, i) => {
                          const isExpanded = expandedCustomerName === c.customerName;

                          return (
                            <React.Fragment key={i}>
                              <tr className="hover:bg-[#18241c]/50 transition-colors">
                                <td className="py-3.5 px-6 font-mono text-xs text-[#a39b8b] print:text-black">{i + 1}</td>
                                <td className="py-3.5 px-6">
                                  <span className="font-bold text-[#f3efe6] block print:text-black">{c.customerName}</span>
                                  {c.taxId && (
                                    <span className="text-[11px] text-[#a39b8b] font-mono block">
                                      เลขผู้เสียภาษี: {c.taxId}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-center font-mono">
                                  <span className="px-3 py-1 rounded-xl bg-[#1e3425] text-[#98c9a3] font-bold text-xs border border-[#98c9a3]/30 inline-block">
                                    {c.totalOrders} บิล
                                  </span>
                                </td>
                                <td className="py-3.5 px-6 text-right font-mono text-emerald-400 print:text-black">
                                  ฿{c.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3.5 px-6 text-right font-mono text-amber-400 print:text-black">
                                  ฿{c.pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3.5 px-6 text-right font-mono font-extrabold text-[#98c9a3] print:text-black">
                                  ฿{c.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3.5 px-6 text-center print:hidden">
                                  <button
                                    onClick={() => setExpandedCustomerName(isExpanded ? null : c.customerName)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                      isExpanded
                                        ? "bg-[#98c9a3] text-[#0f1712] border-[#98c9a3]"
                                        : "bg-[#121c15] text-[#98c9a3] border-[#2d4734] hover:bg-[#1c2d22]"
                                    }`}
                                  >
                                    {isExpanded ? "▲ ซ่อนรายละเอียด" : "▼ ดูรายการสินค้า & บิล"}
                                  </button>
                                </td>
                              </tr>

                              {/* Expanded Panel for Purchased Products & Bills */}
                              {isExpanded && (
                                <tr>
                                  <td colSpan={7} className="p-4 bg-[#0f1712]/80 border-y border-[#2d4734] print:hidden">
                                    <div className="space-y-6 p-4 rounded-2xl bg-[#121c15] border border-[#2d4734]">
                                      {/* Sub-header */}
                                      <div className="flex items-center justify-between border-b border-[#2d4734] pb-3">
                                        <div className="flex items-center gap-2">
                                          <Package className="w-5 h-5 text-[#98c9a3]" />
                                          <h4 className="text-sm font-bold text-[#f3efe6]">
                                            ประวัติสินค้าที่สั่งซื้อและรายการบิลของ "{c.customerName}"
                                          </h4>
                                        </div>
                                        <span className="text-xs text-[#a39b8b]">
                                          รวมทั้งหมด {c.totalOrders} บิล | {c.purchasedProducts?.length || 0} รายการสินค้า
                                        </span>
                                      </div>

                                      {/* Section 1: Purchased Products Summary */}
                                      <div className="space-y-2">
                                        <h5 className="text-xs font-bold text-[#98c9a3] uppercase flex items-center gap-1.5">
                                          <Package className="w-3.5 h-3.5" />
                                          1. สรุปรายการสินค้าที่เคยสั่งซื้อทั้งหมด (Purchased Items Summary)
                                        </h5>
                                        {c.purchasedProducts && c.purchasedProducts.length > 0 ? (
                                          <div className="overflow-x-auto rounded-xl border border-[#2d4734]">
                                            <table className="w-full text-left text-xs">
                                              <thead className="bg-[#18241c] text-[#a39b8b] font-semibold border-b border-[#2d4734]">
                                                <tr>
                                                  <th className="py-2.5 px-4">รหัสสินค้า</th>
                                                  <th className="py-2.5 px-4">ชื่อสินค้า</th>
                                                  <th className="py-2.5 px-4 text-center">จำนวนที่สั่งรวม</th>
                                                  <th className="py-2.5 px-4 text-center">หน่วยนับ</th>
                                                  <th className="py-2.5 px-4 text-right">มูลค่ารวม (บาท)</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-[#2d4734]/50">
                                                {c.purchasedProducts.map((p, pIdx) => (
                                                  <tr key={pIdx} className="hover:bg-[#1e3425]/40">
                                                    <td className="py-2 px-4 font-mono text-[#98c9a3] font-bold">{p.code}</td>
                                                    <td className="py-2 px-4 text-[#f3efe6] font-semibold">{p.name}</td>
                                                    <td className="py-2 px-4 text-center font-mono font-bold text-[#f3efe6]">
                                                      {p.totalQty.toLocaleString()}
                                                    </td>
                                                    <td className="py-2 px-4 text-center text-[#a39b8b]">{p.unit}</td>
                                                    <td className="py-2 px-4 text-right font-mono font-bold text-[#98c9a3]">
                                                      ฿{p.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        ) : (
                                          <p className="text-xs text-[#a39b8b] italic">ไม่มีข้อมูลสินค้า</p>
                                        )}
                                      </div>

                                      {/* Section 2: Bills / Orders List */}
                                      <div className="space-y-2 pt-2">
                                        <h5 className="text-xs font-bold text-[#98c9a3] uppercase flex items-center gap-1.5">
                                          <ShoppingBag className="w-3.5 h-3.5" />
                                          2. รายการบิลคำสั่งซื้อทั้งหมด ({c.orders?.length || 0} บิล)
                                        </h5>
                                        {c.orders && c.orders.length > 0 ? (
                                          <div className="overflow-x-auto rounded-xl border border-[#2d4734]">
                                            <table className="w-full text-left text-xs">
                                              <thead className="bg-[#18241c] text-[#a39b8b] font-semibold border-b border-[#2d4734]">
                                                <tr>
                                                  <th className="py-2.5 px-4">เลขที่สั่งซื้อ (Order No)</th>
                                                  <th className="py-2.5 px-4">วันที่สั่งซื้อ</th>
                                                  <th className="py-2.5 px-4 text-center">สถานะจัดส่ง</th>
                                                  <th className="py-2.5 px-4 text-center">สถานะชำระเงิน</th>
                                                  <th className="py-2.5 px-4 text-right">ยอดเงินรวมสุทธิ</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-[#2d4734]/50">
                                                {c.orders.map((o, oIdx) => (
                                                  <tr key={oIdx} className="hover:bg-[#1e3425]/40">
                                                    <td className="py-2 px-4 font-mono font-bold text-[#98c9a3]">
                                                      {o.orderNo}
                                                    </td>
                                                    <td className="py-2 px-4 text-[#e6dfd3]">
                                                      {new Date(o.orderDate).toLocaleDateString("th-TH")}
                                                    </td>
                                                    <td className="py-2 px-4 text-center">
                                                      {o.deliveryStatus === "DELIVERED" ? (
                                                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-600/40 text-[10px]">
                                                          ส่งมอบสำเร็จ
                                                        </span>
                                                      ) : o.deliveryStatus === "SHIPPED" ? (
                                                        <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 font-bold border border-blue-600/40 text-[10px]">
                                                          กำลังจัดส่ง
                                                        </span>
                                                      ) : (
                                                        <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 font-bold border border-amber-600/40 text-[10px]">
                                                          รอจัดส่ง
                                                        </span>
                                                      )}
                                                    </td>
                                                    <td className="py-2 px-4 text-center">
                                                      {o.paymentStatus === "PAID" ? (
                                                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-600/40 text-[10px]">
                                                          ชำระเงินแล้ว
                                                        </span>
                                                      ) : o.paymentStatus === "BILLED" ? (
                                                        <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 font-bold border border-blue-600/40 text-[10px]">
                                                          วางบิลแล้ว
                                                        </span>
                                                      ) : (
                                                        <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 font-bold border border-amber-600/40 text-[10px]">
                                                          รอชำระเงิน
                                                        </span>
                                                      )}
                                                    </td>
                                                    <td className="py-2 px-4 text-right font-mono font-bold text-[#98c9a3]">
                                                      ฿{o.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        ) : (
                                          <p className="text-xs text-[#a39b8b] italic">ไม่มีรายการบิล</p>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SALES BY PRODUCT */}
        {activeTab === "product" && (
          <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734] print:border-black">
            <div className="p-4 sm:p-6 border-b border-[#2d4734] print:border-black">
              <h3 className="text-lg font-bold text-[#f3efe6] print:text-black">
                สรุปยอดขายแยกตามรายการสินค้า (Sales by Product)
              </h3>
              <p className="text-xs text-[#a39b8b] print:text-gray-600">
                แสดงจำนวนยอดขายรวมและมูลค่าขายของสินค้าแต่ละรายการ
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse print:text-xs">
                <thead>
                  <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase print:bg-gray-100 print:text-black">
                    <th className="py-3.5 px-6">รหัสสินค้า</th>
                    <th className="py-3.5 px-6">ชื่อสินค้า</th>
                    <th className="py-3.5 px-4 text-center">หน่วยนับ</th>
                    <th className="py-3.5 px-4 text-center">จำนวนขายรวม</th>
                    <th className="py-3.5 px-6 text-right">มูลค่าขายรวม (บาท)</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#2d4734]/50 text-sm print:divide-gray-300 print:text-black">
                  {productSales.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#a39b8b]">
                        ไม่พบข้อมูลสรุปยอดขายสินค้า
                      </td>
                    </tr>
                  ) : (
                    productSales.map((p, i) => (
                      <tr key={i} className="hover:bg-[#18241c]/50 transition-colors">
                        <td className="py-3.5 px-6 font-mono text-xs font-bold text-[#98c9a3] print:text-black">{p.code}</td>
                        <td className="py-3.5 px-6 font-bold text-[#f3efe6] print:text-black">{p.name}</td>
                        <td className="py-3.5 px-4 text-center text-xs text-[#a39b8b] print:text-black">{p.unit}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-[#f3efe6] print:text-black">
                          {p.totalQty.toLocaleString()} {p.unit}
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono font-extrabold text-[#98c9a3] print:text-black">
                          ฿{p.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: SALESPERSON SALES SUMMARY REPORT */}
        {activeTab === "salesperson" && (
          <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734] print:border-black">
            <div className="p-4 sm:p-6 border-b border-[#2d4734] flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border-black">
              <div>
                <h3 className="text-lg font-bold text-[#f3efe6] print:text-black">
                  รายงานสรุปยอดขายแยกตามเซล / พนักงานขาย (Salesperson Performance Report)
                </h3>
                <p className="text-xs text-[#a39b8b] print:text-gray-600">
                  แสดงยอดขายรวม จำนวนคำสั่งซื้อ ยอดชำระแล้ว และยอดค้างชำระของพนักงานขายแต่ละคน
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse print:text-xs">
                <thead>
                  <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase print:bg-gray-100 print:text-black">
                    <th className="py-3.5 px-6">#</th>
                    <th className="py-3.5 px-6">พนักงานขาย (SALE)</th>
                    <th className="py-3.5 px-4 text-center">จำนวนคำสั่งซื้อ</th>
                    <th className="py-3.5 px-6 text-right">ยอดชำระแล้ว (PAID)</th>
                    <th className="py-3.5 px-6 text-right">ยอดรอเก็บเงิน (PENDING)</th>
                    <th className="py-3.5 px-6 text-right">ยอดขายรวมสุทธิ</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#2d4734]/50 text-sm print:divide-gray-300 print:text-black">
                  {salespersonSales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#a39b8b]">
                        ไม่พบข้อมูลสรุปยอดขายของพนักงานขาย
                      </td>
                    </tr>
                  ) : (
                    salespersonSales.map((sp, i) => (
                      <tr key={i} className="hover:bg-[#18241c]/50 transition-colors">
                        <td className="py-3.5 px-6 font-mono text-xs text-[#a39b8b] print:text-black">{i + 1}</td>
                        <td className="py-3.5 px-6">
                          <span className="font-bold text-[#f3efe6] flex items-center gap-2 print:text-black">
                            <UserCheck className="w-4 h-4 text-[#98c9a3]" />
                            {sp.salespersonName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          <span className="px-3 py-1 rounded-xl bg-[#1e3425] text-[#98c9a3] font-bold text-xs border border-[#98c9a3]/30 inline-block">
                            {sp.totalOrders} รายการ
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono text-emerald-400 print:text-black">
                          ฿{sp.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono text-amber-400 print:text-black">
                          ฿{sp.pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono font-extrabold text-[#98c9a3] print:text-black">
                          ฿{sp.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: USER USAGE LOGS */}
        {activeTab === "user" && (
          <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734] print:border-black">
            <div className="p-4 sm:p-6 border-b border-[#2d4734] print:border-black">
              <h3 className="text-lg font-bold text-[#f3efe6] print:text-black">
                รายงานประวัติการเข้าใช้งานผู้ใช้ (User Activity Logs)
              </h3>
              <p className="text-xs text-[#a39b8b] print:text-gray-600">
                ประวัติการล็อกอินและการใช้งานหน้าต่างๆ ของผู้ใช้งานระบบ
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse print:text-xs">
                <thead>
                  <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase print:bg-gray-100 print:text-black">
                    <th className="py-3.5 px-6">ผู้ใช้งาน</th>
                    <th className="py-3.5 px-4">สิทธิ์</th>
                    <th className="py-3.5 px-4">หน้าที่กำลังใช้งาน</th>
                    <th className="py-3.5 px-4 text-center">สถานะ</th>
                    <th className="py-3.5 px-6 text-right">ใช้งานล่าสุด</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#2d4734]/50 text-sm print:divide-gray-300 print:text-black">
                  {userLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#a39b8b]">
                        ไม่พบประวัติการใช้งาน
                      </td>
                    </tr>
                  ) : (
                    userLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-[#18241c]/50 transition-colors">
                        <td className="py-3.5 px-6">
                          <span className="font-bold text-[#f3efe6] block print:text-black">{log.name}</span>
                          <span className="text-xs text-[#a39b8b] font-mono print:text-gray-600">@{log.username}</span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono">{log.role}</td>
                        <td className="py-3.5 px-4 text-xs font-mono text-[#98c9a3] print:text-black">{log.currentPath}</td>
                        <td className="py-3.5 px-4 text-center text-xs">
                          {log.status === "online" ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-600/40">
                              🟢 ออนไลน์
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                              ⚪ ออฟไลน์
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right text-xs font-mono text-[#a39b8b] print:text-black">
                          {new Date(log.lastActive).toLocaleString("th-TH")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-[#a39b8b]">กำลังโหลดหน้ารายงาน...</div>}>
      <ReportsPageContent />
    </Suspense>
  );
}

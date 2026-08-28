"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Filter,
  RotateCcw,
  Printer,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
  BarChart3,
  PieChart as PieIcon,
  Layers,
  Sparkles,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { getApiPath } from "@/app/utils/apiPath";

interface MonthlySale {
  month: string;
  total: number;
}

interface CategorySale {
  name: string;
  total: number;
}

interface LocationSale {
  name: string;
  total: number;
}

interface SubCategorySale {
  name: string;
  total: number;
}

interface SalesDashboardData {
  summary: {
    totalSales: number;
    paidSales: number;
    pendingSales: number;
    totalOrdersCount: number;
    totalItemsSold: number;
  };
  monthlySales: MonthlySale[];
  categorySales: CategorySale[];
  locationSales: LocationSale[];
  subCategorySales: SubCategorySale[];
}

export default function SalesDashboardCharts() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<SalesDashboardData>({
    summary: {
      totalSales: 0,
      paidSales: 0,
      pendingSales: 0,
      totalOrdersCount: 0,
      totalItemsSold: 0,
    },
    monthlySales: [],
    categorySales: [],
    locationSales: [],
    subCategorySales: [],
  });

  const printRef = useRef<HTMLDivElement>(null);

  // Generate 10 years centered around current year (5 years back, 4 years ahead)
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const fetchData = async (year: number) => {
    setLoading(true);
    try {
      const res = await fetch(getApiPath(`/api/reports/sales?year=${year}`), { cache: "no-store" });
      if (res.ok) {
        const result = await res.json();
        setData({
          summary: {
            totalSales: result.summary?.totalSales || 0,
            paidSales: result.summary?.paidSales || 0,
            pendingSales: result.summary?.pendingSales || 0,
            totalOrdersCount: result.summary?.totalOrdersCount || 0,
            totalItemsSold: result.summary?.totalItemsSold || 0,
          },
          monthlySales: result.monthlySales || [],
          categorySales: result.categorySales || [],
          locationSales: result.locationSales || [],
          subCategorySales: result.subCategorySales || [],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  const handlePrint = () => {
    window.print();
  };

  // Helper calculations for Charts
  const maxCategorySales = Math.max(...(data.categorySales.map((c) => c.total) || [1]), 1);
  const maxMonthlySales = Math.max(...(data.monthlySales.map((m) => m.total) || [1]), 1);
  const maxSubCategorySales = Math.max(...(data.subCategorySales.map((s) => s.total) || [1]), 1);
  const totalLocationSales = data.locationSales.reduce((acc, curr) => acc + curr.total, 0) || 1;

  // Colors for Donut / Location Chart
  const pieColors = ["#98c9a3", "#f59e0b", "#38bdf8", "#a855f7", "#ec4899", "#34d399"];

  // Bar colors for Sub-Category
  const subCategoryColors = [
    "#98c9a3", "#f59e0b", "#38bdf8", "#10b981", "#fb923c",
    "#a855f7", "#ec4899", "#34d399", "#f43f5e", "#06b6d4",
    "#84cc16", "#eab308", "#6366f1", "#d946ef", "#14b8a6"
  ];

  return (
    <div className="space-y-6 print:p-0 print:space-y-4 text-[#f3efe6]">
      {/* Top Streamlined Year Filter & Actions Header */}
      <div className="glass-earth-card p-5 rounded-3xl border border-[#98c9a3]/30 bg-[#121c15]/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1e3425] border border-[#98c9a3]/40 flex items-center justify-center text-[#98c9a3] shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#f3efe6] tracking-wide flex items-center gap-2">
              <span>รายงานสรุปยอดขาย (Sales Dashboard)</span>
            </h2>
            <span className="text-xs text-[#a39b8b]">
              แสดงข้อมูลสถิติยอดขายประจำปี {selectedYear}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto justify-end">
          {/* 10-Year Dropdown Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#a39b8b]">เลือกปี:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3.5 py-2 rounded-xl bg-[#18241c] text-[#f3efe6] border border-[#98c9a3]/50 text-xs font-extrabold focus:outline-none focus:border-[#98c9a3] cursor-pointer shadow-inner"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year} className="bg-[#121c15] text-[#f3efe6] py-1">
                  ปี {year} {year === currentYear ? "(ปีปัจจุบัน)" : ""}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchData(selectedYear)}
            className="p-2 rounded-xl bg-[#18241c] text-[#a39b8b] hover:text-[#98c9a3] border border-[#2d4734] text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="รีเฟรชกราฟ"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-[#1e3425] text-[#98c9a3] hover:bg-[#274530] border border-[#98c9a3]/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Print Container */}
      <div ref={printRef} className="space-y-6 print:space-y-4">
        {/* 1. TOP 3 SUMMARY KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Total Sales */}
          <div className="glass-earth-card rounded-2xl p-5 border border-[#98c9a3]/30 text-center shadow-xl bg-gradient-to-b from-[#18241c] to-[#121c15] relative overflow-hidden group">
            <div className="absolute top-3 right-3 text-[#98c9a3]/30 group-hover:text-[#98c9a3]/60 transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-[#a39b8b] uppercase tracking-wider block mb-1.5">
              TOTAL SALES (ยอดขายรวม)
            </span>
            <span className="text-3xl font-black text-[#f59e0b] font-mono block drop-shadow-md">
              ฿{data.summary.totalSales.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </span>
          </div>

          {/* Card 2: Total Profit / Paid */}
          <div className="glass-earth-card rounded-2xl p-5 border border-[#98c9a3]/30 text-center shadow-xl bg-gradient-to-b from-[#18241c] to-[#121c15] relative overflow-hidden group">
            <div className="absolute top-3 right-3 text-[#98c9a3]/30 group-hover:text-[#98c9a3]/60 transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-[#a39b8b] uppercase tracking-wider block mb-1.5">
              TOTAL PROFIT / PAID (ชำระแล้ว)
            </span>
            <span className="text-3xl font-black text-[#98c9a3] font-mono block drop-shadow-md">
              ฿{data.summary.paidSales.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </span>
          </div>

          {/* Card 3: Items Sold */}
          <div className="glass-earth-card rounded-2xl p-5 border border-[#98c9a3]/30 text-center shadow-xl bg-gradient-to-b from-[#18241c] to-[#121c15] relative overflow-hidden group">
            <div className="absolute top-3 right-3 text-[#98c9a3]/30 group-hover:text-[#98c9a3]/60 transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold text-[#a39b8b] uppercase tracking-wider block mb-1.5">
              ITEMS SOLD (จำนวนสินค้าขายได้)
            </span>
            <span className="text-3xl font-black text-[#38bdf8] font-mono block drop-shadow-md">
              {data.summary.totalItemsSold.toLocaleString()}{" "}
              <span className="text-sm font-semibold text-[#a39b8b]">ชิ้น</span>
            </span>
          </div>
        </div>

        {/* 2. MIDDLE ROW: 2 SIDE-BY-SIDE CHARTS (Sales by Category & Sales by Region) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Chart: Sales by Category (Horizontal Bar Chart) */}
          <div className="glass-earth-card rounded-3xl p-6 border border-[#2d4734] shadow-xl bg-[#121c15] space-y-4">
            <div className="bg-[#18241c] py-2 px-4 rounded-xl text-center font-bold text-xs text-[#98c9a3] uppercase tracking-wider border border-[#98c9a3]/20 flex items-center justify-center gap-2">
              <Layers className="w-4 h-4 text-[#98c9a3]" />
              <span>Sales by Category (ยอดขายแยกตามประเภทสินค้า)</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-[#a39b8b] text-xs animate-pulse">
                กำลังโหลดข้อมูลประเภทสินค้า...
              </div>
            ) : data.categorySales.length === 0 ? (
              <div className="py-12 text-center text-[#a39b8b]/60 text-xs">
                ไม่มีข้อมูลประเภทสินค้าในช่วงเวลานี้
              </div>
            ) : (
              <div className="space-y-3.5 pt-2">
                {data.categorySales.map((cat, idx) => {
                  const pct = Math.min(100, Math.round((cat.total / maxCategorySales) * 100));

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-[#e6dfd3]">
                        <span>{cat.name}</span>
                        <span className="font-mono text-[#98c9a3] font-bold">
                          ฿{cat.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-4 rounded-lg bg-[#18241c] overflow-hidden border border-[#2d4734] flex">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-gradient-to-r from-[#2d5237] to-[#98c9a3] transition-all duration-500 rounded-lg shadow-sm"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Chart: Sales by Region / Location (Donut / Pie Chart) */}
          <div className="glass-earth-card rounded-3xl p-6 border border-[#2d4734] shadow-xl bg-[#121c15] space-y-4">
            <div className="bg-[#18241c] py-2 px-4 rounded-xl text-center font-bold text-xs text-[#98c9a3] uppercase tracking-wider border border-[#98c9a3]/20 flex items-center justify-center gap-2">
              <PieIcon className="w-4 h-4 text-[#98c9a3]" />
              <span>Sales by Region / Location (สัดส่วนตามสถานที่/ภูมิภาค)</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-[#a39b8b] text-xs animate-pulse">
                กำลังโหลดข้อมูลสถานที่...
              </div>
            ) : data.locationSales.length === 0 ? (
              <div className="py-12 text-center text-[#a39b8b]/60 text-xs">
                ไม่มีข้อมูลสถานที่จัดเก็บในช่วงเวลานี้
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
                {/* SVG Donut Chart */}
                <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {(() => {
                      let accumulatedPercent = 0;
                      return data.locationSales.map((loc, idx) => {
                        const pct = Math.round((loc.total / totalLocationSales) * 100) || 0;
                        const strokeDasharray = `${pct} ${100 - pct}`;
                        const strokeDashoffset = 100 - accumulatedPercent;
                        accumulatedPercent += pct;
                        const color = pieColors[idx % pieColors.length];

                        return (
                          <circle
                            key={idx}
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="transparent"
                            stroke={color}
                            strokeWidth="4.5"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-500"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-[10px] text-[#a39b8b] font-bold uppercase block">ยอดรวม</span>
                    <span className="text-xs font-black text-[#f3efe6] font-mono">
                      ฿{data.summary.totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* Legend List */}
                <div className="space-y-2 w-full max-w-[200px]">
                  {data.locationSales.map((loc, idx) => {
                    const pct = Math.round((loc.total / totalLocationSales) * 100) || 0;
                    const color = pieColors[idx % pieColors.length];

                    return (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-3 h-3 rounded-md shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-semibold text-[#e6dfd3] truncate">{loc.name}</span>
                        </div>
                        <span className="font-mono font-bold text-[#98c9a3] shrink-0">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. MONTHLY TREND LINE CHART: Sales by Month (Jan - Dec) */}
        <div className="glass-earth-card rounded-3xl p-6 border border-[#2d4734] shadow-xl bg-[#121c15] space-y-4">
          <div className="bg-[#18241c] py-2 px-4 rounded-xl text-center font-bold text-xs text-[#98c9a3] uppercase tracking-wider border border-[#98c9a3]/20 flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#98c9a3]" />
            <span>Sales by Month (ยอดขายรายเดือน มกราคม - ธันวาคม ปี {selectedYear})</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#a39b8b] text-xs animate-pulse">
              กำลังโหลดข้อมูลยอดขายรายเดือน...
            </div>
          ) : (
            <div className="pt-4 space-y-4">
              {/* Line Chart Representation */}
              <div className="h-48 w-full flex items-end justify-between gap-1 sm:gap-2 px-2 border-b border-[#2d4734] pb-2 relative">
                {/* Horizontal Guide Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 text-[10px] text-[#a39b8b]">
                  <div className="border-b border-[#2d4734] w-full pt-1">฿{maxMonthlySales.toLocaleString()}</div>
                  <div className="border-b border-[#2d4734] w-full">฿{Math.round(maxMonthlySales / 2).toLocaleString()}</div>
                  <div className="border-b border-[#2d4734] w-full">฿0</div>
                </div>

                {data.monthlySales.map((m, idx) => {
                  const heightPct = Math.max(8, Math.round((m.total / maxMonthlySales) * 100));

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1 group relative z-10 h-full justify-end"
                    >
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#98c9a3] text-[#0f1712] text-[10px] font-mono py-0.5 px-1.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-20 font-bold">
                        ฿{m.total.toLocaleString()}
                      </div>

                      {/* Bar Point Line */}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-[#2d5237] to-[#98c9a3] group-hover:from-[#3a6847] group-hover:to-[#b0dbbb] transition-all duration-500 flex items-start justify-center relative shadow-md"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-[#f3efe6] border-2 border-[#1f3627] -mt-1.5 shadow-md shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Month Labels */}
              <div className="grid grid-cols-12 text-center text-xs font-semibold text-[#a39b8b] font-mono">
                {data.monthlySales.map((m, idx) => (
                  <div key={idx} className="truncate">
                    {m.month}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. BOTTOM ROW: Sales by Sub-Category (Vertical Bar Chart) */}
        <div className="glass-earth-card rounded-3xl p-6 border border-[#2d4734] shadow-xl bg-[#121c15] space-y-4">
          <div className="bg-[#18241c] py-2 px-4 rounded-xl text-center font-bold text-xs text-[#98c9a3] uppercase tracking-wider border border-[#98c9a3]/20 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#98c9a3]" />
            <span>Sales by Sub-Category (ยอดขายแยกตามหมวดสินค้าย่อย)</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#a39b8b] text-xs animate-pulse">
              กำลังโหลดข้อมูลหมวดสินค้าย่อย...
            </div>
          ) : data.subCategorySales.length === 0 ? (
            <div className="py-12 text-center text-[#a39b8b]/60 text-xs">
              ไม่มีข้อมูลหมวดสินค้าย่อยในช่วงเวลานี้
            </div>
          ) : (
            <div className="pt-6 space-y-6">
              {/* Vertical Bar Chart Container */}
              <div className="h-56 w-full flex items-end justify-around gap-2 px-2 border-b border-[#2d4734] pb-2">
                {data.subCategorySales.map((sub, idx) => {
                  const heightPct = Math.max(10, Math.round((sub.total / maxSubCategorySales) * 100));
                  const barColor = subCategoryColors[idx % subCategoryColors.length];

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                    >
                      {/* Amount Badge */}
                      <span className="text-[10px] font-mono font-bold text-[#e6dfd3] opacity-80 group-hover:opacity-100 transition-opacity mb-1">
                        ฿{sub.total >= 1000 ? `${(sub.total / 1000).toFixed(0)}k` : sub.total}
                      </span>

                      {/* Colored Vertical Bar */}
                      <div
                        style={{ height: `${heightPct}%`, backgroundColor: barColor }}
                        className="w-full max-w-[32px] rounded-t-lg transition-all duration-500 shadow-md group-hover:brightness-125"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Sub-Category Labels (Rotated for readability) */}
              <div className="flex items-center justify-around gap-1 px-2">
                {data.subCategorySales.map((sub, idx) => (
                  <div
                    key={idx}
                    className="flex-1 text-center text-[11px] font-bold text-[#e6dfd3]/90 truncate -rotate-45 origin-top-left transform translate-y-2"
                    title={sub.name}
                  >
                    {sub.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

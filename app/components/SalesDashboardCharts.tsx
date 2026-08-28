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
} from "lucide-react";

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
  const [selectedYear, setSelectedYear] = useState<number>(2025);
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

  const availableYears = [2021, 2022, 2023, 2024, 2025, 2026];

  const fetchData = async (year: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/sales?year=${year}`, { cache: "no-store" });
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

  // Colors for Pie / Location Chart
  const pieColors = ["#0284c7", "#f97316", "#10b981", "#8b5cf6", "#ec4899", "#64748b"];

  // Bar colors for Sub-Category
  const subCategoryColors = [
    "#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4",
    "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#ec4899",
    "#14b8a6", "#84cc16", "#eab308", "#38bdf8", "#a855f7"
  ];

  return (
    <div className="space-y-6 print:p-0 print:space-y-4 text-[#f3efe6]">
      {/* Top Banner Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] border border-[#38bdf8]/40 flex items-center justify-center text-white shadow-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gradient-earth">
              SALES DASHBOARD - {selectedYear}
            </h1>
            <p className="text-xs text-[#a39b8b]">
              กราฟสรุปยอดขาย การจำแนกประเภทสินค้า และแนวโน้มรายเดือนแบบอินเทอร์แอคทีฟ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => fetchData(selectedYear)}
            className="px-3 py-2 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734] text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="รีเฟรชกราฟ"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>รีเฟรช</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#1e3425] text-[#98c9a3] hover:bg-[#274530] border border-[#98c9a3]/40 text-xs font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ / พิมพ์ออกเป็น PDF</span>
          </button>
        </div>
      </div>

      {/* Main Print Container */}
      <div ref={printRef} className="space-y-6 print:space-y-4">
        {/* 1. MAIN HEADER TITLE BANNER (Matching Mockup) */}
        <div className="rounded-2xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] p-4 text-center text-white font-extrabold text-2xl tracking-wider uppercase shadow-xl border border-white/20 print:bg-blue-700 print:text-white">
          SALES DASHBOARD - {selectedYear}
        </div>

        {/* 2. YEAR SLICER FILTER BOX (Matching Mockup) */}
        <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] space-y-3 bg-[#121c15]/90 print:bg-white print:border-gray-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#e6dfd3] uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Filter className="w-4 h-4 text-[#38bdf8]" />
              Year (เลือกปีที่ต้องการดูข้อมูล)
            </span>
            <button
              onClick={() => setSelectedYear(2025)}
              className="text-[11px] text-[#a39b8b] hover:text-[#38bdf8] flex items-center gap-1 print:hidden transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              ล้างตัวกรอง
            </button>
          </div>

          {/* Slicer Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 print:hidden">
            {availableYears.map((year) => {
              const isSelected = selectedYear === year;
              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`py-2.5 px-4 rounded-xl text-sm font-extrabold transition-all border ${
                    isSelected
                      ? "bg-[#0284c7] text-white border-[#38bdf8] shadow-lg shadow-sky-900/40 scale-105"
                      : "bg-[#18241c] text-[#a39b8b] border-[#2d4734] hover:bg-[#223327] hover:text-[#f3efe6]"
                  }`}
                >
                  {year}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. TOP 3 SUMMARY KPI CARDS (Matching Mockup Red Numbers) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Total Sales */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center shadow-lg print:border-gray-400">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Total Sales (ยอดขายรวม)
            </span>
            <span className="text-3xl font-black text-[#dc2626] font-mono block">
              ฿{data.summary.totalSales.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </span>
          </div>

          {/* Card 2: Total Profit / Paid */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center shadow-lg print:border-gray-400">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Total Profit / Paid (ชำระแล้ว)
            </span>
            <span className="text-3xl font-black text-[#dc2626] font-mono block">
              ฿{data.summary.paidSales.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </span>
          </div>

          {/* Card 3: Items Sold */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center shadow-lg print:border-gray-400">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Items Sold (จำนวนสินค้าขายได้)
            </span>
            <span className="text-3xl font-black text-[#dc2626] font-mono block">
              {data.summary.totalItemsSold.toLocaleString()}{" "}
              <span className="text-sm font-semibold text-gray-500">ชิ้น</span>
            </span>
          </div>
        </div>

        {/* 4. MIDDLE ROW: 2 SIDE-BY-SIDE CHARTS (Sales by Category & Sales by Region) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Chart: Sales by Category (Horizontal Bar Chart) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg text-gray-800 space-y-4 print:border-gray-400">
            <div className="bg-gray-300 py-1.5 px-4 rounded-lg text-center font-bold text-sm text-gray-700 uppercase tracking-wider">
              Sales by Category (ยอดขายแยกตามประเภทสินค้า)
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-400 text-xs animate-pulse">
                กำลังโหลดข้อมูล...
              </div>
            ) : data.categorySales.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                ไม่มีข้อมูลประเภทสินค้าในช่วงเวลานี้
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {data.categorySales.map((cat, idx) => {
                  const pct = Math.min(100, Math.round((cat.total / maxCategorySales) * 100));

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>{cat.name}</span>
                        <span className="font-mono text-blue-700 font-bold">
                          ฿{cat.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-5 rounded-md bg-gray-100 overflow-hidden border border-gray-200 flex">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-gradient-to-r from-[#0284c7] to-[#0369a1] transition-all duration-500 rounded-md"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Chart: Sales by Region / Location (Donut / Pie Chart) */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-lg text-gray-800 space-y-4 print:border-gray-400">
            <div className="bg-gray-300 py-1.5 px-4 rounded-lg text-center font-bold text-sm text-gray-700 uppercase tracking-wider">
              Sales by Region / Location (สัดส่วนยอดขายตามสถานที่/ภูมิภาค)
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-400 text-xs animate-pulse">
                กำลังโหลดข้อมูล...
              </div>
            ) : data.locationSales.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
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
                            strokeWidth="5"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-500"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Total</span>
                    <span className="text-xs font-black text-gray-800 font-mono">
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
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-semibold text-gray-700 truncate">{loc.name}</span>
                        </div>
                        <span className="font-mono font-bold text-gray-900 shrink-0">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. MONTHLY TREND LINE CHART: Sales by Month (Jan - Dec) */}
        <div className="bg-[#0f172a] rounded-2xl p-5 border border-slate-700 shadow-xl text-white space-y-4 print:bg-slate-900 print:border-gray-400">
          <div className="bg-white py-1.5 px-4 rounded-lg text-center font-bold text-sm text-slate-900 uppercase tracking-wider">
            Sales by Month (ยอดขายรายเดือน มกราคม - ธันวาคม ปี {selectedYear})
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs animate-pulse">
              กำลังโหลดข้อมูลยอดขายรายเดือน...
            </div>
          ) : (
            <div className="pt-4 space-y-4">
              {/* Line Chart Representation */}
              <div className="h-48 w-full flex items-end justify-between gap-1 sm:gap-2 px-2 border-b border-slate-700 pb-2 relative">
                {/* Horizontal Guide Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 text-[10px] text-slate-400">
                  <div className="border-b border-slate-400 w-full pt-1">฿{maxMonthlySales.toLocaleString()}</div>
                  <div className="border-b border-slate-400 w-full">฿{Math.round(maxMonthlySales / 2).toLocaleString()}</div>
                  <div className="border-b border-slate-400 w-full">฿0</div>
                </div>

                {data.monthlySales.map((m, idx) => {
                  const heightPct = Math.max(8, Math.round((m.total / maxMonthlySales) * 100));

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1 group relative z-10 h-full justify-end"
                    >
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-sky-500 text-white text-[10px] font-mono py-0.5 px-1.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-20 font-bold">
                        ฿{m.total.toLocaleString()}
                      </div>

                      {/* Bar Point Line */}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-orange-600 to-amber-400 group-hover:from-orange-500 group-hover:to-amber-300 transition-all duration-500 flex items-start justify-center relative"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-orange-600 -mt-1.5 shadow-md shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Month Labels */}
              <div className="grid grid-cols-12 text-center text-xs font-semibold text-slate-300 font-mono">
                {data.monthlySales.map((m, idx) => (
                  <div key={idx} className="truncate">
                    {m.month}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 6. BOTTOM ROW: Sales by Sub-Category (Colorful Vertical Bar Chart) */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#6b21a8] via-[#86198f] to-[#be185d] shadow-xl text-white space-y-4 border border-fuchsia-400/30 print:bg-purple-900">
          <div className="bg-white py-1.5 px-4 rounded-lg text-center font-bold text-sm text-purple-900 uppercase tracking-wider">
            Sales by Sub-Category (ยอดขายแยกตามหมวดสินค้าย่อย)
          </div>

          {loading ? (
            <div className="py-16 text-center text-purple-200 text-xs animate-pulse">
              กำลังโหลดข้อมูลหมวดสินค้าย่อย...
            </div>
          ) : data.subCategorySales.length === 0 ? (
            <div className="py-12 text-center text-purple-200 text-xs">
              ไม่มีข้อมูลหมวดสินค้าย่อยในช่วงเวลานี้
            </div>
          ) : (
            <div className="pt-6 space-y-6">
              {/* Vertical Bar Chart Container */}
              <div className="h-56 w-full flex items-end justify-around gap-2 px-2 border-b border-purple-400/40 pb-2">
                {data.subCategorySales.map((sub, idx) => {
                  const heightPct = Math.max(10, Math.round((sub.total / maxSubCategorySales) * 100));
                  const barColor = subCategoryColors[idx % subCategoryColors.length];

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                    >
                      {/* Amount Badge */}
                      <span className="text-[10px] font-mono font-bold text-white opacity-80 group-hover:opacity-100 transition-opacity mb-1">
                        ฿{sub.total >= 1000 ? `${(sub.total / 1000).toFixed(0)}k` : sub.total}
                      </span>

                      {/* Colored Vertical Bar */}
                      <div
                        style={{ height: `${heightPct}%`, backgroundColor: barColor }}
                        className="w-full max-w-[32px] rounded-t-md transition-all duration-500 shadow-lg group-hover:brightness-110"
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
                    className="flex-1 text-center text-[11px] font-bold text-white/90 truncate -rotate-45 origin-top-left transform translate-y-2"
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

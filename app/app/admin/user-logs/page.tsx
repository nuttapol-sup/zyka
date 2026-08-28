"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  User as UserIcon,
  Shield,
  Search,
  RefreshCw,
  Clock,
  LogIn,
  LogOut,
  MapPin,
  Sliders,
  Radio,
  Calendar,
  X,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface LogItem {
  _id: string;
  userId: string;
  username: string;
  name: string;
  role: "admin" | "user";
  currentPath: string;
  status: "online" | "offline";
  lastActive: string;
  loginTime: string;
  logoutTime?: string | null;
}

export default function UserLogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [stats, setStats] = useState({ onlineCount: 0, offlineCount: 0, totalLogs: 0 });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "online" | "offline">("all");

  // Date Range Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const url = `/api/admin/logs?${params.toString()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setStats(data.stats || { onlineCount: 0, offlineCount: 0, totalLogs: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 4000); // Auto refresh every 4 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, startDate, endDate]);

  const setPresetToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  };

  const setPresetLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const setPresetLast30Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.currentPath.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "online") return matchesSearch && log.status === "online";
    if (filterStatus === "offline") return matchesSearch && log.status === "offline";
    return matchesSearch;
  });

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#446e50] to-[#1f3627] border border-[#98c9a3]/40 flex items-center justify-center">
            <Activity className="w-6 h-6 text-[#98c9a3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gradient-earth">
                ประวัติเข้าออก & สถานะการใช้งาน (User Activity Logs)
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-[#446e50]/40 text-[#98c9a3] border border-[#98c9a3]/30 font-semibold">
                Admin Only
              </span>
            </div>
            <p className="text-xs text-[#a39b8b]">
              ติดตามสถานะออนไลน์/ออฟไลน์ เวลาเข้า-ออกระบบ และหน้าที่ผู้ใช้งานกำลังเปิดอยู่แบบ Real-time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              autoRefresh
                ? "bg-[#1f3025] text-[#98c9a3] border-[#98c9a3]/40"
                : "bg-[#121c15] text-[#a39b8b] border-[#2d4734]"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? "animate-pulse text-[#98c9a3]" : ""}`} />
            <span>Auto Refresh (4s)</span>
          </button>

          <button
            onClick={fetchLogs}
            className="p-2.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734] transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/manage-permissions"
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#121c15] text-[#98c9a3] border border-[#98c9a3]/30 hover:bg-[#1c2d22] transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-4 h-4" />
            <span>จัดการสิทธิ์</span>
          </Link>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Online Count */}
        <div className="glass-earth-card p-5 rounded-2xl border border-[#98c9a3]/40 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#a39b8b] font-medium uppercase tracking-wider block">
              กำลังออนไลน์อยู่ (ONLINE)
            </span>
            <div className="text-3xl font-extrabold text-[#98c9a3] flex items-center gap-2">
              <span>{stats.onlineCount}</span>
              <span className="text-xs font-normal text-[#a39b8b]">คน</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-[#98c9a3] animate-ping" />
          </div>
        </div>

        {/* Offline Count */}
        <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#a39b8b] font-medium uppercase tracking-wider block">
              ออฟไลน์ (OFFLINE)
            </span>
            <div className="text-3xl font-extrabold text-[#e6dfd3] flex items-center gap-2">
              <span>{stats.offlineCount}</span>
              <span className="text-xs font-normal text-[#a39b8b]">คน</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#18241c] border border-[#2d4734] flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-[#a39b8b]/40" />
          </div>
        </div>

        {/* Total Logged Events */}
        <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#a39b8b] font-medium uppercase tracking-wider block">
              ประวัติในระบบทั้งหมด (TOTAL LOGS)
            </span>
            <div className="text-3xl font-extrabold text-[#f3efe6]">
              {stats.totalLogs}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#18241c] border border-[#2d4734] flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#a39b8b]" />
          </div>
        </div>
      </div>

      {/* Date Range Filter Bar (NEW) */}
      <div className="glass-earth-card p-4 rounded-2xl border border-[#98c9a3]/20 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#e6dfd3]">
            <Filter className="w-4 h-4 text-[#98c9a3]" />
            <span>กรองตามช่วงวันที่ (Date Range Filter):</span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={setPresetToday}
              className="px-2.5 py-1 rounded-lg bg-[#121c15] hover:bg-[#1b2a1f] text-[#98c9a3] border border-[#98c9a3]/30 text-[11px] font-medium transition-colors"
            >
              วันนี้
            </button>
            <button
              onClick={setPresetLast7Days}
              className="px-2.5 py-1 rounded-lg bg-[#121c15] hover:bg-[#1b2a1f] text-[#98c9a3] border border-[#98c9a3]/30 text-[11px] font-medium transition-colors"
            >
              7 วันล่าสุด
            </button>
            <button
              onClick={setPresetLast30Days}
              className="px-2.5 py-1 rounded-lg bg-[#121c15] hover:bg-[#1b2a1f] text-[#98c9a3] border border-[#98c9a3]/30 text-[11px] font-medium transition-colors"
            >
              30 วันล่าสุด
            </button>
            {(startDate || endDate) && (
              <button
                onClick={clearDateFilter}
                className="px-2 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-800/40 text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                ล้างวันที่
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-[#a39b8b] mb-1">
              ตั้งแต่วันที่ (From Date):
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#98c9a3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-[#a39b8b] mb-1">
              ถึงวันที่ (To Date):
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#98c9a3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Status Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#121c15] p-1.5 rounded-2xl border border-[#2d4734] w-fit">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === "all"
                ? "bg-[#2a4332] text-[#98c9a3] border border-[#98c9a3]/30"
                : "text-[#a39b8b] hover:text-[#f3efe6]"
            }`}
          >
            ทั้งหมด ({logs.length})
          </button>
          <button
            onClick={() => setFilterStatus("online")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterStatus === "online"
                ? "bg-[#1e3425] text-[#98c9a3] border border-[#98c9a3]/50"
                : "text-[#a39b8b] hover:text-[#f3efe6]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#98c9a3]" />
            ออนไลน์อยู่ ({stats.onlineCount})
          </button>
          <button
            onClick={() => setFilterStatus("offline")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterStatus === "offline"
                ? "bg-[#24221e] text-[#e6dfd3] border border-[#2d4734]"
                : "text-[#a39b8b] hover:text-[#f3efe6]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#a39b8b]/40" />
            ออฟไลน์ ({stats.offlineCount})
          </button>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, Username หรือหน้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734]">
        {loading ? (
          <div className="p-12 text-center text-[#a39b8b]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#98c9a3]" />
            กำลังโหลดข้อมูล Logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-[#a39b8b]">
            ไม่พบประวัติการใช้งานตามเงื่อนไข
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase tracking-wider">
                  <th className="py-4 px-6">ผู้ใช้งาน</th>
                  <th className="py-4 px-4 text-center">สถานะ (STATUS)</th>
                  <th className="py-4 px-6">หน้าใช้งานปัจจุบัน (CURRENT PAGE)</th>
                  <th className="py-4 px-6">เวลาเข้าใช้งาน (LOGIN TIME)</th>
                  <th className="py-4 px-6">เวลาออก / ล่าสุด (LOGOUT / LAST SEEN)</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2d4734]/50 text-sm">
                {filteredLogs.map((log) => {
                  const isOnline = log.status === "online";
                  const isAdmin = log.role === "admin";

                  return (
                    <tr
                      key={log._id}
                      className="hover:bg-[#18241c]/60 transition-colors"
                    >
                      {/* User Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                              isAdmin
                                ? "bg-[#446e50] text-[#f3efe6] border border-[#98c9a3]/40"
                                : "bg-[#253529] text-[#e6dfd3]"
                            }`}
                          >
                            {isAdmin ? (
                              <Shield className="w-4 h-4" />
                            ) : (
                              <UserIcon className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-[#f3efe6]">
                                {log.name}
                              </p>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                                  isAdmin
                                    ? "bg-[#446e50]/40 text-[#98c9a3]"
                                    : "bg-[#18241c] text-[#a39b8b]"
                                }`}
                              >
                                {log.role.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-[#a39b8b] font-mono">
                              @{log.username}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 text-center">
                        {isOnline ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e3425] text-[#98c9a3] text-xs font-bold border border-[#98c9a3]/40">
                            <span className="w-2 h-2 rounded-full bg-[#98c9a3] animate-pulse" />
                            ออนไลน์ (ONLINE)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c221e] text-[#a39b8b] text-xs font-medium border border-[#2d4734]">
                            <span className="w-2 h-2 rounded-full bg-[#a39b8b]/40" />
                            ออฟไลน์ (OFFLINE)
                          </span>
                        )}
                      </td>

                      {/* Current Page */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#98c9a3] shrink-0" />
                          <code className="px-2.5 py-1 rounded-lg bg-[#121c15] text-[#98c9a3] font-mono text-xs border border-[#2d4734]">
                            {log.currentPath}
                          </code>
                        </div>
                      </td>

                      {/* Login Time */}
                      <td className="py-4 px-6 text-xs text-[#e6dfd3]">
                        <div className="flex items-center gap-2">
                          <LogIn className="w-4 h-4 text-[#98c9a3]" />
                          <span>{formatDateTime(log.loginTime)}</span>
                        </div>
                      </td>

                      {/* Logout / Last Seen Time */}
                      <td className="py-4 px-6 text-xs text-[#a39b8b]">
                        <div className="flex items-center gap-2">
                          <LogOut className="w-4 h-4 text-[#a39b8b]" />
                          <span>
                            {isOnline
                              ? "กำลังใช้งานอยู่"
                              : formatDateTime(log.logoutTime || log.lastActive)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

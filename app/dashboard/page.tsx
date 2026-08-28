"use client";

import { getApiPath } from "@/app/utils/apiPath";
import SalesDashboardCharts from "@/app/components/SalesDashboardCharts";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UserCheck,
  Sparkles,
  KeyRound,
} from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  username: string;
  role: "admin" | "user";
  allowedPages: string[];
  createdAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiPath("/api/auth/me"))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#98c9a3]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-earth-card p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#446e50]/20 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#2a4332] text-[#98c9a3] text-xs font-semibold border border-[#98c9a3]/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                ยินดีต้อนรับสู่ระบบ ZYKA
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  user.role === "admin"
                    ? "bg-[#446e50] text-[#f3efe6] border border-[#98c9a3]/50"
                    : "bg-[#253529] text-[#e6dfd3] border border-[#2d4734]"
                }`}
              >
                {user.role}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient-earth">
              สวัสดีคุณ {user.name}
            </h1>
            <p className="text-[#a39b8b] text-sm">
              ชื่อผู้ใช้ (Username): <span className="text-[#e6dfd3] font-mono">{user.username}</span>
            </p>
          </div>

          <div className="bg-[#121c15] p-4 rounded-2xl border border-[#2d4734] min-w-[240px] flex flex-col justify-between">
            <div>
              <span className="text-xs text-[#a39b8b] font-medium block mb-1">
                สถานะสิทธิ์การเข้าถึงของคุณ:
              </span>
              <div className="flex items-center gap-2">
                {user.role === "admin" ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-[#98c9a3]" />
                    <span className="text-sm font-bold text-[#98c9a3]">
                      Super Admin Access (ทุกหน้า)
                    </span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-5 h-5 text-[#e6dfd3]" />
                    <span className="text-sm font-medium text-[#e6dfd3]">
                      ได้รับสิทธิ์ {user.allowedPages.length} หน้า
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#2d4734]/60">
              <Link
                href="/change-password"
                className="text-xs font-semibold text-[#98c9a3] hover:text-[#f3efe6] flex items-center gap-1.5 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>เปลี่ยนรหัสผ่านส่วนตัว</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Sales Dashboard Charts */}
      <SalesDashboardCharts />
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Lock, ArrowLeft, Leaf } from "lucide-react";
import { Suspense } from "react";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const reason = searchParams.get("reason");

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-earth-card p-8 rounded-3xl text-center space-y-6 border border-[#d9a07e]/30 relative overflow-hidden">
        {/* Glowing background accent */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#d9a07e]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#2a221d] border border-[#d9a07e]/40 shadow-xl">
          <ShieldAlert className="w-8 h-8 text-[#d9a07e]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f3efe6]">
            ไม่มีสิทธิ์เข้าถึงหน้านี้
          </h1>
          <p className="text-sm text-[#a39b8b]">
            {reason === "admin_required" ? (
              <span className="text-[#d9a07e] font-semibold">
                ⚠️ หน้าที่คุณต้องการเข้าถึงสงวนสิทธิ์เฉพาะบัญชี Admin เท่านั้น
              </span>
            ) : page ? (
              <span>
                บัญชีของคุณยังไม่ได้รับการเปิดสิทธิ์การเข้าใช้งานเส้นทาง{" "}
                <code className="px-2 py-0.5 rounded bg-[#121c15] text-[#98c9a3] font-mono text-xs border border-[#2d4734]">
                  {page}
                </code>
              </span>
            ) : (
              <span>คุณไม่มีสิทธิ์เพียงพอในการเข้าถึงเส้นทางดังกล่าว</span>
            )}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#141b16] border border-[#2d4734] text-xs text-[#a39b8b] text-left space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#e6dfd3] mb-1">
            <Lock className="w-3.5 h-3.5 text-[#98c9a3]" />
            วิธีการขอเปิดสิทธิ์:
          </div>
          <p>• กรุณาติดต่อผู้ดูแลระบบ (Admin) เพื่อเพิ่มสิทธิ์ในหน้า **Manage Permissions**</p>
          <p>• เมื่อ Admin อัปเดตสิทธิ์แล้ว คุณจะสามารถเข้าใช้งานหน้านี้ได้ทันที</p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="w-full btn-earth-primary py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้าหลัก Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-[#a39b8b]">กำลังโหลด...</div>}>
      <UnauthorizedContent />
    </Suspense>
  );
}

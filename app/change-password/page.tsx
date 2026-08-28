"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (newPassword.length < 6) {
      setError("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
      }

      setSuccess("เปลี่ยนรหัสผ่านของคุณเรียบร้อยแล้ว!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#446e50] to-[#1f3627] border border-[#98c9a3]/40 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-[#98c9a3]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient-earth">
              เปลี่ยนรหัสผ่าน (Change Password)
            </h1>
            <p className="text-xs text-[#a39b8b]">
              กำหนดรหัสผ่านใหม่สำหรับเข้าใช้งานระบบ
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="p-2 rounded-xl text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#121c15] transition-colors"
          title="กลับสู่หน้าหลัก"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Alert Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Alert Success */}
      {success && (
        <div className="p-4 rounded-2xl bg-[#1e3425] border border-[#98c9a3]/50 text-[#98c9a3] text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#98c9a3] shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="glass-earth-card p-8 rounded-3xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider mb-2">
              รหัสผ่านปัจจุบัน (Current Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a39b8b]">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#121c15] border border-[#2d4734] text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3] focus:ring-1 focus:ring-[#98c9a3] transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider mb-2">
              รหัสผ่านใหม่ (New Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a39b8b]">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#121c15] border border-[#2d4734] text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3] focus:ring-1 focus:ring-[#98c9a3] transition-all text-sm"
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider mb-2">
              ยืนยันรหัสผ่านใหม่ (Confirm Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a39b8b]">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#121c15] border border-[#2d4734] text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3] focus:ring-1 focus:ring-[#98c9a3] transition-all text-sm"
                placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-earth-primary py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>กำลังบันทึกรหัสผ่าน...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>บันทึกการเปลี่ยนรหัสผ่าน</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

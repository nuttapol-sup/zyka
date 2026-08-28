"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Lock, User, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiPath = typeof window !== "undefined" && window.location.pathname.startsWith("/zyka")
        ? "/zyka/api/auth/login"
        : "/api/auth/login";

      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถเข้าสู่ระบบได้");
      }

      // Success -> Dispatch update event & perform full navigation to sync Navbar & cookies
      window.dispatchEvent(new Event("zyka-user-updated"));

      const target = data.targetPage || "/dashboard";
      const isSubpath = typeof window !== "undefined" && window.location.pathname.startsWith("/zyka");
      const finalUrl = isSubpath && !target.startsWith("/zyka")
        ? `/zyka${target.startsWith("/") ? "" : "/"}${target}`
        : target;

      window.location.href = finalUrl;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-earth-card p-8 rounded-3xl relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#446e50]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#34533c] to-[#1f3627] border border-[#98c9a3]/30 shadow-lg mb-2">
            <Leaf className="w-7 h-7 text-[#98c9a3]" />
          </div>
          <h2 className="text-3xl font-extrabold text-gradient-earth tracking-tight">
            เข้าสู่ระบบ ZYKA
          </h2>
        </div>

        {/* Alert Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider mb-2">
              ชื่อผู้ใช้ (Username)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a39b8b]">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#121c15] border border-[#2d4734] text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3] focus:ring-1 focus:ring-[#98c9a3] transition-all"
                placeholder="Username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider mb-2">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a39b8b]">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#121c15] border border-[#2d4734] text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3] focus:ring-1 focus:ring-[#98c9a3] transition-all"
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-earth-primary py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <span>กำลังเข้าสู่ระบบ...</span>
            ) : (
              <>
                <span>ลงชื่อเข้าใช้งาน</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

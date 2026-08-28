"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Leaf,
  Type,
  Trash2,
  MapPin,
  Phone,
  FileText,
} from "lucide-react";

export default function ManageLogoPage() {
  const [logoUrl, setLogoUrl] = useState("");
  const [appName, setAppName] = useState("ZYKA");
  const [appSubtitle, setAppSubtitle] = useState("Access Control");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyTaxId, setCompanyTaxId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch current settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/logo");
      if (res.ok) {
        const data = await res.json();
        setLogoUrl(data.logoUrl || "");
        setAppName(data.appName || "ZYKA");
        setAppSubtitle(data.appSubtitle || "Access Control");
        setCompanyAddress(data.companyAddress || "");
        setCompanyPhone(data.companyPhone || "");
        setCompanyTaxId(data.companyTaxId || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle Image File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 2MB");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  // Submit Changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings/logo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoUrl,
          appName,
          appSubtitle,
          companyAddress,
          companyPhone,
          companyTaxId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถอัปเดตข้อมูลได้");
      }

      setSuccess("บันทึกการเปลี่ยนแปลงโลโก้และข้อมูลบริษัทสำเร็จเรียบร้อยแล้ว!");
      // Trigger header reload by dispatching custom event
      window.dispatchEvent(new Event("zyka-logo-updated"));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    setLogoUrl("");
    setAppName("ZYKA");
    setAppSubtitle("Access Control");
    setCompanyAddress("");
    setCompanyPhone("");
    setCompanyTaxId("");
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#98c9a3]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Alert Messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-[#1e3425] border border-[#98c9a3]/50 text-[#98c9a3] text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#98c9a3] shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Live Preview Box */}
      <div className="glass-earth-card p-6 rounded-3xl space-y-3">
        <h3 className="text-xs font-semibold text-[#a39b8b] uppercase tracking-wider">
          ตัวอย่างการแสดงผลบน NAVBAR (LIVE NAVBAR PREVIEW):
        </h3>
        <div className="p-4 rounded-2xl bg-[#0f1712] border border-[#2d4734] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              // Custom Logo Image
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#98c9a3]/30 bg-[#18241c] flex items-center justify-center p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Custom Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              // Default Leaf Icon
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#446e50] to-[#1f3627] flex items-center justify-center border border-[#98c9a3]/30">
                <Leaf className="w-5 h-5 text-[#98c9a3]" />
              </div>
            )}
            <div>
              <span className="text-xl font-bold text-gradient-earth tracking-tight">
                {appName || "ZYKA"}
              </span>
              <span className="text-xs block text-[#a39b8b] font-medium -mt-1">
                {appSubtitle || "Access Control"}
              </span>
            </div>
          </div>

          <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#18241c] text-[#98c9a3] border border-[#98c9a3]/20">
            Navbar Preview
          </span>
        </div>
      </div>

      {/* Form Card */}
      <div className="glass-earth-card p-8 rounded-3xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload / Image Option */}
          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider mb-2">
              อัปโหลดรูปภาพโลโก้ (UPLOAD IMAGE LOGO)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#121c15] hover:bg-[#1b2a1f] border border-[#98c9a3]/40 text-[#98c9a3] font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>เลือกไฟล์รูปภาพ (PNG, JPG, SVG)</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="px-4 py-3 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-800/40 text-red-300 font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ลบรูปภาพ (ใช้โลโก้เริ่มต้น)</span>
                </button>
              )}
            </div>
          </div>

          {/* Image URL Input (Alternative) */}
          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider mb-2">
              หรือระบุ URL รูปภาพ (IMAGE URL)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a39b8b]">
                <ImageIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={logoUrl.startsWith("data:") ? "(ไฟล์รูปภาพอัปโหลดแล้ว)" : logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#121c15] border border-[#2d4734] text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3] text-sm"
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          {/* App Name Input */}
          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider mb-2">
              ชื่อระบบ / บริษัท (APP TITLE NAME)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a39b8b]">
                <Type className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#121c15] border border-[#2d4734] text-[#f3efe6] focus:outline-none focus:border-[#98c9a3] text-sm"
                placeholder="ZYKA"
              />
            </div>
          </div>

          {/* App Subtitle Input */}
          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider mb-2">
              คำอธิบายใต้โลโก้ (SUBTITLE / TAGLINE)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a39b8b]">
                <Type className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={appSubtitle}
                onChange={(e) => setAppSubtitle(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#121c15] border border-[#2d4734] text-[#f3efe6] focus:outline-none focus:border-[#98c9a3] text-sm"
                placeholder="Access Control"
              />
            </div>
          </div>

          {/* Company Address Input (NEW) */}
          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider mb-2">
              ที่อยู่บริษัท (COMPANY ADDRESS)
            </label>
            <div className="relative">
              <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-[#a39b8b]">
                <MapPin className="w-5 h-5" />
              </div>
              <textarea
                rows={3}
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#121c15] border border-[#2d4734] text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3] text-sm resize-none"
                placeholder="123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110"
              />
            </div>
          </div>

          {/* Company Phone & Tax ID (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider mb-2">
                เบอร์โทรศัพท์บริษัท
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a39b8b]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-[#f3efe6] text-xs focus:outline-none focus:border-[#98c9a3]"
                  placeholder="02-123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider mb-2">
                เลขประจำตัวผู้เสียภาษี
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a39b8b]">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={companyTaxId}
                  onChange={(e) => setCompanyTaxId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-[#f3efe6] text-xs focus:outline-none focus:border-[#98c9a3]"
                  placeholder="0105550000000"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#2d4734]">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-earth-primary py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>บันทึกข้อมูลบริษัทและโลโก้</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetDefault}
              className="px-4 py-3.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-[#a39b8b] hover:text-[#f3efe6] text-xs font-semibold transition-colors"
            >
              คืนค่าเริ่มต้น
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  ShieldCheck,
  Save,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Bell,
  HelpCircle,
  Package,
  Truck,
  ExternalLink,
} from "lucide-react";
import { getApiPath } from "@/app/utils/apiPath";

export default function ManageLinePage() {
  const [lineChannelSecret, setLineChannelSecret] = useState("");
  const [lineChannelAccessToken, setLineChannelAccessToken] = useState("");
  const [lineGroupId, setLineGroupId] = useState("");
  const [lineEnabled, setLineEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      setWebhookUrl(getApiPath("/api/line/webhook"));
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiPath("/api/admin/settings/line"), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setLineChannelSecret(data.lineChannelSecret || "");
        setLineChannelAccessToken(data.lineChannelAccessToken || "");
        setLineGroupId(data.lineGroupId || "");
        setLineEnabled(data.lineEnabled !== false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(getApiPath("/api/admin/settings/line"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineChannelSecret,
          lineChannelAccessToken,
          lineGroupId,
          lineEnabled,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึก");

      setSuccess("บันทึกตั้งค่า LINE Messaging API เรียบร้อยแล้ว!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyWebhook = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00b900] to-[#008f00] border border-white/20 flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-earth flex items-center gap-2">
              <span>ตั้งค่าระบบเช็คสต็อกผ่าน LINE</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00b900]/20 text-[#00b900] text-xs font-bold border border-[#00b900]/40">
                LINE OA Integration
              </span>
            </h1>
            <p className="text-xs text-[#a39b8b]">
              เชื่อมต่อ LINE Official Account เพื่อให้พนักงานพิมพ์เช็คสต็อก และติดตามสถานะออเดอร์ผ่าน LINE ได้ 24 ชม.
            </p>
          </div>
        </div>
      </div>

      {/* Alert Success / Error */}
      {success && (
        <div className="p-4 rounded-2xl bg-[#1e3425] border border-[#98c9a3]/50 text-[#98c9a3] text-sm flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#98c9a3] shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#2d4734] space-y-6">
        {/* Step 1: Webhook URL Instruction */}
        <div className="p-4 rounded-2xl bg-[#121c15] border border-[#2d4734] space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#98c9a3] uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>1. นำ URL ไปวางใน LINE Developers Console (Webhook URL)</span>
            </label>
            <a
              href="https://developers.line.biz/console/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#98c9a3] hover:underline flex items-center gap-1"
            >
              <span>เปิด LINE Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-[#2d4734] text-xs font-mono text-[#f3efe6] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="px-4 py-2.5 rounded-xl bg-[#1e3425] text-[#98c9a3] hover:bg-[#284532] border border-[#98c9a3]/40 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "คัดลอกแล้ว!" : "คัดลอก Webhook URL"}</span>
            </button>
          </div>
          <p className="text-[11px] text-[#a39b8b]">
            * นำ URL ด้านบนไปวางในช่อง <strong>Webhook URL</strong> ใน LINE Developers Console ➔ เมนู Messaging API และกดปุ่ม <strong>Use webhook</strong> ให้เป็นสีเขียว
          </p>
        </div>

        {/* Step 2: Settings Form */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Toggle Enable */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#121c15] border border-[#2d4734]">
            <div>
              <span className="font-bold text-sm text-[#f3efe6] block">เปิดใช้งานการเช็คสต็อกผ่าน LINE</span>
              <span className="text-xs text-[#a39b8b]">เปิด/ปิด การตอบกลับข้อความเช็คสต็อกอัตโนมัติใน LINE</span>
            </div>
            <button
              type="button"
              onClick={() => setLineEnabled(!lineEnabled)}
              className={`w-12 h-6 rounded-full p-1 transition-colors relative ${
                lineEnabled ? "bg-[#00b900]" : "bg-gray-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  lineEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* LINE Channel Secret */}
          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
              LINE Channel Secret *
            </label>
            <input
              type="password"
              value={lineChannelSecret}
              onChange={(e) => setLineChannelSecret(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs font-mono text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
              placeholder="กรอก Channel Secret จาก LINE Developers"
            />
          </div>

          {/* LINE Channel Access Token */}
          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
              LINE Channel Access Token (Long-Lived) *
            </label>
            <textarea
              rows={3}
              value={lineChannelAccessToken}
              onChange={(e) => setLineChannelAccessToken(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs font-mono text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
              placeholder="กรอก Channel Access Token (issue จาก LINE Developers)"
            />
          </div>

          {/* LINE Group ID (Optional for Low Stock Push Alerts) */}
          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1 flex items-center justify-between">
              <span>LINE Group ID / User ID (สำหรับรับแจ้งเตือนสต็อกเตือนใกล้หมด)</span>
              <span className="text-[#a39b8b] normal-case text-[11px]">(ไม่บังคับ)</span>
            </label>
            <input
              type="text"
              value={lineGroupId}
              onChange={(e) => setLineGroupId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs font-mono text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
              placeholder="เช่น C1234567890abcdef1234567890abcdef"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00b900] to-[#008f00] text-white font-bold text-sm shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึกตั้งค่า LINE...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>บันทึกตั้งค่า LINE Messaging API</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Feature Showcase Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#f3efe6]">1. เช็คสต็อกสินค้า</h3>
          <p className="text-xs text-[#a39b8b]">
            พิมพ์: <code className="text-[#98c9a3]">สต็อก พาราเซตามอล</code> หรือ <code className="text-[#98c9a3]">เช็คสต็อก P-001</code> ระบบจะตอบการ์ดจำนวนคงเหลือแยกตามคลังให้อัตโนมัติ
          </p>
        </div>

        <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#f3efe6]">2. ติดตามออเดอร์</h3>
          <p className="text-xs text-[#a39b8b]">
            พิมพ์: <code className="text-[#98c9a3]">ติดตาม ORD-2026-0005</code> เพื่อดูสถานะจัดส่ง สินค้า และเปิดดูใบวางบิลในระบบ
          </p>
        </div>

        <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
            <Bell className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#f3efe6]">3. แจ้งเตือนสินค้าใกล้หมด</h3>
          <p className="text-xs text-[#a39b8b]">
            แจ้งเตือนเข้ากลุ่ม LINE อัตโนมัติทันที เมื่อสินค้าในคลังใดก็ตามลัดคิวกระทบต่ำกว่าค่า <code className="text-[#d4a373]">minQuantity</code>
          </p>
        </div>
      </div>
    </div>
  );
}

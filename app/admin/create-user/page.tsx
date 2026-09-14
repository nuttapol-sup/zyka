"use client";

import { getApiPath } from "@/app/utils/apiPath";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Shield,
  User,
  Lock,
  Check,
  AlertCircle,
  CheckCircle2,
  Sliders,
  UserCheck,
  Search,
  X,
  Briefcase,
  Phone,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

interface PersonnelOption {
  _id: string;
  prefix: string;
  fullname: string;
  position: string;
  phone?: string;
  note?: string;
}

const AVAILABLE_PAGES = [
  { path: "/dashboard", name: "Dashboard (หน้าหลัก)", defaultChecked: true },
  { path: "/orders", name: "Orders (บันทึกสั่งซื้อ & ใบเสร็จ)", defaultChecked: false },
  { path: "/reports", name: "Reports (รายงานสรุป)", defaultChecked: false },
  { path: "/analytics", name: "Analytics (สถิติวิเคราะห์)", defaultChecked: false },
  { path: "/categories", name: "Categories (ประเภทหมวดสินค้า)", defaultChecked: false },
  { path: "/sub-categories", name: "Sub-Categories (บันทึกหมวดสินค้า)", defaultChecked: false },
  { path: "/products", name: "Products (บันทึกสินค้า)", defaultChecked: false },
  { path: "/inventory", name: "Inventory (จัดการสต็อกสินค้า)", defaultChecked: false },
  { path: "/locations", name: "Locations (สถานที่เก็บสินค้า)", defaultChecked: false },
  { path: "/personnel", name: "Personnel (ข้อมูลบุคลากร)", defaultChecked: false },
  { path: "/customers", name: "Customers (ข้อมูลลูกค้า)", defaultChecked: false },
];

export default function CreateUserPage() {
  const router = useRouter();
  const [personnelList, setPersonnelList] = useState<PersonnelOption[]>([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelOption | null>(null);
  const [referId, setReferId] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [allowedPages, setAllowedPages] = useState<string[]>(["/dashboard"]);
  const [lineUserId, setLineUserId] = useState("");
  const [canAccessLineReports, setCanAccessLineReports] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personnelSearch, setPersonnelSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch Personnel Options (referType = "1")
  useEffect(() => {
    async function fetchPersonnel() {
      try {
        const res = await fetch(getApiPath("/api/personnel"), { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setPersonnelList(data.personnel || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchPersonnel();
  }, []);

  // Handle Personnel Selection from Modal
  const handleSelectPersonnel = (p: PersonnelOption) => {
    setSelectedPersonnel(p);
    setReferId(p._id);
    const formattedName = `${p.prefix || ""} ${p.fullname}`.trim();
    setName(formattedName);
    setIsModalOpen(false);
  };

  // Clear Linked Personnel
  const handleClearPersonnel = () => {
    setSelectedPersonnel(null);
    setReferId("");
  };

  const handlePageToggle = (path: string) => {
    if (allowedPages.includes(path)) {
      setAllowedPages(allowedPages.filter((p) => p !== path));
    } else {
      setAllowedPages([...allowedPages, path]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(getApiPath("/api/admin/users"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          password,
          role,
          allowedPages,
          referId: referId || undefined,
          lineUserId: lineUserId || undefined,
          canAccessLineReports,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถสร้างผู้ใช้งานได้");
      }

      setSuccess(`สร้างบัญชีผู้ใช้ ${data.user.username} (${data.user.role}) สำเร็จเรียบร้อย!`);
      // Reset Form
      setSelectedPersonnel(null);
      setReferId("");
      setName("");
      setUsername("");
      setPassword("");
      setRole("user");
      setAllowedPages(["/dashboard"]);
      setLineUserId("");
      setCanAccessLineReports(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPersonnel = personnelList.filter(
    (p) =>
      p.fullname.toLowerCase().includes(personnelSearch.toLowerCase()) ||
      (p.position && p.position.toLowerCase().includes(personnelSearch.toLowerCase())) ||
      (p.phone && p.phone.toLowerCase().includes(personnelSearch.toLowerCase()))
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#446e50] to-[#1f3627] border border-[#98c9a3]/40 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-[#98c9a3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gradient-earth">
                สร้างผู้ใช้งานใหม่ (Create User)
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-[#446e50]/40 text-[#98c9a3] border border-[#98c9a3]/30 font-semibold">
                Admin Only
              </span>
            </div>
            <p className="text-xs text-[#a39b8b]">
              ดึงข้อมูลบุคลากรมาผูกบัญชีผู้ใช้ หรือเพิ่มผู้ใช้งานใหม่เข้าสู่ระบบ
            </p>
          </div>
        </div>

        <Link
          href="/admin/manage-permissions"
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#121c15] text-[#98c9a3] border border-[#98c9a3]/30 hover:bg-[#1c2d22] transition-colors flex items-center gap-1.5"
        >
          <Sliders className="w-4 h-4" />
          <span>จัดการสิทธิ์</span>
        </Link>
      </div>

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

      {/* Form Card */}
      <div className="glass-earth-card p-8 rounded-3xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name & Select Personnel Button in Same Row */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider">
                ชื่อ-นามสกุล (Full Name) *
              </label>
              {selectedPersonnel && (
                <div className="flex items-center gap-1.5 text-xs text-[#98c9a3] bg-[#1e3425] px-2.5 py-0.5 rounded-lg border border-[#98c9a3]/30">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>ผูกกับบุคลากร: {selectedPersonnel.fullname}</span>
                  <button
                    type="button"
                    onClick={handleClearPersonnel}
                    className="text-[#a39b8b] hover:text-red-400 ml-1"
                    title="ยกเลิกการผูก"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a39b8b]">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#121c15] border border-[#2d4734] text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3] focus:ring-1 focus:ring-[#98c9a3] transition-all text-sm"
                  placeholder="สมชาย ใจดี"
                />
              </div>

              {/* Popup Trigger Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-3 rounded-xl bg-[#1e3425] hover:bg-[#274330] border border-[#98c9a3]/40 text-[#98c9a3] hover:text-[#f3efe6] text-xs font-bold flex items-center gap-2 transition-all shrink-0 shadow-md"
              >
                <UserCheck className="w-4 h-4" />
                <span>ดึงข้อมูลบุคลากร</span>
              </button>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider mb-2">
              ชื่อผู้ใช้ (Username) *
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
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#121c15] border border-[#2d4734] text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3] focus:ring-1 focus:ring-[#98c9a3] transition-all text-sm font-mono"
                placeholder="user1"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider mb-2">
              รหัสผ่าน (Password) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a39b8b]">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#121c15] border border-[#2d4734] text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3] focus:ring-1 focus:ring-[#98c9a3] transition-all text-sm"
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
            </div>
          </div>

          {/* Role Select */}
          <div>
            <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider mb-2">
              กำหนดสิทธิ์ระดับบัญชี (User Role)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                  role === "user"
                    ? "bg-[#1f3025] border-[#98c9a3] text-[#f3efe6]"
                    : "bg-[#121c15] border-[#2d4734] text-[#a39b8b] hover:border-[#98c9a3]/40"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    role === "user" ? "bg-[#2a4332] text-[#98c9a3]" : "bg-[#1a261c] text-[#a39b8b]"
                  }`}
                >
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">User ทั่วไป</p>
                  <p className="text-[10px] text-[#a39b8b]">เข้าถึงตามสิทธิ์ที่ได้รับเลือก</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                  role === "admin"
                    ? "bg-[#1f3025] border-[#98c9a3] text-[#f3efe6]"
                    : "bg-[#121c15] border-[#2d4734] text-[#a39b8b] hover:border-[#98c9a3]/40"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    role === "admin" ? "bg-[#446e50] text-[#f3efe6]" : "bg-[#1a261c] text-[#a39b8b]"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Admin</p>
                  <p className="text-[10px] text-[#a39b8b]">เข้าถึงได้ทุกหน้าและจัดการผู้ใช้</p>
                </div>
              </button>
            </div>
          </div>

          {/* LINE Integration & Report Permission */}
          <div className="p-4 rounded-2xl bg-[#121c15] border border-[#2d4734] space-y-3">
            <div className="flex items-center gap-2 border-b border-[#2d4734] pb-2">
              <MessageSquare className="w-4 h-4 text-[#98c9a3]" />
              <span className="text-xs font-bold text-[#f3efe6]">
                สิทธิ์การดูรายงานผ่าน LINE (LINE Report Access)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* LINE User ID */}
              <div>
                <label className="block text-[11px] font-semibold text-[#e6dfd3] mb-1">
                  LINE User ID (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={lineUserId}
                  onChange={(e) => setLineUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1712] border border-[#2d4734] text-xs font-mono text-[#f3efe6] placeholder-[#a39b8b]/40 focus:outline-none focus:border-[#98c9a3]"
                  placeholder="เช่น U1234567890abcdef..."
                />
              </div>

              {/* Can Access LINE Reports Toggle */}
              <div>
                <label className="block text-[11px] font-semibold text-[#e6dfd3] mb-1">
                  สิทธิ์ขอดูรายงานผ่าน LINE
                </label>
                <label className="flex items-center gap-2 text-xs text-[#f3efe6] cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={role === "admin" || canAccessLineReports}
                    disabled={role === "admin"}
                    onChange={(e) => setCanAccessLineReports(e.target.checked)}
                    className="rounded border-[#2d4734] bg-[#0f1712] text-[#98c9a3] accent-[#98c9a3] w-4 h-4"
                  />
                  <span>
                    {role === "admin"
                      ? "ADMIN ได้รับสิทธิ์โดยอัตโนมัติ"
                      : "อนุญาตให้ขอดูลายงานยอดขาย & ยอดเก็บเงินผ่าน LINE"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Initial Allowed Pages Selection */}
          {role === "user" && (
            <div className="space-y-3 pt-2 border-t border-[#2d4734]">
              <label className="block text-xs font-semibold text-[#e6dfd3] uppercase tracking-wider">
                เลือกหน้าที่อนุญาตให้เข้าใช้งานเบื้องต้น (Initial Allowed Pages)
              </label>

              <div className="space-y-2">
                {AVAILABLE_PAGES.map((page) => {
                  const isChecked = allowedPages.includes(page.path);
                  return (
                    <label
                      key={page.path}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-[#1b2b20] border-[#98c9a3]/60 text-[#f3efe6]"
                          : "bg-[#121c15] border-[#2d4734] text-[#a39b8b] hover:border-[#98c9a3]/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageToggle(page.path);
                          }}
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                            isChecked
                              ? "bg-[#446e50] border-[#98c9a3] text-[#f3efe6]"
                              : "border-[#2d4734] bg-[#0f1712]"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-sm font-medium">{page.name}</span>
                      </div>
                      <code className="text-[11px] text-[#98c9a3] bg-[#0f1712] px-2 py-0.5 rounded border border-[#2d4734]">
                        {page.path}
                      </code>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-earth-primary py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>กำลังบันทึกข้อมูล...</span>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>กดยืนยันสร้างบัญชีผู้ใช้งาน</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Personnel Selection Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="max-w-lg w-full glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 space-y-4 relative overflow-hidden max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#f3efe6]">
                    เลือกข้อมูลบุคลากร (Select Personnel)
                  </h3>
                  <p className="text-xs text-[#a39b8b]">
                    เลือกรายชื่อบุคลากรเพื่อนำมาผูกกับบัญชีผู้ใช้นี้
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#121c15]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อบุคลากร, ตำแหน่ง หรือเบอร์โทร..."
                value={personnelSearch}
                onChange={(e) => setPersonnelSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
              />
            </div>

            {/* Personnel List */}
            <div className="overflow-y-auto space-y-2 pr-1 flex-1">
              {filteredPersonnel.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#a39b8b]">
                  ไม่พบข้อมูลบุคลากรในระบบ
                </div>
              ) : (
                filteredPersonnel.map((p) => {
                  const isSelected = referId === p._id;

                  return (
                    <div
                      key={p._id}
                      onClick={() => handleSelectPersonnel(p)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-[#1e3425] border-[#98c9a3] text-[#f3efe6] shadow-sm"
                          : "bg-[#121c15] border-[#2d4734] hover:border-[#98c9a3]/40 text-[#e6dfd3]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#1c2d22] border border-[#98c9a3]/30 flex items-center justify-center font-bold text-xs text-[#98c9a3] shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-[#f3efe6]">
                            {p.prefix && (
                              <span className="text-[#98c9a3] mr-1">{p.prefix}</span>
                            )}
                            {p.fullname}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-[#a39b8b] mt-0.5">
                            {p.position && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-[#98c9a3]" />
                                {p.position}
                              </span>
                            )}
                            {p.phone && (
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-[#98c9a3]" />
                                {p.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                          isSelected
                            ? "bg-[#98c9a3] text-[#0f1712]"
                            : "bg-[#1e3425] text-[#98c9a3] hover:bg-[#274330]"
                        }`}
                      >
                        {isSelected ? "เลือกแล้ว" : "เลือกรายชื่อนี้"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#2d4734] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

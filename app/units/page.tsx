"use client";

import { getApiPath } from "@/app/utils/apiPath";
import { useEffect, useState } from "react";
import {
  Ruler,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Check,
} from "lucide-react";
import Pagination from "@/app/components/Pagination";

interface UnitItem {
  _id: string;
  code: string;
  name: string;
  description?: string;
  seq: number;
  status: "active" | "inactive";
  createdAt: string;
}

export default function UnitsPage() {
  const [units, setUnits] = useState<UnitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitItem | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiPath("/api/units"), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUnits(data.units || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const openCreateModal = () => {
    setEditingUnit(null);
    setCode("");
    setName("");
    setDescription("");
    setStatus("active");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (u: UnitItem) => {
    setEditingUnit(u);
    setCode(u.code);
    setName(u.name);
    setDescription(u.description || "");
    setStatus(u.status);
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("กรุณากรอกชื่อหน่วยนับ");
      return;
    }

    setSaving(true);

    try {
      const url = editingUnit
        ? getApiPath(`/api/units/${editingUnit._id}`)
        : getApiPath("/api/units");
      const method = editingUnit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          name: name.trim(),
          description: description.trim(),
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      setSuccess(data.message || "บันทึกข้อมูลสำเร็จ!");
      setIsModalOpen(false);
      fetchUnits();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, unitName: string) => {
    if (!confirm(`คุณต้องการลบหน่วยนับ "${unitName}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(getApiPath(`/api/units/${id}`), { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถลบรายการได้");
      }

      setSuccess("ลบหน่วยนับสำเร็จ");
      fetchUnits();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredUnits = units.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.description && u.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "all" || u.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = units.filter((u) => u.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#446e50] to-[#1f3627] border border-[#98c9a3]/40 flex items-center justify-center">
            <Ruler className="w-6 h-6 text-[#98c9a3]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-earth">
              บันทึกหน่วยนับ (Unit Master Management)
            </h1>
            <p className="text-xs text-[#a39b8b]">
              กำหนดและจัดการรายการหน่วยนับสินค้า (เช่น ชิ้น, แพ็ค, กล่อง, ขวด, ลัง) สำหรับใช้งานในระบบสินค้า
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUnits}
            className="p-2.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734] transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="btn-earth-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มหน่วยนับใหม่</span>
          </button>
        </div>
      </div>

      {/* Alert Success */}
      {success && (
        <div className="p-4 rounded-2xl bg-[#1e3425] border border-[#98c9a3]/50 text-[#98c9a3] text-sm flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#98c9a3] shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] flex items-center justify-between">
          <div>
            <p className="text-xs text-[#a39b8b]">หน่วยนับทั้งหมดในระบบ</p>
            <h3 className="text-2xl font-extrabold text-[#f3efe6] font-mono mt-1">
              {units.length} <span className="text-sm font-normal text-[#a39b8b]">รายการ</span>
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#121c15] border border-[#2d4734] flex items-center justify-center text-[#98c9a3]">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] flex items-center justify-between">
          <div>
            <p className="text-xs text-[#a39b8b]">สถานะเปิดใช้งาน (ACTIVE)</p>
            <h3 className="text-2xl font-extrabold text-[#98c9a3] font-mono mt-1">
              {activeCount} <span className="text-sm font-normal text-[#a39b8b]">รายการ</span>
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
            <Check className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหน่วยนับ, รหัส, หรือรายละเอียด..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#121c15] text-[#f3efe6] text-xs px-3.5 py-2 rounded-xl border border-[#2d4734] focus:outline-none focus:border-[#98c9a3]"
        >
          <option value="all">ทุกสถานะ</option>
          <option value="active">ใช้งานปกติ (Active)</option>
          <option value="inactive">ปิดใช้งาน (Inactive)</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734]">
        {loading ? (
          <div className="p-12 text-center text-[#a39b8b]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#98c9a3]" />
            กำลังโหลดข้อมูลหน่วยนับ...
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="p-12 text-center text-[#a39b8b]">
            ไม่พบข้อมูลหน่วยนับตามเงื่อนไขที่ค้นหา
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase tracking-wider">
                  <th className="py-4 px-4 text-center">ลำดับ</th>
                  <th className="py-4 px-6">รหัสหน่วยนับ</th>
                  <th className="py-4 px-6">ชื่อหน่วยนับ</th>
                  <th className="py-4 px-6">รายละเอียด / คำอธิบาย</th>
                  <th className="py-4 px-4 text-center">สถานะ</th>
                  <th className="py-4 px-6 text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2d4734]/50 text-sm">
                {filteredUnits
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((u, idx) => (
                  <tr key={u._id} className="hover:bg-[#18241c]/60 transition-colors">
                    {/* Seq */}
                    <td className="py-4 px-4 text-center font-mono text-xs text-[#a39b8b]">
                      #{(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>

                    {/* Code */}
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-xl bg-[#1e3425] text-[#98c9a3] font-mono font-bold text-xs border border-[#98c9a3]/30 inline-block">
                        {u.code}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-4 px-6 font-bold text-[#f3efe6]">
                      {u.name}
                    </td>

                    {/* Description */}
                    <td className="py-4 px-6 text-xs text-[#a39b8b]">
                      {u.description || "-"}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {u.status === "active" ? (
                        <span className="px-3 py-1 rounded-full bg-[#1e3425] text-[#98c9a3] text-xs font-bold border border-[#98c9a3]/30 inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ใช้งาน
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-[#2a251b] text-[#a39b8b] text-xs font-bold border border-[#a39b8b]/30 inline-flex items-center gap-1.5">
                          ปิดใช้งาน
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg bg-[#121c15] text-[#98c9a3] hover:bg-[#1c2d22] border border-[#2d4734] transition-colors"
                          title="แก้ไขหน่วยนับ"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id, u.name)}
                          className="p-1.5 rounded-lg bg-[#121c15] text-red-400 hover:bg-red-950/40 border border-[#2d4734] transition-colors"
                          title="ลบหน่วยนับ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#2d4734]">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredUnits.length / itemsPerPage)}
            totalItems={filteredUnits.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(size) => setItemsPerPage(size)}
          />
        </div>
      </div>

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#98c9a3]/30 space-y-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#f3efe6]">
                    {editingUnit ? "แก้ไขข้อมูลหน่วยนับ" : "เพิ่มหน่วยนับใหม่"}
                  </h3>
                  <p className="text-xs text-[#a39b8b]">
                    {editingUnit ? `รหัส: ${editingUnit.code}` : "สร้างรายการหน่วยนับสินค้าใหม่"}
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

            {/* Alert Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Unit Code */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  รหัสหน่วยนับ (Unit Code)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                  placeholder="เช่น U-01 (เว้นว่างเพื่อสร้างให้อัตโนมัติ)"
                />
              </div>

              {/* Unit Name */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  ชื่อหน่วยนับ (Unit Name) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                  placeholder="เช่น ชิ้น, แพ็ค, กล่อง, ขวด, ลัง"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  รายละเอียด / คำอธิบาย
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3] resize-none"
                  placeholder="ระบุคำอธิบายหรือตัวอย่างการใช้งานเพิ่มเติม..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  สถานะการใช้งาน
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                >
                  <option value="active">ใช้งานปกติ (Active)</option>
                  <option value="inactive">ปิดใช้งาน (Inactive)</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2d4734]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-earth-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <span>กำลังบันทึก...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingUnit ? "บันทึกการแก้ไข" : "ยืนยันสร้างหน่วยนับ"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";
import Pagination from "@/app/components/Pagination";
import { getApiPath } from "@/app/utils/apiPath";

interface ZoneItem {
  _id: string;
  code: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: string;
}

export default function ZonesPage() {
  const [zones, setZones] = useState<ZoneItem[]>([]);
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
  const [editingItem, setEditingItem] = useState<ZoneItem | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiPath("/api/zones"), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setZones(data.zones || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  // Helper to generate next code (e.g. Z-01, Z-02)
  const generateNextCode = (existingZones: ZoneItem[]): string => {
    if (!existingZones || existingZones.length === 0) {
      return "Z-01";
    }

    let maxNum = 0;
    let prefix = "Z-";
    let padLength = 2;

    existingZones.forEach((z) => {
      const match = z.code.match(/^([A-Za-z]+-?)(\d+)$/);
      if (match) {
        prefix = match[1];
        const num = parseInt(match[2], 10);
        if (num > maxNum) {
          maxNum = num;
          padLength = match[2].length;
        }
      }
    });

    const nextNum = maxNum + 1;
    return `${prefix}${nextNum.toString().padStart(padLength, "0")}`;
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setCode(generateNextCode(zones));
    setName("");
    setDescription("");
    setStatus("active");
    setError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ZoneItem) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setDescription(item.description || "");
    setStatus(item.status);
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("กรุณากรอกรหัสโซนสินค้า");
      return;
    }
    if (!name.trim()) {
      setError("กรุณากรอกชื่อโซนสินค้า");
      return;
    }

    setSaving(true);

    try {
      const url = editingItem
        ? getApiPath(`/api/zones/${editingItem._id}`)
        : getApiPath("/api/zones");
      const method = editingItem ? "PUT" : "POST";

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

      setSuccess(
        editingItem ? "อัปเดตข้อมูลโซนสินค้าสำเร็จ!" : "เพิ่มโซนสินค้าใหม่สำเร็จ!"
      );
      setIsModalOpen(false);
      fetchZones();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, zoneName: string) => {
    if (!confirm(`คุณต้องการลบโซนสินค้า "${zoneName}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(getApiPath(`/api/zones/${id}`), { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถลบโซนสินค้าได้");
      }

      setSuccess("ลบโซนสินค้าสำเร็จ");
      fetchZones();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredZones = zones.filter((z) => {
    const matchesSearch =
      z.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      z.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (z.description && z.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === "all" || z.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);
  const paginatedZones = filteredZones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#446e50] to-[#1f3627] border border-[#98c9a3]/40 flex items-center justify-center">
            <Layers className="w-6 h-6 text-[#98c9a3]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-earth">
              บันทึก Zone สินค้า (Zone Master)
            </h1>
            <p className="text-xs text-[#a39b8b]">
              จัดการข้อมูลโซนสินค้า / โซนจัดเก็บ ในคลังสินค้าสำหรับระบุในสต็อก
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchZones}
            className="p-2.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734] transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="btn-earth-primary px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่ม Zone ใหม่</span>
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

      {/* Search & Filter Bar */}
      <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาตามรหัสโซน / ชื่อโซน / รายละเอียด..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#a39b8b] font-semibold shrink-0">สถานะ:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
          >
            <option value="all">ทั้งหมด</option>
            <option value="active">🟢 ใช้งาน (Active)</option>
            <option value="inactive">🔴 ยกเลิก (Inactive)</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734]">
        {loading ? (
          <div className="p-12 text-center text-[#a39b8b]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#98c9a3]" />
            กำลังโหลดข้อมูล Zone...
          </div>
        ) : filteredZones.length === 0 ? (
          <div className="p-12 text-center text-[#a39b8b]">ไม่พบข้อมูล Zone สินค้า</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase tracking-wider">
                  <th className="py-4 px-6">รหัส Zone</th>
                  <th className="py-4 px-6">ชื่อ Zone</th>
                  <th className="py-4 px-6">รายละเอียด</th>
                  <th className="py-4 px-4 text-center">สถานะ</th>
                  <th className="py-4 px-6 text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2d4734]/50 text-sm">
                {paginatedZones.map((item) => (
                  <tr key={item._id} className="hover:bg-[#18241c]/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-[#98c9a3]">
                      {item.code}
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-bold text-[#f3efe6] flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#98c9a3]" />
                        {item.name}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-[#a39b8b]">
                      {item.description || "-"}
                    </td>

                    <td className="py-4 px-4 text-center">
                      {item.status === "active" ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#1e3425] text-[#98c9a3] text-xs font-bold border border-[#98c9a3]/30">
                          🟢 ใช้งาน
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-red-950/60 text-red-300 text-xs font-bold border border-red-800/40">
                          🔴 ปิดใช้งาน
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg bg-[#121c15] text-[#98c9a3] hover:bg-[#1c2d22] border border-[#2d4734] transition-colors"
                          title="แก้ไขโซน"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.name)}
                          className="p-1.5 rounded-lg bg-[#121c15] text-red-400 hover:bg-red-950/40 border border-[#2d4734] transition-colors"
                          title="ลบโซน"
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
            totalPages={totalPages}
            totalItems={filteredZones.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(size) => setItemsPerPage(size)}
          />
        </div>
      </div>

      {/* Modal Form for Create / Edit Zone */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#98c9a3]/30 space-y-6 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4">
              <h3 className="text-xl font-bold text-[#f3efe6]">
                {editingItem ? "แก้ไขโซนสินค้า (Edit Zone)" : "เพิ่ม Zone สินค้าใหม่ (New Zone)"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#121c15]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase">
                    รหัสโซน (Zone Code) *
                  </label>
                  {!editingItem && (
                    <button
                      type="button"
                      onClick={() => setCode(generateNextCode(zones))}
                      className="text-[11px] text-[#98c9a3] hover:underline flex items-center gap-1 font-medium"
                    >
                      <Sparkles className="w-3 h-3 text-[#98c9a3]" />
                      สร้างรหัสอัตโนมัติ
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                  placeholder="เช่น Z-01"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  ชื่อโซนสินค้า (Zone Name) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                  placeholder="เช่น โซน A (สินค้าทั่วไป), โซนเย็น"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  รายละเอียดเพิ่มเติม (Description)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                  placeholder="ระบุรายละเอียดเพิ่มเติมของโซน..."
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
                  <option value="active">🟢 ใช้งาน (Active)</option>
                  <option value="inactive">🔴 ยกเลิก (Inactive)</option>
                </select>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2d4734]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a39b8b] hover:bg-[#121c15] border border-[#2d4734]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-earth-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? "บันทึกการแก้ไข" : "สร้างโซนสินค้า"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

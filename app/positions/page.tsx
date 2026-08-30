"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import Pagination from "@/app/components/Pagination";
import { getApiPath } from "@/app/utils/apiPath";

interface PositionData {
  _id: string;
  code?: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionData | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const url = `/api/positions?search=${encodeURIComponent(searchTerm)}&status=${statusFilter}`;
      const res = await fetch(getApiPath(url), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPositions(data.positions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const openCreateModal = () => {
    setEditingPosition(null);
    setCode("");
    setName("");
    setDescription("");
    setStatus("active");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (pos: PositionData) => {
    setEditingPosition(pos);
    setCode(pos.code || "");
    setName(pos.name);
    setDescription(pos.description || "");
    setStatus(pos.status);
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (!name.trim()) {
        throw new Error("กรุณากรอกชื่อตำแหน่งงาน");
      }

      const isEdit = !!editingPosition;
      const url = isEdit ? `/api/positions/${editingPosition._id}` : "/api/positions";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(getApiPath(url), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          description,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");

      setSuccess(isEdit ? "แก้ไขตำแหน่งงานเรียบร้อยแล้ว!" : "สร้างตำแหน่งงานใหม่เรียบร้อยแล้ว!");
      setIsModalOpen(false);
      fetchPositions();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, posName: string) => {
    if (!confirm(`คุณต้องการลบตำแหน่งงาน "${posName}" ใช่หรือไม่?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(getApiPath(`/api/positions/${id}`), { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการลบข้อมูล");

      setSuccess(`ลบตำแหน่งงาน "${posName}" เรียบร้อยแล้ว`);
      fetchPositions();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const totalCount = positions.length;
  const activeCount = positions.filter((p) => p.status === "active").length;
  const inactiveCount = positions.filter((p) => p.status === "inactive").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-earth">
              บันทึกข้อมูลตำแหน่งงาน (Job Positions)
            </h1>
            <p className="text-xs text-[#a39b8b]">
              กำหนดและจัดการตำแหน่งงาน เพื่อนำไปดึงเลือกใช้งานในหน้าข้อมูลบุคลากร
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPositions}
            className="p-2.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734] transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="btn-earth-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มตำแหน่งงานใหม่</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="p-4 rounded-2xl bg-[#1e3425] border border-[#98c9a3]/50 text-[#98c9a3] text-sm flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#98c9a3] shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] text-[#98c9a3] border border-[#98c9a3]/30 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#a39b8b]">ตำแหน่งงานทั้งหมด</p>
            <p className="text-xl font-bold text-[#f3efe6] font-mono">{totalCount} รายการ</p>
          </div>
        </div>

        <div className="glass-earth-card p-4 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-900/40 text-emerald-300 border border-emerald-600/40 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-emerald-300/80">สถานะเปิดใช้งาน</p>
            <p className="text-xl font-bold text-emerald-300 font-mono">{activeCount} ตำแหน่ง</p>
          </div>
        </div>

        <div className="glass-earth-card p-4 rounded-2xl border border-rose-900/40 bg-rose-950/20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-900/40 text-rose-300 border border-rose-600/40 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-rose-300/80">สถานะปิดใช้งาน</p>
            <p className="text-xl font-bold text-rose-300 font-mono">{inactiveCount} ตำแหน่ง</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหารหัส หรือ ชื่อตำแหน่งงาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#a39b8b]">สถานะ:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#121c15] text-[#f3efe6] text-xs px-3 py-1.5 rounded-xl border border-[#2d4734] focus:outline-none focus:border-[#98c9a3]"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="active">เปิดใช้งาน (Active)</option>
            <option value="inactive">ปิดใช้งาน (Inactive)</option>
          </select>
        </div>
      </div>

      {/* Positions Table */}
      <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734]">
        {loading ? (
          <div className="p-12 text-center text-[#a39b8b]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#98c9a3]" />
            กำลังโหลดข้อมูลตำแหน่งงาน...
          </div>
        ) : positions.length === 0 ? (
          <div className="p-12 text-center text-[#a39b8b]">
            ไม่พบข้อมูลตำแหน่งงานในระบบ
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase tracking-wider">
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">รหัสตำแหน่ง</th>
                  <th className="py-4 px-6">ชื่อตำแหน่งงาน</th>
                  <th className="py-4 px-6">รายละเอียดเพิ่มเติม</th>
                  <th className="py-4 px-4 text-center">สถานะ</th>
                  <th className="py-4 px-6 text-right">วันที่สร้าง</th>
                  <th className="py-4 px-6 text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2d4734]/50 text-sm">
                {positions
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((pos, idx) => (
                    <tr key={pos._id} className="hover:bg-[#18241c]/60 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-[#a39b8b]">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>

                      <td className="py-4 px-6 font-mono text-xs font-bold text-[#98c9a3]">
                        {pos.code || "-"}
                      </td>

                      <td className="py-4 px-6 font-bold text-[#f3efe6]">
                        {pos.name}
                      </td>

                      <td className="py-4 px-6 text-xs text-[#a39b8b]">
                        {pos.description || "-"}
                      </td>

                      <td className="py-4 px-4 text-center text-xs">
                        {pos.status === "active" ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-600/40 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            เปิดใช้งาน
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-300 font-bold border border-rose-600/40 inline-flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            ปิดใช้งาน
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right font-mono text-xs text-[#a39b8b]">
                        {new Date(pos.createdAt).toLocaleDateString("th-TH")}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(pos)}
                            className="p-2 rounded-xl bg-[#1e3425] text-[#98c9a3] hover:bg-[#284532] border border-[#98c9a3]/30 transition-colors"
                            title="แก้ไขตำแหน่งงาน"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(pos._id, pos.name)}
                            disabled={deletingId === pos._id}
                            className="p-2 rounded-xl bg-red-950/50 text-red-400 hover:bg-red-900/60 border border-red-800/40 transition-colors disabled:opacity-50"
                            title="ลบตำแหน่งงาน"
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
            totalPages={Math.ceil(positions.length / itemsPerPage)}
            totalItems={positions.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(size) => setItemsPerPage(size)}
          />
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#98c9a3]/30 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#f3efe6]">
                    {editingPosition ? "แก้ไขตำแหน่งงาน" : "เพิ่มตำแหน่งงานใหม่"}
                  </h3>
                  <p className="text-xs text-[#a39b8b]">
                    {editingPosition ? "อัปเดตข้อมูลตำแหน่งงานในระบบ" : "กรอกข้อมูลเพื่อบันทึกตำแหน่งงานใหม่"}
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

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  รหัสตำแหน่ง (Position Code)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="เช่น POS-001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  ชื่อตำแหน่งงาน (Position Name) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น พนักงานขาย, ผู้จัดการฝ่ายขาย, บัญชี"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  รายละเอียดเพิ่มเติม (Description)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="คำอธิบายขอบเขตงาน หรือรายละเอียดหน้าที่..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  สถานะการใช้งาน (Status)
                </label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                >
                  <option value="active">เปิดใช้งาน (Active)</option>
                  <option value="inactive">ปิดใช้งาน (Inactive)</option>
                </select>
              </div>

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
                  className="btn-earth-primary px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <span>{editingPosition ? "อัปเดตข้อมูล" : "บันทึกข้อมูล"}</span>
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

"use client";

import { useEffect, useState } from "react";
import {
  FolderTree,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
} from "lucide-react";
import Pagination from "@/app/components/Pagination";
import { getApiPath } from "@/app/utils/apiPath";

interface DepartmentItem {
  _id: string;
  code?: string;
  name: string;
  description?: string;
  seq: number;
  status: "active" | "inactive";
  createdAt: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DepartmentItem | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [seq, setSeq] = useState<number>(0);
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiPath("/api/departments"), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setCode("");
    setName("");
    setDescription("");
    setSeq(departments.length + 1);
    setStatus("active");
    setError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: DepartmentItem) => {
    setEditingItem(item);
    setCode(item.code || "");
    setName(item.name);
    setDescription(item.description || "");
    setSeq(item.seq || 0);
    setStatus(item.status);
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("กรุณากรอกชื่อแผนก");
      return;
    }

    setSaving(true);

    try {
      const url = editingItem
        ? getApiPath(`/api/departments/${editingItem._id}`)
        : getApiPath("/api/departments");
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          name: name.trim(),
          description: description.trim(),
          seq,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      setSuccess(
        editingItem ? "อัปเดตข้อมูลแผนกสำเร็จ!" : "เพิ่มข้อมูลแผนกใหม่สำเร็จ!"
      );
      setIsModalOpen(false);
      fetchDepartments();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, deptName: string) => {
    if (!confirm(`คุณต้องการลบแผนก "${deptName}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(getApiPath(`/api/departments/${id}`), { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถลบแผนกได้");
      }

      setSuccess("ลบข้อมูลแผนกสำเร็จ");
      fetchDepartments();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredDepartments = departments.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.code && d.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === "all" || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#446e50] to-[#1f3627] border border-[#98c9a3]/40 flex items-center justify-center">
            <FolderTree className="w-6 h-6 text-[#98c9a3]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-earth">
              บันทึกข้อมูลแผนก (Department Master)
            </h1>
            <p className="text-xs text-[#a39b8b]">
              จัดการข้อมูลรายชื่อแผนกงานภายในองค์กร สำหรับผูกข้อมูลตำแหน่งและบุคลากร
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDepartments}
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
            <span>เพิ่มแผนกใหม่</span>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] text-[#98c9a3] border border-[#98c9a3]/30 flex items-center justify-center">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#a39b8b]">แผนกทั้งหมด</p>
            <p className="text-xl font-bold text-[#f3efe6] font-mono">{departments.length} รายการ</p>
          </div>
        </div>

        <div className="glass-earth-card p-4 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-900/40 text-emerald-300 border border-emerald-600/40 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-emerald-300/80">สถานะเปิดใช้งาน</p>
            <p className="text-xl font-bold text-emerald-300 font-mono">
              {departments.filter((d) => d.status === "active").length} แผนก
            </p>
          </div>
        </div>

        <div className="glass-earth-card p-4 rounded-2xl border border-rose-900/40 bg-rose-950/20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-900/40 text-rose-300 border border-rose-600/40 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-rose-300/80">สถานะปิดใช้งาน</p>
            <p className="text-xl font-bold text-rose-300 font-mono">
              {departments.filter((d) => d.status === "inactive").length} แผนก
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาตามรหัสแผนก / ชื่อแผนก / รายละเอียด..."
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
            กำลังโหลดข้อมูลแผนก...
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="p-12 text-center text-[#a39b8b]">ไม่พบข้อมูลแผนก</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase tracking-wider">
                  <th className="py-4 px-6">รหัส</th>
                  <th className="py-4 px-6">ชื่อแผนก</th>
                  <th className="py-4 px-6">รายละเอียด</th>
                  <th className="py-4 px-4 text-center">ลำดับ</th>
                  <th className="py-4 px-4 text-center">สถานะ</th>
                  <th className="py-4 px-6 text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2d4734]/50 text-sm">
                {paginatedDepartments.map((item) => (
                  <tr key={item._id} className="hover:bg-[#18241c]/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-[#98c9a3]">
                      {item.code || "-"}
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-bold text-[#f3efe6] flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-[#98c9a3]" />
                        {item.name}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-[#a39b8b]">
                      {item.description || "-"}
                    </td>

                    <td className="py-4 px-4 text-center font-mono text-xs text-[#a39b8b]">
                      {item.seq}
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
                          title="แก้ไขแผนก"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.name)}
                          className="p-1.5 rounded-lg bg-[#121c15] text-red-400 hover:bg-red-950/40 border border-[#2d4734] transition-colors"
                          title="ลบแผนก"
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
            totalItems={filteredDepartments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(size) => setItemsPerPage(size)}
          />
        </div>
      </div>

      {/* Modal Form for Create / Edit Department */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#98c9a3]/30 space-y-6 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4">
              <h3 className="text-xl font-bold text-[#f3efe6]">
                {editingItem ? "แก้ไขข้อมูลแผนก (Edit Department)" : "เพิ่มแผนกใหม่ (New Department)"}
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
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  รหัสแผนก (Department Code)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                  placeholder="เช่น D-01 (ไม่ระบุก็ได้)"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  ชื่อแผนก (Department Name) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                  placeholder="เช่น ฝ่ายขาย, ฝ่ายผลิต, ฝ่ายจัดซื้อ"
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
                  placeholder="ระบุรายละเอียดเพิ่มเติม..."
                />
              </div>

              {/* Sequence */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  ลำดับการแสดงผล (Seq)
                </label>
                <input
                  type="number"
                  value={seq}
                  onChange={(e) => setSeq(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                  placeholder="1"
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
                  <span>{editingItem ? "บันทึกการแก้ไข" : "สร้างข้อมูลแผนก"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

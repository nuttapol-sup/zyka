"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Briefcase,
  UserCheck,
} from "lucide-react";
import Pagination from "@/app/components/Pagination";

interface PersonnelItem {
  _id: string;
  prefix: string;
  fullname: string;
  position: string;
  phone?: string;
  note?: string;
  referType: string;
  status: "active" | "inactive";
  createdAt: string;
}

const PREFIX_OPTIONS = ["นาย", "นาง", "นางสาว", "ดร.", "ผศ.", "พญ.", "นพ.", "อื่นๆ"];

export default function PersonnelPage() {
  const [personnelList, setPersonnelList] = useState<PersonnelItem[]>([]);
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
  const [editingItem, setEditingItem] = useState<PersonnelItem | null>(null);

  // Form State
  const [prefix, setPrefix] = useState("นาย");
  const [fullname, setFullname] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPersonnel = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/personnel", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPersonnelList(data.personnel || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setPrefix("นาย");
    setFullname("");
    setPosition("");
    setPhone("");
    setNote("");
    setStatus("active");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: PersonnelItem) => {
    setEditingItem(item);
    setPrefix(item.prefix || "นาย");
    setFullname(item.fullname);
    setPosition(item.position);
    setPhone(item.phone || "");
    setNote(item.note || "");
    setStatus(item.status);
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const url = editingItem
        ? `/api/personnel/${editingItem._id}`
        : "/api/personnel";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefix,
          fullname,
          position,
          phone,
          note,
          referType: "1",
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      setSuccess(editingItem ? "อัปเดตข้อมูลบุคลากรสำเร็จ!" : "เพิ่มข้อมูลบุคลากรสำเร็จ!");
      setIsModalOpen(false);
      fetchPersonnel();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบข้อมูลบุคลากร "${name}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/personnel/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถลบข้อมูลได้");

      setSuccess("ลบข้อมูลบุคลากรสำเร็จเรียบร้อย");
      fetchPersonnel();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredPersonnel = personnelList.filter((item) => {
    const matchesSearch =
      item.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phone && item.phone.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const activeCount = personnelList.filter((p) => p.status === "active").length;
  const inactiveCount = personnelList.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#446e50] to-[#1f3627] border border-[#98c9a3]/40 flex items-center justify-center">
            <Users className="w-6 h-6 text-[#98c9a3]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-earth">
              บันทึกข้อมูลบุคลากร (Personnel Records)
            </h1>
            <p className="text-xs text-[#a39b8b]">
              ระบบจัดเก็บและจัดการข้อมูลรายชื่อบุคลากร คำนำหน้า ตำแหน่ง และข้อมูลการติดต่อ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPersonnel}
            className="p-2.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734] transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="btn-earth-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มข้อมูลบุคลากร</span>
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
        <div className="glass-earth-card p-5 rounded-2xl border border-[#98c9a3]/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#a39b8b] font-medium block uppercase">
              จำนวนบุคลากรทั้งหมด
            </span>
            <span className="text-3xl font-extrabold text-[#f3efe6]">
              {personnelList.length} <span className="text-xs font-normal text-[#a39b8b]">คน</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#98c9a3]" />
          </div>
        </div>

        <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#a39b8b] font-medium block uppercase">
              ทำงานอยู่ (ACTIVE)
            </span>
            <span className="text-3xl font-extrabold text-[#98c9a3]">
              {activeCount} <span className="text-xs font-normal text-[#a39b8b]">คน</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-[#98c9a3]" />
          </div>
        </div>

        <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#a39b8b] font-medium block uppercase">
              ลาออก / พักงาน (INACTIVE)
            </span>
            <span className="text-3xl font-extrabold text-[#e6dfd3]">
              {inactiveCount} <span className="text-xs font-normal text-[#a39b8b]">คน</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#18241c] border border-[#2d4734] flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-[#a39b8b]/40" />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ-นามสกุล, ตำแหน่ง หรือเบอร์โทร..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#121c15] text-[#f3efe6] text-xs px-3 py-2 rounded-xl border border-[#2d4734] focus:outline-none focus:border-[#98c9a3]"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="active">ทำงานอยู่ (Active)</option>
            <option value="inactive">ลาออก/พักงาน (Inactive)</option>
          </select>
        </div>
      </div>

      {/* Personnel Table */}
      <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734]">
        {loading ? (
          <div className="p-12 text-center text-[#a39b8b]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#98c9a3]" />
            กำลังโหลดข้อมูลบุคลากร...
          </div>
        ) : filteredPersonnel.length === 0 ? (
          <div className="p-12 text-center text-[#a39b8b]">
            ไม่พบข้อมูลบุคลากรในระบบ
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase tracking-wider">
                  <th className="py-4 px-6">ชื่อ-นามสกุล</th>
                  <th className="py-4 px-6">ตำแหน่ง</th>
                  <th className="py-4 px-6">เบอร์ติดต่อ</th>
                  <th className="py-4 px-6">หมายเหตุ</th>
                  <th className="py-4 px-4 text-center">สถานะ</th>
                  <th className="py-4 px-6 text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2d4734]/50 text-sm">
                {filteredPersonnel
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((item) => (
                  <tr key={item._id} className="hover:bg-[#18241c]/60 transition-colors">
                    {/* Full Name & Prefix */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3] font-bold text-xs">
                          {item.fullname.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-[#f3efe6]">
                            <span className="text-[#98c9a3] font-medium mr-1">
                              {item.prefix}
                            </span>
                            {item.fullname}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-4 px-6 text-xs text-[#e6dfd3]">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[#98c9a3] shrink-0" />
                        <span>{item.position}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-6 text-xs text-[#a39b8b]">
                      {item.phone ? (
                        <div className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-[#98c9a3] shrink-0" />
                          <span>{item.phone}</span>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>

                    {/* Note */}
                    <td className="py-4 px-6 text-xs text-[#a39b8b]">
                      {item.note || "-"}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      {item.status === "active" ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#1e3425] text-[#98c9a3] text-[11px] font-semibold border border-[#98c9a3]/30">
                          ทำงานอยู่
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-[#2a221e] text-[#a39b8b] text-[11px] font-medium border border-[#2d4734]">
                          พ้นสภาพ
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-[#121c15] text-[#98c9a3] hover:bg-[#1c2d22] border border-[#2d4734] transition-colors"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, `${item.prefix}${item.fullname}`)}
                          className="p-1.5 rounded-lg bg-[#121c15] text-red-400 hover:bg-red-950/40 border border-[#2d4734] transition-colors"
                          title="ลบ"
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
            totalPages={Math.ceil(filteredPersonnel.length / itemsPerPage)}
            totalItems={filteredPersonnel.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(size) => setItemsPerPage(size)}
          />
        </div>
      </div>

      {/* Modal Form for Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="max-w-lg w-full glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#98c9a3]/30 space-y-6 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#f3efe6]">
                  {editingItem ? "แก้ไขข้อมูลบุคลากร" : "เพิ่มข้อมูลบุคลากรใหม่"}
                </h3>
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

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ซ่อนประเภทบุคลากร ไว้ เก็บค่าเป็น 1 ตามข้อกำหนด */}
              <input type="hidden" name="referType" value="1" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Prefix */}
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    คำนำหน้า *
                  </label>
                  <select
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                  >
                    {PREFIX_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    ชื่อ-นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                    placeholder="สมชาย ใจดี"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Position */}
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    ตำแหน่ง *
                  </label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                    placeholder="เจ้าหน้าที่คลังสินค้า"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    เบอร์ติดต่อ
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                    placeholder="081-234-5678"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  สถานะการทำงาน
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-[#f3efe6] cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={status === "active"}
                      onChange={() => setStatus("active")}
                      className="accent-[#98c9a3]"
                    />
                    <span>ทำงานอยู่ (Active)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#a39b8b] cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={status === "inactive"}
                      onChange={() => setStatus("inactive")}
                      className="accent-[#98c9a3]"
                    />
                    <span>พ้นสภาพ (Inactive)</span>
                  </label>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  หมายเหตุ
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                  placeholder="หมายเหตุเพิ่มเติม..."
                />
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
                      <span>{editingItem ? "บันทึกการแก้ไข" : "ยืนยันการเพิ่ม"}</span>
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

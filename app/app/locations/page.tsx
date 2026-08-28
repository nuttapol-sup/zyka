"use client";

import { useEffect, useState } from "react";
import {
  Warehouse,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  Building,
  Sparkles,
} from "lucide-react";
import Pagination from "@/app/components/Pagination";

interface StorageItem {
  _id: string;
  code: string;
  name: string;
  type?: string;
  address?: string;
  capacity?: number;
  status: "active" | "inactive";
  note?: string;
  createdAt: string;
}

export default function StorageLocationsPage() {
  const [locations, setLocations] = useState<StorageItem[]>([]);
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
  const [editingItem, setEditingItem] = useState<StorageItem | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/locations", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setLocations(data.locations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Helper to generate next auto-incremented code (e.g., WH-01 -> WH-02)
  const generateNextCode = (existingLocations: StorageItem[]): string => {
    if (!existingLocations || existingLocations.length === 0) {
      return "WH-01";
    }

    let maxNum = 0;
    let prefix = "WH-";
    let padLength = 2;

    existingLocations.forEach((loc) => {
      const match = loc.code.match(/^([A-Za-z]+-?)(\d+)$/);
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
    const numStr = String(nextNum).padStart(Math.max(2, padLength), "0");
    return `${prefix.toUpperCase()}${numStr}`;
  };

  const openCreateModal = () => {
    setEditingItem(null);
    const nextCode = generateNextCode(locations);
    setCode(nextCode);
    setName("");
    setAddress("");
    setStatus("active");
    setNote("");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: StorageItem) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setAddress(item.address || "");
    setStatus(item.status);
    setNote(item.note || "");
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const url = editingItem
        ? `/api/locations/${editingItem._id}`
        : "/api/locations";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          address,
          status,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      setSuccess(editingItem ? "อัปเดตข้อมูลสำเร็จ!" : "เพิ่มสถานที่เก็บสินค้าสำเร็จ!");
      setIsModalOpen(false);
      fetchLocations();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, locationName: string) => {
    if (!confirm(`คุณต้องการลบสถานที่เก็บสินค้า "${locationName}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถลบข้อมูลได้");

      setSuccess("ลบข้อมูลสำเร็จเรียบร้อย");
      fetchLocations();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loc.address && loc.address.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === "all" || loc.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const activeCount = locations.filter((l) => l.status === "active").length;
  const inactiveCount = locations.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#446e50] to-[#1f3627] border border-[#98c9a3]/40 flex items-center justify-center">
            <Warehouse className="w-6 h-6 text-[#98c9a3]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-earth">
              บันทึกข้อมูลสถานที่เก็บสินค้า (Storage Locations)
            </h1>
            <p className="text-xs text-[#a39b8b]">
              จัดการข้อมูลสถานที่เก็บสินค้า คลังสินค้า และตำแหน่งที่ตั้งในระบบ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLocations}
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
            <span>เพิ่มสถานที่เก็บสินค้า</span>
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
              จำนวนสถานที่ทั้งหมด
            </span>
            <span className="text-3xl font-extrabold text-[#f3efe6]">
              {locations.length} <span className="text-xs font-normal text-[#a39b8b]">แห่ง</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center">
            <Building className="w-5 h-5 text-[#98c9a3]" />
          </div>
        </div>

        <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#a39b8b] font-medium block uppercase">
              เปิดใช้งานอยู่ (ACTIVE)
            </span>
            <span className="text-3xl font-extrabold text-[#98c9a3]">
              {activeCount} <span className="text-xs font-normal text-[#a39b8b]">แห่ง</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-[#98c9a3]" />
          </div>
        </div>

        <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#a39b8b] font-medium block uppercase">
              ปิดใช้งาน (INACTIVE)
            </span>
            <span className="text-3xl font-extrabold text-[#e6dfd3]">
              {inactiveCount} <span className="text-xs font-normal text-[#a39b8b]">แห่ง</span>
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
            placeholder="ค้นหารหัส, ชื่อสถานที่ หรือที่อยู่..."
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
            <option value="active">ใช้งาน (Active)</option>
            <option value="inactive">ปิดใช้งาน (Inactive)</option>
          </select>
        </div>
      </div>

      {/* Locations Table */}
      <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734]">
        {loading ? (
          <div className="p-12 text-center text-[#a39b8b]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#98c9a3]" />
            กำลังโหลดข้อมูลสถานที่เก็บสินค้า...
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="p-12 text-center text-[#a39b8b]">
            ไม่พบข้อมูลสถานที่เก็บสินค้าในระบบ
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase tracking-wider">
                  <th className="py-4 px-6">รหัส & ชื่อสถานที่</th>
                  <th className="py-4 px-6">ที่อยู่ / ตำแหน่งที่ตั้ง</th>
                  <th className="py-4 px-4 text-center">สถานะ</th>
                  <th className="py-4 px-6 text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2d4734]/50 text-sm">
                {filteredLocations
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((item) => (
                  <tr key={item._id} className="hover:bg-[#18241c]/60 transition-colors">
                    {/* Code & Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#121c15] border border-[#2d4734] flex items-center justify-center text-[#98c9a3] font-mono text-xs font-bold">
                          <Warehouse className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-[#98c9a3] font-mono bg-[#0f1712] px-2 py-0.5 rounded border border-[#2d4734]">
                              {item.code}
                            </code>
                            <span className="font-bold text-[#f3efe6]">{item.name}</span>
                          </div>
                          {item.note && (
                            <p className="text-[11px] text-[#a39b8b] mt-0.5">{item.note}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="py-4 px-6 text-xs text-[#a39b8b]">
                      {item.address ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#98c9a3] shrink-0" />
                          <span>{item.address}</span>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      {item.status === "active" ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#1e3425] text-[#98c9a3] text-[11px] font-semibold border border-[#98c9a3]/30">
                          ใช้งาน
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-[#2a221e] text-[#a39b8b] text-[11px] font-medium border border-[#2d4734]">
                          ปิดใช้งาน
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
                          onClick={() => handleDelete(item._id, item.name)}
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
            totalPages={Math.ceil(filteredLocations.length / itemsPerPage)}
            totalItems={filteredLocations.length}
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
                  <Warehouse className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#f3efe6]">
                  {editingItem ? "แก้ไขสถานที่เก็บสินค้า" : "เพิ่มสถานที่เก็บสินค้าใหม่"}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Code (Auto-Incremented) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase">
                      รหัสสถานที่ *
                    </label>
                    {!editingItem && (
                      <span className="text-[10px] text-[#98c9a3] flex items-center gap-1 font-mono">
                        <Sparkles className="w-3 h-3" /> Auto-Code
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#98c9a3] uppercase font-mono font-bold focus:outline-none focus:border-[#98c9a3]"
                    placeholder="WH-01"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    ชื่อสถานที่ *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                    placeholder="คลังสินค้าหลัก A"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  ที่อยู่ / ตำแหน่งที่ตั้ง
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3] resize-none"
                  placeholder="อาคาร 1 ชั้น 2 แขวง..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  สถานะการใช้งาน
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
                    <span>เปิดใช้งาน (Active)</span>
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
                    <span>ปิดใช้งาน (Inactive)</span>
                  </label>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  หมายเหตุเพิ่มเติม
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                  placeholder="ข้อมูลเพิ่มเติม..."
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

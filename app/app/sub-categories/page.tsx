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
  AlertCircle,
  X,
  Tags,
} from "lucide-react";
import Pagination from "@/app/components/Pagination";

interface SubCategoryItem {
  _id: string;
  code: string;
  name: string;
  categoryCode: string;
  categoryName?: string;
  seq: number;
  note?: string;
  status: "active" | "inactive";
  createdAt: string;
}

interface CategoryOption {
  _id: string;
  code: string;
  name: string;
}

export default function SubCategoriesPage() {
  const [items, setItems] = useState<SubCategoryItem[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [nextSeq, setNextSeq] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SubCategoryItem | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [seq, setSeq] = useState(1);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sub-categories", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setItems(data.subCategories || []);
        setCategoryOptions(data.categories || []);
        if (data.nextSeq) setNextSeq(data.nextSeq);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setCode(""); // Empty for manual typing
    setName("");
    setCategoryCode(categoryOptions[0]?.code || "");
    setSeq(nextSeq);
    setNote("");
    setStatus("active");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: SubCategoryItem) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setCategoryCode(item.categoryCode);
    setSeq(item.seq);
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
        ? `/api/sub-categories/${editingItem._id}`
        : "/api/sub-categories";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          categoryCode,
          seq,
          note,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      setSuccess(
        editingItem ? "อัปเดตหมวดสินค้าสำเร็จ!" : "เพิ่มหมวดสินค้าสำเร็จ!"
      );
      setIsModalOpen(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบหมวดสินค้า "${name}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/sub-categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถลบข้อมูลได้");

      setSuccess("ลบหมวดสินค้าสำเร็จเรียบร้อย");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.categoryName && item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      filterCategory === "all" || item.categoryCode === filterCategory;

    return matchesSearch && matchesCategory;
  });

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
              บันทึกหมวดสินค้า (Product Sub-Categories)
            </h1>
            <p className="text-xs text-[#a39b8b]">
              บันทึกและจัดการหมวดสินค้า กรอกรหัสเองและเชื่อมโยงประเภทหมวดสินค้า (`categoryCode`)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
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
            <span>เพิ่มหมวดสินค้า</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-earth-card p-5 rounded-2xl border border-[#98c9a3]/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#a39b8b] font-medium block uppercase">
              หมวดสินค้าทั้งหมด
            </span>
            <span className="text-3xl font-extrabold text-[#f3efe6]">
              {items.length} <span className="text-xs font-normal text-[#a39b8b]">รายการ</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center">
            <FolderTree className="w-5 h-5 text-[#98c9a3]" />
          </div>
        </div>

        <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#a39b8b] font-medium block uppercase">
              ประเภทหมวดสินค้าที่มีในระบบ
            </span>
            <span className="text-3xl font-extrabold text-[#98c9a3]">
              {categoryOptions.length} <span className="text-xs font-normal text-[#a39b8b]">ประเภท</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center">
            <Tags className="w-5 h-5 text-[#98c9a3]" />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, รหัส หรือประเภทหมวดสินค้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
          />
        </div>

        {/* Filter by Category */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-[#121c15] text-[#f3efe6] text-xs px-3 py-2 rounded-xl border border-[#2d4734] focus:outline-none focus:border-[#98c9a3]"
        >
          <option value="all">ทุกประเภทหมวดสินค้า</option>
          {categoryOptions.map((c) => (
            <option key={c._id} value={c.code}>
              {c.name} (รหัส: {c.code})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734]">
        {loading ? (
          <div className="p-12 text-center text-[#a39b8b]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#98c9a3]" />
            กำลังโหลดข้อมูลหมวดสินค้า...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-[#a39b8b]">
            ไม่พบหมวดสินค้าในระบบ
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase tracking-wider">
                  <th className="py-4 px-4 text-center">ลำดับ</th>
                  <th className="py-4 px-6">รหัสหมวดสินค้า</th>
                  <th className="py-4 px-6">ชื่อหมวดสินค้า</th>
                  <th className="py-4 px-6">ประเภทหมวดสินค้า (ผูก Code)</th>
                  <th className="py-4 px-4 text-center">สถานะ</th>
                  <th className="py-4 px-6 text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2d4734]/50 text-sm">
                {filteredItems
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((item) => (
                  <tr key={item._id} className="hover:bg-[#18241c]/60 transition-colors">
                    {/* Seq */}
                    <td className="py-4 px-4 text-center font-mono text-xs text-[#a39b8b]">
                      #{item.seq}
                    </td>

                    {/* Code */}
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-xl bg-[#1e3425] text-[#98c9a3] font-mono font-bold text-xs border border-[#98c9a3]/30">
                        {item.code}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-4 px-6 font-bold text-[#f3efe6]">
                      {item.name}
                      {item.note && (
                        <p className="text-[11px] text-[#a39b8b] font-normal mt-0.5">{item.note}</p>
                      )}
                    </td>

                    {/* Category Code & Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#121c15] text-[#98c9a3] font-mono text-[11px] border border-[#2d4734]">
                          Code: {item.categoryCode}
                        </span>
                        <span className="text-xs font-semibold text-[#e6dfd3]">
                          {item.categoryName}
                        </span>
                      </div>
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
            totalPages={Math.ceil(filteredItems.length / itemsPerPage)}
            totalItems={filteredItems.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(size) => setItemsPerPage(size)}
          />
        </div>
      </div>

      {/* Modal Form for Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#98c9a3]/30 space-y-6 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <FolderTree className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#f3efe6]">
                  {editingItem ? "แก้ไขหมวดสินค้า" : "เพิ่มหมวดสินค้าใหม่"}
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
              {/* Category Code Dropdown (ผูกกับ Category.code) */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  ประเภทหมวดสินค้า (Category Type) *
                </label>
                <select
                  required
                  value={categoryCode}
                  onChange={(e) => setCategoryCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                >
                  <option value="">-- เลือกประเภทหมวดสินค้า --</option>
                  {categoryOptions.map((c) => (
                    <option key={c._id} value={c.code}>
                      {c.name} (รหัสประเภท: {c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-Category Name */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  ชื่อหมวดสินค้า (Sub-Category Name) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                  placeholder="ยาสามัญประจำบ้าน"
                />
              </div>

              {/* Code & Seq Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Code (Manual Typing) */}
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    รหัสหมวดสินค้า (Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                    placeholder="เช่น SC-01, 101"
                  />
                </div>

                {/* Sequence Number (Gen Auto) */}
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    ลำดับ (Auto Gen Seq) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={seq}
                    onChange={(e) => setSeq(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  หมายเหตุเพิ่มเติม
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3] resize-none"
                  placeholder="รายละเอียดเพิ่มเติม..."
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

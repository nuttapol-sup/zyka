"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  FolderTree,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
  Upload,
  Paperclip,
} from "lucide-react";
import Pagination from "@/app/components/Pagination";
import { getApiPath } from "@/app/utils/apiPath";

interface SubCategoryRef {
  _id: string;
  code: string;
  name: string;
  categoryCode: string;
}

interface ProductItem {
  _id: string;
  code: string;
  name: string;
  unit: string;
  subCategoryId?: SubCategoryRef | null;
  description?: string;
  imageUrl?: string;
  minQuantity: number;
  seq: number;
  status: "active" | "inactive";
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [nextSeq, setNextSeq] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // SubCategory List for Modal Selection
  const [subCategoriesList, setSubCategoriesList] = useState<SubCategoryRef[]>([]);
  const [loadingSubCats, setLoadingSubCats] = useState(false);
  const [subCatSearch, setSubCatSearch] = useState("");
  const [isSubCatModalOpen, setIsSubCatModalOpen] = useState(false);

  // Product Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("ชิ้น");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [selectedSubCatObj, setSelectedSubCatObj] = useState<SubCategoryRef | null>(null);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [minQuantity, setMinQuantity] = useState(5);
  const [seq, setSeq] = useState(1);
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiPath("/api/products"), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        if (data.nextSeq) setNextSeq(data.nextSeq);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async () => {
    setLoadingSubCats(true);
    try {
      const res = await fetch(getApiPath("/api/sub-categories"), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSubCategoriesList(data.subCategories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubCats(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSubCategories();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setCode("");
    setName("");
    setUnit("ชิ้น");
    setSubCategoryId("");
    setSelectedSubCatObj(null);
    setDescription("");
    setImageUrl("");
    setMinQuantity(5);
    setSeq(nextSeq);
    setStatus("active");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: ProductItem) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setUnit(item.unit || "ชิ้น");
    if (item.subCategoryId && typeof item.subCategoryId === "object") {
      setSubCategoryId(item.subCategoryId._id);
      setSelectedSubCatObj(item.subCategoryId);
    } else {
      setSubCategoryId("");
      setSelectedSubCatObj(null);
    }
    setDescription(item.description || "");
    setImageUrl(item.imageUrl || "");
    setMinQuantity(item.minQuantity || 0);
    setSeq(item.seq);
    setStatus(item.status);
    setError("");
    setIsModalOpen(true);
  };

  const handleSelectSubCategory = (sub: SubCategoryRef) => {
    setSubCategoryId(sub._id);
    setSelectedSubCatObj(sub);
    setIsSubCatModalOpen(false);
  };

  const handleClearSubCategory = () => {
    setSubCategoryId("");
    setSelectedSubCatObj(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(getApiPath("/api/upload"), {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");

      setImageUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const rawUrl = editingItem
        ? `/api/products/${editingItem._id}`
        : "/api/products";
      const url = getApiPath(rawUrl);
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          unit,
          subCategoryId,
          description,
          imageUrl,
          minQuantity,
          seq,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      setSuccess(
        editingItem ? "อัปเดตข้อมูลสินค้าสำเร็จ!" : "เพิ่มสินค้าสำเร็จ!"
      );
      setIsModalOpen(false);
      fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบสินค้า "${name}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(getApiPath(`/api/products/${id}`), { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถลบข้อมูลได้");

      setSuccess("ลบสินค้าสำเร็จเรียบร้อย");
      fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.unit && item.unit.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.subCategoryId?.name && item.subCategoryId.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredSubCatsModal = subCategoriesList.filter((sub) => {
    const query = subCatSearch.toLowerCase();
    return (
      sub.name.toLowerCase().includes(query) ||
      sub.code.toLowerCase().includes(query) ||
      (sub.categoryCode && sub.categoryCode.toLowerCase().includes(query))
    );
  });

  const activeCount = products.filter((p) => p.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#446e50] to-[#1f3627] border border-[#98c9a3]/40 flex items-center justify-center">
            <Package className="w-6 h-6 text-[#98c9a3]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-earth">
              บันทึกสินค้า (Product Items)
            </h1>
            <p className="text-xs text-[#a39b8b]">
              บันทึกและจัดการรายการสินค้า กำหนดหน่วยนับ และระบุจำนวนขั้นต่ำ (min) สำหรับระบบแจ้งเตือน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
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
            <span>เพิ่มสินค้าใหม่</span>
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
              สินค้าทั้งหมดในระบบ
            </span>
            <span className="text-3xl font-extrabold text-[#f3efe6]">
              {products.length} <span className="text-xs font-normal text-[#a39b8b]">รายการ</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center">
            <Package className="w-5 h-5 text-[#98c9a3]" />
          </div>
        </div>

        <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#a39b8b] font-medium block uppercase">
              สถานะเปิดใช้งาน (Active)
            </span>
            <span className="text-3xl font-extrabold text-[#98c9a3]">
              {activeCount} <span className="text-xs font-normal text-[#a39b8b]">รายการ</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center">
            <Layers className="w-5 h-5 text-[#98c9a3]" />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อสินค้า, รหัส, หน่วยนับ หรือหมวดสินค้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
          />
        </div>

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

      {/* Table */}
      <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734]">
        {loading ? (
          <div className="p-12 text-center text-[#a39b8b]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#98c9a3]" />
            กำลังโหลดข้อมูลสินค้า...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-[#a39b8b]">
            ไม่พบรายการสินค้าในระบบ
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase tracking-wider whitespace-nowrap">
                  <th className="py-4 px-4 text-center">ลำดับ</th>
                  <th className="py-4 px-4 text-center">รูปภาพ</th>
                  <th className="py-4 px-6">รหัสสินค้า</th>
                  <th className="py-4 px-6">ชื่อสินค้า / รายละเอียด</th>
                  <th className="py-4 px-4 text-center">หน่วยนับ</th>
                  <th className="py-4 px-6">หมวดหมู่สินค้า (Category)</th>
                  <th className="py-4 px-4 text-center">จำนวนขั้นต่ำ (min)</th>
                  <th className="py-4 px-4 text-center">สถานะ</th>
                  <th className="py-4 px-6 text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2d4734]/50 text-sm">
                {paginatedProducts.map((item) => (
                  <tr key={item._id} className="hover:bg-[#18241c]/60 transition-colors">
                    {/* Seq */}
                    <td className="py-4 px-4 text-center font-mono text-xs text-[#a39b8b] whitespace-nowrap">
                      #{item.seq}
                    </td>

                    {/* Image Thumbnail */}
                    <td className="py-4 px-4 text-center">
                      {item.imageUrl ? (
                        <div className="w-11 h-11 mx-auto rounded-xl overflow-hidden bg-[#121c15] border border-[#98c9a3]/40 p-0.5 shadow-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getApiPath(item.imageUrl)}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg hover:scale-110 transition-transform cursor-pointer"
                            onClick={() => window.open(getApiPath(item.imageUrl!), "_blank")}
                            title="กดเพื่อเปิดดูรูปภาพขนาดเต็ม"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 mx-auto rounded-xl bg-[#121c15] border border-[#2d4734]/60 flex items-center justify-center text-[#a39b8b]/30">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </td>

                    {/* Code */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-xl bg-[#1e3425] text-[#98c9a3] font-mono font-bold text-xs border border-[#98c9a3]/30 inline-block whitespace-nowrap">
                        {item.code}
                      </span>
                    </td>

                    {/* Name, Description & SubCategory (3-line layout) */}
                    <td className="py-4 px-6 min-w-[240px]">
                      {/* Line 1: Sub-Category Name */}
                      <span className="text-[11px] font-semibold text-[#98c9a3] bg-[#121c15] px-2 py-0.5 rounded border border-[#2d4734] inline-block mb-1.5 whitespace-nowrap">
                        🏷️ {item.subCategoryId?.name || "Clips"}
                      </span>

                      {/* Line 2: Product Name */}
                      <span className="font-bold text-[#f3efe6] text-sm block leading-snug">
                        {item.name}
                      </span>

                      {/* Line 3: Description */}
                      {item.description && (
                        <p className="text-xs text-[#a39b8b] mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </td>

                    {/* Unit */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-[#121c15] text-[#e6dfd3] text-xs font-semibold border border-[#2d4734] inline-block whitespace-nowrap">
                        {item.unit || "ชิ้น"}
                      </span>
                    </td>

                    {/* Category (Red Bounding Box Column) */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-[#1e3425] text-[#98c9a3] text-xs font-bold border border-[#98c9a3]/30 inline-block whitespace-nowrap">
                        {(item as any).categoryName || "-"}
                      </span>
                    </td>

                    {/* Min Quantity */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className="px-3 py-1 rounded-xl bg-[#121c15] text-[#d4a373] font-mono font-bold text-xs border border-[#d4a373]/30 inline-flex items-center gap-1.5 whitespace-nowrap">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#d4a373]" />
                        {item.minQuantity} {item.unit || "ชิ้น"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {item.status === "active" ? (
                        <span className="px-3 py-1 rounded-full bg-[#1e3425] text-[#98c9a3] text-xs font-bold border border-[#98c9a3]/30 inline-block whitespace-nowrap">
                          ใช้งาน
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-[#2a221e] text-[#a39b8b] text-xs font-medium border border-[#2d4734] inline-block whitespace-nowrap">
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
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(size) => setItemsPerPage(size)}
          />
        </div>
      </div>

      {/* Modal Form for Create / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="max-w-xl w-full glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#98c9a3]/30 space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#f3efe6]">
                  {editingItem ? "แก้ไขรายการสินค้า" : "เพิ่มสินค้าใหม่"}
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
              {/* Product Code & Name Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Code */}
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    รหัสสินค้า (Product Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                    placeholder="เช่น PROD-001, P-101"
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    ชื่อสินค้า (Product Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                    placeholder="พาราเซตามอล 500mg"
                  />
                </div>
              </div>

              {/* Product Image Upload Section */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#98c9a3]" />
                  <span>รูปภาพสินค้า (Product Image)</span>
                </label>

                {imageUrl ? (
                  <div className="p-3 rounded-xl bg-[#121c15] border border-[#2d4734] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/40 border border-[#98c9a3]/40 p-0.5 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getApiPath(imageUrl)}
                          alt="Product Preview"
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="text-xs text-[#a39b8b] truncate max-w-xs">
                        <p className="text-[#98c9a3] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>อัปโหลดรูปภาพสินค้าสำเร็จ</span>
                        </p>
                        <p className="text-[11px] truncate mt-0.5">{imageUrl}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="px-3 py-1.5 rounded-lg bg-red-950/60 text-red-300 hover:bg-red-900/60 border border-red-800/40 text-xs font-bold transition-colors shrink-0"
                    >
                      ลบรูปภาพ
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full px-4 py-3 rounded-xl bg-[#121c15] border border-dashed border-[#2d4734] hover:border-[#98c9a3]/60 text-xs flex items-center justify-center gap-2 text-[#a39b8b] hover:text-[#f3efe6] transition-colors">
                        {uploadingImage ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-[#98c9a3]" />
                            <span>กำลังอัปโหลดรูปภาพ...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-[#98c9a3]" />
                            <span>กดเพื่อแนบรูปภาพสินค้า (JPG, PNG, WEBP)</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Unit of Measurement (หน่วยนับ) */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  หน่วยนับ (Unit of Measurement) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                    placeholder="เช่น ชิ้น, กล่อง, ขวด, แพ็ค, แผง, ถุง"
                  />
                  {/* Quick Unit Presets */}
                  {["ชิ้น", "กล่อง", "ขวด", "แพ็ค"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setUnit(preset)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                        unit === preset
                          ? "bg-[#1e3425] text-[#98c9a3] border-[#98c9a3]/40"
                          : "bg-[#121c15] text-[#a39b8b] border-[#2d4734] hover:text-[#f3efe6]"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-Category Selection with INLINE BUTTON on the EXACT SAME ROW */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  หมวดสินค้า (Sub-Category)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      readOnly
                      value={
                        selectedSubCatObj
                          ? `${selectedSubCatObj.name} (รหัส: ${selectedSubCatObj.code})`
                          : ""
                      }
                      placeholder="ยังไม่ได้เลือกหมวดสินค้า (กดปุ่มดึงข้อมูลด้านข้าง)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none cursor-default"
                    />
                    {selectedSubCatObj && (
                      <button
                        type="button"
                        onClick={handleClearSubCategory}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#a39b8b] hover:text-red-400"
                        title="ยกเลิกการผูกหมวดสินค้า"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      fetchSubCategories();
                      setIsSubCatModalOpen(true);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-[#1e3425] text-[#98c9a3] hover:bg-[#284532] border border-[#98c9a3]/40 text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <FolderTree className="w-3.5 h-3.5" />
                    <span>📂 ดึงข้อมูลหมวดสินค้า</span>
                  </button>
                </div>

                {selectedSubCatObj && (
                  <div className="mt-1.5 text-[11px] text-[#98c9a3] flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ผูกกับหมวดสินค้า: {selectedSubCatObj.name} ({selectedSubCatObj.code})</span>
                  </div>
                )}
              </div>

              {/* Min Quantity & Sequence Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* min (จำนวนขั้นต่ำแจ้งเตือน) */}
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    จำนวนขั้นต่ำ (min) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                    placeholder="5"
                  />
                  <span className="text-[10px] text-[#a39b8b] mt-0.5 block">
                    * สำหรับแจ้งเตือนเมื่อสินค้าในคลังเหลือน้อยกว่าค่านี้
                  </span>
                </div>

                {/* Sequence Number */}
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

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  รายละเอียดสินค้า
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3] resize-none"
                  placeholder="รายละเอียดเพิ่มเติมของสินค้า เช่น ขนาด บรรจุภัณฑ์ ฯลฯ..."
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

      {/* Sub-Category Selection Popup Modal */}
      {isSubCatModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/40 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#f3efe6]">
                    เลือกข้อมูลหมวดสินค้า (Sub-Category)
                  </h3>
                  <p className="text-[11px] text-[#a39b8b]">
                    กดเลือกหมวดสินค้าที่ต้องการเพื่อผูกบันทึก id ลงในรายการสินค้า
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubCatModalOpen(false)}
                className="p-1.5 rounded-xl text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#121c15]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อหมวดสินค้า หรือรหัส..."
                value={subCatSearch}
                onChange={(e) => setSubCatSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {loadingSubCats ? (
                <div className="p-8 text-center text-xs text-[#a39b8b]">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#98c9a3]" />
                  กำลังดึงข้อมูลหมวดสินค้า...
                </div>
              ) : filteredSubCatsModal.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#a39b8b]">
                  ไม่พบข้อมูลหมวดสินค้าในระบบ
                </div>
              ) : (
                filteredSubCatsModal.map((sub) => (
                  <div
                    key={sub._id}
                    onClick={() => handleSelectSubCategory(sub)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      subCategoryId === sub._id
                        ? "bg-[#1e3425] border-[#98c9a3] shadow-sm"
                        : "bg-[#121c15]/80 border-[#2d4734] hover:bg-[#1c2d22] hover:border-[#98c9a3]/50"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#0f1712] text-[#98c9a3] font-mono text-[11px] border border-[#98c9a3]/30 font-bold">
                          {sub.code}
                        </span>
                        <span className="text-xs font-bold text-[#f3efe6] group-hover:text-[#98c9a3] transition-colors">
                          {sub.name}
                        </span>
                      </div>
                      {sub.categoryCode && (
                        <p className="text-[11px] text-[#a39b8b]">
                          ประเภทหมวดสินค้า Code: {sub.categoryCode}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-[#273e2e] text-[#98c9a3] text-xs font-semibold group-hover:bg-[#98c9a3] group-hover:text-[#0f1712] transition-colors"
                    >
                      เลือกรายการ
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-[#2d4734] flex justify-end">
              <button
                type="button"
                onClick={() => setIsSubCatModalOpen(false)}
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

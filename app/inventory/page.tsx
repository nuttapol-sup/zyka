"use client";

import { getApiPath } from "@/app/utils/apiPath";

import { useEffect, useState } from "react";
import {
  Boxes,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  History,
  Warehouse,
  Paperclip,
  FileText,
  Edit,
  Trash2,
} from "lucide-react";
import Pagination from "@/app/components/Pagination";

interface SubCategoryRef {
  _id: string;
  code: string;
  name: string;
}

interface ProductItem {
  _id: string;
  code: string;
  name: string;
  unit?: string;
  minQuantity: number;
  seq: number;
  subCategoryId?: SubCategoryRef;
}

interface LocationItem {
  _id: string;
  code: string;
  name: string;
}

interface InventoryItem {
  _id: string;
  productId: ProductItem;
  locationId?: LocationItem;
  quantity: number;
  updatedAt: string;
}

interface MovementItem {
  _id: string;
  productId: ProductItem;
  locationId?: LocationItem;
  type: "IN" | "OUT" | "ADJUST";
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  refDoc?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  note?: string;
  createdByName?: string;
  createdAt: string;
}

export default function InventoryPage() {
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [movements, setMovements] = useState<MovementItem[]>([]);
  const [productStockMap, setProductStockMap] = useState<Record<string, number>>({});
  const [lowStockAlertCount, setLowStockAlertCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"balances" | "movements">("balances");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterMinAlert, setFilterMinAlert] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterLocation, filterMinAlert, activeTab]);

  // Movement Modal State (Create)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"IN" | "OUT" | "ADJUST">("IN");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [refDoc, setRefDoc] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [note, setNote] = useState("");

  // Edit Movement Modal State
  const [isEditMovementModalOpen, setIsEditMovementModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<MovementItem | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiPath("/api/inventory"), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setInventories(data.inventories || []);
        setProducts(data.products || []);
        setLocations(data.locations || []);
        setMovements(data.movements || []);
        setProductStockMap(data.productStockMap || {});
        setLowStockAlertCount(data.lowStockAlertCount || 0);
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

  const openMovementModal = (
    type: "IN" | "OUT" | "ADJUST",
    prodId?: string,
    locId?: string
  ) => {
    setModalType(type);
    setSelectedProductId(prodId || products[0]?._id || "");
    setSelectedLocationId(locId || locations[0]?._id || "");
    setQuantity(1);
    setRefDoc("");
    setAttachmentUrl("");
    setAttachmentName("");
    setNote("");
    setError("");
    setIsModalOpen(true);
  };

  const openEditMovementModal = (m: MovementItem) => {
    setEditingMovement(m);
    setRefDoc(m.refDoc || "");
    setAttachmentUrl(m.attachmentUrl || "");
    setAttachmentName(m.attachmentName || "");
    setNote(m.note || "");
    setError("");
    setIsEditMovementModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(getApiPath("/api/upload"), {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์");

      setAttachmentUrl(data.url);
      setAttachmentName(data.name || file.name);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleProcessMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedProductId) {
      setError("กรุณาเลือกสินค้า");
      return;
    }

    if (!selectedLocationId) {
      setError("กรุณาระบุสถานที่เก็บสินค้า (LOCATION)");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(getApiPath("/api/inventory/movement"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
          locationId: selectedLocationId || undefined,
          type: modalType,
          quantity,
          refDoc,
          attachmentUrl,
          attachmentName,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกสต็อก");
      }

      setSuccess(data.message || "ทำรายการสำเร็จ!");
      setIsModalOpen(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovement) return;

    setError("");
    setSaving(true);

    try {
      const res = await fetch(getApiPath(`/api/inventory/movement/${editingMovement._id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refDoc,
          attachmentUrl,
          attachmentName,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");

      setSuccess("อัปเดตข้อมูลประวัติสำเร็จ!");
      setIsEditMovementModalOpen(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMovement = async (id: string) => {
    if (!confirm("คุณต้องการลบรายการประวัตินี้ใช่หรือไม่?")) return;

    try {
      const res = await fetch(getApiPath(`/api/inventory/movement/${id}`), { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถลบรายการได้");

      setSuccess("ลบรายการประวัติสำเร็จ");
      fetchData();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Combine product and location stock list for balance view
  const combinedStockRows = products.map((p) => {
    const totalStock = productStockMap[p._id] || 0;
    const isLowStock = totalStock <= (p.minQuantity || 0);
    const itemInventories = inventories.filter((inv) => inv.productId?._id === p._id);

    return {
      product: p,
      totalStock,
      isLowStock,
      itemInventories,
    };
  });

  const filteredStockRows = combinedStockRows.filter(({ product, totalStock, isLowStock, itemInventories }) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.subCategoryId?.name && product.subCategoryId.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMin = !filterMinAlert || isLowStock;

    const matchesLocation =
      filterLocation === "all" ||
      itemInventories.some((inv) => inv.locationId?._id === filterLocation);

    return matchesSearch && matchesMin && matchesLocation;
  });

  const filteredMovements = movements.filter((m) => {
    const query = searchTerm.toLowerCase();
    const prodName = m.productId?.name?.toLowerCase() || "";
    const prodCode = m.productId?.code?.toLowerCase() || "";
    const refDoc = m.refDoc?.toLowerCase() || "";
    return prodName.includes(query) || prodCode.includes(query) || refDoc.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#446e50] to-[#1f3627] border border-[#98c9a3]/40 flex items-center justify-center">
            <Boxes className="w-6 h-6 text-[#98c9a3]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-earth">
              จัดการสต็อกสินค้า (Inventory Management)
            </h1>
            <p className="text-xs text-[#a39b8b]">
              รับสินค้าเข้า เบิกสินค้าออก ปรับปรุงสต็อก และตรวจสอบรายการสินค้าเหลือน้อยกว่าขั้นต่ำ (min)
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="p-2.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734] transition-colors"
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Alert Success */}
      {success && (
        <div className="p-4 rounded-2xl bg-[#1e3425] border border-[#98c9a3]/50 text-[#98c9a3] text-sm flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#98c9a3] shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Low Stock Warning Alert Banner */}
      {lowStockAlertCount > 0 && (
        <div className="glass-earth-card p-4 rounded-2xl border border-yellow-700/50 bg-gradient-to-r from-[#2c2415] to-[#1f190e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                พบสินค้าเตือนสต็อกเหลือน้อยกว่าขั้นต่ำ (min) {lowStockAlertCount} รายการ!
              </h4>
              <p className="text-xs text-amber-300/70">
                สินค้าเหล่านี้มีจำนวนคงเหลือรวมน้อยกว่าหรือเท่ากับค่า min ที่กำหนดไว้
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setFilterMinAlert(!filterMinAlert);
              setActiveTab("balances");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors shrink-0 ${
              filterMinAlert
                ? "bg-amber-500 text-black border-amber-400"
                : "bg-amber-950/60 text-amber-300 border-amber-700/50 hover:bg-amber-900/60"
            }`}
          >
            {filterMinAlert ? "แสดงสินค้าทั้งหมด" : "กรองดูสินค้าเหลือน้อย"}
          </button>
        </div>
      )}

      {/* Tab Switcher & Filters */}
      <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-[#121c15] p-1 rounded-xl border border-[#2d4734]">
          <button
            onClick={() => setActiveTab("balances")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "balances"
                ? "bg-[#273e2e] text-[#98c9a3] shadow-sm border border-[#98c9a3]/30"
                : "text-[#a39b8b] hover:text-[#f3efe6]"
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>ยอดคงเหลือในคลัง (Stock Balances)</span>
          </button>
          <button
            onClick={() => setActiveTab("movements")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "movements"
                ? "bg-[#273e2e] text-[#98c9a3] shadow-sm border border-[#98c9a3]/30"
                : "text-[#a39b8b] hover:text-[#f3efe6]"
            }`}
          >
            <History className="w-4 h-4" />
            <span>ประวัติการรับเข้า-เบิกออก (Movements)</span>
          </button>
        </div>

        {/* Search & Location Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้า, รหัส, หรือเอกสาร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
            />
          </div>

          {activeTab === "balances" && (
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="bg-[#121c15] text-[#f3efe6] text-xs px-3 py-2 rounded-xl border border-[#2d4734] focus:outline-none focus:border-[#98c9a3]"
            >
              <option value="all">ทุกสถานที่เก็บสินค้า</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name} (รหัส: {loc.code})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "balances" ? (
        /* TAB 1: Stock Balances Table */
        <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734]">
          {loading ? (
            <div className="p-12 text-center text-[#a39b8b]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#98c9a3]" />
              กำลังโหลดข้อมูลสต็อกสินค้า...
            </div>
          ) : filteredStockRows.length === 0 ? (
            <div className="p-12 text-center text-[#a39b8b]">
              ไม่พบรายการสต็อกสินค้าตามเงื่อนไขที่กำหนด
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase tracking-wider">
                    <th className="py-4 px-4 text-center">ลำดับ</th>
                    <th className="py-4 px-6">รหัสสินค้า / หมวด</th>
                    <th className="py-4 px-6">ชื่อสินค้า</th>
                    <th className="py-4 px-6">สถานที่เก็บสินค้า (Location)</th>
                    <th className="py-4 px-4 text-center">คงเหลือรวม</th>
                    <th className="py-4 px-4 text-center">เกณฑ์ขั้นต่ำ (min)</th>
                    <th className="py-4 px-4 text-center">สถานะสต็อก</th>
                    <th className="py-4 px-6 text-center">ทำรายการ</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#2d4734]/50 text-sm">
                  {filteredStockRows
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map(({ product, totalStock, isLowStock, itemInventories }) => (
                    <tr
                      key={product._id}
                      className={`hover:bg-[#18241c]/60 transition-colors ${
                        isLowStock ? "bg-amber-950/20" : ""
                      }`}
                    >
                      {/* Seq */}
                      <td className="py-4 px-4 text-center font-mono text-xs text-[#a39b8b]">
                        #{product.seq}
                      </td>

                      {/* Code & SubCategory */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded-xl bg-[#1e3425] text-[#98c9a3] font-mono font-bold text-xs border border-[#98c9a3]/30 inline-block">
                            {product.code}
                          </span>
                          {product.subCategoryId && (
                            <p className="text-[11px] text-[#a39b8b]">
                              หมวด: {product.subCategoryId.name}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Product Name */}
                      <td className="py-4 px-6 font-bold text-[#f3efe6]">
                        {product.name}
                      </td>

                      {/* Location Stock Breakdown */}
                      <td className="py-4 px-6">
                        {itemInventories.length === 0 ? (
                          <span className="text-xs text-[#a39b8b] italic">
                            - ยังไม่มีสถานที่จัดเก็บ -
                          </span>
                        ) : (
                          <div className="space-y-1">
                            {itemInventories.map((inv) => (
                              <div
                                key={inv._id}
                                className="text-xs flex items-center justify-between gap-2 px-2 py-1 rounded-lg bg-[#121c15] border border-[#2d4734]"
                              >
                                <span className="text-[#e6dfd3] flex items-center gap-1">
                                  <Warehouse className="w-3 h-3 text-[#98c9a3]" />
                                  {inv.locationId?.name || "คลังหลัก"}:
                                </span>
                                <span className="font-mono font-bold text-[#98c9a3]">
                                  {inv.quantity} {product.unit || "ชิ้น"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Total Stock */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-xl font-mono font-extrabold text-sm border ${
                            isLowStock
                              ? "bg-amber-950/60 text-amber-300 border-amber-600/50"
                              : "bg-[#1e3425] text-[#98c9a3] border-[#98c9a3]/30"
                          }`}
                        >
                          {totalStock} {product.unit || "ชิ้น"}
                        </span>
                      </td>

                      {/* Min Threshold */}
                      <td className="py-4 px-4 text-center font-mono text-xs text-[#d4a373]">
                        {product.minQuantity} {product.unit || "ชิ้น"}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-4 px-4 text-center">
                        {isLowStock ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 text-[11px] font-bold border border-amber-600/50 flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            สต็อกเหลือน้อย
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-[#1e3425] text-[#98c9a3] text-[11px] font-semibold border border-[#98c9a3]/30 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ปกติ
                          </span>
                        )}
                      </td>

                      {/* Quick Action Buttons */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openMovementModal("IN", product._id)}
                            className="p-1.5 rounded-lg bg-[#1e3425] text-[#98c9a3] hover:bg-[#284532] border border-[#98c9a3]/30 transition-colors"
                            title="รับเข้า"
                          >
                            <ArrowDownRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openMovementModal("ADJUST", product._id)}
                            className="p-1.5 rounded-lg bg-[#2a251b] text-[#d4a373] hover:bg-[#3d3425] border border-[#d4a373]/40 transition-colors"
                            title="ปรับปรุงสต็อก"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar for Balances */}
          <div className="p-4 border-t border-[#2d4734]">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredStockRows.length / itemsPerPage)}
              totalItems={filteredStockRows.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
              onItemsPerPageChange={(size) => setItemsPerPage(size)}
            />
          </div>
        </div>
      ) : (
        /* TAB 2: Movement History Log Table */
        <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734]">
          {loading ? (
            <div className="p-12 text-center text-[#a39b8b]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#98c9a3]" />
              กำลังโหลดประวัติการรับเข้า-เบิกออก...
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="p-12 text-center text-[#a39b8b]">
              ไม่พบประวัติรายการเคลื่อนไหวสต็อก
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase tracking-wider">
                    <th className="py-4 px-6">วัน-เวลา</th>
                    <th className="py-4 px-4 text-center">ประเภท</th>
                    <th className="py-4 px-6">สินค้า</th>
                    <th className="py-4 px-6">สถานที่เก็บสินค้า</th>
                    <th className="py-4 px-4 text-center">จำนวน</th>
                    <th className="py-4 px-4 text-center">หลังทำรายการ</th>
                    <th className="py-4 px-6">เลขที่เอกสาร / ไฟล์แนบ</th>
                    <th className="py-4 px-6">ผู้ทำรายการ</th>
                    <th className="py-4 px-6 text-center">จัดการ</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#2d4734]/50 text-sm">
                  {filteredMovements.map((m) => (
                    <tr key={m._id} className="hover:bg-[#18241c]/60 transition-colors">
                      {/* Date & Time */}
                      <td className="py-4 px-6 text-xs font-mono text-[#a39b8b]">
                        {new Date(m.createdAt).toLocaleString("th-TH")}
                      </td>

                      {/* Movement Type Badge */}
                      <td className="py-4 px-4 text-center">
                        {m.type === "IN" ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#1e3425] text-[#98c9a3] text-[11px] font-bold border border-[#98c9a3]/30 inline-flex items-center gap-1">
                            <ArrowDownRight className="w-3 h-3" /> รับเข้า
                          </span>
                        ) : m.type === "OUT" ? (
                          <span className="px-2.5 py-1 rounded-full bg-[#321e1e] text-red-300 text-[11px] font-bold border border-red-800/40 inline-flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> เบิกออก
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-[#2a251b] text-[#d4a373] text-[11px] font-bold border border-[#d4a373]/40 inline-flex items-center gap-1">
                            <SlidersHorizontal className="w-3 h-3" /> ปรับปรุง
                          </span>
                        )}
                      </td>

                      {/* Product */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-[#f3efe6] block">
                          {m.productId?.name || "-"}
                        </span>
                        <span className="text-xs font-mono text-[#a39b8b]">
                          {m.productId?.code}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-6 text-xs text-[#e6dfd3]">
                        {m.locationId ? `${m.locationId.name} (${m.locationId.code})` : "คลังหลัก"}
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-4 text-center font-mono font-bold">
                        <span
                          className={
                            m.type === "IN"
                              ? "text-[#98c9a3]"
                              : m.type === "OUT"
                              ? "text-red-400"
                              : "text-[#d4a373]"
                          }
                        >
                          {m.type === "IN" ? `+${m.quantity}` : m.type === "OUT" ? `-${m.quantity}` : `${m.quantity}`} {m.productId?.unit || "ชิ้น"}
                        </span>
                      </td>

                      {/* Balance After */}
                      <td className="py-4 px-4 text-center font-mono font-bold text-[#f3efe6]">
                        {m.balanceAfter} {m.productId?.unit || "ชิ้น"}
                      </td>

                      {/* RefDoc, Attachment & Note */}
                      <td className="py-4 px-6 text-xs space-y-1">
                        {m.refDoc && (
                          <span className="px-2 py-0.5 rounded bg-[#121c15] text-[#98c9a3] font-mono border border-[#2d4734] inline-block">
                            Doc: {m.refDoc}
                          </span>
                        )}

                        {/* Clickable Attachment Link */}
                        {m.attachmentUrl && (
                          <a
                            href={m.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[#98c9a3] hover:text-[#f3efe6] font-medium transition-colors"
                            title="คลิกเพื่อดู/ดาวน์โหลดไฟล์แนบ"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span className="underline line-clamp-1">
                              {m.attachmentName || "ดูไฟล์แนบ"}
                            </span>
                          </a>
                        )}

                        {m.note && <p className="text-[#a39b8b]">{m.note}</p>}
                      </td>

                      {/* Performer */}
                      <td className="py-4 px-6 text-xs text-[#a39b8b]">
                        {m.createdByName || "System"}
                      </td>

                      {/* Edit / Delete Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditMovementModal(m)}
                            className="p-1.5 rounded-lg bg-[#121c15] text-[#98c9a3] hover:bg-[#1c2d22] border border-[#2d4734] transition-colors"
                            title="แก้ไขเอกสาร/ไฟล์แนบ"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMovement(m._id)}
                            className="p-1.5 rounded-lg bg-[#121c15] text-red-400 hover:bg-red-950/40 border border-[#2d4734] transition-colors"
                            title="ลบรายการประวัติ"
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

          {/* Pagination Bar for Movements */}
          <div className="p-4 border-t border-[#2d4734]">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredMovements.length / itemsPerPage)}
              totalItems={filteredMovements.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
              onItemsPerPageChange={(size) => setItemsPerPage(size)}
            />
          </div>
        </div>
      )}

      {/* Movement Modal Form (Create IN / OUT / ADJUST) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#98c9a3]/30 space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    modalType === "IN"
                      ? "bg-[#1e3425] text-[#98c9a3] border-[#98c9a3]/30"
                      : modalType === "OUT"
                      ? "bg-[#321e1e] text-red-300 border-red-800/40"
                      : "bg-[#2a251b] text-[#d4a373] border-[#d4a373]/40"
                  }`}
                >
                  {modalType === "IN" ? (
                    <ArrowDownRight className="w-5 h-5" />
                  ) : modalType === "OUT" ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <SlidersHorizontal className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#f3efe6]">
                    {modalType === "IN"
                      ? "รับสินค้าเข้า (Stock IN)"
                      : modalType === "OUT"
                      ? "เบิกสินค้าออก (Stock OUT)"
                      : "ปรับปรุงสต็อก (Stock Adjust)"}
                  </h3>
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

            {/* Modal Form */}
            <form onSubmit={handleProcessMovement} className="space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  สินค้า (Product) *
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                >
                  <option value="">-- เลือกสินค้า --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (รหัส: {p.code} | สต็อกปัจจุบัน: {productStockMap[p._id] || 0} {p.unit || "ชิ้น"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  สถานที่เก็บสินค้า (LOCATION) *
                </label>
                <select
                  required
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                >
                  <option value="">-- เลือก --</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name} (รหัส: {loc.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  {modalType === "ADJUST" ? "จำนวนยอดคงเหลือใหม่ *" : "จำนวนสินค้า *"}
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                  placeholder="1"
                />
              </div>

              {/* Ref Doc */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  เลขที่เอกสาร / อ้างอิง (Ref Doc)
                </label>
                <input
                  type="text"
                  value={refDoc}
                  onChange={(e) => setRefDoc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                  placeholder="เช่น PO-2026-001, REQ-005"
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  แนบไฟล์เอกสาร / ใบส่งสินค้า (Attachment)
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] hover:border-[#98c9a3]/50 cursor-pointer text-xs text-[#a39b8b] transition-colors">
                    <Paperclip className="w-4 h-4 text-[#98c9a3]" />
                    <span>
                      {uploadingFile
                        ? "กำลังอัปโหลดไฟล์..."
                        : attachmentName
                        ? `เปลี่ยนไฟล์: ${attachmentName}`
                        : "เลือกไฟล์แนบ (PDF, รูปภาพ, เอกสาร)"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                  </label>

                  {attachmentName && (
                    <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 text-[#98c9a3]">
                      <span className="line-clamp-1 flex items-center gap-1 font-medium">
                        <FileText className="w-3.5 h-3.5" />
                        {attachmentName}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachmentUrl("");
                          setAttachmentName("");
                        }}
                        className="text-red-400 hover:text-red-300 ml-2"
                        title="ลบไฟล์แนบ"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  หมายเหตุ / เหตุผล
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3] resize-none"
                  placeholder="ระบุเหตุผลการทำรายการเพิ่มเติม..."
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
                  disabled={saving || uploadingFile}
                  className="btn-earth-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <span>กำลังบันทึก...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ยืนยันบันทึกสต็อก</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Movement Modal Form */}
      {isEditMovementModalOpen && editingMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#98c9a3]/30 space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#f3efe6]">
                    แก้ไขเอกสาร/ประวัติทำรายการ
                  </h3>
                  <p className="text-xs text-[#a39b8b]">
                    {editingMovement.productId?.name} ({editingMovement.productId?.code})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditMovementModalOpen(false)}
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
            <form onSubmit={handleUpdateMovement} className="space-y-4">
              {/* Ref Doc */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  เลขที่เอกสาร / อ้างอิง (Ref Doc)
                </label>
                <input
                  type="text"
                  value={refDoc}
                  onChange={(e) => setRefDoc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                  placeholder="เช่น PO-2026-001"
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  แนบไฟล์เอกสาร / ใบส่งสินค้า (Attachment)
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] hover:border-[#98c9a3]/50 cursor-pointer text-xs text-[#a39b8b] transition-colors">
                    <Paperclip className="w-4 h-4 text-[#98c9a3]" />
                    <span>
                      {uploadingFile
                        ? "กำลังอัปโหลดไฟล์..."
                        : attachmentName
                        ? `เปลี่ยนไฟล์: ${attachmentName}`
                        : "เลือกไฟล์แนบใหม่ (PDF, รูปภาพ, เอกสาร)"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                  </label>

                  {attachmentName && (
                    <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 text-[#98c9a3]">
                      <span className="line-clamp-1 flex items-center gap-1 font-medium">
                        <FileText className="w-3.5 h-3.5" />
                        {attachmentName}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachmentUrl("");
                          setAttachmentName("");
                        }}
                        className="text-red-400 hover:text-red-300 ml-2"
                        title="ลบไฟล์แนบ"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  หมายเหตุ / เหตุผล
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3] resize-none"
                  placeholder="ระบุเหตุผลการแก้ไข..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2d4734]">
                <button
                  type="button"
                  onClick={() => setIsEditMovementModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingFile}
                  className="btn-earth-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <span>กำลังบันทึก...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>บันทึกการแก้ไข</span>
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

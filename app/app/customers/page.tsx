"use client";

import { useEffect, useState } from "react";
import {
  Contact,
  UserPlus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Building2,
  User,
  FileText,
  MapPin,
  UserCheck,
} from "lucide-react";
import Pagination from "@/app/components/Pagination";

interface CustomerItem {
  _id: string;
  referType: "2" | "3"; // 2=บุคคลทั่วไป, 3=นิติบุคคล
  prefix: string;
  fullname: string;
  address?: string;
  taxId?: string;
  phone?: string;
  contactName?: string;
  note?: string;
  status: "active" | "inactive";
  createdAt: string;
}

const INDIVIDUAL_PREFIXES = ["นาย", "นาง", "นางสาว", "ดร.", "ผศ.", "พญ.", "นพ.", "อื่นๆ"];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "2" | "3">("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterStatus]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomerItem | null>(null);

  // Form State
  const [referType, setReferType] = useState<"2" | "3">("2"); // 2=บุคคลทั่วไป, 3=นิติบุคคล
  const [prefix, setPrefix] = useState("นาย");
  const [fullname, setFullname] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setReferType("2"); // Default บุคคลทั่วไป
    setPrefix("นาย");
    setFullname("");
    setAddress("");
    setTaxId("");
    setPhone("");
    setContactName("");
    setNote("");
    setStatus("active");
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: CustomerItem) => {
    setEditingItem(item);
    setReferType(item.referType === "3" ? "3" : "2");
    setPrefix(item.prefix || (item.referType === "3" ? "บริษัท" : "นาย"));
    setFullname(item.fullname);
    setAddress(item.address || "");
    setTaxId(item.taxId || "");
    setPhone(item.phone || "");
    setContactName(item.contactName || "");
    setNote(item.note || "");
    setStatus(item.status);
    setError("");
    setIsModalOpen(true);
  };

  // Handle Radio Change for referType
  const handleTypeChange = (newType: "2" | "3") => {
    setReferType(newType);
    if (newType === "2") {
      setPrefix("นาย");
    } else {
      setPrefix("บริษัท");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const url = editingItem
        ? `/api/customers/${editingItem._id}`
        : "/api/customers";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referType,
          prefix,
          fullname,
          address,
          taxId,
          phone,
          contactName,
          note,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      setSuccess(editingItem ? "อัปเดตข้อมูลลูกค้าสำเร็จ!" : "เพิ่มข้อมูลลูกค้าสำเร็จ!");
      setIsModalOpen(false);
      fetchCustomers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบข้อมูลลูกค้า "${name}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถลบข้อมูลได้");

      setSuccess("ลบข้อมูลลูกค้าสำเร็จเรียบร้อย");
      fetchCustomers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredCustomers = customers.filter((item) => {
    const matchesSearch =
      item.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.taxId && item.taxId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.phone && item.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.contactName && item.contactName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === "all" || item.referType === filterType;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const individualCount = customers.filter((c) => c.referType === "2").length;
  const corporateCount = customers.filter((c) => c.referType === "3").length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#446e50] to-[#1f3627] border border-[#98c9a3]/40 flex items-center justify-center">
            <Contact className="w-6 h-6 text-[#98c9a3]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-earth">
              บันทึกข้อมูลลูกค้า (Customer Records)
            </h1>
            <p className="text-xs text-[#a39b8b]">
              ระบบจัดเก็บและจัดการข้อมูลลูกค้าทั้งประเภทบุคคลทั่วไป (referType = 2) และนิติบุคคล (referType = 3)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCustomers}
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
            <span>เพิ่มข้อมูลลูกค้า</span>
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
              ลูกค้าทั้งหมด
            </span>
            <span className="text-3xl font-extrabold text-[#f3efe6]">
              {customers.length} <span className="text-xs font-normal text-[#a39b8b]">ราย</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center">
            <Contact className="w-5 h-5 text-[#98c9a3]" />
          </div>
        </div>

        <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#a39b8b] font-medium block uppercase">
              บุคคลทั่วไป (referType 2)
            </span>
            <span className="text-3xl font-extrabold text-[#98c9a3]">
              {individualCount} <span className="text-xs font-normal text-[#a39b8b]">ราย</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center">
            <User className="w-5 h-5 text-[#98c9a3]" />
          </div>
        </div>

        <div className="glass-earth-card p-5 rounded-2xl border border-[#2d4734] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#a39b8b] font-medium block uppercase">
              นิติบุคคล (referType 3)
            </span>
            <span className="text-3xl font-extrabold text-[#e6dfd3]">
              {corporateCount} <span className="text-xs font-normal text-[#a39b8b]">ราย</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#18241c] border border-[#2d4734] flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#e6dfd3]" />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, เลขผู้เสียภาษี, เบอร์ หรือผู้ติดต่อ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-[#121c15] text-[#f3efe6] text-xs px-3 py-2 rounded-xl border border-[#2d4734] focus:outline-none focus:border-[#98c9a3]"
          >
            <option value="all">ทุกประเภทอ้างอิง</option>
            <option value="2">บุคคลทั่วไป (Type 2)</option>
            <option value="3">นิติบุคคล (Type 3)</option>
          </select>

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

      {/* Customers Table */}
      <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734]">
        {loading ? (
          <div className="p-12 text-center text-[#a39b8b]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#98c9a3]" />
            กำลังโหลดข้อมูลลูกค้า...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-[#a39b8b]">
            ไม่พบข้อมูลลูกค้าในระบบ
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase tracking-wider">
                  <th className="py-4 px-6">ชื่อลูกค้า / บริษัท</th>
                  <th className="py-4 px-4">ประเภทอ้างอิง</th>
                  <th className="py-4 px-6">เลขผู้เสียภาษี & ที่อยู่</th>
                  <th className="py-4 px-6">การติดต่อ (ผู้ติดต่อ / เบอร์)</th>
                  <th className="py-4 px-4 text-center">สถานะ</th>
                  <th className="py-4 px-6 text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2d4734]/50 text-sm">
                {filteredCustomers
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((item) => {
                  const isCorporate = item.referType === "3";

                  return (
                    <tr key={item._id} className="hover:bg-[#18241c]/60 transition-colors">
                      {/* Name & Prefix */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs ${
                              isCorporate
                                ? "bg-[#18241c] text-[#e6dfd3] border-[#2d4734]"
                                : "bg-[#1e3425] text-[#98c9a3] border-[#98c9a3]/30"
                            }`}
                          >
                            {isCorporate ? (
                              <Building2 className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-[#f3efe6]">
                              {item.prefix && (
                                <span className="text-[#98c9a3] font-medium mr-1">
                                  {item.prefix}
                                </span>
                              )}
                              {item.fullname}
                            </p>
                            {item.note && (
                              <p className="text-[11px] text-[#a39b8b] mt-0.5">{item.note}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-4 px-4 text-xs">
                        {isCorporate ? (
                          <span className="px-2.5 py-1 rounded-lg bg-[#24221e] text-[#e6dfd3] border border-[#2d4734] font-medium">
                            นิติบุคคล (3)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-[#1e3425] text-[#98c9a3] border border-[#98c9a3]/30 font-medium">
                            บุคคลทั่วไป (2)
                          </span>
                        )}
                      </td>

                      {/* Tax ID & Address */}
                      <td className="py-4 px-6 text-xs text-[#a39b8b]">
                        {item.taxId && (
                          <div className="flex items-center gap-1.5 font-mono text-[#e6dfd3] mb-1">
                            <FileText className="w-3.5 h-3.5 text-[#98c9a3] shrink-0" />
                            <span>เลขผู้เสียภาษี: {item.taxId}</span>
                          </div>
                        )}
                        {item.address ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#98c9a3] shrink-0" />
                            <span className="truncate max-w-xs">{item.address}</span>
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-6 text-xs text-[#e6dfd3]">
                        {item.contactName && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <UserCheck className="w-3.5 h-3.5 text-[#98c9a3] shrink-0" />
                            <span className="font-semibold">{item.contactName}</span>
                          </div>
                        )}
                        {item.phone ? (
                          <div className="flex items-center gap-1.5 text-[#a39b8b] font-mono">
                            <Phone className="w-3.5 h-3.5 text-[#98c9a3] shrink-0" />
                            <span>{item.phone}</span>
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
                            onClick={() => handleDelete(item._id, item.fullname)}
                            className="p-1.5 rounded-lg bg-[#121c15] text-red-400 hover:bg-red-950/40 border border-[#2d4734] transition-colors"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#2d4734]">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredCustomers.length / itemsPerPage)}
            totalItems={filteredCustomers.length}
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
                  <Contact className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#f3efe6]">
                  {editingItem ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มข้อมูลลูกค้าใหม่"}
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
              {/* 1. ประเภทอ้างอิง (Radio Box: 2=บุคคลทั่วไป, 3=นิติบุคคล) */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-2">
                  ประเภทอ้างอิง (Customer Type) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => handleTypeChange("2")}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      referType === "2"
                        ? "bg-[#1e3425] border-[#98c9a3]/60 text-[#98c9a3] font-semibold"
                        : "bg-[#121c15] border-[#2d4734] text-[#a39b8b] hover:text-[#f3efe6]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="referType"
                      value="2"
                      checked={referType === "2"}
                      onChange={() => handleTypeChange("2")}
                      className="accent-[#98c9a3]"
                    />
                    <div className="flex items-center gap-1.5 text-xs">
                      <User className="w-4 h-4" />
                      <span>บุคคลทั่วไป (2)</span>
                    </div>
                  </label>

                  <label
                    onClick={() => handleTypeChange("3")}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      referType === "3"
                        ? "bg-[#1e3425] border-[#98c9a3]/60 text-[#98c9a3] font-semibold"
                        : "bg-[#121c15] border-[#2d4734] text-[#a39b8b] hover:text-[#f3efe6]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="referType"
                      value="3"
                      checked={referType === "3"}
                      onChange={() => handleTypeChange("3")}
                      className="accent-[#98c9a3]"
                    />
                    <div className="flex items-center gap-1.5 text-xs">
                      <Building2 className="w-4 h-4" />
                      <span>นิติบุคคล (3)</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 2. คำนำหน้า & ชื่อบริษัท/บุคคล */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Prefix */}
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    คำนำหน้า *
                  </label>
                  {referType === "2" ? (
                    // บุคคลทั่วไป -> Dropdown
                    <select
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                    >
                      {INDIVIDUAL_PREFIXES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  ) : (
                    // นิติบุคคล -> Text Input
                    <input
                      type="text"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                      placeholder="บริษัท / หจก."
                    />
                  )}
                </div>

                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    {referType === "3"
                      ? "ชื่อบริษัท / ห้างหุ้นส่วน / ร้านค้า *"
                      : "ชื่อ-นามสกุล บุคคลทั่วไป *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                    placeholder={
                      referType === "3"
                        ? "ไทยเภสัช เทรดดิ้ง จำกัด"
                        : "สมศักดิ์ มั่งคั่ง"
                    }
                  />
                </div>
              </div>

              {/* 3. เลขผู้เสียภาษี & เบอร์ติดต่อ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tax ID */}
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    เลขประจำตัวผู้เสียภาษี
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                    placeholder="0105562012345"
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
                    placeholder="02-123-4567"
                  />
                </div>
              </div>

              {/* 4. ชื่อผู้ติดต่อ */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  ชื่อผู้ติดต่อ (Contact Person)
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                  placeholder="คุณวีระ (ผู้จัดการฝ่ายจัดซื้อ)"
                />
              </div>

              {/* 5. ที่อยู่ */}
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  ที่อยู่
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3] resize-none"
                  placeholder="เลขที่ 123/45 ถนนสุขุมวิท..."
                />
              </div>

              {/* 6. สถานะ */}
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

              {/* 7. หมายเหตุ */}
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

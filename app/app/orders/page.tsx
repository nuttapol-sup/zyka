"use client";

import { useEffect, useState, useRef } from "react";
import {
  ShoppingBag,
  Plus,
  Search,
  RefreshCw,
  Truck,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Printer,
  X,
  Paperclip,
  User,
  Calendar,
  CreditCard,
  Building,
  Package,
  FolderSearch,
} from "lucide-react";
import Pagination from "@/app/components/Pagination";

interface CustomerItem {
  _id: string;
  fullname: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

interface ProductItem {
  _id: string;
  code: string;
  name: string;
  unit?: string;
  stock?: number;
}

interface LocationItem {
  _id: string;
  code: string;
  name: string;
}

interface OrderItemRow {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  price: number;
  quantity: number;
  amount: number;
  stock?: number;
}

interface OrderData {
  _id: string;
  orderNo: string;
  customerId: CustomerItem;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerTaxId?: string;
  orderDate: string;
  dueDate?: string;
  creditDays?: number;
  deliveryStatus: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  shippingCarrier?: string;
  trackingNo?: string;
  paymentStatus: "UNPAID" | "BILLED" | "PAID" | "OVERDUE";
  paymentMethod?: "CASH" | "TRANSFER" | "CREDIT_CARD" | "CHEQUE";
  items: OrderItemRow[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  stockDeducted: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  note?: string;
  createdByName?: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingDelivery: 0,
    pendingPayment: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDelivery, setFilterDelivery] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDelivery, filterPayment]);

  // Create Order Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [creditDays, setCreditDays] = useState(0);
  const [shippingCarrier, setShippingCarrier] = useState("Kerry Express");
  const [trackingNo, setTrackingNo] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<"PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED">("PENDING");
  const [paymentStatus, setPaymentStatus] = useState<"UNPAID" | "BILLED" | "PAID" | "OVERDUE">("UNPAID");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER" | "CREDIT_CARD" | "CHEQUE">("TRANSFER");
  const [discount, setDiscount] = useState(0);
  const [hasTax, setHasTax] = useState(true);
  const [taxRate, setTaxRate] = useState(7);
  const [deductStock, setDeductStock] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [note, setNote] = useState("");

  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Edit Status Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderData | null>(null);

  // Print Receipt Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printingOrder, setPrintingOrder] = useState<OrderData | null>(null);
  const [docType, setDocType] = useState<"receipt" | "billing" | "order">("receipt");

  // Product Search Popup Modal State
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState("");

  const openProductPicker = (index: number) => {
    setActiveItemIndex(index);
    setProductSearchQuery("");
    setIsProductPickerOpen(true);
  };

  const handleSelectProductFromPicker = (prod: ProductItem) => {
    if (activeItemIndex === null) return;
    const newItems = [...orderItems];
    newItems[activeItemIndex] = {
      ...newItems[activeItemIndex],
      productId: prod._id,
      productCode: prod.code,
      productName: prod.name,
      unit: prod.unit || "ชิ้น",
      stock: prod.stock ?? 0,
    };
    setOrderItems(newItems);
    setIsProductPickerOpen(false);
    setActiveItemIndex(null);
  };

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const printRef = useRef<HTMLDivElement>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = `/api/orders?search=${encodeURIComponent(searchTerm)}&deliveryStatus=${filterDelivery}&paymentStatus=${filterPayment}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [resCust, resProd, resLoc] = await Promise.all([
        fetch("/api/customers", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/locations", { cache: "no-store" }),
      ]);

      if (resCust.ok) {
        const dataCust = await resCust.json();
        setCustomers(dataCust.customers || []);
      }
      if (resProd.ok) {
        const dataProd = await resProd.json();
        setProducts(dataProd.products || []);
      }
      if (resLoc.ok) {
        const dataLoc = await resLoc.json();
        setLocations(dataLoc.locations || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, filterDelivery, filterPayment]);

  const openCreateModal = () => {
    setSelectedCustomerId(customers[0]?._id || "");
    setOrderDate(new Date().toISOString().split("T")[0]);
    setDueDate("");
    setCreditDays(0);
    setShippingCarrier("Kerry Express");
    setTrackingNo("");
    setDeliveryStatus("PENDING");
    setPaymentStatus("UNPAID");
    setPaymentMethod("TRANSFER");
    setDiscount(0);
    setHasTax(true);
    setTaxRate(7);
    setDeductStock(false);
    setSelectedLocationId(locations[0]?._id || "");
    setAttachmentUrl("");
    setAttachmentName("");
    setNote("");
    setError("");
    setOrderItems([]);
    setIsCreateModalOpen(true);
  };

  const handleAddOrderItem = () => {
    setOrderItems([
      ...orderItems,
      {
        productId: "",
        productCode: "",
        productName: "",
        unit: "ชิ้น",
        price: 0,
        quantity: 1,
        amount: 0,
      },
    ]);
  };

  const handleRemoveOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemProductChange = (index: number, prodId: string) => {
    const prod = products.find((p) => p._id === prodId);
    if (!prod) return;

    const newItems = [...orderItems];
    newItems[index] = {
      ...newItems[index],
      productId: prod._id,
      productCode: prod.code,
      productName: prod.name,
      unit: prod.unit || "ชิ้น",
    };
    setOrderItems(newItems);
  };

  const handleItemQuantityChange = (index: number, qty: number) => {
    const newItems = [...orderItems];
    const item = newItems[index];
    item.quantity = qty;
    item.amount = item.quantity * item.price;
    setOrderItems(newItems);
  };

  const handleItemPriceChange = (index: number, price: number) => {
    const newItems = [...orderItems];
    const item = newItems[index];
    item.price = price;
    item.amount = item.quantity * item.price;
    setOrderItems(newItems);
  };

  // Money Calculations
  const calculatedSubtotal = orderItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const calculatedTaxableAmount = Math.max(0, calculatedSubtotal - discount);
  const calculatedTaxAmount = hasTax ? (calculatedTaxableAmount * 7) / 100 : 0;
  const calculatedGrandTotal = calculatedTaxableAmount + calculatedTaxAmount;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
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

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (orderItems.length === 0) {
        throw new Error("กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ");
      }

      for (const item of orderItems) {
        if (!item.productId) {
          throw new Error("กรุณากดเลือกสินค้าให้ครบถ้วนทุกรายการ");
        }
        const avail = item.stock ?? 0;
        if (item.quantity > avail) {
          throw new Error(
            `⚠️ สินค้าในคลังไม่พอ! "${item.productName}" (สั่งซื้อ ${item.quantity} ${item.unit} แต่ในคลังคงเหลือเพียง ${avail} ${item.unit})`
          );
        }
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          orderDate,
          dueDate,
          creditDays,
          shippingCarrier,
          trackingNo,
          deliveryStatus,
          paymentStatus,
          paymentMethod,
          items: orderItems,
          discount,
          hasTax,
          taxRate: hasTax ? 7 : 0,
          deductStock,
          locationId: deductStock ? selectedLocationId : undefined,
          attachmentUrl,
          attachmentName,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการบันทึกสั่งซื้อ");

      setSuccess("บันทึกคำสั่งซื้อเรียบร้อยแล้ว!");
      setIsCreateModalOpen(false);
      fetchOrders();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const [editDeductStock, setEditDeductStock] = useState(false);
  const [editLocationId, setEditLocationId] = useState("");

  const openEditModal = (order: OrderData) => {
    setEditingOrder(order);
    setDeliveryStatus(order.deliveryStatus);
    setShippingCarrier(order.shippingCarrier || "Kerry Express");
    setTrackingNo(order.trackingNo || "");
    setPaymentStatus(order.paymentStatus);
    setPaymentMethod(order.paymentMethod || "TRANSFER");
    setDueDate(order.dueDate ? order.dueDate.split("T")[0] : "");
    setAttachmentUrl(order.attachmentUrl || "");
    setAttachmentName(order.attachmentName || "");
    setNote(order.note || "");
    setEditDeductStock(false);
    setEditLocationId(locations[0]?._id || "");
    setError("");
    setIsEditModalOpen(true);
  };

  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/orders/${editingOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryStatus,
          shippingCarrier,
          trackingNo,
          paymentStatus,
          paymentMethod,
          dueDate: dueDate || undefined,
          attachmentUrl,
          attachmentName,
          note,
          deductStock: editDeductStock,
          locationId: editDeductStock ? editLocationId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการอัปเดตสถานะ");

      setSuccess("อัปเดตสถานะคำสั่งซื้อเรียบร้อยแล้ว!");
      setIsEditModalOpen(false);
      fetchOrders();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการสั่งซื้อนี้? ระบบจะทำการคืนสินค้าเข้าคลังสต็อกตามสถานที่เก็บเดิมให้อัตโนมัติ")) return;

    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการลบ");

      setSuccess("ลบคำสั่งซื้อเรียบร้อยแล้ว");
      fetchOrders();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openPrintModal = (order: OrderData, type: "receipt" | "billing" | "order" = "receipt") => {
    setPrintingOrder(order);
    setDocType(type);
    setIsPrintModalOpen(true);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#446e50] to-[#1f3627] border border-[#98c9a3]/40 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-[#98c9a3]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient-earth">
              บันทึกรายการสั่งซื้อ (Purchase & Sales Orders)
            </h1>
            <p className="text-xs text-[#a39b8b]">
              บันทึกคำสั่งซื้อ ดึงข้อมูลลูกค้า ติดตามสถานะจัดส่ง/ขนส่ง วางบิล และออกใบเสร็จรับเงิน/ใบกำกับภาษี
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
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
            <span>+ สร้างคำสั่งซื้อใหม่</span>
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

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] text-[#98c9a3] border border-[#98c9a3]/30 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#a39b8b]">คำสั่งซื้อทั้งหมด</p>
            <p className="text-xl font-bold text-[#f3efe6] font-mono">{stats.totalOrders} รายการ</p>
          </div>
        </div>

        <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-600/40 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#a39b8b]">รอจัดส่ง / กำลังส่ง</p>
            <p className="text-xl font-bold text-amber-300 font-mono">{stats.pendingDelivery} รายการ</p>
          </div>
        </div>

        <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-950/60 text-blue-300 border border-blue-600/40 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#a39b8b]">รอวางบิล / รอชำระเงิน</p>
            <p className="text-xl font-bold text-blue-300 font-mono">{stats.pendingPayment} รายการ</p>
          </div>
        </div>

        <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#1e3425] text-[#98c9a3] border border-[#98c9a3]/30 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#a39b8b]">ยอดขายรวมสุทธิ</p>
            <p className="text-xl font-bold text-[#98c9a3] font-mono">฿{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหารหัสสั่งซื้อ, ชื่อลูกค้า, เลขพัสดุ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#a39b8b]">
            <Truck className="w-3.5 h-3.5" />
            <span>ขนส่ง:</span>
            <select
              value={filterDelivery}
              onChange={(e) => setFilterDelivery(e.target.value)}
              className="bg-[#121c15] text-[#f3efe6] text-xs px-3 py-1.5 rounded-xl border border-[#2d4734] focus:outline-none focus:border-[#98c9a3]"
            >
              <option value="all">ทุกสถานะจัดส่ง</option>
              <option value="PENDING">รอจัดส่ง</option>
              <option value="SHIPPED">กำลังจัดส่ง</option>
              <option value="DELIVERED">ส่งมอบสำเร็จ</option>
              <option value="CANCELLED">ยกเลิก</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#a39b8b]">
            <FileText className="w-3.5 h-3.5" />
            <span>การเงิน:</span>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="bg-[#121c15] text-[#f3efe6] text-xs px-3 py-1.5 rounded-xl border border-[#2d4734] focus:outline-none focus:border-[#98c9a3]"
            >
              <option value="all">ทุกสถานะชำระ/วางบิล</option>
              <option value="UNPAID">รอวางบิล / รอชำระ</option>
              <option value="BILLED">วางบิลแล้ว</option>
              <option value="PAID">ชำระเงินแล้ว (เสร็จสิ้น)</option>
              <option value="OVERDUE">เกินกำหนดชำระ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-earth-card rounded-3xl overflow-hidden border border-[#2d4734]">
        {loading ? (
          <div className="p-12 text-center text-[#a39b8b]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#98c9a3]" />
            กำลังโหลดรายการสั่งซื้อ...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-[#a39b8b]">
            ไม่พบรายการสั่งซื้อตามเงื่อนไขที่กำหนด
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121c15] border-b border-[#2d4734] text-xs font-semibold text-[#a39b8b] uppercase tracking-wider">
                  <th className="py-4 px-6">รหัสสั่งซื้อ / วันที่</th>
                  <th className="py-4 px-6">ข้อมูลลูกค้า</th>
                  <th className="py-4 px-6">การจัดส่ง & Tracking</th>
                  <th className="py-4 px-4 text-center">สถานะจัดส่ง</th>
                  <th className="py-4 px-4 text-center">สถานะวางบิล/ชำระ</th>
                  <th className="py-4 px-6 text-right">ยอดเงินรวมสุทธิ</th>
                  <th className="py-4 px-6 text-center">ออกใบเสร็จ / จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#2d4734]/50 text-sm">
                {orders
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((o) => (
                  <tr key={o._id} className="hover:bg-[#18241c]/60 transition-colors">
                    {/* Order No & Date */}
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-xl bg-[#1e3425] text-[#98c9a3] font-mono font-bold text-xs border border-[#98c9a3]/30 block w-fit mb-1">
                        {o.orderNo}
                      </span>
                      <span className="text-xs text-[#a39b8b] block">
                        {new Date(o.orderDate).toLocaleDateString("th-TH")}
                      </span>
                      {o.stockDeducted ? (
                        <span className="px-2 py-0.5 mt-1 rounded bg-[#1e3425] text-[#98c9a3] text-[10px] font-bold border border-[#98c9a3]/30 inline-block">
                          ✓ ตัดสต็อกสินค้าแล้ว
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 mt-1 rounded bg-amber-950/60 text-amber-300 text-[10px] font-bold border border-amber-600/40 inline-block">
                          ⚠️ ยังไม่ตัดสต็อก
                        </span>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-6">
                      <span className="font-bold text-[#f3efe6] block">{o.customerName}</span>
                      {o.customerPhone && (
                        <span className="text-xs text-[#a39b8b] block">โทร: {o.customerPhone}</span>
                      )}
                    </td>

                    {/* Shipping Carrier & Tracking */}
                    <td className="py-4 px-6 text-xs space-y-1">
                      <span className="text-[#e6dfd3] flex items-center gap-1 font-medium">
                        <Truck className="w-3.5 h-3.5 text-[#98c9a3]" />
                        {o.shippingCarrier || "ขนส่งเอกชน"}
                      </span>
                      {o.trackingNo ? (
                        <span className="px-2 py-0.5 rounded bg-[#121c15] text-[#98c9a3] font-mono border border-[#2d4734] inline-block">
                          Track: {o.trackingNo}
                        </span>
                      ) : (
                        <span className="text-[#a39b8b] italic">- ยังไม่ได้ใส่เลขพัสดุ -</span>
                      )}
                    </td>

                    {/* Delivery Status */}
                    <td className="py-4 px-4 text-center">
                      {o.deliveryStatus === "PENDING" ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 text-[11px] font-bold border border-amber-600/40 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> รอจัดส่ง
                        </span>
                      ) : o.deliveryStatus === "SHIPPED" ? (
                        <span className="px-2.5 py-1 rounded-full bg-blue-950/60 text-blue-300 text-[11px] font-bold border border-blue-600/40 inline-flex items-center gap-1">
                          <Truck className="w-3 h-3" /> กำลังจัดส่ง
                        </span>
                      ) : o.deliveryStatus === "DELIVERED" ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#1e3425] text-[#98c9a3] text-[11px] font-bold border border-[#98c9a3]/30 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ส่งมอบสำเร็จ
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-red-950/60 text-red-300 text-[11px] font-bold border border-red-800/40 inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> ยกเลิก
                        </span>
                      )}
                    </td>

                    {/* Payment Status */}
                    <td className="py-4 px-4 text-center">
                      {o.paymentStatus === "UNPAID" ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 text-[11px] font-bold border border-amber-600/40 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> รอวางบิล/ชำระ
                        </span>
                      ) : o.paymentStatus === "BILLED" ? (
                        <span className="px-2.5 py-1 rounded-full bg-blue-950/60 text-blue-300 text-[11px] font-bold border border-blue-600/40 inline-flex items-center gap-1">
                          <FileText className="w-3 h-3" /> วางบิลแล้ว
                        </span>
                      ) : o.paymentStatus === "PAID" ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#1e3425] text-[#98c9a3] text-[11px] font-bold border border-[#98c9a3]/30 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ชำระเงินแล้ว
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-red-950/60 text-red-300 text-[11px] font-bold border border-red-800/40 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> เกินกำหนด
                        </span>
                      )}
                    </td>

                    {/* Grand Total */}
                    <td className="py-4 px-6 text-right font-mono font-extrabold text-[#98c9a3]">
                      ฿{o.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openPrintModal(o, "receipt")}
                          className="p-1.5 rounded-lg bg-[#1e3425] text-[#98c9a3] hover:bg-[#284532] border border-[#98c9a3]/30 transition-colors"
                          title="พิมพ์ใบเสร็จ / ใบกำกับภาษี"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(o)}
                          className="p-1.5 rounded-lg bg-[#121c15] text-[#98c9a3] hover:bg-[#1c2d22] border border-[#2d4734] transition-colors"
                          title="อัปเดตสถานะจัดส่ง/การเงิน"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(o._id)}
                          className="p-1.5 rounded-lg bg-[#121c15] text-red-400 hover:bg-red-950/40 border border-[#2d4734] transition-colors"
                          title="ลบคำสั่งซื้อ"
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
            totalPages={Math.ceil(orders.length / itemsPerPage)}
            totalItems={orders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(size) => setItemsPerPage(size)}
          />
        </div>
      </div>

      {/* CREATE ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-4xl w-full glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#98c9a3]/30 space-y-6 relative overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#f3efe6]">สร้างคำสั่งซื้อใหม่ (Create Purchase Order)</h3>
                  <p className="text-xs text-[#a39b8b]">กรอกข้อมูลลูกค้า รายการสินค้า เลือกขนส่ง และออกเอกสาร</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 rounded-xl text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#121c15]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="space-y-6">
              {/* Section 1: Customer & Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#121c15]/60 p-4 rounded-2xl border border-[#2d4734]">
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    เลือกลูกค้า (Customer) *
                  </label>
                  <select
                    required
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                  >
                    <option value="">-- เลือกลูกค้า --</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.fullname} {c.phone ? `(โทร: ${c.phone})` : ""}
                      </option>
                    ))}
                  </select>

                  {/* Customer Preview Box */}
                  {selectedCustomerId && (
                    <div className="mt-2 p-3 rounded-xl bg-[#18241c] border border-[#2d4734] text-xs text-[#a39b8b] space-y-1">
                      {(() => {
                        const cust = customers.find((c) => c._id === selectedCustomerId);
                        if (!cust) return null;
                        return (
                          <>
                            <p className="text-[#f3efe6] font-semibold">{cust.fullname}</p>
                            <p>ที่อยู่: {cust.address || "-"}</p>
                            <p>เลขผู้เสียภาษี: {cust.taxId || "-"}</p>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                      วันที่สั่งซื้อ *
                    </label>
                    <input
                      type="date"
                      required
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                      กำหนดชำระ / วางบิล
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                      บริษัทขนส่ง (Carrier)
                    </label>
                    <input
                      type="text"
                      value={shippingCarrier}
                      onChange={(e) => setShippingCarrier(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                      placeholder="Kerry, Flash, J&T, EMS"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                      เลขพัสดุ (Tracking No)
                    </label>
                    <input
                      type="text"
                      value={trackingNo}
                      onChange={(e) => setTrackingNo(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                      placeholder="TH0123456789"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Order Items Selection Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#f3efe6] uppercase flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#98c9a3]" />
                    รายการสินค้าที่สั่งซื้อ
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddOrderItem}
                    className="px-3 py-1.5 rounded-xl bg-[#1e3425] text-[#98c9a3] hover:bg-[#284532] border border-[#98c9a3]/30 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มรายการสินค้า</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-[#2d4734] rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#121c15] text-[#a39b8b] uppercase border-b border-[#2d4734]">
                        <th className="py-3 px-3">#</th>
                        <th className="py-3 px-4">สินค้า (Product)</th>
                        <th className="py-3 px-3 text-center">หน่วย</th>
                        <th className="py-3 px-3 text-center">จำนวน</th>
                        <th className="py-3 px-4 text-right">ราคา/หน่วย (บาท)</th>
                        <th className="py-3 px-4 text-right">รวมเงิน (บาท)</th>
                        <th className="py-3 px-3 text-center">ลบ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2d4734]/50">
                      {orderItems.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-xs text-[#a39b8b]">
                            ยังไม่มีรายการสินค้า กรุณากดปุ่ม <span className="text-[#98c9a3] font-bold">+ เพิ่มรายการสินค้า</span> ด้านบนเพื่อเลือกสินค้า
                          </td>
                        </tr>
                      ) : (
                        orderItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#18241c]/50">
                          <td className="py-3 px-3 font-mono text-[#a39b8b]">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                readOnly
                                value={item.productName ? `${item.productName} (รหัส: ${item.productCode})` : "กรุณากดดึงข้อมูลสินค้า"}
                                onClick={() => openProductPicker(idx)}
                                className="w-full px-3 py-1.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] cursor-pointer focus:outline-none focus:border-[#98c9a3]"
                                placeholder="กดปุ่มเพื่อเลือกสินค้า..."
                              />
                              <button
                                type="button"
                                onClick={() => openProductPicker(idx)}
                                className="px-3 py-1.5 rounded-xl bg-[#1e3425] text-[#98c9a3] hover:bg-[#284532] border border-[#98c9a3]/40 text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors shadow-sm"
                                title="ดึงข้อมูลสินค้า"
                              >
                                <FolderSearch className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">ดึงข้อมูลสินค้า</span>
                              </button>
                            </div>
                            {item.productId && (
                              <div className="mt-1 text-[11px] font-medium text-[#a39b8b] flex items-center gap-2">
                                <span>สต็อกคงเหลือในคลัง: <strong className={item.stock && item.stock > 0 ? "text-[#98c9a3]" : "text-red-400"}>{item.stock ?? 0} {item.unit}</strong></span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-[#a39b8b]">
                            {item.unit}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleItemQuantityChange(idx, parseInt(e.target.value, 10) || 1)}
                              className={`w-16 text-center px-2 py-1 rounded-lg bg-[#121c15] border text-xs font-mono ${
                                item.productId && item.quantity > (item.stock ?? 0)
                                  ? "border-red-500 text-red-300 bg-red-950/40"
                                  : "border-[#2d4734] text-[#f3efe6]"
                              }`}
                            />
                            {item.productId && item.quantity > (item.stock ?? 0) && (
                              <div className="text-[10px] text-red-400 font-bold mt-1 leading-tight">
                                ⚠️ สินค้าไม่พอ!
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={item.price}
                              onChange={(e) => handleItemPriceChange(idx, parseFloat(e.target.value) || 0)}
                              className="w-24 text-right px-2 py-1 rounded-lg bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono"
                            />
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#98c9a3]">
                            ฿{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveOrderItem(idx)}
                              className="p-1 rounded bg-red-950/50 text-red-400 hover:text-red-300 border border-red-800/40"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Money Summary & Stock Deduction */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Order Note */}
                <div className="bg-[#121c15]/60 p-4 rounded-2xl border border-[#2d4734] space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                      หมายเหตุสั่งซื้อเพิ่มเติม
                    </label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] resize-none"
                      placeholder="เช่น ส่งของช่วงเช้า, ห่อกันกระแทก..."
                    />
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="bg-[#121c15] p-4 rounded-2xl border border-[#2d4734] space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-[#a39b8b]">
                    <span>รวมเงิน (Subtotal):</span>
                    <span>฿{calculatedSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between items-center text-[#a39b8b]">
                    <span>ส่วนลด (Discount):</span>
                    <input
                      type="number"
                      min={0}
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-24 text-right px-2 py-0.5 rounded bg-[#18241c] border border-[#2d4734] text-xs text-[#f3efe6]"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[#a39b8b]">
                    <span>ประเภทภาษี (VAT):</span>
                    <select
                      value={hasTax ? "7" : "0"}
                      onChange={(e) => setHasTax(e.target.value === "7")}
                      className="px-2 py-0.5 rounded bg-[#18241c] border border-[#2d4734] text-xs text-[#98c9a3] font-bold"
                    >
                      <option value="7">มี VAT 7% (ภาษีมูลค่าเพิ่ม)</option>
                      <option value="0">ไม่มี VAT (0% / ยกเว้นภาษี)</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center text-[#a39b8b]">
                    <span>ภาษีมูลค่าเพิ่ม ({hasTax ? "VAT 7%" : "ไม่มี VAT"}):</span>
                    <span>฿{calculatedTaxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="pt-2 border-t border-[#2d4734] flex justify-between items-center text-sm font-extrabold text-[#98c9a3]">
                    <span>ยอดรวมสุทธิ (Grand Total):</span>
                    <span>฿{calculatedGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2d4734]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving || orderItems.length === 0}
                  className="btn-earth-primary px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  {saving ? <span>กำลังบันทึก...</span> : <span>ยืนยันบันทึกสั่งซื้อ</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / UPDATE STATUS MODAL */}
      {isEditModalOpen && editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#98c9a3]/30 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#f3efe6]">อัปเดตสถานะจัดส่ง/วางบิล</h3>
                  <p className="text-xs text-[#a39b8b] font-mono">{editingOrder.orderNo}</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 rounded-xl text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#121c15]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleUpdateOrderStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  สถานะการจัดส่ง (Delivery Status)
                </label>
                <select
                  value={deliveryStatus}
                  onChange={(e: any) => setDeliveryStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6]"
                >
                  <option value="PENDING">รอจัดส่ง (Pending)</option>
                  <option value="SHIPPED">กำลังจัดส่ง (Shipped)</option>
                  <option value="DELIVERED">ส่งมอบสำเร็จ (Delivered)</option>
                  <option value="CANCELLED">ยกเลิก (Cancelled)</option>
                </select>
              </div>

              {/* Stock Deduction Status & Toggle */}
              <div className="p-3 rounded-2xl bg-[#121c15] border border-[#2d4734] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#e6dfd3]">สถานะการตัดสต็อกสินค้า:</span>
                  {editingOrder.stockDeducted ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#1e3425] text-[#98c9a3] font-bold border border-[#98c9a3]/30">
                      ✓ ตัดสต็อกเรียบร้อยแล้ว
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 font-bold border border-amber-600/40">
                      ⚠️ ยังไม่ได้ตัดสต็อก
                    </span>
                  )}
                </div>

                {!editingOrder.stockDeducted && (
                  <div className="pt-2 border-t border-[#2d4734]/60 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={editDeductStock}
                        onChange={(e) => setEditDeductStock(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#98c9a3]"
                      />
                      <span className="font-bold text-[#98c9a3]">
                        [x] ดำเนินการตัดสต็อกสินค้าในคลังบัดนี้
                      </span>
                    </label>

                    {editDeductStock && (
                      <div>
                        <label className="block text-[11px] font-semibold text-[#a39b8b] uppercase mb-1">
                          เลือกคลังสินค้าที่ต้องการตัดสต็อก
                        </label>
                        <select
                          value={editLocationId}
                          onChange={(e) => setEditLocationId(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-[#18241c] border border-[#2d4734] text-xs text-[#f3efe6]"
                        >
                          {locations.map((loc) => (
                            <option key={loc._id} value={loc._id}>
                              {loc.name} ({loc.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  บริษัทขนส่ง & เลข Tracking No
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={shippingCarrier}
                    onChange={(e) => setShippingCarrier(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6]"
                    placeholder="Kerry, Flash, J&T"
                  />
                  <input
                    type="text"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono"
                    placeholder="Tracking No."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  สถานะการชำระเงิน / วางบิล (Payment Status)
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e: any) => setPaymentStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6]"
                >
                  <option value="UNPAID">รอวางบิล / รอชำระ (Unpaid)</option>
                  <option value="BILLED">วางบิลแล้ว (Billed)</option>
                  <option value="PAID">ชำระเงินแล้ว (Paid)</option>
                  <option value="OVERDUE">เกินกำหนดชำระ (Overdue)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                  แนบหลักฐานชำระเงิน / สลิป (Attachment)
                </label>
                <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] cursor-pointer text-xs text-[#a39b8b]">
                  <Paperclip className="w-4 h-4 text-[#98c9a3]" />
                  <span>{uploadingFile ? "กำลังอัปโหลด..." : attachmentName ? attachmentName : "เลือกไฟล์สลิป/เอกสาร"}</span>
                  <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2d4734]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#121c15] text-[#a39b8b] text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-earth-primary px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกอัปเดต"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT RECEIPT / INVOICE MODAL */}
      {isPrintModalOpen && printingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="max-w-3xl w-full bg-white text-black p-8 sm:p-12 rounded-2xl shadow-2xl space-y-6 relative print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:rounded-none">
            {/* Screen Action Bar (Hidden when printing) */}
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDocType("receipt")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    docType === "receipt" ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  ใบเสร็จรับเงิน / ใบกำกับภาษี
                </button>
                <button
                  onClick={() => setDocType("billing")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    docType === "billing" ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  ใบแจ้งหนี้ / ใบวางบิล
                </button>
                <button
                  onClick={() => setDocType("order")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    docType === "order" ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  ใบสั่งซื้อ (Order)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerPrint}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all hover:scale-105"
                  title="กดเพื่อส่งพิมพ์ หรือ เลือกบันทึกเป็นไฟล์ PDF (Save as PDF)"
                >
                  <Printer className="w-4 h-4" />
                  <span>📄 บันทึกเป็น PDF / พิมพ์เอกสาร (Print & Export PDF)</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 rounded-xl text-gray-500 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE A4 CONTENT BOX */}
            <div ref={printRef} className="space-y-6 text-sm text-gray-800">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b pb-6">
                <div>
                  <h2 className="text-2xl font-black text-emerald-900 tracking-wider">ZYKA MEDIC CO., LTD.</h2>
                  <p className="text-xs text-gray-600">บริษัท ซีก้า เมดิค จำกัด (สำนักงานใหญ่)</p>
                  <p className="text-xs text-gray-600">เลขที่ผู้เสียภาษี: 0105566000000 | โทร: 02-123-4567</p>
                  <p className="text-xs text-gray-600">อีเมล: contact@zyka.co.th | www.zyka.co.th</p>
                </div>

                <div className="text-right">
                  <h3 className="text-lg font-bold text-emerald-800">
                    {docType === "receipt"
                      ? "ใบเสร็จรับเงิน / ใบกำกับภาษี"
                      : docType === "billing"
                      ? "ใบแจ้งหนี้ / ใบวางบิล"
                      : "ใบสั่งซื้อสินค้า"}
                  </h3>
                  <p className="text-xs font-mono font-bold text-gray-700">เลขที่: {printingOrder.orderNo}</p>
                  <p className="text-xs text-gray-600">
                    วันที่: {new Date(printingOrder.orderDate).toLocaleDateString("th-TH")}
                  </p>
                  {printingOrder.dueDate && (
                    <p className="text-xs text-gray-600">
                      กำหนดชำระ: {new Date(printingOrder.dueDate).toLocaleDateString("th-TH")}
                    </p>
                  )}
                </div>
              </div>

              {/* Customer Info Box */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                <div>
                  <p className="font-bold text-gray-900">ลูกค้า (Customer):</p>
                  <p className="font-semibold text-gray-800">{printingOrder.customerName}</p>
                  <p className="text-gray-600">ที่อยู่: {printingOrder.customerAddress || "-"}</p>
                  <p className="text-gray-600">เลขผู้เสียภาษี: {printingOrder.customerTaxId || "-"}</p>
                  <p className="text-gray-600">เบอร์โทรศัพท์: {printingOrder.customerPhone || "-"}</p>
                </div>

                <div className="text-right space-y-1">
                  <p className="font-bold text-gray-900">รายละเอียดการขนส่ง & ชำระเงิน:</p>
                  <p className="text-gray-700">ขนส่งโดย: {printingOrder.shippingCarrier || "-"}</p>
                  <p className="font-mono text-gray-700">Tracking: {printingOrder.trackingNo || "-"}</p>
                  <p className="text-gray-700">วิธีชำระเงิน: {printingOrder.paymentMethod || "โอนเงินเข้าบัญชี"}</p>
                  <p className="font-bold text-emerald-700">
                    สถานะ: {printingOrder.paymentStatus === "PAID" ? "ชำระเงินแล้ว (PAID)" : "รอชำระ / วางบิล"}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-emerald-950 text-white font-bold uppercase">
                    <th className="py-2.5 px-3 border border-gray-400 text-center">ลำดับ</th>
                    <th className="py-2.5 px-4 border border-gray-400">รายการสินค้า (Description)</th>
                    <th className="py-2.5 px-3 border border-gray-400 text-center">จำนวน</th>
                    <th className="py-2.5 px-3 border border-gray-400 text-center">หน่วย</th>
                    <th className="py-2.5 px-4 border border-gray-400 text-right">ราคา/หน่วย</th>
                    <th className="py-2.5 px-4 border border-gray-400 text-right">จำนวนเงิน (บาท)</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-300">
                  {printingOrder.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 border border-gray-300 text-center font-mono">{i + 1}</td>
                      <td className="py-2 px-4 border border-gray-300 font-medium">
                        {item.productName} (รหัส: {item.productCode})
                      </td>
                      <td className="py-2 px-3 border border-gray-300 text-center font-mono">{item.quantity}</td>
                      <td className="py-2 px-3 border border-gray-300 text-center">{item.unit}</td>
                      <td className="py-2 px-4 border border-gray-300 text-right font-mono">
                        ฿{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-4 border border-gray-300 text-right font-mono font-bold">
                        ฿{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Money Totals & Summary */}
              <div className="flex justify-between items-start pt-2">
                <div className="text-xs text-gray-500 max-w-xs">
                  {printingOrder.note && <p>หมายเหตุ: {printingOrder.note}</p>}
                  <p className="mt-2 font-mono">ผู้ออกเอกสาร: {printingOrder.createdByName || "Admin"}</p>
                </div>

                <div className="w-64 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-600">รวมเป็นเงิน:</span>
                    <span>฿{printingOrder.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  {printingOrder.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>ส่วนลด:</span>
                      <span>-฿{printingOrder.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>
                      ภาษีมูลค่าเพิ่ม ({printingOrder.taxRate && printingOrder.taxRate > 0 ? `VAT ${printingOrder.taxRate}%` : "ไม่มี VAT / ยกเว้นภาษี"}):
                    </span>
                    <span>฿{(printingOrder.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between font-extrabold text-sm border-t border-b border-gray-800 py-1.5 text-emerald-900">
                    <span>จำนวนเงินสุทธิ:</span>
                    <span>฿{printingOrder.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Signatures Row */}
              <div className="grid grid-cols-2 gap-8 pt-12 text-center text-xs">
                <div className="space-y-8">
                  <div className="border-b border-dashed border-gray-400 w-48 mx-auto" />
                  <p>ลงชื่อ ........................................................... ผู้รับเงิน / ผู้แจ้งหนี้</p>
                  <p className="text-gray-500">วันที่ .......... / .......... / .............</p>
                </div>

                <div className="space-y-8">
                  <div className="border-b border-dashed border-gray-400 w-48 mx-auto" />
                  <p>ลงชื่อ ........................................................... ผู้สั่งซื้อ / ผู้รับสินค้า</p>
                  <p className="text-gray-500">วันที่ .......... / .......... / .............</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT SEARCH POPUP MODAL (z-[70] to overlay cleanly above z-50 parent modal) */}
      {isProductPickerOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="max-w-2xl w-full glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#98c9a3]/40 space-y-6 relative overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/40 flex items-center justify-center text-[#98c9a3]">
                  <FolderSearch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#f3efe6]">
                    ดึงข้อมูลสินค้า (Select Product)
                  </h3>
                  <p className="text-xs text-[#a39b8b]">
                    ค้นหาและคลิกเลือกรายการสินค้าที่ต้องการสั่งซื้อ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(false)}
                className="p-2 rounded-xl text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#121c15] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="พิมพ์ชื่อสินค้า หรือ รหัสสินค้าเพื่อค้นหา..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#121c15] border border-[#2d4734] text-sm text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
              />
            </div>

            {/* Filtered Product List */}
            <div className="max-h-80 overflow-y-auto space-y-2 border border-[#2d4734] rounded-2xl p-2 bg-[#0f1712]/50">
              {(() => {
                const query = productSearchQuery.toLowerCase();
                const filtered = products.filter(
                  (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.code.toLowerCase().includes(query)
                );

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center text-xs text-[#a39b8b]">
                      ไม่พบรายการสินค้าที่ค้นหา
                    </div>
                  );
                }

                return filtered.map((p) => {
                  const stockQty = p.stock ?? 0;
                  const isOutOfStock = stockQty <= 0;

                  return (
                    <div
                      key={p._id}
                      onClick={() => handleSelectProductFromPicker(p)}
                      className="p-3.5 rounded-xl bg-[#121c15] hover:bg-[#1f3425] border border-[#2d4734] hover:border-[#98c9a3]/50 cursor-pointer transition-all flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-[#1e3425] text-[#98c9a3] font-mono font-bold text-xs border border-[#98c9a3]/30 shrink-0">
                          {p.code}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-[#f3efe6] group-hover:text-[#98c9a3] transition-colors">
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-[#a39b8b] mt-0.5">
                            <span>หน่วยนับ: {p.unit || "ชิ้น"}</span>
                            <span>•</span>
                            <span className="font-semibold text-[#e6dfd3]">
                              คลังคงเหลือ: {stockQty.toLocaleString()} {p.unit || "ชิ้น"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-950/70 text-red-300 text-[11px] font-bold border border-red-800/40">
                            ⚠️ สต็อกหมด (0 {p.unit || "ชิ้น"})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 text-[11px] font-bold border border-emerald-600/40">
                            ✓ คงเหลือ {stockQty.toLocaleString()} {p.unit || "ชิ้น"}
                          </span>
                        )}

                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-xl bg-[#1e3425] text-[#98c9a3] font-bold text-xs border border-[#98c9a3]/30 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          เลือกรายการนี้
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-[#2d4734]">
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] text-xs font-semibold"
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

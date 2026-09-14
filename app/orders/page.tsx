"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
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
  UserCheck,
  UserPlus,
  ChevronRight,
  Calendar,
  CreditCard,
  Building,
  Package,
  FolderSearch,
} from "lucide-react";
import Pagination from "@/app/components/Pagination";
import { getApiPath } from "@/app/utils/apiPath";

function arabicToThaiBaht(numbers: number, includeParentheses: boolean = false): string {
  if (isNaN(numbers) || numbers === null || numbers === undefined) return "";
  const numberText = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const unitText = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  const numStr = Math.abs(numbers).toFixed(2);
  const [bahtStr, satangStr] = numStr.split(".");

  let bahtText = "";
  const bahtLen = bahtStr.length;

  for (let i = 0; i < bahtLen; i++) {
    const digit = parseInt(bahtStr[i]);
    const pos = bahtLen - 1 - i;

    if (digit !== 0) {
      if (pos % 6 === 1 && digit === 1) {
        bahtText += "สิบ";
      } else if (pos % 6 === 1 && digit === 2) {
        bahtText += "ยี่สิบ";
      } else if (pos % 6 === 0 && digit === 1 && i > 0 && bahtStr[i - 1] !== "0") {
        bahtText += "เอ็ด";
      } else {
        bahtText += numberText[digit] + unitText[pos % 6];
      }
    } else if (pos % 6 === 0 && pos > 0 && bahtLen > 6) {
      bahtText += "ล้าน";
    }
  }

  if (!bahtText) bahtText = "ศูนย์";
  bahtText += "บาท";

  let satangText = "";
  if (satangStr && satangStr !== "00") {
    const d1 = parseInt(satangStr[0]);
    const d2 = parseInt(satangStr[1]);

    if (d1 !== 0) {
      if (d1 === 1) satangText += "สิบ";
      else if (d1 === 2) satangText += "ยี่สิบ";
      else satangText += numberText[d1] + "สิบ";
    }

    if (d2 !== 0) {
      if (d2 === 1 && d1 !== 0) satangText += "เอ็ด";
      else satangText += numberText[d2];
    }
    satangText += "สตางค์";
  } else {
    satangText = "ถ้วน";
  }

  const result = `${bahtText}${satangText}`;
  return includeParentheses ? `(${result})` : result;
}

function SingleStandardDocPage({
  printingOrder,
  docType,
  pageType,
}: {
  printingOrder: any;
  docType: "receipt" | "tax_invoice" | "delivery_order";
  pageType: "ต้นฉบับ/ORIGINAL" | "สำเนา/COPY";
}) {
  const isReceipt = docType === "receipt";
  const isTaxInvoice = docType === "tax_invoice";

  const titleText = isReceipt
    ? "ใบเสร็จรับเงิน"
    : isTaxInvoice
    ? "ใบกำกับภาษี"
    : "ใบส่งสินค้า / ใบแจ้งหนี้";

  const subtitleText = isReceipt
    ? "RECEIPT"
    : isTaxInvoice
    ? "TAX INVOICE"
    : "DELIVERY ORDER / INVOICE";

  const subLabelText = isTaxInvoice ? "เอกสารออกเป็นชุด" : "เอกสารออกเป็นชุด (ไม่ใช่ใบกำกับภาษี)";

  return (
    <div className="space-y-3 text-xs font-sans relative z-10 text-black p-2 bg-white">
      {/* Top Header: Logo + Company Info + Original/Copy Stamp */}
      <div className="flex justify-between items-start pb-2 border-b border-black">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full border border-[#284532] text-[#284532] flex flex-col items-center justify-center font-black text-xs shrink-0 p-1">
            <span className="text-[9px] font-bold">บริษัท ไซกา</span>
            <span className="text-base font-black leading-none">ZM</span>
            <span className="text-[8px]">ZYKA MEDIC</span>
          </div>
          <div className="space-y-0.5 text-black">
            <h2 className="text-base font-extrabold text-[#284532] leading-tight">บริษัท ไซกา เมดิค จำกัด</h2>
            <h3 className="text-xs font-bold text-[#284532] tracking-wide">ZYKA MEDIC CO., LTD.</h3>
            <p className="text-[10px] text-gray-700 leading-tight">
              51 อาคารเมเจอร์ ทาวเวอร์ พระราม9-รามคำแหง ห้องเลขที่ 7 ชั้นที่ 7 ถนนพระราม 9 แขวงหัวหมาก เขตบางกะปิ กรุงเทพฯ 10240
            </p>
            <p className="text-[10px] text-gray-700 leading-tight">
              Tel. 02-1151758 Fax 02-1151759 E-mail: contact@zykamedic.com
            </p>
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className={`px-2.5 py-1 rounded border text-xs font-bold inline-block ${
            pageType.includes("ต้นฉบับ") ? "border-green-600 text-green-700 bg-green-50" : "border-gray-500 text-gray-700 bg-gray-50"
          }`}>
            {pageType}
          </div>
          <p className="text-[9px] text-gray-600 block">{subLabelText}</p>
        </div>
      </div>

      {/* Title Banner */}
      <div className="text-center my-1">
        <div className={`inline-block px-6 py-1.5 rounded-full border font-bold text-center ${
          isReceipt ? "border-green-600 bg-green-50 text-green-800" : "border-black bg-gray-100 text-black"
        }`}>
          <h1 className="text-base font-black leading-tight tracking-wide">{titleText}</h1>
          <p className="text-[10px] font-bold tracking-widest uppercase">{subtitleText}</p>
        </div>
      </div>

      {/* Tax ID Line */}
      <div className="flex justify-between text-[11px] font-semibold text-black border-b border-black pb-1">
        <span>เลขประจำตัวผู้เสียภาษี 010552058550 สำนักงานใหญ่</span>
        <span>Tax ID. No. 010552058550</span>
      </div>

      {/* Metadata Table */}
      <div className="border border-black text-[11px] text-black">
        <div className="grid grid-cols-12 divide-x divide-black border-b border-black">
          <div className="col-span-7 p-2 space-y-1">
            <p><span className="font-bold">นามผู้ซื้อ / Sold To:</span> <span className="font-bold">{printingOrder.customerName}</span></p>
            <p><span className="font-bold">ที่อยู่ / Address:</span> {printingOrder.customerAddress || "-"}</p>
            <p><span className="font-bold">เลขประจำตัวผู้เสียภาษีอากร / Tax ID. No.:</span> {printingOrder.customerTaxId || "-"}</p>
          </div>
          <div className="col-span-5 p-2 space-y-1 font-mono">
            <p><span className="font-bold font-sans">เลขที่ / Invoice No.:</span> <span className="font-bold">{printingOrder.orderNo}</span></p>
            <p><span className="font-bold font-sans">วันที่ / Date:</span> {new Date(printingOrder.orderDate).toLocaleDateString("th-TH")}</p>
            <p><span className="font-bold font-sans">พนักงานขาย / Salesman:</span> {printingOrder.createdByName || "-"}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 divide-x divide-black text-center font-mono text-[10px] bg-gray-50 py-1">
          <div>
            <span className="font-bold font-sans block text-gray-700">เลขที่ใบสั่งซื้อของลูกค้า / P/O No.</span>
            <span className="font-bold">{printingOrder.poNo || "-"}</span>
          </div>
          <div>
            <span className="font-bold font-sans block text-gray-700">รหัสลูกค้า / Customer Code</span>
            <span>-</span>
          </div>
          <div>
            <span className="font-bold font-sans block text-gray-700">เงื่อนไขในการชำระเงิน / Term</span>
            <span>-</span>
          </div>
          <div>
            <span className="font-bold font-sans block text-gray-700">วันครบกำหนดชำระ / Due Date</span>
            <span>{printingOrder.dueDate ? new Date(printingOrder.dueDate).toLocaleDateString("th-TH") : "-"}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left text-xs border-collapse border border-black">
        <thead>
          <tr className="bg-gray-100 font-bold border-b border-black text-black text-[11px]">
            <th className="py-1.5 px-2 border-r border-black text-center w-12">ลำดับที่<br/><span className="text-[9px] font-normal">Item</span></th>
            <th className="py-1.5 px-2 border-r border-black text-center w-24">รหัสสินค้า<br/><span className="text-[9px] font-normal">Product Code</span></th>
            <th className="py-1.5 px-3 border-r border-black text-center">รายการ<br/><span className="text-[9px] font-normal">Description</span></th>
            <th className="py-1.5 px-2 border-r border-black text-center w-16">จำนวน<br/><span className="text-[9px] font-normal">Quantity</span></th>
            <th className="py-1.5 px-3 border-r border-black text-right w-24">หน่วยละ<br/><span className="text-[9px] font-normal">Unit Price</span></th>
            <th className="py-1.5 px-3 text-right w-28">จำนวนเงิน<br/><span className="text-[9px] font-normal">Amount</span></th>
          </tr>
        </thead>
        <tbody>
          {printingOrder.items.map((item: any, idx: number) => (
            <tr key={idx} className="border-b border-black text-[11px]">
              <td className="py-2 px-2 border-r border-black text-center font-mono">{idx + 1}</td>
              <td className="py-2 px-2 border-r border-black text-center font-mono font-bold">{item.productCode || "-"}</td>
              <td className="py-2 px-3 border-r border-black">
                <span className="font-bold block">{item.productName}</span>
              </td>
              <td className="py-2 px-2 border-r border-black text-center font-mono">{item.quantity} {item.unit}</td>
              <td className="py-2 px-3 border-r border-black text-right font-mono">
                {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-3 text-right font-mono font-bold">
                {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Table: Thai Baht Text & Totals */}
      <table className="w-full text-left text-xs border-collapse border border-black font-mono">
        <tbody>
          <tr className="border-b border-black">
            <td rowSpan={2} colSpan={3} className="py-2 px-4 border-r border-black bg-gray-100 text-center font-bold text-xs text-black align-middle font-sans">
              {arabicToThaiBaht(printingOrder.grandTotal, true)}
            </td>
            <td className="py-1 px-3 border-r border-black font-bold text-black w-40 font-sans">รวมราคาสินค้า / Sub Total</td>
            <td className="py-1 px-3 text-right font-bold text-black w-32">
              {printingOrder.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
          <tr className="border-b border-black">
            <td className="py-1 px-3 border-r border-black font-bold text-black font-sans">ภาษีมูลค่าเพิ่ม {printingOrder.taxRate}% / Vat</td>
            <td className="py-1 px-3 text-right font-bold text-black">
              {(printingOrder.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
          <tr>
            <td colSpan={3} className="py-1 px-3 border-r border-black text-[10px] text-gray-600 font-sans">
              โปรดชำระด้วยเช็คขีดคร่อมสั่งจ่ายในนามบัญชี "บริษัท ไซกา เมดิค จำกัด"
            </td>
            <td className="py-1.5 px-3 border-r border-black font-black text-black font-sans">รวมเงินทั้งสิ้น / Grand Total</td>
            <td className="py-1.5 px-3 text-right font-black text-black text-sm">
              {printingOrder.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Bottom Signatures & Payment Info */}
      <div className="border border-black p-2.5 rounded grid grid-cols-2 gap-4 text-[10px]">
        {isReceipt ? (
          /* Receipt Bottom Left: Payment Method Checkboxes */
          <div className="space-y-1.5 border-r border-black pr-2">
            <p className="font-bold text-black">ได้รับชำระเงินโดย / Payment by</p>
            <div className="flex gap-4 font-semibold">
              <label className="flex items-center gap-1"><input type="checkbox" readOnly checked={printingOrder.paymentMethod === "CASH"} /> เงินสด Cash</label>
              <label className="flex items-center gap-1"><input type="checkbox" readOnly checked={printingOrder.paymentMethod === "TRANSFER" || !printingOrder.paymentMethod} /> เงินโอน Transfer</label>
              <label className="flex items-center gap-1"><input type="checkbox" readOnly checked={printingOrder.paymentMethod === "CHEQUE"} /> เช็คธนาคาร Cheque</label>
            </div>
            <p className="pt-1">เลขที่ No. .......................... วันที่ Date .......................... จำนวนเงิน ..........................</p>
            <p className="text-[9px] text-gray-500 pt-1">ใบเสร็จนี้จะสมบูรณ์ต่อเมื่อมีลายมือชื่อผู้รับเงินและผู้มีอำนาจลงนามแทนบริษัทฯ</p>
          </div>
        ) : (
          /* Tax Invoice & Delivery Order Bottom Left: Goods Received / Delivery */
          <div className="grid grid-cols-2 gap-2 border-r border-black pr-2 text-center">
            <div className="space-y-6 pt-4">
              <p>.......................................................</p>
              <p className="font-bold">ผู้รับสินค้า / Goods Received By</p>
              <p className="text-[9px]">วันที่ / Date ......../......../........</p>
            </div>
            <div className="space-y-6 pt-4">
              <p>.......................................................</p>
              <p className="font-bold">ผู้ส่งสินค้า / Goods Delivery By</p>
              <p className="text-[9px]">วันที่ / Date ......../......../........</p>
            </div>
          </div>
        )}

        {/* Right Side Signature (Shared across Receipt, Tax Invoice, Delivery Order) */}
        <div className="text-center space-y-4 pt-2">
          <p className="font-bold text-black">ในนาม บริษัท ไซกา เมดิค จำกัด / For ZYKA MEDIC CO., LTD.</p>
          <div className="pt-2">
            <p className="font-mono font-bold text-sm text-blue-900">Danupat P.</p>
            <p className="border-t border-dashed border-black w-48 mx-auto pt-1 text-[9px] font-bold">ลายเซ็นผู้มีอำนาจลงนาม / Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CustomerItem {
  _id: string;
  code?: string;
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

interface PersonnelItem {
  _id: string;
  prefix: string;
  fullname: string;
  position: string;
  phone?: string;
  status: string;
}

interface OrderData {
  _id: string;
  orderNo: string;
  poNo?: string;
  expectedDeliveryDate?: string;
  shippedDate?: string;
  senderName?: string;
  customerId: CustomerItem;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerTaxId?: string;
  salespersonId?: any;
  salespersonName?: string;
  orderDate: string;
  billingNo?: string;
  billingDate?: string;
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [personnelList, setPersonnelList] = useState<PersonnelItem[]>([]);

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingDelivery: 0,
    pendingPayment: 0,
    totalRevenue: 0,
    unpaidCount: 0,
    billedCount: 0,
    paidCount: 0,
    overdueCount: 0,
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
  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [selectedSalespersonId, setSelectedSalespersonId] = useState("");
  const [selectedSalespersonName, setSelectedSalespersonName] = useState("");
  const [isSalespersonPickerOpen, setIsSalespersonPickerOpen] = useState(false);
  const [salespersonSearchTerm, setSalespersonSearchTerm] = useState("");
  const [poNo, setPoNo] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [shippedDate, setShippedDate] = useState("");
  const [senderName, setSenderName] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [billingNo, setBillingNo] = useState("");
  const [billingDate, setBillingDate] = useState("");
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
  const [editBillingNo, setEditBillingNo] = useState("");
  const [editBillingDate, setEditBillingDate] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editPoNo, setEditPoNo] = useState("");
  const [editExpectedDeliveryDate, setEditExpectedDeliveryDate] = useState("");
  const [editShippedDate, setEditShippedDate] = useState("");
  const [editSenderName, setEditSenderName] = useState("");

  // Print Receipt Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printingOrder, setPrintingOrder] = useState<OrderData | null>(null);
  const [docType, setDocType] = useState<"billing" | "receipt" | "tax_invoice" | "delivery_order">("billing");

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
      const res = await fetch(getApiPath(url), { cache: "no-store" });
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
      const [resCust, resProd, resLoc, resPers] = await Promise.all([
        fetch(getApiPath("/api/customers"), { cache: "no-store" }),
        fetch(getApiPath("/api/products"), { cache: "no-store" }),
        fetch(getApiPath("/api/locations"), { cache: "no-store" }),
        fetch(getApiPath("/api/personnel"), { cache: "no-store" }),
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
      if (resPers.ok) {
        const dataPers = await resPers.json();
        setPersonnelList(dataPers.personnel || []);
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

  const isSalesperson = (pos?: string) => {
    if (!pos) return false;
    const lower = pos.toLowerCase();
    return lower.includes("ขาย") || lower.includes("เซล") || lower.includes("sale");
  };

  const filteredPersonnelList = personnelList.filter((p) => {
    const hasSalesPersonnel = personnelList.some((item) => isSalesperson(item.position));
    if (hasSalesPersonnel && !isSalesperson(p.position)) {
      return false;
    }

    if (!salespersonSearchTerm) return true;
    const term = salespersonSearchTerm.toLowerCase();
    return (
      (p.fullname && p.fullname.toLowerCase().includes(term)) ||
      (p.position && p.position.toLowerCase().includes(term)) ||
      (p.phone && p.phone.includes(term))
    );
  });

  const filteredCustomersList = customers.filter((c) => {
    if (!customerSearchTerm) return true;
    const term = customerSearchTerm.toLowerCase();
    return (
      (c.fullname && c.fullname.toLowerCase().includes(term)) ||
      (c.code && c.code.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term)) ||
      (c.taxId && c.taxId.includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term))
    );
  });

  const openCreateModal = () => {
    setSelectedCustomerId(customers[0]?._id || "");
    setIsCustomerPickerOpen(false);
    setCustomerSearchTerm("");
    setSelectedSalespersonId("");
    setSelectedSalespersonName("");
    setPoNo("");
    setExpectedDeliveryDate("");
    setShippedDate("");
    setSenderName("");
    setOrderDate(new Date().toISOString().split("T")[0]);
    setBillingNo("");
    setBillingDate("");
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

      const res = await fetch(getApiPath("/api/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          salespersonId: selectedSalespersonId || undefined,
          salespersonName: selectedSalespersonName || "",
          poNo: poNo || undefined,
          expectedDeliveryDate: expectedDeliveryDate || undefined,
          shippedDate: shippedDate || undefined,
          senderName: senderName || undefined,
          orderDate,
          billingNo,
          billingDate: billingDate || undefined,
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
    setEditBillingNo(order.billingNo || "");
    setEditBillingDate(order.billingDate ? order.billingDate.split("T")[0] : "");
    setEditDueDate(order.dueDate ? order.dueDate.split("T")[0] : "");
    setEditPoNo(order.poNo || "");
    setEditExpectedDeliveryDate(order.expectedDeliveryDate ? order.expectedDeliveryDate.split("T")[0] : "");
    setEditShippedDate(order.shippedDate ? order.shippedDate.split("T")[0] : "");
    setEditSenderName(order.senderName || "");
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
      const res = await fetch(getApiPath(`/api/orders/${editingOrder._id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryStatus,
          shippingCarrier,
          trackingNo,
          paymentStatus,
          paymentMethod,
          billingNo: editBillingNo || undefined,
          billingDate: editBillingDate || undefined,
          dueDate: editDueDate || undefined,
          poNo: editPoNo || undefined,
          expectedDeliveryDate: editExpectedDeliveryDate || undefined,
          shippedDate: editShippedDate || undefined,
          senderName: editSenderName || undefined,
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
      const res = await fetch(getApiPath(`/api/orders/${id}`), { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการลบ");

      setSuccess("ลบคำสั่งซื้อเรียบร้อยแล้ว");
      fetchOrders();
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openPrintModal = (
    order: OrderData,
    type: "billing" | "receipt" | "tax_invoice" | "delivery_order" = "billing"
  ) => {
    window.open(getApiPath(`/orders/print/${order._id}`), "_blank");
  };

  const handleTriggerPrint = () => {
    if (printingOrder) {
      window.open(getApiPath(`/orders/print/${printingOrder._id}`), "_blank");
    } else {
      window.print();
    }
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
            <span>สร้างคำสั่งซื้อใหม่</span>
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

      {/* Payment / Billing Status Filter Tabs */}
      <div className="glass-earth-card p-2 sm:p-3 rounded-2xl border border-[#2d4734] flex flex-wrap items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setFilterPayment("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            filterPayment === "all"
              ? "bg-[#98c9a3] text-[#0f1712] shadow-md"
              : "bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734]"
          }`}
        >
          <span>ทั้งหมด</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            filterPayment === "all" ? "bg-[#0f1712]/30 text-[#0f1712]" : "bg-[#1e3425] text-[#98c9a3]"
          }`}>
            {stats.totalOrders}
          </span>
        </button>

        <button
          onClick={() => setFilterPayment("UNPAID")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            filterPayment === "UNPAID"
              ? "bg-amber-500 text-amber-950 shadow-md font-bold"
              : "bg-[#121c15] text-amber-300 hover:text-amber-200 border border-amber-900/40"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>⏳ รอวางบิล / รอชำระ</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            filterPayment === "UNPAID" ? "bg-amber-950/30 text-amber-950" : "bg-amber-950/60 text-amber-300 border border-amber-800/40"
          }`}>
            {stats.unpaidCount || 0}
          </span>
        </button>

        <button
          onClick={() => setFilterPayment("BILLED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            filterPayment === "BILLED"
              ? "bg-blue-500 text-blue-950 shadow-md font-bold"
              : "bg-[#121c15] text-blue-300 hover:text-blue-200 border border-blue-900/40"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>📄 วางบิลแล้ว</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            filterPayment === "BILLED" ? "bg-blue-950/30 text-blue-950" : "bg-blue-950/60 text-blue-300 border border-blue-800/40"
          }`}>
            {stats.billedCount || 0}
          </span>
        </button>

        <button
          onClick={() => setFilterPayment("PAID")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            filterPayment === "PAID"
              ? "bg-emerald-500 text-emerald-950 shadow-md font-bold"
              : "bg-[#121c15] text-emerald-300 hover:text-emerald-200 border border-emerald-900/40"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>🟢 ชำระเงินแล้ว (เสร็จสิ้น)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            filterPayment === "PAID" ? "bg-emerald-950/30 text-emerald-950" : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
          }`}>
            {stats.paidCount || 0}
          </span>
        </button>

        <button
          onClick={() => setFilterPayment("OVERDUE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            filterPayment === "OVERDUE"
              ? "bg-rose-500 text-rose-950 shadow-md font-bold"
              : "bg-[#121c15] text-rose-300 hover:text-rose-200 border border-rose-900/40"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>⚠️ เกินกำหนดชำระ</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            filterPayment === "OVERDUE" ? "bg-rose-950/30 text-rose-950" : "bg-rose-950/60 text-rose-300 border border-rose-800/40"
          }`}>
            {stats.overdueCount || 0}
          </span>
        </button>
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
                    {/* Order No & Date & PO */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="px-2.5 py-0.5 rounded-xl bg-[#1e3425] text-[#98c9a3] font-mono font-bold text-xs border border-[#98c9a3]/30 inline-block">
                          {o.orderNo}
                        </span>
                        {o.poNo && (
                          <span className="px-2 py-0.5 rounded-lg bg-[#121c15] text-[#d4a373] font-mono font-bold text-[11px] border border-[#d4a373]/40 inline-block" title="เลขที่ PO">
                            PO: {o.poNo}
                          </span>
                        )}
                      </div>
                      {o.billingNo && (
                        <span className="text-xs font-bold text-emerald-400 font-mono block">
                          เลขที่วางบิล: {o.billingNo}
                        </span>
                      )}
                      <span className="text-xs text-[#a39b8b] block">
                        สั่งซื้อ: {new Date(o.orderDate).toLocaleDateString("th-TH")}
                      </span>
                      {o.expectedDeliveryDate && (
                        <span className="text-[11px] text-amber-300 font-semibold block">
                          ⏳ กำหนดส่ง (ไม่เกิน): {new Date(o.expectedDeliveryDate).toLocaleDateString("th-TH")}
                        </span>
                      )}
                      {o.billingDate && (
                        <span className="text-[11px] text-[#98c9a3] font-medium block">
                          📄 วางบิล: {new Date(o.billingDate).toLocaleDateString("th-TH")}
                        </span>
                      )}
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
                      {o.salespersonName && (
                        <span className="text-[11px] text-[#98c9a3] font-semibold flex items-center gap-1 mt-0.5">
                          <UserCheck className="w-3 h-3 text-[#98c9a3]" />
                          เซล: {o.salespersonName}
                        </span>
                      )}
                      {o.customerPhone && (
                        <span className="text-xs text-[#a39b8b] block">โทร: {o.customerPhone}</span>
                      )}
                    </td>

                    {/* Shipping Carrier, Sender & Tracking */}
                    <td className="py-4 px-6 text-xs space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[#e6dfd3] flex items-center gap-1 font-medium">
                          <Truck className="w-3.5 h-3.5 text-[#98c9a3]" />
                          {o.shippingCarrier || "ขนส่งเอกชน"}
                        </span>
                        {o.senderName && (
                          <span className="px-1.5 py-0.5 rounded bg-[#121c15] text-[#98c9a3] font-semibold text-[10px] border border-[#2d4734]">
                            ผู้ส่ง: {o.senderName}
                          </span>
                        )}
                      </div>
                      {o.shippedDate && (
                        <span className="text-[11px] text-blue-300 font-medium block">
                          🚚 ส่งเมื่อ: {new Date(o.shippedDate).toLocaleDateString("th-TH")}
                        </span>
                      )}
                      {o.trackingNo ? (
                        <span className="px-2 py-0.5 rounded bg-[#121c15] text-[#98c9a3] font-mono border border-[#2d4734] inline-block">
                          Track: {o.trackingNo}
                        </span>
                      ) : (
                        <span className="text-[#a39b8b] italic block">- ยังไม่ได้ใส่เลขพัสดุ -</span>
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
                          onClick={() => openPrintModal(o, "billing")}
                          className="px-3 py-1.5 rounded-lg bg-[#284532] text-[#98c9a3] hover:bg-[#345941] border border-[#98c9a3]/40 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                          title="พิมพ์ใบวางบิล (Billing Note)"
                        >
                          <FileText className="w-4 h-4" />
                          <span>พิมพ์ใบวางบิล</span>
                        </button>
                        <button
                          onClick={() => openEditModal(o)}
                          className="p-1.5 rounded-lg bg-[#121c15] text-[#98c9a3] hover:bg-[#1c2d22] border border-[#2d4734] transition-colors shrink-0"
                          title="อัปเดตสถานะจัดส่ง/การเงิน"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(o._id)}
                          className="p-1.5 rounded-lg bg-[#121c15] text-red-400 hover:bg-red-950/40 border border-[#2d4734] transition-colors shrink-0"
                          title="ลบคำสั่งซื้อ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
              {/* Section 1: Customer & Salesperson & Order Meta */}
              <div className="bg-[#121c15]/60 p-4 sm:p-5 rounded-2xl border border-[#2d4734] space-y-4">
                {/* Row 1: Customer (50%) & Salesperson (50%) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Popup Picker Button */}
                  <div>
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-[#98c9a3]" />
                      <span>เลือกลูกค้า (CUSTOMER) *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomerPickerOpen(true)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] hover:border-[#98c9a3]/60 text-xs flex items-center justify-between text-[#f3efe6] transition-colors shadow-inner group"
                    >
                      {(() => {
                        const selectedCustomer = customers.find((c) => c._id === selectedCustomerId);
                        if (selectedCustomerId && selectedCustomer) {
                          return (
                            <span className="font-bold text-[#98c9a3] flex items-center gap-2 truncate">
                              <UserCheck className="w-4 h-4 text-[#98c9a3] shrink-0" />
                              <span className="truncate">{selectedCustomer.fullname} {selectedCustomer.phone ? `(โทร: ${selectedCustomer.phone})` : ""}</span>
                            </span>
                          );
                        }
                        return (
                          <span className="text-[#a39b8b] group-hover:text-[#f3efe6] flex items-center gap-2 truncate">
                            <UserPlus className="w-4 h-4 text-[#98c9a3] shrink-0" />
                            <span>-- กดเพื่อเลือกลูกค้า (CUSTOMER) --</span>
                          </span>
                        );
                      })()}
                      <ChevronRight className="w-4 h-4 text-[#a39b8b] shrink-0" />
                    </button>
                    <p className="text-[11px] text-[#a39b8b] mt-1.5">
                      กดเพื่อเปิดป๊อบอัพค้นหาและเลือกลูกค้าดูแลออเดอร์
                    </p>

                    {/* Customer Preview Box */}
                    {selectedCustomerId && (
                      <div className="mt-2 p-3 rounded-xl bg-[#18241c] border border-[#2d4734] text-xs text-[#a39b8b] space-y-1">
                        {(() => {
                          const cust = customers.find((c) => c._id === selectedCustomerId);
                          if (!cust) return null;
                          return (
                            <>
                              <p className="text-[#f3efe6] font-semibold flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-[#98c9a3]" />
                                {cust.fullname}
                              </p>
                              <p>ที่อยู่: {cust.address || "-"}</p>
                              <p>เลขผู้เสียภาษี: {cust.taxId || "-"}</p>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Salesperson Picker Button */}
                  <div>
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#98c9a3]" />
                      <span>พนักงานขาย (SALE / ผู้รับผิดชอบ)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSalespersonPickerOpen(true)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] hover:border-[#98c9a3]/60 text-xs flex items-center justify-between text-[#f3efe6] transition-colors shadow-inner group"
                    >
                      {selectedSalespersonName ? (
                        <span className="font-bold text-[#98c9a3] flex items-center gap-2 truncate">
                          <UserCheck className="w-4 h-4 text-[#98c9a3] shrink-0" />
                          <span className="truncate">{selectedSalespersonName}</span>
                        </span>
                      ) : (
                        <span className="text-[#a39b8b] group-hover:text-[#f3efe6] flex items-center gap-2 truncate">
                          <UserPlus className="w-4 h-4 text-[#98c9a3] shrink-0" />
                          <span>-- กดเพื่อเลือกพนักงานขาย (SALE) --</span>
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-[#a39b8b] shrink-0" />
                    </button>
                    <p className="text-[11px] text-[#a39b8b] mt-1.5">
                      กดเพื่อเปิดป๊อบอัพค้นหาและเลือกเซลผู้ดูแลออเดอร์
                    </p>
                  </div>
                </div>

                {/* Row 2: PO No, Order Date, Billing No, Billing Date, Due Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#2d4734]/50">
                  <div>
                    <label className="block text-xs font-semibold text-[#98c9a3] uppercase mb-1">
                      เลขที่ PO (PO NO.)
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น 4500047080"
                      value={poNo}
                      onChange={(e) => setPoNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-[#98c9a3]/40 text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                      วันที่สั่งซื้อ *
                    </label>
                    <input
                      type="date"
                      required
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1 text-emerald-400">
                      เลขที่ใบวางบิล
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น IVN680360"
                      value={billingNo}
                      onChange={(e) => setBillingNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-[#98c9a3]/40 text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1 text-emerald-400">
                      วันที่วางบิล
                    </label>
                    <input
                      type="date"
                      value={billingDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBillingDate(val);
                        if (val && creditDays > 0) {
                          const d = new Date(val);
                          d.setDate(d.getDate() + creditDays);
                          setDueDate(d.toISOString().split("T")[0]);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-[#98c9a3]/40 text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                    />
                  </div>
                </div>

                {/* Row 3: Expected Delivery, Shipped Date, Carrier, Sender Name, Tracking No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-[#2d4734]/50">
                  <div>
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1 text-amber-300">
                      กำหนดส่งสินค้า (ไม่เกิน)
                    </label>
                    <input
                      type="date"
                      value={expectedDeliveryDate}
                      onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-amber-600/40 text-xs text-[#f3efe6] focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1 text-blue-300">
                      วันที่จัดส่งจริง
                    </label>
                    <input
                      type="date"
                      value={shippedDate}
                      onChange={(e) => setShippedDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-blue-600/40 text-xs text-[#f3efe6] focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                      บริษัทขนส่ง (CARRIER)
                    </label>
                    <input
                      type="text"
                      value={shippingCarrier}
                      onChange={(e) => setShippingCarrier(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                      placeholder="ไซกา, KERRY, IT, FLASH"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                      ผู้ส่ง (DISPATCHER)
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                      placeholder="เช่น คุณแต้, คุณแดน, คุณนิก"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                      เลขพัสดุ (TRACKING NO)
                    </label>
                    <input
                      type="text"
                      value={trackingNo}
                      onChange={(e) => setTrackingNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#98c9a3] uppercase mb-1">
                    เลขที่ PO (PO NO.)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 4500047080"
                    value={editPoNo}
                    onChange={(e) => setEditPoNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-[#98c9a3]/40 text-xs text-[#f3efe6] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    ผู้ส่ง (DISPATCHER)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น คุณแต้, คุณแดน"
                    value={editSenderName}
                    onChange={(e) => setEditSenderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1 text-amber-300">
                    กำหนดส่งสินค้า (ไม่เกิน)
                  </label>
                  <input
                    type="date"
                    value={editExpectedDeliveryDate}
                    onChange={(e) => setEditExpectedDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-amber-600/40 text-xs text-[#f3efe6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1 text-blue-300">
                    วันที่จัดส่งจริง
                  </label>
                  <input
                    type="date"
                    value={editShippedDate}
                    onChange={(e) => setEditShippedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-blue-600/40 text-xs text-[#f3efe6]"
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

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1 text-emerald-400">
                    เลขที่ใบวางบิล
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น BIL-2026-0001"
                    value={editBillingNo}
                    onChange={(e) => setEditBillingNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-[#98c9a3]/40 text-xs text-[#f3efe6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1 text-emerald-400">
                    วันที่วางบิล
                  </label>
                  <input
                    type="date"
                    value={editBillingDate}
                    onChange={(e) => setEditBillingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-[#98c9a3]/40 text-xs text-[#f3efe6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1">
                    กำหนดชำระเงิน
                  </label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6]"
                  />
                </div>
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

      {/* PRINT RECEIPT / INVOICE MODAL (SCREEN ONLY) */}
      {isPrintModalOpen && printingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto print:hidden">
          <div className="max-w-4xl w-full bg-white text-black p-6 sm:p-8 rounded-2xl shadow-2xl space-y-4 relative">
            {/* Screen Action Bar */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-800 text-white shadow flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>ใบวางบิล (Billing Note) - 1 หน้า</span>
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleTriggerPrint}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all hover:scale-105"
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

            {/* SCREEN PREVIEW CONTAINER */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="space-y-3 text-xs font-sans text-black max-w-3xl mx-auto bg-white p-6 rounded shadow-sm border border-gray-300">
                {/* Header */}
                <div className="flex justify-between items-start pb-2 border-b border-gray-300">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-7 h-7 rounded bg-[#284532] text-white flex items-center justify-center font-black text-xs shrink-0">ZM</div>
                      <div>
                        <h2 className="text-base font-extrabold text-black leading-tight">บริษัท ไซกา เมดิค จำกัด</h2>
                        <p className="text-[11px] font-bold text-gray-800 tracking-wider">ZYKA MEDIC CO.,LTD</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-800 leading-tight">เลขที่ 51 อาคารเมเจอร์ ทาวเวอร์ พระราม9-รามคำแหง ห้องเลขที่ 7 ชั้นที่ 7 ถ.พระราม 9</p>
                    <p className="text-[10px] text-gray-800 leading-tight">แขวงหัวหมาก เขตบางกะปิ กรุงเทพมหานคร 10240 โทร 02-1151758</p>
                    <p className="text-[10px] text-gray-800 leading-tight">E-mail : contact@zykamedic.com Fax. 02 115 1759</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <h1 className="text-lg font-bold text-black tracking-wide">ใบวางบิล</h1>
                    <p className="text-xs font-semibold text-gray-700">Billing Note</p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-0.5 text-xs text-black border-b border-gray-300 pb-1.5">
                  <div className="flex justify-between">
                    <div><span className="font-bold">เล่มที่</span> <span className="font-mono">01/2568</span></div>
                    <div><span className="font-bold">เลขที่</span> <span className="font-mono font-bold">{printingOrder.billingNo || printingOrder.orderNo}</span></div>
                  </div>
                  <div className="flex justify-between">
                    <div><span className="font-bold">ในนาม(ลูกค้า)</span> <span className="font-semibold">{printingOrder.customerName}</span></div>
                    <div>
                      <span className="font-bold">วันที่</span>{" "}
                      {printingOrder.billingDate
                        ? new Date(printingOrder.billingDate).toLocaleDateString("th-TH")
                        : new Date(printingOrder.orderDate).toLocaleDateString("th-TH")}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div><span className="font-bold">ที่อยู่</span> {printingOrder.customerAddress || "-"}</div>
                    <div><span className="font-bold">เลขประจำตัวผู้เสียภาษี</span> <span className="font-mono">{printingOrder.customerTaxId || "-"}</span></div>
                  </div>
                </div>

                <div className="py-1 px-3 text-center text-[11px] font-semibold text-black bg-gray-50 border border-black">
                  ได้รับบิลเงินเชื่อหรือเงินสดไว้ เพื่อตรวจสอบและพร้อมที่จะชำระเงินให้ตามบิลต่อไปนี้
                </div>

                <table className="w-full text-left text-xs border-collapse border border-black">
                  <thead>
                    <tr className="bg-gray-100 font-bold border-b border-black text-black">
                      <th className="py-1.5 px-2 border-r border-black text-center w-12">ลำดับที่</th>
                      <th className="py-1.5 px-3 border-r border-black text-center">เลขที่ใบวางบิล / รายการสินค้า</th>
                      <th className="py-1.5 px-3 border-r border-black text-center w-28">วันที่บิล</th>
                      <th className="py-1.5 px-3 border-r border-black text-center w-28">วันครบรอบชำระ</th>
                      <th className="py-1.5 px-4 text-right border-black w-32">จำนวนเงิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printingOrder.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-black">
                        <td className="py-1.5 px-2 border-r border-black text-center font-mono">{idx + 1}</td>
                        <td className="py-1.5 px-3 border-r border-black">
                          <span className="font-mono font-bold block text-black">{printingOrder.billingNo || printingOrder.orderNo}</span>
                          <span className="text-[11px] font-semibold text-gray-800 block">{item.productName} ({item.quantity} {item.unit})</span>
                        </td>
                        <td className="py-1.5 px-3 border-r border-black text-center font-mono">{new Date(printingOrder.orderDate).toLocaleDateString("th-TH")}</td>
                        <td className="py-1.5 px-3 border-r border-black text-center font-mono">{printingOrder.dueDate ? new Date(printingOrder.dueDate).toLocaleDateString("th-TH") : "-"}</td>
                        <td className="py-1.5 px-4 text-right font-mono font-bold border-black">{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <table className="w-full text-left text-xs border-collapse border border-black font-mono">
                  <tbody>
                    <tr className="border-b border-black">
                      <td rowSpan={2} colSpan={3} className="py-1 px-3 border-r border-black bg-gray-200 text-center font-bold text-xs text-black align-middle font-sans">{arabicToThaiBaht(printingOrder.grandTotal, false)}</td>
                      <td className="py-1 px-3 border-r border-black font-bold text-gray-900 w-28 font-sans">รวมเงิน</td>
                      <td className="py-1 px-4 text-right font-bold text-black w-32">{printingOrder.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="py-1 px-3 border-r border-black font-bold text-gray-900 font-sans">VAT {printingOrder.taxRate}%</td>
                      <td className="py-1 px-4 text-right font-bold text-black">{(printingOrder.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="py-1 px-3 border-r border-black text-black font-sans font-medium">รวม ........{printingOrder.items.length}....... รายการ</td>
                      <td className="py-1 px-3 border-r border-black font-extrabold text-black font-sans">จำนวนเงินทั้งสิ้น</td>
                      <td className="py-1 px-4 text-right font-extrabold text-black text-sm">{printingOrder.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>

            {/* Signatures Section (Exact layout from PDF Page 1) */}
            <div className="grid grid-cols-2 gap-8 pt-12 text-xs text-black">
              <div className="space-y-3">
                <p><span className="font-bold">ชื่อผู้รับวางบิล</span> .........................................................</p>
                <p className="pt-1"><span className="font-bold">วันที่รับ</span> ......../......../........</p>
                <p><span className="font-bold">วันที่ได้รับเงิน</span> ......../......../........</p>
              </div>

              <div className="space-y-3 text-right">
                <p><span className="font-bold">ชื่อผู้วางบิล</span> .........................................................</p>
                <p className="pt-1"><span className="font-bold">วันที่</span> ......../......../........</p>
              </div>
            </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT BODY PRINT PORTAL (FOR PRINTING ONLY - CLEAN 1 PAGE A4) */}
      {mounted && isPrintModalOpen && printingOrder && createPortal(
        <div id="printable-document" ref={printRef} className="space-y-3 text-sm text-gray-900 bg-white p-0 relative overflow-hidden">
          {/* Translucent Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0">
            <div className="text-center font-black text-6xl text-emerald-900 rotate-[-20deg]">
              ZYKA MEDIC
            </div>
          </div>

          {/* OFFICIAL BILLING NOTE TEMPLATE (100% MATCHING PDF IMAGE 1 - EXACT 1 PAGE) */}
          <div className="space-y-2 text-xs font-sans relative z-10 text-black">
            {/* Header: Company Info + Document Title */}
            <div className="flex justify-between items-start pb-1.5 border-b border-gray-300">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-7 h-7 rounded bg-[#284532] text-white flex items-center justify-center font-black text-xs shrink-0">
                    ZM
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-black leading-tight">บริษัท ไซกา เมดิค จำกัด</h2>
                    <p className="text-[11px] font-bold text-gray-800 tracking-wider">ZYKA MEDIC CO.,LTD</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-800 leading-tight">
                  เลขที่ 51 อาคารเมเจอร์ ทาวเวอร์ พระราม9-รามคำแหง ห้องเลขที่ 7 ชั้นที่ 7 ถ.พระราม 9
                </p>
                <p className="text-[10px] text-gray-800 leading-tight">
                  แขวงหัวหมาก เขตบางกะปิ กรุงเทพมหานคร 10240 โทร 02-1151758
                </p>
                <p className="text-[10px] text-gray-800 leading-tight">
                  E-mail : contact@zykamedic.com Fax. 02 115 1759
                </p>
              </div>

              <div className="text-right space-y-0.5">
                <h1 className="text-lg font-bold text-black tracking-wide">ใบวางบิล</h1>
                <p className="text-xs font-semibold text-gray-700">Billing Note</p>
              </div>
            </div>

            {/* Metadata & Customer Info (Exact 4-row layout from PDF Page 1) */}
            <div className="space-y-0.5 text-xs text-black border-b border-gray-300 pb-1.5">
              <div className="flex justify-between">
                <div><span className="font-bold">เล่มที่</span> <span className="font-mono">01/2568</span></div>
                <div><span className="font-bold">เลขที่</span> <span className="font-mono font-bold">{printingOrder.billingNo || printingOrder.orderNo}</span></div>
              </div>
              <div className="flex justify-between">
                <div><span className="font-bold">ในนาม(ลูกค้า)</span> <span className="font-semibold">{printingOrder.customerName}</span></div>
                <div>
                  <span className="font-bold">วันที่</span>{" "}
                  {printingOrder.billingDate
                    ? new Date(printingOrder.billingDate).toLocaleDateString("th-TH")
                    : new Date(printingOrder.orderDate).toLocaleDateString("th-TH")}
                </div>
              </div>
              <div className="flex justify-between">
                <div><span className="font-bold">ที่อยู่</span> {printingOrder.customerAddress || "-"}</div>
                <div><span className="font-bold">เลขประจำตัวผู้เสียภาษี</span> <span className="font-mono">{printingOrder.customerTaxId || "-"}</span></div>
              </div>
            </div>

            {/* Notice Line */}
            <div className="py-1 px-3 text-center text-[11px] font-semibold text-black bg-gray-50 border border-black">
              ได้รับบิลเงินเชื่อหรือเงินสดไว้ เพื่อตรวจสอบและพร้อมที่จะชำระเงินให้ตามบิลต่อไปนี้
            </div>

            {/* Table Header & Rows (Black Borders matching PDF Page 1) */}
            <table className="w-full text-left text-xs border-collapse border border-black">
              <thead>
                <tr className="bg-gray-100 font-bold border-b border-black text-black">
                  <th className="py-1.5 px-2 border-r border-black text-center w-12">ลำดับที่</th>
                  <th className="py-1.5 px-3 border-r border-black text-center">เลขที่ใบวางบิล / รายการสินค้า</th>
                  <th className="py-1.5 px-3 border-r border-black text-center w-28">วันที่บิล</th>
                  <th className="py-1.5 px-3 border-r border-black text-center w-28">วันครบรอบชำระ</th>
                  <th className="py-1.5 px-4 text-right border-black w-32">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody>
                {printingOrder.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="py-1.5 px-2 border-r border-black text-center font-mono">{idx + 1}</td>
                    <td className="py-1.5 px-3 border-r border-black">
                      <span className="font-mono font-bold block text-black">{printingOrder.billingNo || printingOrder.orderNo}</span>
                      <span className="text-[11px] font-semibold text-gray-800 block">
                        {item.productName} ({item.quantity} {item.unit})
                      </span>
                    </td>
                    <td className="py-1.5 px-3 border-r border-black text-center font-mono">
                      {new Date(printingOrder.orderDate).toLocaleDateString("th-TH")}
                    </td>
                    <td className="py-1.5 px-3 border-r border-black text-center font-mono">
                      {printingOrder.dueDate ? new Date(printingOrder.dueDate).toLocaleDateString("th-TH") : "-"}
                    </td>
                    <td className="py-1.5 px-4 text-right font-mono font-bold border-black">
                      {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer Totals Table (Exact PDF Page 1 Grid Format) */}
            <table className="w-full text-left text-xs border-collapse border border-black font-mono">
              <tbody>
                <tr className="border-b border-black">
                  {/* Thai Baht Text Box */}
                  <td rowSpan={2} colSpan={3} className="py-1 px-3 border-r border-black bg-gray-200 text-center font-bold text-xs text-black align-middle font-sans">
                    {arabicToThaiBaht(printingOrder.grandTotal, false)}
                  </td>
                  <td className="py-1 px-3 border-r border-black font-bold text-gray-900 w-28 font-sans">รวมเงิน</td>
                  <td className="py-1 px-4 text-right font-bold text-black w-32">
                    {printingOrder.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="py-1 px-3 border-r border-black font-bold text-gray-900 font-sans">VAT {printingOrder.taxRate}%</td>
                  <td className="py-1 px-4 text-right font-bold text-black">
                    {(printingOrder.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-1 px-3 border-r border-black text-black font-sans font-medium">
                    รวม ........{printingOrder.items.length}....... รายการ
                  </td>
                  <td className="py-1 px-3 border-r border-black font-extrabold text-black font-sans">จำนวนเงินทั้งสิ้น</td>
                  <td className="py-1 px-4 text-right font-extrabold text-black text-sm">
                    {printingOrder.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Signatures Section (Exact layout from PDF Page 1) */}
            <div className="grid grid-cols-2 gap-8 pt-12 text-xs text-black">
              <div className="space-y-3">
                <p><span className="font-bold">ชื่อผู้รับวางบิล</span> .........................................................</p>
                <p className="pt-1"><span className="font-bold">วันที่รับ</span> ......../......../........</p>
                <p><span className="font-bold">วันที่ได้รับเงิน</span> ......../......../........</p>
              </div>

              <div className="space-y-3 text-right">
                <p><span className="font-bold">ชื่อผู้วางบิล</span> .........................................................</p>
                <p className="pt-1"><span className="font-bold">วันที่</span> ......../......../........</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
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

      {/* CUSTOMER POPUP PICKER MODAL */}
      {isCustomerPickerOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#98c9a3]/30 space-y-6 relative max-h-[85vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#f3efe6]">เลือกลูกค้า (CUSTOMER)</h3>
                  <p className="text-xs text-[#a39b8b]">ค้นหาและเลือกลูกค้าสำหรับออกคำสั่งซื้อ</p>
                </div>
              </div>
              <button
                onClick={() => setIsCustomerPickerOpen(false)}
                className="p-2 rounded-xl text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#121c15]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, เลขภาษี..."
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
              />
            </div>

            {/* Customers List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-[#2d4734]/40 max-h-[45vh]">
              {filteredCustomersList.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#a39b8b]">
                  ไม่พบข้อมูลลูกค้าในระบบ (สามารถเพิ่มได้ที่เมนู Customers)
                </div>
              ) : (
                filteredCustomersList.map((c) => {
                  const isSelected = selectedCustomerId === c._id;

                  return (
                    <div
                      key={c._id}
                      onClick={() => {
                        setSelectedCustomerId(c._id);
                        setIsCustomerPickerOpen(false);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between mt-2 ${
                        isSelected
                          ? "bg-[#1e3425] border-[#98c9a3]/50 text-[#98c9a3]"
                          : "bg-[#121c15] border-[#2d4734] hover:bg-[#18241c] text-[#e6dfd3]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#18241c] border border-[#2d4734] flex items-center justify-center text-[#98c9a3] shrink-0 font-bold text-xs">
                          {c.fullname.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#f3efe6]">{c.fullname}</p>
                          <span className="text-[10px] text-[#a39b8b] block">
                            {c.phone ? `โทร: ${c.phone}` : ""} {c.taxId ? `| ภาษี: ${c.taxId}` : ""}
                          </span>
                          {c.address && (
                            <span className="text-[10px] text-[#a39b8b]/80 line-clamp-1">
                              ที่อยู่: {c.address}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#98c9a3] shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-[#2d4734]">
              <button
                type="button"
                onClick={() => setIsCustomerPickerOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SALESPERSON POPUP PICKER MODAL */}
      {isSalespersonPickerOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#98c9a3]/30 space-y-6 relative max-h-[85vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#f3efe6]">เลือกพนักงานขาย (SALE)</h3>
                  <p className="text-xs text-[#a39b8b]">เลือกเซล/พนักงานผู้รับผิดชอบคำสั่งซื้อนี้</p>
                </div>
              </div>
              <button
                onClick={() => setIsSalespersonPickerOpen(false)}
                className="p-2 rounded-xl text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#121c15]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ หรือ ตำแหน่งพนักงานขาย..."
                value={salespersonSearchTerm}
                onChange={(e) => setSalespersonSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
              />
            </div>

            {/* Personnel List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-[#2d4734]/40 max-h-[45vh]">
              {/* Option: ไม่ระบุพนักงานขาย */}
              <div
                onClick={() => {
                  setSelectedSalespersonId("");
                  setSelectedSalespersonName("");
                  setIsSalespersonPickerOpen(false);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  !selectedSalespersonId
                    ? "bg-[#1e3425] border-[#98c9a3]/50 text-[#98c9a3]"
                    : "bg-[#121c15] border-[#2d4734] hover:bg-[#18241c] text-[#e6dfd3]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-[#a39b8b]" />
                  <span className="text-xs font-semibold">-- ไม่ระบุพนักงานขาย --</span>
                </div>
                {!selectedSalespersonId && <CheckCircle2 className="w-4 h-4 text-[#98c9a3]" />}
              </div>

              {filteredPersonnelList.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#a39b8b]">
                  ไม่พบพนักงานในระบบ (สามารถเพิ่มบุคลากรได้ที่เมนู Personnel)
                </div>
              ) : (
                filteredPersonnelList.map((p) => {
                  const fullName = `${p.prefix || ""} ${p.fullname}`.trim();
                  const isSelected = selectedSalespersonId === p._id;

                  return (
                    <div
                      key={p._id}
                      onClick={() => {
                        setSelectedSalespersonId(p._id);
                        setSelectedSalespersonName(fullName);
                        setIsSalespersonPickerOpen(false);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between mt-2 ${
                        isSelected
                          ? "bg-[#1e3425] border-[#98c9a3]/50 text-[#98c9a3]"
                          : "bg-[#121c15] border-[#2d4734] hover:bg-[#18241c] text-[#e6dfd3]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#18241c] border border-[#2d4734] flex items-center justify-center text-[#98c9a3] shrink-0 font-bold text-xs">
                          {p.fullname.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#f3efe6]">{fullName}</p>
                          <span className="text-[10px] text-[#a39b8b]">
                            ตำแหน่ง: {p.position || "พนักงานขาย"} {p.phone ? `| โทร: ${p.phone}` : ""}
                          </span>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#98c9a3]" />}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-[#2d4734]">
              <button
                type="button"
                onClick={() => setIsSalespersonPickerOpen(false)}
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

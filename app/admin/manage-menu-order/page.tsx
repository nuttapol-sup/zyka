"use client";

import { getApiPath } from "@/app/utils/apiPath";

import { useEffect, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  LayoutDashboard,
  FileText,
  BarChart3,
  FolderKanban,
  Shield,
  CheckCircle2,
  ListOrdered,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  Package,
  Boxes,
  Tags,
  FolderTree,
  Warehouse,
  Users,
  Contact,
  TrendingUp,
  UserPlus,
  Sliders,
  Activity,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";

interface MenuItem {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

// MAIN MENUS
const MAIN_ITEMS: Record<string, MenuItem> = {
  dashboard: {
    key: "dashboard",
    label: "Dashboard",
    description: "หน้าแดชบอร์ดสรุปสถิติต่างๆ",
    icon: <LayoutDashboard className="w-5 h-5 text-[#98c9a3]" />,
  },
  reports: {
    key: "reports",
    label: "Reports (เมนูกลุ่มรายงาน)",
    description: "เมนูกลุ่มรายงานสรุปยอดขาย การชำระเงิน และประวัติผู้ใช้งาน",
    icon: <FileText className="w-5 h-5 text-[#98c9a3]" />,
  },
  analytics: {
    key: "analytics",
    label: "Analytics",
    description: "หน้ารวมสถิติกราฟวิเคราะห์แนวโน้มยอดขายและสินค้าขายดี",
    icon: <BarChart3 className="w-5 h-5 text-[#98c9a3]" />,
  },
  datarecords: {
    key: "datarecords",
    label: "Data Records (เมนูกลุ่มบันทึกข้อมูล)",
    description: "เมนูกลุ่มบันทึกข้อมูล (Orders, Products, Stock, Customers ฯลฯ)",
    icon: <FolderKanban className="w-5 h-5 text-[#98c9a3]" />,
  },
  manage: {
    key: "manage",
    label: "Manage (เมนูผู้ดูแลระบบ Admin)",
    description: "เมนูกลุ่มแอดมินจัดการสิทธิ์ สร้างผู้ใช้ และตั้งค่าระบบ",
    icon: <Shield className="w-5 h-5 text-[#98c9a3]" />,
  },
};

// REPORTS SUB-ITEMS
const REPORTS_ITEMS: Record<string, MenuItem> = {
  sales: {
    key: "sales",
    label: "📊 สรุปยอดขาย (Sales Summary)",
    description: "รายงานสรุปยอดขายสุทธิ การชำระเงิน และการรอเก็บเงิน",
    icon: <TrendingUp className="w-5 h-5 text-[#98c9a3]" />,
  },
  charts: {
    key: "charts",
    label: "📈 กราฟวิเคราะห์ (Sales Charts)",
    description: "กราฟแท่งแนวโน้มยอดขายรายวันและสถิติยอดขาย",
    icon: <BarChart3 className="w-5 h-5 text-[#98c9a3]" />,
  },
  customer: {
    key: "customer",
    label: "👥 สรุปตามลูกค้า (Sales by Customer)",
    description: "รายงานสรุปยอดซื้อและยอดค้างชำระของลูกค้าแต่ละราย",
    icon: <Users className="w-5 h-5 text-[#98c9a3]" />,
  },
  product: {
    key: "product",
    label: "📦 สรุปตามสินค้า (Sales by Product)",
    description: "รายงานสรุปจำนวนยอดขายและมูลค่าขายของสินค้าแต่ละชนิด",
    icon: <Package className="w-5 h-5 text-[#98c9a3]" />,
  },
  user: {
    key: "user",
    label: "👤 ประวัติผู้ใช้งาน (User Logs)",
    description: "รายงานบันทึกประวัติการเข้าใช้งานระบบของผู้ใช้",
    icon: <Activity className="w-5 h-5 text-[#98c9a3]" />,
  },
};

// DATA RECORDS SUB-ITEMS
const DATA_RECORDS_ITEMS: Record<string, MenuItem> = {
  orders: {
    key: "orders",
    label: "Orders (บันทึกสั่งซื้อ & ใบเสร็จ)",
    description: "หน้าบันทึกรายการสั่งซื้อ ติดตามสถานะจัดส่ง และพิมพ์ใบเสร็จ",
    icon: <ShoppingBag className="w-5 h-5 text-[#98c9a3]" />,
  },
  products: {
    key: "products",
    label: "Products (บันทึกสินค้า)",
    description: "หน้าบันทึกรายการสินค้า รหัสสินค้า ราคา และรูปภาพ",
    icon: <Package className="w-5 h-5 text-[#98c9a3]" />,
  },
  inventory: {
    key: "inventory",
    label: "Inventory (จัดการสต็อกสินค้า)",
    description: "หน้าจัดการยอดคงเหลือสต็อกสินค้า การเบิกออกและการเติมเข้า",
    icon: <Boxes className="w-5 h-5 text-[#98c9a3]" />,
  },
  categories: {
    key: "categories",
    label: "Categories (ประเภทหมวดสินค้า)",
    description: "หน้าจัดการประเภทหลักของสินค้า",
    icon: <Tags className="w-5 h-5 text-[#98c9a3]" />,
  },
  "sub-categories": {
    key: "sub-categories",
    label: "Sub-Categories (หมวดสินค้า)",
    description: "หน้าจัดการหมวดย่อยของสินค้า",
    icon: <FolderTree className="w-5 h-5 text-[#98c9a3]" />,
  },
  locations: {
    key: "locations",
    label: "Locations (สถานที่เก็บสินค้า)",
    description: "หน้าจัดการคลังและสถานที่จัดเก็บสินค้า",
    icon: <Warehouse className="w-5 h-5 text-[#98c9a3]" />,
  },
  personnel: {
    key: "personnel",
    label: "Personnel (พนักงาน)",
    description: "หน้าจัดการข้อมูลรายชื่อและรายละเอียดพนักงาน",
    icon: <Contact className="w-5 h-5 text-[#98c9a3]" />,
  },
  customers: {
    key: "customers",
    label: "Customers (ลูกค้า)",
    description: "หน้าจัดการข้อมูลรายชื่อและที่อยู่ออกใบเสร็จลูกค้า",
    icon: <Users className="w-5 h-5 text-[#98c9a3]" />,
  },
};

// MANAGE SUB-ITEMS
const MANAGE_ITEMS: Record<string, MenuItem> = {
  "create-user": {
    key: "create-user",
    label: "Create User (สร้างผู้ใช้)",
    description: "หน้าลงทะเบียนสร้างบัญชีผู้ใช้งานใหม่ในระบบ",
    icon: <UserPlus className="w-5 h-5 text-[#98c9a3]" />,
  },
  "manage-permissions": {
    key: "manage-permissions",
    label: "Permissions (จัดการสิทธิ์)",
    description: "หน้ากำหนดสิทธิ์การเข้าถึงเมนูต่างๆ ของผู้ใช้แต่ละราย",
    icon: <Sliders className="w-5 h-5 text-[#98c9a3]" />,
  },
  "manage-menu-order": {
    key: "manage-menu-order",
    label: "Menu Order (จัดลำดับเมนู)",
    description: "หน้าจัดเรียงลำดับการแสดงผลเมนูบน Navigation Bar",
    icon: <ListOrdered className="w-5 h-5 text-[#98c9a3]" />,
  },
  "manage-logo": {
    key: "manage-logo",
    label: "Logo & Branding (จัดการโลโก้)",
    description: "หน้าตั้งค่าโลโก้และชื่อหัวข้อระบบ",
    icon: <ImageIcon className="w-5 h-5 text-[#98c9a3]" />,
  },
  "user-logs": {
    key: "user-logs",
    label: "User Logs (ประวัติการใช้งาน)",
    description: "หน้าตรวจสอบประวัติการล็อกอินและการใช้งานของผู้ใช้",
    icon: <Activity className="w-5 h-5 text-[#98c9a3]" />,
  },
};

const DEFAULT_MAIN = ["dashboard", "reports", "analytics", "datarecords", "manage"];
const DEFAULT_REPORTS = ["sales", "charts", "customer", "product", "user"];
const DEFAULT_DATA_RECORDS = ["orders", "products", "inventory", "categories", "sub-categories", "locations", "personnel", "customers"];
const DEFAULT_MANAGE = ["create-user", "manage-permissions", "manage-menu-order", "manage-logo", "user-logs"];

export default function ManageMenuOrderPage() {
  const [activeTab, setActiveTab] = useState<"main" | "reports" | "datarecords" | "manage">("main");

  const [menuOrder, setMenuOrder] = useState<string[]>(DEFAULT_MAIN);
  const [reportsSubOrder, setReportsSubOrder] = useState<string[]>(DEFAULT_REPORTS);
  const [dataRecordsSubOrder, setDataRecordsSubOrder] = useState<string[]>(DEFAULT_DATA_RECORDS);
  const [manageSubOrder, setManageSubOrder] = useState<string[]>(DEFAULT_MANAGE);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchMenuOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiPath("/api/admin/settings/menu-order"), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.menuOrder && Array.isArray(data.menuOrder)) setMenuOrder(data.menuOrder);
        if (data.reportsSubOrder && Array.isArray(data.reportsSubOrder)) setReportsSubOrder(data.reportsSubOrder);
        if (data.dataRecordsSubOrder && Array.isArray(data.dataRecordsSubOrder)) setDataRecordsSubOrder(data.dataRecordsSubOrder);
        if (data.manageSubOrder && Array.isArray(data.manageSubOrder)) setManageSubOrder(data.manageSubOrder);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuOrders();
  }, []);

  // Helper getters for currently active target order & item dictionary
  const getActiveState = () => {
    if (activeTab === "main") return { order: menuOrder, setOrder: setMenuOrder, dict: MAIN_ITEMS, defaultOrder: DEFAULT_MAIN };
    if (activeTab === "reports") return { order: reportsSubOrder, setOrder: setReportsSubOrder, dict: REPORTS_ITEMS, defaultOrder: DEFAULT_REPORTS };
    if (activeTab === "datarecords") return { order: dataRecordsSubOrder, setOrder: setDataRecordsSubOrder, dict: DATA_RECORDS_ITEMS, defaultOrder: DEFAULT_DATA_RECORDS };
    return { order: manageSubOrder, setOrder: setManageSubOrder, dict: MANAGE_ITEMS, defaultOrder: DEFAULT_MANAGE };
  };

  const { order, setOrder, dict, defaultOrder } = getActiveState();

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...order];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    setOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === order.length - 1) return;
    const newOrder = [...order];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    setOrder(newOrder);
  };

  const handleResetDefault = () => {
    setOrder(defaultOrder);
  };

  const handleSaveAllOrders = async () => {
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch(getApiPath("/api/admin/settings/menu-order"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuOrder,
          reportsSubOrder,
          dataRecordsSubOrder,
          manageSubOrder,
        }),
      });

      if (res.ok) {
        setSuccessMsg("บันทึกการจัดลำดับเมนูและเมนูย่อยเรียบร้อยแล้ว!");
        window.dispatchEvent(new Event("zyka-menu-updated"));
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "เกิดข้อผิดพลาดในการบันทึกลำดับเมนู");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f3efe6] flex items-center gap-3">
            <ListOrdered className="w-8 h-8 text-[#98c9a3]" />
            จัดลำดับเมนูระบบและเมนูย่อย (Menu & Submenu Reordering)
          </h1>
          <p className="text-xs sm:text-sm text-[#a39b8b] mt-1">
            ปรับเลื่อนตำแหน่งการแสดงผลของเมนูหลักและรายการเมนูย่อย (Submenu Dropdown) ได้อย่างอิสระ
          </p>
        </div>

        <Link
          href="/dashboard"
          className="text-xs text-[#a39b8b] hover:text-[#f3efe6] transition-colors self-start sm:self-auto"
        >
          ← กลับสู่หน้าหลัก
        </Link>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/40 text-red-300 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* Target Category Tabs Selection */}
      <div className="flex flex-wrap gap-2 border-b border-[#2d4734] pb-2">
        <button
          onClick={() => setActiveTab("main")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "main"
              ? "bg-[#1e3425] text-[#98c9a3] border border-[#98c9a3]/40 shadow-md"
              : "text-[#a39b8b] hover:bg-[#121c15] hover:text-[#f3efe6]"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>🔝 เมนูหลัก Navbar</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "reports"
              ? "bg-[#1e3425] text-[#98c9a3] border border-[#98c9a3]/40 shadow-md"
              : "text-[#a39b8b] hover:bg-[#121c15] hover:text-[#f3efe6]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>📋 Submenu: Reports</span>
        </button>

        <button
          onClick={() => setActiveTab("datarecords")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "datarecords"
              ? "bg-[#1e3425] text-[#98c9a3] border border-[#98c9a3]/40 shadow-md"
              : "text-[#a39b8b] hover:bg-[#121c15] hover:text-[#f3efe6]"
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>📁 Submenu: Data Records</span>
        </button>

        <button
          onClick={() => setActiveTab("manage")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "manage"
              ? "bg-[#1e3425] text-[#98c9a3] border border-[#98c9a3]/40 shadow-md"
              : "text-[#a39b8b] hover:bg-[#121c15] hover:text-[#f3efe6]"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>🛡️ Submenu: Manage (Admin)</span>
        </button>
      </div>

      {/* Live Preview Header Bar */}
      <div className="glass-earth-card p-5 rounded-3xl border border-[#2d4734] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#e6dfd3] flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#98c9a3]" />
            ตัวอย่างการแสดงผลลำดับ ({activeTab === "main" ? "เมนูหลัก บน Navbar" : `รายการย่อย Submenu ในกลุ่ม ${activeTab}`})
          </span>
          <span className="text-[11px] text-[#a39b8b]">เรียงตามลำดับจากแรกไปหลัง</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-[#0f1712] border border-[#98c9a3]/20">
          {order.map((key, idx) => {
            const item = dict[key];
            if (!item) return null;

            return (
              <div
                key={key}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1e3425] text-[#98c9a3] text-xs font-bold border border-[#98c9a3]/30 shadow"
              >
                <span className="w-4 h-4 font-mono text-[10px] rounded-full bg-[#121c15] text-[#a39b8b] flex items-center justify-center">
                  {idx + 1}
                </span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Menu Ordering Card List */}
      <div className="glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#2d4734] space-y-6">
        <div className="flex items-center justify-between border-b border-[#2d4734] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#f3efe6]">
              จัดลำดับรายการ ({activeTab === "main" ? "เมนูหลัก" : `เมนูย่อย Submenu: ${activeTab}`})
            </h3>
            <p className="text-xs text-[#a39b8b]">
              ใช้ปุ่มขยับขึ้น (⬆️) หรือ ขยับลง (⬇️) เพื่อสลับตำแหน่งการแสดงผล
            </p>
          </div>

          <button
            onClick={handleResetDefault}
            className="px-3.5 py-2 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="รีเซ็ตเป็นลำดับเริ่มต้นของแท็บนี้"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าเริ่มต้นแท็บนี้</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#a39b8b]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#98c9a3]" />
            กำลังโหลดข้อมูลลำดับเมนู...
          </div>
        ) : (
          <div className="space-y-3">
            {order.map((key, index) => {
              const item = dict[key];
              if (!item) return null;

              const isFirst = index === 0;
              const isLast = index === order.length - 1;

              return (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#121c15] border border-[#2d4734] hover:border-[#98c9a3]/40 transition-all gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Index Badge */}
                    <span className="w-8 h-8 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 font-mono font-bold text-xs text-[#98c9a3] flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>

                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-[#18241c] border border-[#2d4734] flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>

                    <div>
                      <h4 className="font-bold text-[#f3efe6] text-sm">{item.label}</h4>
                      <p className="text-xs text-[#a39b8b] mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  {/* Position Up / Down Control Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => moveUp(index)}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                        isFirst
                          ? "bg-[#18241c]/50 text-[#a39b8b]/30 border-transparent cursor-not-allowed"
                          : "bg-[#1e3425] text-[#98c9a3] border-[#98c9a3]/40 hover:bg-[#284532]"
                      }`}
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp className="w-4 h-4" />
                      <span className="hidden sm:inline">ขยับขึ้น</span>
                    </button>

                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => moveDown(index)}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                        isLast
                          ? "bg-[#18241c]/50 text-[#a39b8b]/30 border-transparent cursor-not-allowed"
                          : "bg-[#1e3425] text-[#98c9a3] border-[#98c9a3]/40 hover:bg-[#284532]"
                      }`}
                      title="เลื่อนลง"
                    >
                      <ArrowDown className="w-4 h-4" />
                      <span className="hidden sm:inline">ขยับลง</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-6 border-t border-[#2d4734] flex justify-end gap-3">
          <button
            onClick={handleSaveAllOrders}
            disabled={saving}
            className="btn-earth-primary px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "กำลังบันทึก..." : "บันทึกการจัดลำดับทั้งหมด"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

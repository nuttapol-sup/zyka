"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Shield,
  UserPlus,
  Sliders,
  LogOut,
  LayoutDashboard,
  FileText,
  BarChart3,
  Leaf,
  User as UserIcon,
  Activity,
  Warehouse,
  Users,
  Contact,
  ChevronDown,
  FolderKanban,
  Tags,
  FolderTree,
  Package,
  Boxes,
  ShoppingBag,
  TrendingUp,
  ListOrdered,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  role: "admin" | "user";
  allowedPages: string[];
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // Dynamic Logo & Branding State
  const [logoUrl, setLogoUrl] = useState("");
  const [appName, setAppName] = useState("ZYKA");
  const [appSubtitle, setAppSubtitle] = useState("Access Control");

  // Menu & Submenu Ordering State
  const [menuOrder, setMenuOrder] = useState<string[]>([
    "dashboard",
    "reports",
    "analytics",
    "datarecords",
    "manage",
  ]);
  const [reportsSubOrder, setReportsSubOrder] = useState<string[]>([
    "sales",
    "charts",
    "customer",
    "product",
    "user",
  ]);
  const [dataRecordsSubOrder, setDataRecordsSubOrder] = useState<string[]>([
    "orders",
    "products",
    "inventory",
    "categories",
    "sub-categories",
    "locations",
    "personnel",
    "customers",
  ]);
  const [manageSubOrder, setManageSubOrder] = useState<string[]>([
    "create-user",
    "manage-permissions",
    "manage-menu-order",
    "manage-logo",
    "user-logs",
  ]);

  // Fetch logo settings
  const fetchLogoSettings = async () => {
    try {
      const res = await fetch("/api/settings/logo", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setLogoUrl(data.logoUrl || "");
        setAppName(data.appName || "ZYKA");
        setAppSubtitle(data.appSubtitle || "Access Control");
      }
    } catch {
      // Keep defaults
    }
  };

  // Fetch menu & submenu order settings
  const fetchMenuOrder = async () => {
    try {
      const res = await fetch("/api/admin/settings/menu-order", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.menuOrder && Array.isArray(data.menuOrder)) setMenuOrder(data.menuOrder);
        if (data.reportsSubOrder && Array.isArray(data.reportsSubOrder)) setReportsSubOrder(data.reportsSubOrder);
        if (data.dataRecordsSubOrder && Array.isArray(data.dataRecordsSubOrder)) setDataRecordsSubOrder(data.dataRecordsSubOrder);
        if (data.manageSubOrder && Array.isArray(data.manageSubOrder)) setManageSubOrder(data.manageSubOrder);
      }
    } catch {
      // Keep defaults
    }
  };

  // Fetch current logged in user
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchLogoSettings();
    fetchMenuOrder();

    // Listen for custom update events
    const handleLogoUpdate = () => fetchLogoSettings();
    const handleMenuUpdate = () => fetchMenuOrder();

    window.addEventListener("zyka-logo-updated", handleLogoUpdate);
    window.addEventListener("zyka-menu-updated", handleMenuUpdate);
    return () => {
      window.removeEventListener("zyka-logo-updated", handleLogoUpdate);
      window.removeEventListener("zyka-menu-updated", handleMenuUpdate);
    };
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  // If on login page, return null
  if (pathname === "/login") return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2d4734]/40 bg-[#0f1712]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo & Nav Links with generous spacing */}
          <div className="flex items-center gap-8 md:gap-12">
            {/* Dynamic Brand Logo (Clickable for Admin to manage logo settings) */}
            <Link
              href={user?.role === "admin" ? "/admin/manage-logo" : "/dashboard"}
              title={
                user?.role === "admin"
                  ? "กดเพื่อจัดการโลโก้และชื่อระบบ (Admin Only)"
                  : "กลับสู่หน้าหลัก Dashboard"
              }
              className="flex items-center gap-2.5 group transition-transform duration-200 hover:scale-105 shrink-0"
            >
              {logoUrl ? (
                // Custom Logo Image
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#98c9a3]/30 bg-[#18241c] flex items-center justify-center p-1 group-hover:border-[#98c9a3]/60 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                // Default Icon Logo
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#446e50] to-[#1f3627] flex items-center justify-center border border-[#98c9a3]/30 shadow-md group-hover:border-[#98c9a3]/60">
                  <Leaf className="w-5 h-5 text-[#98c9a3]" />
                </div>
              )}
              <div>
                <span className="text-xl font-bold text-gradient-earth tracking-tight">
                  {appName || "ZYKA"}
                </span>
                <span className="text-xs block text-[#a39b8b] font-medium -mt-1">
                  {appSubtitle || "Access Control"}
                </span>
              </div>
            </Link>

            {/* Navigation Links (Ordered Dynamically) */}
            {user && (
              <div className="hidden md:flex items-center space-x-1.5">
                {menuOrder.map((key) => {
                  if (key === "dashboard") {
                    return (
                      <NavLink
                        key="dashboard"
                        href="/dashboard"
                        icon={<LayoutDashboard className="w-4 h-4" />}
                        label="Dashboard"
                        active={pathname === "/dashboard"}
                      />
                    );
                  }
                  if (key === "reports") {
                    return <ReportsDropdown key="reports" pathname={pathname} user={user} subOrder={reportsSubOrder} />;
                  }
                  if (key === "analytics") {
                    return (
                      <NavLink
                        key="analytics"
                        href="/analytics"
                        icon={<BarChart3 className="w-4 h-4" />}
                        label="Analytics"
                        active={pathname === "/analytics"}
                        isAllowed={user.role === "admin" || user.allowedPages.includes("/analytics")}
                      />
                    );
                  }
                  if (key === "datarecords") {
                    return <DataRecordsDropdown key="datarecords" pathname={pathname} user={user} subOrder={dataRecordsSubOrder} />;
                  }
                  if (key === "manage" && user.role === "admin") {
                    return (
                      <div key="manage" className="pl-3 ml-3 border-l border-[#2d4734]">
                        <AdminManageDropdown pathname={pathname} subOrder={manageSubOrder} />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          {/* User Status / Auth Action */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Clickable User Profile Badge -> Navigates to Change Password */}
                <Link
                  href="/change-password"
                  title="คลิกเพื่อเปลี่ยนรหัสผ่าน (Change Password)"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18241c] border border-[#98c9a3]/20 hover:border-[#98c9a3]/60 hover:bg-[#1e3024] transition-all cursor-pointer group shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-[#2a4332] group-hover:bg-[#365741] flex items-center justify-center text-[#98c9a3] transition-colors">
                    {user.role === "admin" ? (
                      <Shield className="w-4 h-4 text-[#98c9a3]" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-[#e6dfd3]" />
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase transition-colors ${
                      user.role === "admin"
                        ? "bg-[#446e50]/40 text-[#98c9a3] border border-[#98c9a3]/30"
                        : "bg-[#2a302a] text-[#e6dfd3]"
                    }`}
                  >
                    {user.role}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#1f3025] transition-colors border border-transparent hover:border-[#98c9a3]/20"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : !loading ? (
              <Link
                href="/login"
                className="btn-earth-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                เข้าสู่ระบบ
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  icon,
  label,
  active,
  isAllowed = true,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  isAllowed?: boolean;
  badge?: string;
}) {
  if (!isAllowed) return null;

  return (
    <Link
      href={href}
      className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
        active
          ? "bg-[#273e2e] text-[#98c9a3] border border-[#98c9a3]/30 shadow-sm"
          : "text-[#e6dfd3]/80 hover:text-[#f3efe6] hover:bg-[#18241c]"
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-[#446e50]/40 text-[#98c9a3] border border-[#98c9a3]/30 font-semibold">
          {badge}
        </span>
      )}
    </Link>
  );
}

function DataRecordsDropdown({
  pathname,
  user,
  subOrder = ["orders", "products", "inventory", "categories", "sub-categories", "locations", "personnel", "customers"],
}: {
  pathname: string;
  user: UserProfile;
  subOrder?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOrdersAllowed = user.role === "admin" || user.allowedPages.includes("/orders");
  const isCategoriesAllowed = user.role === "admin" || user.allowedPages.includes("/categories");
  const isSubCategoriesAllowed = user.role === "admin" || user.allowedPages.includes("/sub-categories");
  const isProductsAllowed = user.role === "admin" || user.allowedPages.includes("/products");
  const isInventoryAllowed = user.role === "admin" || user.allowedPages.includes("/inventory");
  const isLocationsAllowed = user.role === "admin" || user.allowedPages.includes("/locations");
  const isPersonnelAllowed = user.role === "admin" || user.allowedPages.includes("/personnel");
  const isCustomersAllowed = user.role === "admin" || user.allowedPages.includes("/customers");

  const hasAnyAccess = isOrdersAllowed || isCategoriesAllowed || isSubCategoriesAllowed || isProductsAllowed || isInventoryAllowed || isLocationsAllowed || isPersonnelAllowed || isCustomersAllowed;

  const isDataActive = pathname === "/orders" || pathname === "/categories" || pathname === "/sub-categories" || pathname === "/products" || pathname === "/inventory" || pathname === "/locations" || pathname === "/personnel" || pathname === "/customers";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!hasAnyAccess) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
          isDataActive || isOpen
            ? "bg-[#273e2e] text-[#98c9a3] border border-[#98c9a3]/30 shadow-sm"
            : "text-[#e6dfd3]/80 hover:text-[#f3efe6] hover:bg-[#18241c]"
        }`}
      >
        <FolderKanban className="w-4 h-4 text-[#98c9a3]" />
        <span>Data Records</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#98c9a3]" : "text-[#a39b8b]"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#0f1712] border border-[#98c9a3]/30 shadow-2xl backdrop-blur-xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {subOrder.map((key) => {
            if (key === "orders" && isOrdersAllowed) {
              return (
                <Link
                  key="orders"
                  href="/orders"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/orders" ? "bg-[#1f3025] text-[#98c9a3] border border-[#98c9a3]/30 font-semibold" : "text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3]"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-[#98c9a3]" />
                  <span>Orders (บันทึกสั่งซื้อ & ใบเสร็จ)</span>
                </Link>
              );
            }
            if (key === "categories" && isCategoriesAllowed) {
              return (
                <Link
                  key="categories"
                  href="/categories"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/categories" ? "bg-[#1f3025] text-[#98c9a3] border border-[#98c9a3]/30 font-semibold" : "text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3]"
                  }`}
                >
                  <Tags className="w-4 h-4 text-[#98c9a3]" />
                  <span>Categories (ประเภทหมวดสินค้า)</span>
                </Link>
              );
            }
            if (key === "sub-categories" && isSubCategoriesAllowed) {
              return (
                <Link
                  key="sub-categories"
                  href="/sub-categories"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/sub-categories" ? "bg-[#1f3025] text-[#98c9a3] border border-[#98c9a3]/30 font-semibold" : "text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3]"
                  }`}
                >
                  <FolderTree className="w-4 h-4 text-[#98c9a3]" />
                  <span>Sub-Categories (หมวดสินค้า)</span>
                </Link>
              );
            }
            if (key === "products" && isProductsAllowed) {
              return (
                <Link
                  key="products"
                  href="/products"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/products" ? "bg-[#1f3025] text-[#98c9a3] border border-[#98c9a3]/30 font-semibold" : "text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3]"
                  }`}
                >
                  <Package className="w-4 h-4 text-[#98c9a3]" />
                  <span>Products (บันทึกสินค้า)</span>
                </Link>
              );
            }
            if (key === "inventory" && isInventoryAllowed) {
              return (
                <Link
                  key="inventory"
                  href="/inventory"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/inventory" ? "bg-[#1f3025] text-[#98c9a3] border border-[#98c9a3]/30 font-semibold" : "text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3]"
                  }`}
                >
                  <Boxes className="w-4 h-4 text-[#98c9a3]" />
                  <span>Inventory (จัดการสต็อกสินค้า)</span>
                </Link>
              );
            }
            if (key === "locations" && isLocationsAllowed) {
              return (
                <Link
                  key="locations"
                  href="/locations"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/locations" ? "bg-[#1f3025] text-[#98c9a3] border border-[#98c9a3]/30 font-semibold" : "text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3]"
                  }`}
                >
                  <Warehouse className="w-4 h-4 text-[#98c9a3]" />
                  <span>Locations (สถานที่เก็บสินค้า)</span>
                </Link>
              );
            }
            if (key === "personnel" && isPersonnelAllowed) {
              return (
                <Link
                  key="personnel"
                  href="/personnel"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/personnel" ? "bg-[#1f3025] text-[#98c9a3] border border-[#98c9a3]/30 font-semibold" : "text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3]"
                  }`}
                >
                  <Users className="w-4 h-4 text-[#98c9a3]" />
                  <span>Personnel (ข้อมูลบุคลากร)</span>
                </Link>
              );
            }
            if (key === "customers" && isCustomersAllowed) {
              return (
                <Link
                  key="customers"
                  href="/customers"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/customers" ? "bg-[#1f3025] text-[#98c9a3] border border-[#98c9a3]/30 font-semibold" : "text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3]"
                  }`}
                >
                  <Contact className="w-4 h-4 text-[#98c9a3]" />
                  <span>Customers (ข้อมูลลูกค้า)</span>
                </Link>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

function AdminManageDropdown({
  pathname,
  subOrder = ["create-user", "manage-permissions", "manage-menu-order", "manage-logo", "user-logs"],
}: {
  pathname: string;
  subOrder?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdminActive = pathname === "/admin/create-user" || pathname === "/admin/manage-permissions" || pathname === "/admin/manage-menu-order" || pathname === "/admin/manage-logo" || pathname === "/admin/user-logs";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
          isAdminActive || isOpen
            ? "bg-[#273e2e] text-[#98c9a3] border border-[#98c9a3]/30 shadow-sm"
            : "text-[#e6dfd3]/80 hover:text-[#f3efe6] hover:bg-[#18241c]"
        }`}
      >
        <Shield className="w-4 h-4 text-[#98c9a3]" />
        <span>Manage</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#446e50]/40 text-[#98c9a3] border border-[#98c9a3]/30 font-semibold">
          Admin
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#98c9a3]" : "text-[#a39b8b]"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-[#0f1712] border border-[#98c9a3]/30 shadow-2xl backdrop-blur-xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {subOrder.map((key) => {
            if (key === "create-user") {
              return (
                <Link
                  key="create-user"
                  href="/admin/create-user"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/admin/create-user" ? "bg-[#1f3025] text-[#98c9a3] border border-[#98c9a3]/30 font-semibold" : "text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3]"
                  }`}
                >
                  <UserPlus className="w-4 h-4 text-[#98c9a3]" />
                  <span>Create User (สร้างผู้ใช้)</span>
                </Link>
              );
            }
            if (key === "manage-permissions") {
              return (
                <Link
                  key="manage-permissions"
                  href="/admin/manage-permissions"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/admin/manage-permissions" ? "bg-[#1f3025] text-[#98c9a3] border border-[#98c9a3]/30 font-semibold" : "text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3]"
                  }`}
                >
                  <Sliders className="w-4 h-4 text-[#98c9a3]" />
                  <span>Permissions (จัดการสิทธิ์)</span>
                </Link>
              );
            }
            if (key === "manage-menu-order") {
              return (
                <Link
                  key="manage-menu-order"
                  href="/admin/manage-menu-order"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/admin/manage-menu-order" ? "bg-[#1f3025] text-[#98c9a3] border border-[#98c9a3]/30 font-semibold" : "text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3]"
                  }`}
                >
                  <ListOrdered className="w-4 h-4 text-[#98c9a3]" />
                  <span>Menu Order (จัดลำดับเมนู)</span>
                </Link>
              );
            }
            if (key === "manage-logo") {
              return (
                <Link
                  key="manage-logo"
                  href="/admin/manage-logo"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/admin/manage-logo" ? "bg-[#1f3025] text-[#98c9a3] border border-[#98c9a3]/30 font-semibold" : "text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3]"
                  }`}
                >
                  <Leaf className="w-4 h-4 text-[#98c9a3]" />
                  <span>Logo & Branding (จัดการโลโก้)</span>
                </Link>
              );
            }
            if (key === "user-logs") {
              return (
                <Link
                  key="user-logs"
                  href="/admin/user-logs"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/admin/user-logs" ? "bg-[#1f3025] text-[#98c9a3] border border-[#98c9a3]/30 font-semibold" : "text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3]"
                  }`}
                >
                  <Activity className="w-4 h-4 text-[#98c9a3]" />
                  <span>User Logs (ประวัติการใช้งาน)</span>
                </Link>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

function ReportsDropdown({
  pathname,
  user,
  subOrder = ["sales", "charts", "customer", "product", "user"],
}: {
  pathname: string;
  user: UserProfile;
  subOrder?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasFullReportAccess = user.role === "admin" || user.allowedPages.includes("/reports");

  const isSalesAllowed = hasFullReportAccess || user.allowedPages.includes("/reports?tab=sales");
  const isChartsAllowed = hasFullReportAccess || user.allowedPages.includes("/reports?tab=charts");
  const isCustomerAllowed = hasFullReportAccess || user.allowedPages.includes("/reports?tab=customer");
  const isProductAllowed = hasFullReportAccess || user.allowedPages.includes("/reports?tab=product");
  const isUserAllowed = hasFullReportAccess || user.allowedPages.includes("/reports?tab=user");

  const hasAnyAccess = isSalesAllowed || isChartsAllowed || isCustomerAllowed || isProductAllowed || isUserAllowed;

  const isReportActive = pathname === "/reports";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!hasAnyAccess) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
          isReportActive || isOpen
            ? "bg-[#273e2e] text-[#98c9a3] border border-[#98c9a3]/30 shadow-sm"
            : "text-[#e6dfd3]/80 hover:text-[#f3efe6] hover:bg-[#18241c]"
        }`}
      >
        <FileText className="w-4 h-4 text-[#98c9a3]" />
        <span>Reports</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#98c9a3]" : "text-[#a39b8b]"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#0f1712] border border-[#98c9a3]/30 shadow-2xl backdrop-blur-xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {subOrder.map((key) => {
            if (key === "sales" && isSalesAllowed) {
              return (
                <Link
                  key="sales"
                  href="/reports?tab=sales"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3] transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-[#98c9a3]" />
                  <span>📊 สรุปยอดขาย (Sales Summary)</span>
                </Link>
              );
            }
            if (key === "charts" && isChartsAllowed) {
              return (
                <Link
                  key="charts"
                  href="/reports?tab=charts"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3] transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-[#98c9a3]" />
                  <span>📈 กราฟวิเคราะห์ (Sales Charts)</span>
                </Link>
              );
            }
            if (key === "customer" && isCustomerAllowed) {
              return (
                <Link
                  key="customer"
                  href="/reports?tab=customer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3] transition-colors"
                >
                  <Users className="w-4 h-4 text-[#98c9a3]" />
                  <span>👥 สรุปตามลูกค้า (Sales by Customer)</span>
                </Link>
              );
            }
            if (key === "product" && isProductAllowed) {
              return (
                <Link
                  key="product"
                  href="/reports?tab=product"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3] transition-colors"
                >
                  <Package className="w-4 h-4 text-[#98c9a3]" />
                  <span>📦 สรุปตามสินค้า (Sales by Product)</span>
                </Link>
              );
            }
            if (key === "user" && isUserAllowed) {
              return (
                <Link
                  key="user"
                  href="/reports?tab=user"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3] transition-colors"
                >
                  <Activity className="w-4 h-4 text-[#98c9a3]" />
                  <span>👤 ประวัติผู้ใช้งาน (User Logs)</span>
                </Link>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

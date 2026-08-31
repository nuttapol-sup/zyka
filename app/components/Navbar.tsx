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
  ChevronRight,
  FolderKanban,
  Tags,
  FolderTree,
  Package,
  Boxes,
  ShoppingBag,
  TrendingUp,
  ListOrdered,
  Menu,
  X,
  KeyRound,
  UserCheck,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { getApiPath } from "@/app/utils/apiPath";

interface UserProfile {
  id?: string;
  _id?: string;
  name: string;
  username: string;
  role: "admin" | "user";
  allowedPages: string[];
}

const hasAccess = (user: UserProfile | null, path: string): boolean => {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!Array.isArray(user.allowedPages)) return false;

  const cleanTarget = path.replace(/^\/zyka/, "").toLowerCase();
  const targetNorm = cleanTarget.startsWith("/") ? cleanTarget : `/${cleanTarget}`;

  return user.allowedPages.some((p) => {
    const cleanP = String(p).replace(/^\/zyka/, "").toLowerCase();
    const pNorm = cleanP.startsWith("/") ? cleanP : `/${cleanP}`;

    // 1. Exact match
    if (pNorm === targetNorm) return true;

    // 2. All Reports granted (/reports)
    if (pNorm === "/reports" && targetNorm.startsWith("/reports")) return true;

    // 3. Base /reports check when checking header access
    if (targetNorm === "/reports" && pNorm.startsWith("/reports")) return true;

    // 4. Standard path sub-route (e.g. /orders/123)
    if (!pNorm.includes("?") && !targetNorm.includes("?") && targetNorm.startsWith(pNorm + "/")) return true;

    return false;
  });
};

const isSubTabAllowed = (user: UserProfile | null, tabKey: string): boolean => {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!Array.isArray(user.allowedPages)) return false;

  // 1. If All Reports permission is granted ("/reports" in allowedPages)
  if (user.allowedPages.includes("/reports")) return true;

  // 2. Check exact sub-tab permission
  return user.allowedPages.some((p) => {
    const cleanP = String(p).replace(/^\/zyka/, "").toLowerCase();
    return cleanP === `/reports?tab=${tabKey.toLowerCase()}`;
  });
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Instant user state initialization from sessionStorage cache (0ms render)
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("zyka_user_cache");
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Mobile Drawer & Mobile Submenu Accordion States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileReportsOpen, setMobileReportsOpen] = useState(false);
  const [mobileDataOpen, setMobileDataOpen] = useState(false);
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);

  // Dynamic Logo & Branding State
  const [logoUrl, setLogoUrl] = useState("");
  const [appName, setAppName] = useState("ZYKA");
  const [appSubtitle, setAppSubtitle] = useState("Access Control");

  // Menu & Submenu Ordering & Custom Labels State
  const [menuOrder, setMenuOrder] = useState<string[]>([
    "dashboard",
    "reports",
    "datarecords",
    "manage",
  ]);
  const [reportsSubOrder, setReportsSubOrder] = useState<string[]>([
    "sales",
    "charts",
    "customer",
    "product",
    "salesperson",
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
    "positions",
    "customers",
  ]);
  const [manageSubOrder, setManageSubOrder] = useState<string[]>([
    "create-user",
    "manage-permissions",
    "manage-menu-order",
    "manage-logo",
    "manage-line",
    "user-logs",
  ]);
  const [menuCustomLabels, setMenuCustomLabels] = useState<Record<string, string>>({});

  // Fetch logo settings
  const fetchLogoSettings = async () => {
    try {
      const res = await fetch(getApiPath("/api/settings/logo"), {
        cache: "no-store",
        credentials: "same-origin",
      });
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

  // Fetch menu & submenu order settings & custom labels
  const fetchMenuOrder = async () => {
    try {
      const res = await fetch(getApiPath("/api/settings/menu-order"), {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.menuOrder && Array.isArray(data.menuOrder)) setMenuOrder(data.menuOrder);
        if (data.reportsSubOrder && Array.isArray(data.reportsSubOrder)) setReportsSubOrder(data.reportsSubOrder);
        if (data.dataRecordsSubOrder && Array.isArray(data.dataRecordsSubOrder)) {
          const list = [...data.dataRecordsSubOrder];
          if (!list.includes("positions")) list.push("positions");
          setDataRecordsSubOrder(list);
        }
        if (data.manageSubOrder && Array.isArray(data.manageSubOrder)) {
          const mList = [...data.manageSubOrder];
          if (!mList.includes("manage-line")) {
            const userLogIdx = mList.indexOf("user-logs");
            if (userLogIdx !== -1) {
              mList.splice(userLogIdx, 0, "manage-line");
            } else {
              mList.push("manage-line");
            }
          }
          setManageSubOrder(mList);
        }
        if (data.menuCustomLabels && typeof data.menuCustomLabels === "object") setMenuCustomLabels(data.menuCustomLabels);
      }
    } catch {
      // Keep defaults
    }
  };

  // Fetch current logged in user with explicit credentials & automatic retry
  const fetchUser = async (retryCount = 0) => {
    try {
      const res = await fetch(getApiPath("/api/auth/me"), {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
          try {
            sessionStorage.setItem("zyka_user_cache", JSON.stringify(data.user));
          } catch {}
          setLoading(false);
          return;
        }
      }

      // Retry once after 400ms if initial request failed (e.g. cookie timing)
      if (retryCount < 2) {
        setTimeout(() => fetchUser(retryCount + 1), 400);
        return;
      }

      // Clear cache if confirmed unauthenticated after retries
      try {
        sessionStorage.removeItem("zyka_user_cache");
      } catch {}
      setUser(null);
    } catch {
      if (retryCount < 2) {
        setTimeout(() => fetchUser(retryCount + 1), 400);
        return;
      }
      try {
        sessionStorage.removeItem("zyka_user_cache");
      } catch {}
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogoSettings();
    fetchMenuOrder();

    const isLoginPage = pathname === "/login" || pathname === "/zyka/login";
    if (!isLoginPage) {
      fetchUser();
    } else {
      setUser(null);
      setLoading(false);
    }

    // Auto-close mobile drawer on route navigation
    setIsMobileMenuOpen(false);

    // Listen for custom events to update logo, menu ordering & user session live without manual page refresh
    const handleLogoUpdate = () => fetchLogoSettings();
    const handleMenuUpdate = () => fetchMenuOrder();
    const handleUserUpdate = () => fetchUser();

    window.addEventListener("zyka-logo-updated", handleLogoUpdate);
    window.addEventListener("zyka-menu-updated", handleMenuUpdate);
    window.addEventListener("zyka-user-updated", handleUserUpdate);

    return () => {
      window.removeEventListener("zyka-logo-updated", handleLogoUpdate);
      window.removeEventListener("zyka-menu-updated", handleMenuUpdate);
      window.removeEventListener("zyka-user-updated", handleUserUpdate);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      try {
        sessionStorage.clear();
        localStorage.clear();
      } catch {}
      await fetch(getApiPath("/api/auth/logout"), { method: "POST", credentials: "same-origin" });
      setUser(null);
      setIsMobileMenuOpen(false);
      window.location.replace(getApiPath("/login"));
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.replace(getApiPath("/login"));
    }
  };

  const getLabel = (key: string, fallback: string) => menuCustomLabels[key] || fallback;

  // Never render Navbar on /login page or /orders/print pages
  if (
    pathname === "/login" ||
    pathname === "/zyka/login" ||
    pathname?.endsWith("/login") ||
    pathname?.includes("/orders/print")
  ) {
    return null;
  }

  return (
    <nav className="glass-earth-header sticky top-0 z-50 border-b border-[#2d4734] print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Desktop Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="flex items-center gap-3 group shrink-0"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {logoUrl ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#18241c] border border-[#98c9a3]/40 flex items-center justify-center p-1 shadow-md group-hover:border-[#98c9a3] transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
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

            {/* Desktop Navigation Links (Allowed per User Permissions) */}
            {user && (
              <div className="hidden md:flex items-center space-x-1.5">
                {menuOrder.map((key) => {
                  if (key === "dashboard" && hasAccess(user, "/dashboard")) {
                    return (
                      <NavLink
                        key="dashboard"
                        href="/dashboard"
                        icon={<LayoutDashboard className="w-4 h-4" />}
                        label={getLabel("dashboard", "Dashboard")}
                        active={pathname === "/dashboard" || pathname === "/zyka/dashboard"}
                      />
                    );
                  }
                  if (key === "reports") {
                    return <ReportsDropdown key="reports" pathname={pathname} user={user} subOrder={reportsSubOrder} menuCustomLabels={menuCustomLabels} />;
                  }
                  if (key === "datarecords") {
                    return <DataRecordsDropdown key="datarecords" pathname={pathname} user={user} subOrder={dataRecordsSubOrder} menuCustomLabels={menuCustomLabels} />;
                  }
                  if (key === "manage" && user.role === "admin") {
                    return (
                      <div key="manage" className="pl-2 border-l border-[#2d4734]">
                        <AdminManageDropdown pathname={pathname} subOrder={manageSubOrder} menuCustomLabels={menuCustomLabels} />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          {/* Right: Desktop User Profile Status OR Mobile Toggle Button */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Desktop User Status & Logout */}
            {user && (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/change-password"
                  title="คลิกเพื่อเปลี่ยนรหัสผ่าน (Change Password)"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#18241c] border border-[#98c9a3]/30 hover:border-[#98c9a3] hover:bg-[#1e3024] transition-all cursor-pointer group shadow-md"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#2a4332] group-hover:bg-[#365741] flex items-center justify-center text-[#98c9a3] transition-colors shrink-0">
                    {user.role === "admin" ? (
                      <Shield className="w-4 h-4 text-[#98c9a3]" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-[#e6dfd3]" />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-extrabold text-[#f3efe6] line-clamp-1 max-w-[130px]">
                      {user.name || user.username}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase leading-none ${
                        user.role === "admin" ? "text-[#98c9a3]" : "text-[#a39b8b]"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#1f3025] transition-colors border border-[#2d4734] hover:border-[#98c9a3]/40"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            {user && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-[#18241c] text-[#98c9a3] border border-[#98c9a3]/30 hover:bg-[#1e3024] transition-colors focus:outline-none"
                aria-label="Toggle Mobile Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER OVERLAY */}
      {user && isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#2d4734] bg-[#0f1712]/95 backdrop-blur-2xl p-4 space-y-4 animate-in slide-in-from-top-3 duration-200 shadow-2xl">
          {/* Mobile User Profile Summary */}
          <div className="p-3.5 rounded-2xl bg-[#18241c] border border-[#98c9a3]/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2a4332] flex items-center justify-center text-[#98c9a3]">
                {user.role === "admin" ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5 text-[#e6dfd3]" />}
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#f3efe6]">{user.name || user.username}</p>
                <span className="text-[10px] font-black uppercase text-[#98c9a3] bg-[#2a4332]/50 px-2 py-0.5 rounded-full border border-[#98c9a3]/30">
                  {user.role}
                </span>
              </div>
            </div>

            <Link
              href="/change-password"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl bg-[#1e3024] text-[#98c9a3] hover:text-[#f3efe6] border border-[#98c9a3]/20 text-xs font-semibold flex items-center gap-1"
            >
              <KeyRound className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Navigation Links */}
          <div className="space-y-1.5">
            {menuOrder.map((key) => {
              if (key === "dashboard" && hasAccess(user, "/dashboard")) {
                return (
                  <Link
                    key="mobile-dashboard"
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-all ${
                      pathname === "/dashboard" || pathname === "/zyka/dashboard"
                        ? "bg-[#273e2e] text-[#98c9a3] border border-[#98c9a3]/40 shadow-sm"
                        : "text-[#e6dfd3] bg-[#121c15] border border-[#2d4734]/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-4 h-4 text-[#98c9a3]" />
                      <span>{getLabel("dashboard", "Dashboard")}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#a39b8b]" />
                  </Link>
                );
              }

              if (key === "reports") {
                const isSalesAllowed = isSubTabAllowed(user, "sales");
                const isChartsAllowed = isSubTabAllowed(user, "charts");
                const isCustomerAllowed = isSubTabAllowed(user, "customer");
                const isProductAllowed = isSubTabAllowed(user, "product");
                const isSalespersonAllowed = isSubTabAllowed(user, "salesperson");
                const isUserAllowed = isSubTabAllowed(user, "user");
                const hasAnyReports = isSalesAllowed || isChartsAllowed || isCustomerAllowed || isProductAllowed || isSalespersonAllowed || isUserAllowed;

                if (!hasAnyReports) return null;

                return (
                  <div key="mobile-reports" className="rounded-xl bg-[#121c15] border border-[#2d4734]/60 overflow-hidden">
                    <button
                      onClick={() => setMobileReportsOpen(!mobileReportsOpen)}
                      className="w-full flex items-center justify-between p-3 text-sm font-bold text-[#e6dfd3]"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#98c9a3]" />
                        <span>{getLabel("reports", "Reports")}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#a39b8b] transition-transform ${mobileReportsOpen ? "rotate-180 text-[#98c9a3]" : ""}`} />
                    </button>

                    {mobileReportsOpen && (
                      <div className="p-2 space-y-1 bg-[#18241c]/80 border-t border-[#2d4734]/40">
                        {reportsSubOrder.map((subKey) => {
                          if (subKey === "sales" && isSalesAllowed) {
                            return (
                              <Link
                                key="m-sales"
                                href="/reports?tab=sales"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]"
                              >
                                <TrendingUp className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("sales", "📊 สรุปยอดขาย (Sales Summary)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "charts" && isChartsAllowed) {
                            return (
                              <Link
                                key="m-charts"
                                href="/reports?tab=charts"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]"
                              >
                                <BarChart3 className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("charts", "📈 กราฟวิเคราะห์ (Sales Charts)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "customer" && isCustomerAllowed) {
                            return (
                              <Link
                                key="m-customer"
                                href="/reports?tab=customer"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]"
                              >
                                <Users className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("customer", "👥 สรุปตามลูกค้า (Sales by Customer)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "product" && isProductAllowed) {
                            return (
                              <Link
                                key="m-product"
                                href="/reports?tab=product"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]"
                              >
                                <Package className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("product", "📦 สรุปตามสินค้า (Sales by Product)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "salesperson" && isSalespersonAllowed) {
                            return (
                              <Link
                                key="m-salesperson"
                                href="/reports?tab=salesperson"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("salesperson", "👔 สรุปตามพนักงานขาย (Salesperson)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "user" && isUserAllowed) {
                            return (
                              <Link
                                key="m-user"
                                href="/reports?tab=user"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]"
                              >
                                <Activity className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("user", "👤 ประวัติผู้ใช้งาน (User Logs)")}</span>
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

              if (key === "datarecords") {
                const isOrdersAllowed = hasAccess(user, "/orders");
                const isCategoriesAllowed = hasAccess(user, "/categories");
                const isSubCategoriesAllowed = hasAccess(user, "/sub-categories");
                const isProductsAllowed = hasAccess(user, "/products");
                const isInventoryAllowed = hasAccess(user, "/inventory");
                const isLocationsAllowed = hasAccess(user, "/locations");
                const isPersonnelAllowed = hasAccess(user, "/personnel");
                const isPositionsAllowed = hasAccess(user, "/positions");
                const isCustomersAllowed = hasAccess(user, "/customers");
                const hasAnyData = isOrdersAllowed || isCategoriesAllowed || isSubCategoriesAllowed || isProductsAllowed || isInventoryAllowed || isLocationsAllowed || isPersonnelAllowed || isPositionsAllowed || isCustomersAllowed;

                if (!hasAnyData) return null;

                return (
                  <div key="mobile-datarecords" className="rounded-xl bg-[#121c15] border border-[#2d4734]/60 overflow-hidden">
                    <button
                      onClick={() => setMobileDataOpen(!mobileDataOpen)}
                      className="w-full flex items-center justify-between p-3 text-sm font-bold text-[#e6dfd3]"
                    >
                      <div className="flex items-center gap-3">
                        <FolderKanban className="w-4 h-4 text-[#98c9a3]" />
                        <span>{getLabel("datarecords", "Data Records")}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#a39b8b] transition-transform ${mobileDataOpen ? "rotate-180 text-[#98c9a3]" : ""}`} />
                    </button>

                    {mobileDataOpen && (
                      <div className="p-2 space-y-1 bg-[#18241c]/80 border-t border-[#2d4734]/40">
                        {(() => {
                          const ALL_DATA = ["orders", "products", "inventory", "categories", "sub-categories", "locations", "personnel", "positions", "customers"];
                          const effectiveMobileDataOrder = [...dataRecordsSubOrder];
                          ALL_DATA.forEach((k) => {
                            if (!effectiveMobileDataOrder.includes(k)) effectiveMobileDataOrder.push(k);
                          });
                          return effectiveMobileDataOrder.map((subKey) => {
                          if (subKey === "orders" && isOrdersAllowed) {
                            return (
                              <Link key="m-orders" href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]">
                                <ShoppingBag className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("orders", "Orders (บันทึกสั่งซื้อ & ใบเสร็จ)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "categories" && isCategoriesAllowed) {
                            return (
                              <Link key="m-categories" href="/categories" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]">
                                <Tags className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("categories", "Categories (ประเภทหมวดสินค้า)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "sub-categories" && isSubCategoriesAllowed) {
                            return (
                              <Link key="m-sub-categories" href="/sub-categories" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]">
                                <FolderTree className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("sub-categories", "Sub-Categories (หมวดสินค้า)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "products" && isProductsAllowed) {
                            return (
                              <Link key="m-products" href="/products" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]">
                                <Package className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("products", "Products (บันทึกสินค้า)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "inventory" && isInventoryAllowed) {
                            return (
                              <Link key="m-inventory" href="/inventory" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]">
                                <Boxes className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("inventory", "Inventory (จัดการสต็อกสินค้า)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "locations" && isLocationsAllowed) {
                            return (
                              <Link key="m-locations" href="/locations" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]">
                                <Warehouse className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("locations", "Locations (สถานที่เก็บสินค้า)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "personnel" && isPersonnelAllowed) {
                            return (
                              <Link key="m-personnel" href="/personnel" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]">
                                <Users className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("personnel", "Personnel (ข้อมูลบุคลากร)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "positions" && isPositionsAllowed) {
                            return (
                              <Link key="m-positions" href="/positions" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]">
                                <Briefcase className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("positions", "Positions (ข้อมูลตำแหน่งงาน)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "customers" && isCustomersAllowed) {
                            return (
                              <Link key="m-customers" href="/customers" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]">
                                <Contact className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("customers", "Customers (ข้อมูลลูกค้า)")}</span>
                              </Link>
                            );
                          }
                          return null;
                        });
                      })()}
                      </div>
                    )}
                  </div>
                );
              }

              if (key === "manage" && user.role === "admin") {
                return (
                  <div key="mobile-manage" className="rounded-xl bg-[#121c15] border border-[#2d4734]/60 overflow-hidden">
                    <button
                      onClick={() => setMobileAdminOpen(!mobileAdminOpen)}
                      className="w-full flex items-center justify-between p-3 text-sm font-bold text-[#e6dfd3]"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-[#98c9a3]" />
                        <span>{getLabel("manage", "Manage")}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#446e50]/40 text-[#98c9a3] border border-[#98c9a3]/30 font-semibold">
                          Admin
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#a39b8b] transition-transform ${mobileAdminOpen ? "rotate-180 text-[#98c9a3]" : ""}`} />
                    </button>

                    {mobileAdminOpen && (
                      <div className="p-2 space-y-1 bg-[#18241c]/80 border-t border-[#2d4734]/40">
                        {manageSubOrder.map((subKey) => {
                          if (subKey === "create-user") {
                            return (
                              <Link key="m-create-user" href="/admin/create-user" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]">
                                <UserPlus className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("create-user", "Create User (สร้างผู้ใช้)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "manage-permissions") {
                            return (
                              <Link key="m-manage-permissions" href="/admin/manage-permissions" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]">
                                <Sliders className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("manage-permissions", "Permissions (จัดการสิทธิ์)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "manage-menu-order") {
                            return (
                              <Link key="m-manage-menu-order" href="/admin/manage-menu-order" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]">
                                <ListOrdered className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("manage-menu-order", "Menu Order (จัดลำดับและตั้งชื่อเมนู)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "manage-logo") {
                            return (
                              <Link key="m-manage-logo" href="/admin/manage-logo" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]">
                                <Leaf className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("manage-logo", "Logo & Branding (จัดการโลโก้)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "manage-line") {
                            return (
                              <Link key="m-manage-line" href="/admin/manage-line" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]">
                                <MessageSquare className="w-3.5 h-3.5 text-[#00b900]" />
                                <span>{getLabel("manage-line", "LINE Messaging API (เช็คสต็อกผ่าน LINE)")}</span>
                              </Link>
                            );
                          }
                          if (subKey === "user-logs") {
                            return (
                              <Link key="m-user-logs" href="/admin/user-logs" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#e6dfd3] hover:text-[#98c9a3]">
                                <Activity className="w-3.5 h-3.5 text-[#98c9a3]" />
                                <span>{getLabel("user-logs", "User Logs (ประวัติการใช้งาน)")}</span>
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
              return null;
            })}
          </div>

          {/* Mobile Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-950/40 text-red-300 border border-red-800/40 text-sm font-bold hover:bg-red-900/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  icon,
  label,
  active,
  isAllowed = true,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  isAllowed?: boolean;
}) {
  if (!isAllowed) return null;

  return (
    <Link
      href={href}
      className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
        active
          ? "bg-[#273e2e] text-[#98c9a3] border border-[#98c9a3]/30 shadow-sm font-bold"
          : "text-[#e6dfd3]/80 hover:text-[#f3efe6] hover:bg-[#18241c]"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function DataRecordsDropdown({
  pathname,
  user,
  subOrder = ["orders", "products", "inventory", "categories", "sub-categories", "locations", "personnel", "positions", "customers"],
  menuCustomLabels = {},
}: {
  pathname: string;
  user: UserProfile;
  subOrder?: string[];
  menuCustomLabels?: Record<string, string>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getLabel = (key: string, fallback: string) => menuCustomLabels[key] || fallback;

  const isOrdersAllowed = hasAccess(user, "/orders");
  const isCategoriesAllowed = hasAccess(user, "/categories");
  const isSubCategoriesAllowed = hasAccess(user, "/sub-categories");
  const isProductsAllowed = hasAccess(user, "/products");
  const isInventoryAllowed = hasAccess(user, "/inventory");
  const isLocationsAllowed = hasAccess(user, "/locations");
  const isPersonnelAllowed = hasAccess(user, "/personnel");
  const isPositionsAllowed = hasAccess(user, "/positions");
  const isCustomersAllowed = hasAccess(user, "/customers");

  const hasAnyAccess = isOrdersAllowed || isCategoriesAllowed || isSubCategoriesAllowed || isProductsAllowed || isInventoryAllowed || isLocationsAllowed || isPersonnelAllowed || isPositionsAllowed || isCustomersAllowed;

  const isDataActive = pathname === "/orders" || pathname === "/categories" || pathname === "/sub-categories" || pathname === "/products" || pathname === "/inventory" || pathname === "/locations" || pathname === "/personnel" || pathname === "/positions" || pathname === "/customers";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ALL_DATA_KEYS = ["orders", "products", "inventory", "categories", "sub-categories", "locations", "personnel", "positions", "customers"];
  const effectiveSubOrder = Array.isArray(subOrder) ? [...subOrder] : ALL_DATA_KEYS;
  ALL_DATA_KEYS.forEach((k) => {
    if (!effectiveSubOrder.includes(k)) {
      effectiveSubOrder.push(k);
    }
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
          isDataActive || isOpen
            ? "bg-[#273e2e] text-[#98c9a3] border border-[#98c9a3]/30 shadow-sm font-bold"
            : "text-[#e6dfd3]/80 hover:text-[#f3efe6] hover:bg-[#18241c]"
        }`}
      >
        <FolderKanban className="w-4 h-4 text-[#98c9a3]" />
        <span>{getLabel("datarecords", "Data Records")}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#98c9a3]" : "text-[#a39b8b]"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#0f1712] border border-[#98c9a3]/30 shadow-2xl backdrop-blur-xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {effectiveSubOrder.map((key) => {
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
                  <span>{getLabel("orders", "Orders (บันทึกสั่งซื้อ & ใบเสร็จ)")}</span>
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
                  <span>{getLabel("categories", "Categories (ประเภทหมวดสินค้า)")}</span>
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
                  <span>{getLabel("sub-categories", "Sub-Categories (หมวดสินค้า)")}</span>
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
                  <span>{getLabel("products", "Products (บันทึกสินค้า)")}</span>
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
                  <span>{getLabel("inventory", "Inventory (จัดการสต็อกสินค้า)")}</span>
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
                  <span>{getLabel("locations", "Locations (สถานที่เก็บสินค้า)")}</span>
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
                  <span>{getLabel("personnel", "Personnel (ข้อมูลบุคลากร)")}</span>
                </Link>
              );
            }
            if (key === "positions" && isPositionsAllowed) {
              return (
                <Link
                  key="positions"
                  href="/positions"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/positions" ? "bg-[#1f3025] text-[#98c9a3] border border-[#98c9a3]/30 font-semibold" : "text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3]"
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-[#98c9a3]" />
                  <span>{getLabel("positions", "Positions (ข้อมูลตำแหน่งงาน)")}</span>
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
                  <span>{getLabel("customers", "Customers (ข้อมูลลูกค้า)")}</span>
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
  menuCustomLabels = {},
}: {
  pathname: string;
  subOrder?: string[];
  menuCustomLabels?: Record<string, string>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getLabel = (key: string, fallback: string) => menuCustomLabels[key] || fallback;

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
        className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
          isAdminActive || isOpen
            ? "bg-[#273e2e] text-[#98c9a3] border border-[#98c9a3]/30 shadow-sm font-bold"
            : "text-[#e6dfd3]/80 hover:text-[#f3efe6] hover:bg-[#18241c]"
        }`}
      >
        <Shield className="w-4 h-4 text-[#98c9a3]" />
        <span>{getLabel("manage", "Manage")}</span>
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
                  <span>{getLabel("create-user", "Create User (สร้างผู้ใช้)")}</span>
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
                  <span>{getLabel("manage-permissions", "Permissions (จัดการสิทธิ์)")}</span>
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
                  <span>{getLabel("manage-menu-order", "Menu Order (จัดลำดับและตั้งชื่อเมนู)")}</span>
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
                  <span>{getLabel("manage-logo", "Logo & Branding (จัดการโลโก้)")}</span>
                </Link>
              );
            }
            if (key === "manage-line") {
              return (
                <Link
                  key="manage-line"
                  href="/admin/manage-line"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    pathname === "/admin/manage-line" ? "bg-[#1f3025] text-[#00b900] border border-[#00b900]/30 font-semibold" : "text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#00b900]"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-[#00b900]" />
                  <span>{getLabel("manage-line", "LINE Messaging API (เช็คสต็อกผ่าน LINE)")}</span>
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
                  <span>{getLabel("user-logs", "User Logs (ประวัติการใช้งาน)")}</span>
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
  subOrder = ["sales", "charts", "customer", "product", "salesperson", "user"],
  menuCustomLabels = {},
}: {
  pathname: string;
  user: UserProfile;
  subOrder?: string[];
  menuCustomLabels?: Record<string, string>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getLabel = (key: string, fallback: string) => menuCustomLabels[key] || fallback;

  const isSalesAllowed = isSubTabAllowed(user, "sales");
  const isChartsAllowed = isSubTabAllowed(user, "charts");
  const isCustomerAllowed = isSubTabAllowed(user, "customer");
  const isProductAllowed = isSubTabAllowed(user, "product");
  const isSalespersonAllowed = isSubTabAllowed(user, "salesperson");
  const isUserAllowed = isSubTabAllowed(user, "user");

  const hasAnyAccess = isSalesAllowed || isChartsAllowed || isCustomerAllowed || isProductAllowed || isSalespersonAllowed || isUserAllowed;

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
        className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
          isReportActive || isOpen
            ? "bg-[#273e2e] text-[#98c9a3] border border-[#98c9a3]/30 shadow-sm font-bold"
            : "text-[#e6dfd3]/80 hover:text-[#f3efe6] hover:bg-[#18241c]"
        }`}
      >
        <FileText className="w-4 h-4 text-[#98c9a3]" />
        <span>{getLabel("reports", "Reports")}</span>
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
                  <span>{getLabel("sales", "📊 สรุปยอดขาย (Sales Summary)")}</span>
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
                  <span>{getLabel("charts", "📈 กราฟวิเคราะห์ (Sales Charts)")}</span>
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
                  <span>{getLabel("customer", "👥 สรุปตามลูกค้า (Sales by Customer)")}</span>
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
                  <span>{getLabel("product", "📦 สรุปตามสินค้า (Sales by Product)")}</span>
                </Link>
              );
            }
            if (key === "salesperson" && isSalespersonAllowed) {
              return (
                <Link
                  key="salesperson"
                  href="/reports?tab=salesperson"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#e6dfd3] hover:bg-[#18241c] hover:text-[#98c9a3] transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-[#98c9a3]" />
                  <span>{getLabel("salesperson", "👔 สรุปตามพนักงานขาย (Salesperson)")}</span>
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
                  <span>{getLabel("user", "👤 ประวัติผู้ใช้งาน (User Logs)")}</span>
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

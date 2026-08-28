"use client";

import { getApiPath } from "@/app/utils/apiPath";

import { useEffect, useState } from "react";
import {
  Sliders,
  Shield,
  User as UserIcon,
  CheckCircle2,
  RefreshCw,
  Search,
  Edit,
  Trash2,
  X,
  AlertCircle,
  KeyRound,
  UserCheck,
  Briefcase,
  Phone,
  LayoutDashboard,
  FolderKanban,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  ShoppingBag,
  Package,
  Boxes,
  Tags,
  FolderTree,
  Warehouse,
  Users,
  Contact,
  TrendingUp,
  BarChart3,
  Activity,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface PersonnelOption {
  _id: string;
  prefix: string;
  fullname: string;
  position: string;
  phone?: string;
  note?: string;
}

interface UserItem {
  _id: string;
  name: string;
  username: string;
  role: "admin" | "user";
  allowedPages: string[];
  referId?: any;
}

interface PageDef {
  path: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface PageGroup {
  groupKey: string;
  groupTitle: string;
  groupDescription: string;
  icon: React.ReactNode;
  pages: PageDef[];
}

const PAGE_GROUPS: PageGroup[] = [
  {
    groupKey: "main",
    groupTitle: "🏠 หน้าหลัก (Main Pages)",
    groupDescription: "หน้าเริ่มต้นสำหรับการเข้าใช้งานระบบ",
    icon: <LayoutDashboard className="w-5 h-5 text-[#98c9a3]" />,
    pages: [
      {
        path: "/dashboard",
        label: "Dashboard",
        description: "หน้าแดชบอร์ดสรุปภาพรวมระบบ",
        icon: <LayoutDashboard className="w-4 h-4 text-[#98c9a3]" />,
      },
    ],
  },
  {
    groupKey: "data",
    groupTitle: "📁 บันทึกข้อมูลระบบ (Data Records)",
    groupDescription: "หน้าจัดการและบันทึกข้อมูลหลัก สั่งซื้อ สต็อก และลูกค้า",
    icon: <FolderKanban className="w-5 h-5 text-[#98c9a3]" />,
    pages: [
      {
        path: "/orders",
        label: "Orders (สั่งซื้อ & ใบเสร็จ)",
        description: "บันทึกรายการสั่งซื้อและพิมพ์ใบเสร็จ",
        icon: <ShoppingBag className="w-4 h-4 text-[#98c9a3]" />,
      },
      {
        path: "/products",
        label: "Products (บันทึกสินค้า)",
        description: "จัดการรายการสินค้าและรหัสสินค้า",
        icon: <Package className="w-4 h-4 text-[#98c9a3]" />,
      },
      {
        path: "/inventory",
        label: "Inventory (สต็อกสินค้า)",
        description: "จัดการและติดตามยอดสต็อกสินค้าคงเหลือ",
        icon: <Boxes className="w-4 h-4 text-[#98c9a3]" />,
      },
      {
        path: "/categories",
        label: "Categories (ประเภทหมวด)",
        description: "จัดการประเภทหลักของหมวดสินค้า",
        icon: <Tags className="w-4 h-4 text-[#98c9a3]" />,
      },
      {
        path: "/sub-categories",
        label: "Sub-Categories (หมวดสินค้า)",
        description: "จัดการหมวดย่อยของสินค้า",
        icon: <FolderTree className="w-4 h-4 text-[#98c9a3]" />,
      },
      {
        path: "/locations",
        label: "Locations (สถานที่เก็บ)",
        description: "จัดการคลังและสถานที่จัดเก็บสินค้า",
        icon: <Warehouse className="w-4 h-4 text-[#98c9a3]" />,
      },
      {
        path: "/personnel",
        label: "Personnel (พนักงาน)",
        description: "จัดการข้อมูลรายชื่อและตำแหน่งพนักงาน",
        icon: <Users className="w-4 h-4 text-[#98c9a3]" />,
      },
      {
        path: "/customers",
        label: "Customers (ลูกค้า)",
        description: "จัดการข้อมูลรายชื่อและที่อยู่ลูกค้า",
        icon: <Contact className="w-4 h-4 text-[#98c9a3]" />,
      },
    ],
  },
  {
    groupKey: "reports",
    groupTitle: "📋 หน้ารายงาน & สถิติ (Reports & Analytics)",
    groupDescription: "หน้ารายงานสรุปยอดขาย กราฟวิเคราะห์ และประวัติผู้ใช้งาน",
    icon: <FileText className="w-5 h-5 text-[#98c9a3]" />,
    pages: [
      {
        path: "/reports",
        label: "Reports (ทุกหน้ารายงาน)",
        description: "สิทธิ์เข้าถึงหน้ารายงานสรุปทุกส่วน",
        icon: <FileText className="w-4 h-4 text-[#98c9a3]" />,
      },
      {
        path: "/reports?tab=sales",
        label: "📊 สรุปยอดขาย (Sales Summary)",
        description: "รายงานสรุปยอดขายรายวัน/เดือน และการชำระเงิน",
        icon: <TrendingUp className="w-4 h-4 text-[#98c9a3]" />,
      },
      {
        path: "/reports?tab=charts",
        label: "📈 กราฟวิเคราะห์ (Sales Charts)",
        description: "กราฟวิเคราะห์แนวโน้มยอดขายสินค้า",
        icon: <BarChart3 className="w-4 h-4 text-[#98c9a3]" />,
      },
      {
        path: "/reports?tab=customer",
        label: "👥 สรุปตามลูกค้า (Sales by Customer)",
        description: "รายงานสรุปยอดซื้อและยอดค้างชำระลูกค้า",
        icon: <Users className="w-4 h-4 text-[#98c9a3]" />,
      },
      {
        path: "/reports?tab=product",
        label: "📦 สรุปตามสินค้า (Sales by Product)",
        description: "รายงานสรุปยอดขายตามรายการสินค้า",
        icon: <Package className="w-4 h-4 text-[#98c9a3]" />,
      },
      {
        path: "/reports?tab=user",
        label: "👤 ประวัติผู้ใช้งาน (User Logs)",
        description: "รายงานบันทึกประวัติการล็อกอินและใช้งานระบบ",
        icon: <Activity className="w-4 h-4 text-[#98c9a3]" />,
      },
      {
        path: "/analytics",
        label: "Analytics (กราฟวิเคราะห์รวม)",
        description: "หน้ารวมกราฟวิเคราะห์การขายและอันดับสินค้าขายดี",
        icon: <BarChart3 className="w-4 h-4 text-[#98c9a3]" />,
      },
    ],
  },
];

export default function ManagePermissionsPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [personnelList, setPersonnelList] = useState<PersonnelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

  // Expanded User Card ID State for Inline Permission Management
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "user">("user");
  const [editAllowedPages, setEditAllowedPages] = useState<string[]>([]);
  const [editReferId, setEditReferId] = useState<string>("");
  const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelOption | null>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // Personnel Selection Sub-Modal State
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [personnelSearch, setPersonnelSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const [usersRes, meRes, personnelRes] = await Promise.all([
        fetch(getApiPath("/api/admin/users"), { cache: "no-store" }),
        fetch(getApiPath("/api/auth/me"), { cache: "no-store" }),
        fetch(getApiPath("/api/personnel"), { cache: "no-store" }),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentAdminId(meData.user?.id || null);
      }
      if (personnelRes.ok) {
        const pData = await personnelRes.json();
        setPersonnelList(pData.personnel || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const saveAllowedPages = async (userId: string, role: string, newAllowedPages: string[], userDisplayName: string) => {
    setSavingId(userId);

    try {
      const res = await fetch(getApiPath(`/api/admin/users/${userId}/permissions`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          allowedPages: newAllowedPages,
        }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, allowedPages: newAllowedPages } : u))
        );
        setSuccessMsg(`อัปเดตสิทธิ์ของ ${userDisplayName} เรียบร้อยแล้ว`);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const toggleSinglePage = (user: UserItem, pagePath: string) => {
    const isCurrentlyAllowed = user.allowedPages.includes(pagePath);
    let newPages: string[];
    if (isCurrentlyAllowed) {
      newPages = user.allowedPages.filter((p) => p !== pagePath);
    } else {
      newPages = [...user.allowedPages, pagePath];
    }
    saveAllowedPages(user._id, user.role, newPages, user.name);
  };

  const toggleGroupAllPages = (user: UserItem, groupPages: PageDef[]) => {
    const groupPaths = groupPages.map((p) => p.path);
    const allInGroupAllowed = groupPaths.every((p) => user.allowedPages.includes(p));

    let newPages: string[];
    if (allInGroupAllowed) {
      // Uncheck all in group
      newPages = user.allowedPages.filter((p) => !groupPaths.includes(p));
    } else {
      // Check all in group
      const union = new Set([...user.allowedPages, ...groupPaths]);
      newPages = Array.from(union);
    }

    saveAllowedPages(user._id, user.role, newPages, user.name);
  };

  const handleRoleChange = async (user: UserItem, newRole: "admin" | "user") => {
    setSavingId(user._id);

    try {
      const res = await fetch(getApiPath(`/api/admin/users/${user._id}/permissions`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: newRole,
          allowedPages: user.allowedPages,
        }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
        );
        setSuccessMsg(`เปลี่ยนบทบาทของ ${user.name} เป็น ${newRole === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งานทั่วไป"} เรียบร้อย`);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  // Open Edit User Modal
  const openEditModal = (user: UserItem) => {
    setEditingUser(user);
    setEditName(user.name || "");
    setEditUsername(user.username || "");
    setEditPassword("");
    setEditRole(user.role || "user");
    setEditAllowedPages(user.allowedPages || []);

    const refId =
      typeof user.referId === "object" && user.referId !== null
        ? user.referId._id
        : user.referId || "";

    setEditReferId(refId);

    if (refId) {
      const found = personnelList.find((p) => p._id === refId);
      setSelectedPersonnel(found || (typeof user.referId === "object" ? user.referId : null));
    } else {
      setSelectedPersonnel(null);
    }

    setModalError("");
    setIsEditModalOpen(true);
  };

  const handleSelectPersonnel = (p: PersonnelOption) => {
    setSelectedPersonnel(p);
    setEditReferId(p._id);
    const formattedName = `${p.prefix || ""} ${p.fullname}`.trim();
    setEditName(formattedName);
    setIsPersonnelModalOpen(false);
  };

  const handleClearPersonnel = () => {
    setSelectedPersonnel(null);
    setEditReferId("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setModalError("");
    setModalSaving(true);

    try {
      const res = await fetch(getApiPath(`/api/admin/users/${editingUser._id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          username: editUsername,
          newPassword: editPassword || undefined,
          role: editRole,
          allowedPages: editAllowedPages,
          referId: editReferId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้");

      setSuccessMsg(`แก้ไขข้อมูลผู้ใช้งาน "${editName}" สำเร็จ!`);
      setIsEditModalOpen(false);
      fetchUsers();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteUser = async (user: UserItem) => {
    if (user._id === currentAdminId) {
      alert("ไม่สามารถลบบัญชีผู้ใช้ของตัวคุณเองได้");
      return;
    }

    if (!confirm(`คุณต้องการลบผู้ใช้งาน "${user.name}" (@${user.username}) ออกจากระบบใช่หรือไม่?`)) {
      return;
    }

    try {
      const res = await fetch(getApiPath(`/api/admin/users/${user._id}`), {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถลบผู้ใช้งานได้");

      setSuccessMsg(`ลบผู้ใช้งาน "${user.name}" เรียบร้อยแล้ว`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPersonnel = personnelList.filter(
    (p) =>
      p.fullname.toLowerCase().includes(personnelSearch.toLowerCase()) ||
      (p.position && p.position.toLowerCase().includes(personnelSearch.toLowerCase())) ||
      (p.phone && p.phone.toLowerCase().includes(personnelSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#446e50] to-[#1f3627] border border-[#98c9a3]/40 flex items-center justify-center">
            <Sliders className="w-6 h-6 text-[#98c9a3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gradient-earth">
                จัดการสิทธิ์การเข้าถึง (Grouped Permissions Management)
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-[#446e50]/40 text-[#98c9a3] border border-[#98c9a3]/30 font-semibold">
                Admin Only
              </span>
            </div>
            <p className="text-xs text-[#a39b8b]">
              กำหนดสิทธิ์การเข้าถึงโดยแบ่งตามกลุ่มเมนูหลัก กลุ่มข้อมูลระบบ และกลุ่มหน้ารายงาน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="p-2.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] border border-[#2d4734] transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/create-user"
            className="btn-earth-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>สร้างผู้ใช้งานใหม่</span>
          </Link>
        </div>
      </div>

      {/* Alert Success */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#1e3425] border border-[#98c9a3]/50 text-[#98c9a3] text-sm flex items-center gap-3 animate-bounce shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-[#98c9a3] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="glass-earth-card p-4 rounded-2xl border border-[#2d4734] flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ Username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
          />
        </div>
        <div className="text-xs text-[#a39b8b]">
          ผู้ใช้งานทั้งหมด: <span className="font-bold text-[#f3efe6]">{users.length}</span> คน
        </div>
      </div>

      {/* Grouped User Cards List */}
      {loading ? (
        <div className="glass-earth-card p-12 rounded-3xl border border-[#2d4734] text-center text-[#a39b8b]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#98c9a3]" />
          กำลังโหลดข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึง...
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => {
            const isAdmin = user.role === "admin";
            const isCurrentAdmin = user._id === currentAdminId;
            const isExpanded = expandedUserId === user._id;

            // Calculate allowed counts per group
            const dataGroup = PAGE_GROUPS.find((g) => g.groupKey === "data")!;
            const reportsGroup = PAGE_GROUPS.find((g) => g.groupKey === "reports")!;

            const dataAllowedCount = isAdmin
              ? dataGroup.pages.length
              : dataGroup.pages.filter((p) => user.allowedPages.includes(p.path)).length;

            const reportsAllowedCount = isAdmin
              ? reportsGroup.pages.length
              : reportsGroup.pages.filter((p) => user.allowedPages.includes(p.path)).length;

            return (
              <div
                key={user._id}
                className="glass-earth-card rounded-3xl border border-[#2d4734] hover:border-[#98c9a3]/40 transition-all overflow-hidden shadow-sm"
              >
                {/* User Card Main Row Header */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121c15]">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                        isAdmin
                          ? "bg-[#446e50] text-[#f3efe6] border-[#98c9a3]/40 shadow"
                          : "bg-[#18241c] text-[#e6dfd3] border-[#2d4734]"
                      }`}
                    >
                      {isAdmin ? <Shield className="w-5 h-5 text-[#98c9a3]" /> : <UserIcon className="w-5 h-5 text-[#98c9a3]" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-[#f3efe6] text-base">{user.name}</h3>
                        {isCurrentAdmin && (
                          <span className="text-[10px] bg-[#1e3425] text-[#98c9a3] px-2 py-0.5 rounded-full border border-[#98c9a3]/30 font-semibold">
                            คุณ (บัญชีปัจจุบัน)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#a39b8b] mt-1">
                        <span className="font-mono">@{user.username}</span>
                        <span>•</span>
                        {/* Role Selector */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold">บทบาท:</span>
                          <select
                            value={user.role}
                            disabled={savingId === user._id || isCurrentAdmin}
                            onChange={(e) => handleRoleChange(user, e.target.value as "admin" | "user")}
                            className="bg-[#0f1712] text-[#98c9a3] text-xs px-2 py-0.5 rounded-lg border border-[#98c9a3]/30 font-bold focus:outline-none disabled:opacity-50"
                          >
                            <option value="user">USER</option>
                            <option value="admin">ADMIN</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Badges & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#2d4734]">
                    {/* Permission Count Badges */}
                    {!isAdmin ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-xl bg-[#18241c] border border-[#2d4734] text-[#e6dfd3] flex items-center gap-1.5">
                          <FolderKanban className="w-3.5 h-3.5 text-[#98c9a3]" />
                          <span>ข้อมูล: <strong className="text-[#98c9a3]">{dataAllowedCount}/{dataGroup.pages.length}</strong></span>
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-xl bg-[#18241c] border border-[#2d4734] text-[#e6dfd3] flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#98c9a3]" />
                          <span>รายงาน: <strong className="text-[#98c9a3]">{reportsAllowedCount}/{reportsGroup.pages.length}</strong></span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs px-3 py-1 rounded-xl bg-[#1e3425] border border-[#98c9a3]/40 text-[#98c9a3] font-bold">
                        สิทธิ์สูงสุด (ทุกหน้า)
                      </span>
                    )}

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedUserId(isExpanded ? null : user._id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isExpanded
                            ? "bg-[#98c9a3] text-[#0f1712] border-[#98c9a3]"
                            : "bg-[#1e3425] text-[#98c9a3] border-[#98c9a3]/40 hover:bg-[#284532]"
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>{isExpanded ? "ซ่อนสิทธิ์" : "จัดการสิทธิ์รายหน้า"}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 rounded-xl bg-[#18241c] text-[#98c9a3] hover:bg-[#284532] border border-[#2d4734] transition-colors"
                        title="แก้ไขข้อมูลผู้ใช้"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={isCurrentAdmin}
                        className={`p-1.5 rounded-xl border transition-colors ${
                          isCurrentAdmin
                            ? "bg-[#18241c]/50 text-[#a39b8b]/30 border-[#2d4734]/30 cursor-not-allowed"
                            : "bg-[#18241c] text-red-400 hover:bg-red-950/40 border-[#2d4734]"
                        }`}
                        title={isCurrentAdmin ? "ไม่สามารถลบตัวเองได้" : "ลบผู้ใช้"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Grouped Permissions Grid Panel */}
                {isExpanded && (
                  <div className="p-6 border-t border-[#2d4734] bg-[#0f1712]/90 space-y-6 animate-in fade-in slide-in-from-top-2 duration-150">
                    {isAdmin ? (
                      <div className="p-4 rounded-2xl bg-[#1e3425]/50 border border-[#98c9a3]/30 text-xs text-[#98c9a3] flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>บัญชีระดับ ADMIN มีสิทธิ์เข้าถึงทุกหน้าเมนูในระบบโดยสมบูรณ์ ไม่ต้องติ๊กเลือกสิทธิ์รายหน้า</span>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {PAGE_GROUPS.map((group) => {
                          const groupPaths = group.pages.map((p) => p.path);
                          const allInGroupAllowed = groupPaths.every((p) => user.allowedPages.includes(p));
                          const allowedInGroupCount = group.pages.filter((p) => user.allowedPages.includes(p.path)).length;

                          return (
                            <div key={group.groupKey} className="space-y-3">
                              {/* Group Category Header */}
                              <div className="flex items-center justify-between border-b border-[#2d4734] pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-[#f3efe6] flex items-center gap-2">
                                    {group.groupTitle}
                                  </span>
                                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1e3425] text-[#98c9a3] border border-[#98c9a3]/30">
                                    {allowedInGroupCount} / {group.pages.length} อนุญาต
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => toggleGroupAllPages(user, group.pages)}
                                  className="text-xs text-[#98c9a3] hover:text-[#f3efe6] font-semibold flex items-center gap-1 transition-colors"
                                >
                                  {allInGroupAllowed ? (
                                    <>
                                      <CheckSquare className="w-3.5 h-3.5 text-[#98c9a3]" />
                                      <span>ยกเลิกทั้งหมดในกลุ่มนี้</span>
                                    </>
                                  ) : (
                                    <>
                                      <Square className="w-3.5 h-3.5 text-[#a39b8b]" />
                                      <span>เลือกทั้งหมดในกลุ่มนี้</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Group Pages Grid Cards */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {group.pages.map((page) => {
                                  const isChecked = user.allowedPages.includes(page.path);

                                  return (
                                    <div
                                      key={page.path}
                                      onClick={() => toggleSinglePage(user, page.path)}
                                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 shadow-sm ${
                                        isChecked
                                          ? "bg-[#1e3425] border-[#98c9a3]/60 text-[#f3efe6]"
                                          : "bg-[#121c15] border-[#2d4734] text-[#a39b8b] hover:border-[#98c9a3]/30 hover:text-[#e6dfd3]"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-[#18241c] border border-[#2d4734] flex items-center justify-center shrink-0">
                                          {page.icon}
                                        </div>
                                        <div>
                                          <p className="font-bold text-xs text-[#f3efe6]">{page.label}</p>
                                          <p className="text-[11px] text-[#a39b8b] mt-0.5 line-clamp-1">{page.description}</p>
                                        </div>
                                      </div>

                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {}} // handled by parent onClick
                                        className="w-4 h-4 rounded border-[#2d4734] bg-[#121c15] text-[#98c9a3] accent-[#98c9a3] shrink-0 pointer-events-none"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit User Modal Form */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-2xl w-full glass-earth-card p-6 sm:p-8 rounded-3xl border border-[#98c9a3]/30 space-y-6 relative max-h-[90vh] flex flex-col my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#f3efe6]">
                    แก้ไขข้อมูลผู้ใช้งานและสิทธิ์
                  </h3>
                  <p className="text-xs text-[#a39b8b]">@{editingUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#121c15]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Error */}
            {modalError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Modal Form Content */}
            <form onSubmit={handleEditSubmit} className="space-y-6 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name & Select Personnel Button */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#e6dfd3] uppercase">
                      ชื่อ-นามสกุล *
                    </label>
                    {selectedPersonnel && (
                      <div className="flex items-center gap-1 text-[10px] text-[#98c9a3] bg-[#1e3425] px-1.5 py-0.5 rounded border border-[#98c9a3]/30">
                        <UserCheck className="w-3 h-3" />
                        <span>ผูกแล้ว</span>
                        <button
                          type="button"
                          onClick={handleClearPersonnel}
                          className="text-[#a39b8b] hover:text-red-400 ml-1"
                          title="ยกเลิกการผูก"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={editName || ""}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                      placeholder="สมชาย ใจดี"
                    />

                    <button
                      type="button"
                      onClick={() => setIsPersonnelModalOpen(true)}
                      className="px-3 py-2.5 rounded-xl bg-[#1e3425] hover:bg-[#274330] border border-[#98c9a3]/40 text-[#98c9a3] text-xs font-bold flex items-center gap-1 shrink-0"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>ดึงพนักงาน</span>
                    </button>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1.5">
                    ชื่อผู้ใช้งาน (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername || ""}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] font-mono focus:outline-none focus:border-[#98c9a3]"
                  />
                </div>
              </div>

              {/* Password & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1.5">
                    เปลี่ยนรหัสผ่านใหม่ (เว้นว่างไว้หากไม่เปลี่ยน)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#a39b8b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      value={editPassword || ""}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] focus:outline-none focus:border-[#98c9a3]"
                      placeholder="รหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร"
                    />
                  </div>
                </div>

                {/* Role Select */}
                <div>
                  <label className="block text-xs font-semibold text-[#e6dfd3] uppercase mb-1.5">
                    สิทธิ์การใช้งาน (Role)
                  </label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs text-[#f3efe6] cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="user"
                        checked={editRole === "user"}
                        onChange={() => setEditRole("user")}
                        className="accent-[#98c9a3]"
                      />
                      <span>USER (ผู้ใช้ทั่วไป)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-[#f3efe6] cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={editRole === "admin"}
                        onChange={() => setEditRole("admin")}
                        className="accent-[#98c9a3]"
                      />
                      <span>ADMIN (ผู้ดูแลระบบ)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Grouped Allowed Pages Checkboxes in Modal */}
              {editRole === "user" && (
                <div className="space-y-4 pt-2 border-t border-[#2d4734]">
                  <label className="block text-xs font-bold text-[#e6dfd3] uppercase">
                    จัดสิทธิ์การเข้าถึงหน้าเมนู (Allowed Pages by Group)
                  </label>

                  <div className="space-y-4">
                    {PAGE_GROUPS.map((group) => {
                      const groupPaths = group.pages.map((p) => p.path);
                      const allChecked = groupPaths.every((p) => editAllowedPages.includes(p));

                      const toggleModalGroup = () => {
                        if (allChecked) {
                          setEditAllowedPages(editAllowedPages.filter((p) => !groupPaths.includes(p)));
                        } else {
                          const union = new Set([...editAllowedPages, ...groupPaths]);
                          setEditAllowedPages(Array.from(union));
                        }
                      };

                      return (
                        <div key={group.groupKey} className="p-4 rounded-2xl bg-[#121c15] border border-[#2d4734] space-y-3">
                          <div className="flex items-center justify-between border-b border-[#2d4734] pb-2">
                            <span className="text-xs font-bold text-[#f3efe6] flex items-center gap-2">
                              {group.groupTitle}
                            </span>
                            <button
                              type="button"
                              onClick={toggleModalGroup}
                              className="text-[11px] text-[#98c9a3] hover:text-[#f3efe6] font-semibold"
                            >
                              {allChecked ? "ยกเลิกทั้งกลุ่ม" : "เลือกทั้งกลุ่ม"}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {group.pages.map((page) => {
                              const checked = editAllowedPages.includes(page.path);

                              return (
                                <label
                                  key={page.path}
                                  className="flex items-center gap-2 text-xs text-[#e6dfd3] cursor-pointer p-1.5 rounded-lg hover:bg-[#18241c]"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      if (checked) {
                                        setEditAllowedPages(editAllowedPages.filter((p) => p !== page.path));
                                      } else {
                                        setEditAllowedPages([...editAllowedPages, page.path]);
                                      }
                                    }}
                                    className="rounded border-[#2d4734] bg-[#18241c] accent-[#98c9a3]"
                                  />
                                  <span>{page.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2d4734] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#121c15] text-[#a39b8b] hover:text-[#f3efe6] text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="btn-earth-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {modalSaving ? (
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

      {/* Personnel Selection Popup Modal */}
      {isPersonnelModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="max-w-lg w-full glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 space-y-4 relative overflow-hidden max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2d4734] pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1e3425] border border-[#98c9a3]/30 flex items-center justify-center text-[#98c9a3]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#f3efe6]">
                    เลือกข้อมูลบุคลากร (Select Personnel)
                  </h3>
                  <p className="text-xs text-[#a39b8b]">
                    เลือกรายชื่อบุคลากรเพื่อดึงมาผูกกับผู้ใช้งานนี้
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPersonnelModalOpen(false)}
                className="p-2 rounded-xl text-[#a39b8b] hover:text-[#f3efe6] hover:bg-[#121c15]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-[#a39b8b] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อบุคลากร, ตำแหน่ง หรือเบอร์โทร..."
                value={personnelSearch}
                onChange={(e) => setPersonnelSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121c15] border border-[#2d4734] text-xs text-[#f3efe6] placeholder-[#a39b8b]/50 focus:outline-none focus:border-[#98c9a3]"
              />
            </div>

            {/* Personnel List */}
            <div className="overflow-y-auto space-y-2 pr-1 flex-1">
              {filteredPersonnel.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#a39b8b]">
                  ไม่พบข้อมูลบุคลากรในระบบ
                </div>
              ) : (
                filteredPersonnel.map((p) => {
                  const isSelected = editReferId === p._id;

                  return (
                    <div
                      key={p._id}
                      onClick={() => handleSelectPersonnel(p)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-[#1e3425] border-[#98c9a3] text-[#f3efe6] shadow-sm"
                          : "bg-[#121c15] border-[#2d4734] hover:border-[#98c9a3]/40 text-[#e6dfd3]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#1c2d22] border border-[#98c9a3]/30 flex items-center justify-center font-bold text-xs text-[#98c9a3] shrink-0">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-[#f3efe6]">
                            {p.prefix && (
                              <span className="text-[#98c9a3] mr-1">{p.prefix}</span>
                            )}
                            {p.fullname}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-[#a39b8b] mt-0.5">
                            {p.position && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-[#98c9a3]" />
                                {p.position}
                              </span>
                            )}
                            {p.phone && (
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-[#98c9a3]" />
                                {p.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                          isSelected
                            ? "bg-[#98c9a3] text-[#0f1712]"
                            : "bg-[#1e3425] text-[#98c9a3] hover:bg-[#274330]"
                        }`}
                      >
                        {isSelected ? "เลือกแล้ว" : "เลือกผูก"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

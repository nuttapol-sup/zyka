"use client";

import { getApiPath } from "@/app/utils/apiPath";
import SalesDashboardCharts from "@/app/components/SalesDashboardCharts";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UserCheck,
  FileText,
  BarChart3,
  UserPlus,
  Sliders,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  KeyRound,
  Image as ImageIcon,
  Activity,
  Warehouse,
  Users,
  Contact,
  Tags,
  FolderTree,
  Package,
  Boxes,
  ShoppingBag,
} from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  username: string;
  role: "admin" | "user";
  allowedPages: string[];
  createdAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiPath("/api/auth/me"))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#98c9a3]" />
      </div>
    );
  }

  if (!user) return null;

  const isPageAllowed = (path: string) => {
    if (user.role === "admin") return true;
    return user.allowedPages.includes(path);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-earth-card p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#446e50]/20 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#2a4332] text-[#98c9a3] text-xs font-semibold border border-[#98c9a3]/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                ยินดีต้อนรับสู่ระบบ ZYKA
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  user.role === "admin"
                    ? "bg-[#446e50] text-[#f3efe6] border border-[#98c9a3]/50"
                    : "bg-[#253529] text-[#e6dfd3] border border-[#2d4734]"
                }`}
              >
                {user.role}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gradient-earth">
              สวัสดีคุณ {user.name}
            </h1>
            <p className="text-[#a39b8b] text-sm">
              ชื่อผู้ใช้ (Username): <span className="text-[#e6dfd3] font-mono">{user.username}</span>
            </p>
          </div>

          <div className="bg-[#121c15] p-4 rounded-2xl border border-[#2d4734] min-w-[240px] flex flex-col justify-between">
            <div>
              <span className="text-xs text-[#a39b8b] font-medium block mb-1">
                สถานะสิทธิ์การเข้าถึงของคุณ:
              </span>
              <div className="flex items-center gap-2">
                {user.role === "admin" ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-[#98c9a3]" />
                    <span className="text-sm font-bold text-[#98c9a3]">
                      Super Admin Access (ทุกหน้า)
                    </span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-5 h-5 text-[#e6dfd3]" />
                    <span className="text-sm font-medium text-[#e6dfd3]">
                      ได้รับสิทธิ์ {user.allowedPages.length} หน้า
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#2d4734]/60">
              <Link
                href="/change-password"
                className="text-xs font-semibold text-[#98c9a3] hover:text-[#f3efe6] flex items-center gap-1.5 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>เปลี่ยนรหัสผ่านส่วนตัว</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Sales Dashboard Charts */}
      <SalesDashboardCharts />

      {/* Access Control Grid Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#f3efe6] flex items-center gap-2">
          <span>สำรวจหน้าที่ระบบอนุญาตให้เข้าถึง</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Dashboard Card */}
          <FeatureCard
            title="Dashboard"
            description="หน้าหลักภาพรวมและข้อมูลโปรไฟล์"
            icon={<ShieldCheck className="w-6 h-6 text-[#98c9a3]" />}
            href="/dashboard"
            isAllowed={true}
          />

          {/* Orders Card */}
          <FeatureCard
            title="Orders (สั่งซื้อ & ใบเสร็จ)"
            description="หน้าบันทึกคำสั่งซื้อ ติดตามสถานะจัดส่ง/วางบิล และออกใบเสร็จรับเงิน"
            icon={<ShoppingBag className="w-6 h-6 text-[#98c9a3]" />}
            href="/orders"
            isAllowed={isPageAllowed("/orders")}
          />

          {/* Reports Card */}
          <FeatureCard
            title="Reports Page"
            description="หน้ารายงานสรุปข้อมูลและการวิเคราะห์"
            icon={<FileText className="w-6 h-6 text-[#98c9a3]" />}
            href="/reports"
            isAllowed={isPageAllowed("/reports")}
          />

          {/* Categories Card */}
          <FeatureCard
            title="Categories (ประเภทหมวดสินค้า)"
            description="หน้าบันทึกและจัดการประเภทหมวดสินค้า"
            icon={<Tags className="w-6 h-6 text-[#98c9a3]" />}
            href="/categories"
            isAllowed={isPageAllowed("/categories")}
          />

          {/* Sub-Categories Card */}
          <FeatureCard
            title="Sub-Categories (หมวดสินค้า)"
            description="หน้าบันทึกและจัดการหมวดสินค้า (ผูก Code ประเภท)"
            icon={<FolderTree className="w-6 h-6 text-[#98c9a3]" />}
            href="/sub-categories"
            isAllowed={isPageAllowed("/sub-categories")}
          />

          {/* Products Card */}
          <FeatureCard
            title="Products (บันทึกสินค้า)"
            description="หน้าบันทึกและจัดการรายการสินค้า (ผูกหมวดสินค้า & min)"
            icon={<Package className="w-6 h-6 text-[#98c9a3]" />}
            href="/products"
            isAllowed={isPageAllowed("/products")}
          />

          {/* Inventory Card */}
          <FeatureCard
            title="Inventory (จัดการสต็อกสินค้า)"
            description="หน้าควบคุมสต็อกสินค้า รับเข้า เบิกออก และเตือนสินค้าคงเหลือน้อย"
            icon={<Boxes className="w-6 h-6 text-[#98c9a3]" />}
            href="/inventory"
            isAllowed={isPageAllowed("/inventory")}
          />

          {/* Locations Card */}
          <FeatureCard
            title="Locations (คลังสินค้า)"
            description="หน้าบันทึกและจัดการสถานที่เก็บสินค้า"
            icon={<Warehouse className="w-6 h-6 text-[#98c9a3]" />}
            href="/locations"
            isAllowed={isPageAllowed("/locations")}
          />

          {/* Personnel Card */}
          <FeatureCard
            title="Personnel (บุคลากร)"
            description="หน้าบันทึกและจัดการข้อมูลบุคลากร"
            icon={<Users className="w-6 h-6 text-[#98c9a3]" />}
            href="/personnel"
            isAllowed={isPageAllowed("/personnel")}
          />

          {/* Customers Card */}
          <FeatureCard
            title="Customers (ลูกค้า)"
            description="หน้าบันทึกและจัดการข้อมูลลูกค้า (บุคคลธรรมดา/นิติบุคคล)"
            icon={<Contact className="w-6 h-6 text-[#98c9a3]" />}
            href="/customers"
            isAllowed={isPageAllowed("/customers")}
          />

          {/* Admin Management Card */}
          <FeatureCard
            title="Create User (Admin)"
            description="หน้าสร้างบัญชีผู้ใช้งานใหม่ในระบบ"
            icon={<UserPlus className="w-6 h-6 text-[#98c9a3]" />}
            href="/admin/create-user"
            isAllowed={user.role === "admin"}
            adminOnly
          />
        </div>
      </div>

      {/* Admin Quick Action Panel if Admin */}
      {user.role === "admin" && (
        <div className="glass-earth-card p-6 rounded-3xl border border-[#98c9a3]/30 bg-gradient-to-r from-[#18241c] to-[#1e3224]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#98c9a3]" />
                <h3 className="text-lg font-bold text-[#f3efe6]">
                  ศูนย์ควบคุม Admin (Permission Control Panel)
                </h3>
              </div>
              <p className="text-sm text-[#a39b8b]">
                ในฐานะ Admin คุณสามารถกำหนดสิทธิ์ (Allowed Pages) ของ User แต่ละคน และสร้าง User ใหม่ได้ทันที
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/create-user"
                className="btn-earth-primary px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                สร้าง User ใหม่
              </Link>
              <Link
                href="/admin/manage-permissions"
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[#121c15] text-[#98c9a3] border border-[#98c9a3]/40 hover:bg-[#1c2d22] transition-colors flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                จัดการสิทธิ์การเข้าถึง
              </Link>
              <Link
                href="/admin/manage-logo"
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[#121c15] text-[#98c9a3] border border-[#98c9a3]/40 hover:bg-[#1c2d22] transition-colors flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                ตั้งค่าโลโก้ระบบ
              </Link>
              <Link
                href="/admin/user-logs"
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[#121c15] text-[#98c9a3] border border-[#98c9a3]/40 hover:bg-[#1c2d22] transition-colors flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                ประวัติ & สถานะการใช้งาน
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  href,
  isAllowed,
  adminOnly = false,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  isAllowed: boolean;
  adminOnly?: boolean;
}) {
  if (!isAllowed) return null;

  return (
    <div
      className="glass-earth-card p-6 rounded-2xl flex flex-col justify-between transition-all duration-200 hover:border-[#98c9a3]/50 hover:-translate-y-1"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-[#121c15] border border-[#2d4734] flex items-center justify-center">
            {icon}
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#1e3425] text-[#98c9a3] text-[11px] font-semibold flex items-center gap-1 border border-[#98c9a3]/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            เข้าถึงได้
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#f3efe6] text-base">{title}</h3>
            {adminOnly && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#446e50]/40 text-[#98c9a3] border border-[#98c9a3]/30 font-semibold">
                Admin Only
              </span>
            )}
          </div>
          <p className="text-xs text-[#a39b8b] mt-1">{description}</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#2d4734]/50">
        <Link
          href={href}
          className="text-xs font-semibold text-[#98c9a3] hover:text-[#f3efe6] flex items-center gap-1 group"
        >
          <span>เปิดหน้านี้</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

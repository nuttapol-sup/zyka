import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Setting from "@/models/Setting";
import { getSession } from "@/lib/auth";

const DEFAULT_MENU_ORDER = ["dashboard", "reports", "datarecords", "manage"];
const DEFAULT_REPORTS_ORDER = ["sales", "charts", "customer", "product", "user"];
const DEFAULT_DATA_RECORDS_ORDER = ["orders", "products", "inventory", "categories", "sub-categories", "locations", "personnel", "customers"];
const DEFAULT_MANAGE_ORDER = ["create-user", "manage-permissions", "manage-menu-order", "manage-logo", "user-logs"];

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    await connectDB();
    let setting = await Setting.findOne({ key: "app_settings" });
    if (!setting) {
      setting = await Setting.create({
        key: "app_settings",
        menuOrder: DEFAULT_MENU_ORDER,
        reportsSubOrder: DEFAULT_REPORTS_ORDER,
        dataRecordsSubOrder: DEFAULT_DATA_RECORDS_ORDER,
        manageSubOrder: DEFAULT_MANAGE_ORDER,
        menuCustomLabels: {},
      });
    }

    const menuOrder = setting.menuOrder && setting.menuOrder.length > 0 ? setting.menuOrder : DEFAULT_MENU_ORDER;
    const reportsSubOrder = setting.reportsSubOrder && setting.reportsSubOrder.length > 0 ? setting.reportsSubOrder : DEFAULT_REPORTS_ORDER;
    const dataRecordsSubOrder = setting.dataRecordsSubOrder && setting.dataRecordsSubOrder.length > 0 ? setting.dataRecordsSubOrder : DEFAULT_DATA_RECORDS_ORDER;
    const manageSubOrder = setting.manageSubOrder && setting.manageSubOrder.length > 0 ? setting.manageSubOrder : DEFAULT_MANAGE_ORDER;
    const menuCustomLabels = setting.menuCustomLabels || {};

    return NextResponse.json({
      menuOrder,
      reportsSubOrder,
      dataRecordsSubOrder,
      manageSubOrder,
      menuCustomLabels,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการดึงลำดับเมนู" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ดำเนินการ (Admin Only)" }, { status: 403 });
    }

    const body = await request.json();
    const { menuOrder, reportsSubOrder, dataRecordsSubOrder, manageSubOrder, menuCustomLabels } = body;

    await connectDB();
    let setting = await Setting.findOne({ key: "app_settings" });
    if (!setting) {
      setting = new Setting({ key: "app_settings" });
    }

    if (menuOrder && Array.isArray(menuOrder)) setting.menuOrder = menuOrder;
    if (reportsSubOrder && Array.isArray(reportsSubOrder)) setting.reportsSubOrder = reportsSubOrder;
    if (dataRecordsSubOrder && Array.isArray(dataRecordsSubOrder)) setting.dataRecordsSubOrder = dataRecordsSubOrder;
    if (manageSubOrder && Array.isArray(manageSubOrder)) setting.manageSubOrder = manageSubOrder;
    if (menuCustomLabels && typeof menuCustomLabels === "object") setting.menuCustomLabels = menuCustomLabels;

    await setting.save();

    return NextResponse.json({
      message: "บันทึกจัดลำดับเมนูและตั้งชื่อเมนูเรียบร้อยแล้ว",
      menuOrder: setting.menuOrder,
      reportsSubOrder: setting.reportsSubOrder,
      dataRecordsSubOrder: setting.dataRecordsSubOrder,
      manageSubOrder: setting.manageSubOrder,
      menuCustomLabels: setting.menuCustomLabels,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการบันทึกลำดับเมนู" },
      { status: 500 }
    );
  }
}

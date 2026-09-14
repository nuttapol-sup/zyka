import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Setting from "@/models/Setting";

const DEFAULT_MENU_ORDER = ["dashboard", "reports", "datarecords", "manage"];
const DEFAULT_REPORTS_ORDER = ["sales", "customer", "product", "delivery", "user"];
const DEFAULT_DATA_RECORDS_ORDER = ["orders", "products", "inventory", "categories", "sub-categories", "locations", "personnel", "customers"];
const DEFAULT_MANAGE_ORDER = ["create-user", "manage-permissions", "manage-menu-order", "manage-logo", "user-logs"];

export async function GET() {
  try {
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

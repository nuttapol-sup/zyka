import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Setting from "@/models/Setting";
import { getSession } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "ต้องใช้สิทธิ์ Admin เท่านั้นในการเปลี่ยนข้อมูลระบบ" },
        { status: 403 }
      );
    }

    const { logoUrl, appName, appSubtitle, companyAddress, companyPhone, companyTaxId } = await request.json();

    await connectDB();
    let setting = await Setting.findOne({ key: "app_settings" });
    if (!setting) {
      setting = new Setting({ key: "app_settings" });
    }

    if (logoUrl !== undefined) setting.logoUrl = logoUrl;
    if (appName !== undefined) setting.appName = appName;
    if (appSubtitle !== undefined) setting.appSubtitle = appSubtitle;
    if (companyAddress !== undefined) setting.companyAddress = companyAddress;
    if (companyPhone !== undefined) setting.companyPhone = companyPhone;
    if (companyTaxId !== undefined) setting.companyTaxId = companyTaxId;

    await setting.save();

    return NextResponse.json({
      message: "อัปเดตข้อมูลระบบสำเร็จ",
      setting: {
        logoUrl: setting.logoUrl,
        appName: setting.appName,
        appSubtitle: setting.appSubtitle,
        companyAddress: setting.companyAddress,
        companyPhone: setting.companyPhone,
        companyTaxId: setting.companyTaxId,
      },
    });
  } catch (error: any) {
    console.error("Update Settings Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Setting from "@/models/Setting";

export async function GET() {
  try {
    await connectDB();
    let setting = await Setting.findOne({ key: "app_settings" });
    if (!setting) {
      setting = await Setting.create({
        key: "app_settings",
        logoUrl: "",
        appName: "ZYKA",
        appSubtitle: "Medic",
        companyAddress: "",
        companyPhone: "",
        companyTaxId: "",
      });
    }

    return NextResponse.json({
      logoUrl: setting.logoUrl || "",
      appName: setting.appName || "ZYKA",
      appSubtitle: setting.appSubtitle || "Medic",
      companyAddress: setting.companyAddress || "",
      companyPhone: setting.companyPhone || "",
      companyTaxId: setting.companyTaxId || "",
    });
  } catch (error) {
    return NextResponse.json(
      {
        logoUrl: "",
        appName: "ZYKA",
        appSubtitle: "Medic",
        companyAddress: "",
        companyPhone: "",
        companyTaxId: "",
      },
      { status: 500 }
    );
  }
}

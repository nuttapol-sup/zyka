import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Setting from "@/models/Setting";
import { getSession } from "@/lib/auth";

// GET /api/admin/settings/line - Get LINE settings
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงตั้งค่า" }, { status: 403 });
    }

    await connectDB();
    const setting = (await Setting.findOne({ key: "app_settings" })) || (await Setting.findOne({}));

    return NextResponse.json({
      lineChannelSecret: setting?.lineChannelSecret || process.env.LINE_CHANNEL_SECRET || "",
      lineChannelAccessToken: setting?.lineChannelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
      lineGroupId: setting?.lineGroupId || process.env.LINE_GROUP_ID || "",
      lineEnabled: setting?.lineEnabled !== undefined ? setting.lineEnabled : true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

// POST /api/admin/settings/line - Save LINE settings
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์แก้ไขตั้งค่า" }, { status: 403 });
    }

    const { lineChannelSecret, lineChannelAccessToken, lineGroupId, lineEnabled } = await request.json();

    await connectDB();
    const settingDoc = (await Setting.findOne({ key: "app_settings" })) || (await Setting.findOne({}));
    const docId = settingDoc ? settingDoc._id : undefined;

    let setting;
    if (docId) {
      setting = await Setting.findByIdAndUpdate(
        docId,
        {
          key: "app_settings",
          lineChannelSecret: lineChannelSecret ? lineChannelSecret.trim() : "",
          lineChannelAccessToken: lineChannelAccessToken ? lineChannelAccessToken.trim() : "",
          lineGroupId: lineGroupId ? lineGroupId.trim() : "",
          lineEnabled: Boolean(lineEnabled),
        },
        { new: true }
      );
    } else {
      setting = await Setting.create({
        key: "app_settings",
        lineChannelSecret: lineChannelSecret ? lineChannelSecret.trim() : "",
        lineChannelAccessToken: lineChannelAccessToken ? lineChannelAccessToken.trim() : "",
        lineGroupId: lineGroupId ? lineGroupId.trim() : "",
        lineEnabled: Boolean(lineEnabled),
      });
    }

    return NextResponse.json({
      message: "บันทึกตั้งค่า LINE Messaging API เรียบร้อยแล้ว",
      setting,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการบันทึก" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendLineReportNotification } from "@/lib/line-reports";

// POST /api/admin/line/notify - Send report notification to LINE Group/Recipient
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ใช้งาน (Admin Only)" }, { status: 403 });
    }

    const { reportType, targetId } = await request.json();

    if (!reportType) {
      return NextResponse.json({ error: "โปรดระบุประเภทรายงาน (reportType)" }, { status: 400 });
    }

    const result = await sendLineReportNotification(reportType, targetId);

    return NextResponse.json({
      message: "ส่งการแจ้งเตือนรายงานเข้า LINE เรียบร้อยแล้ว",
      result,
    });
  } catch (error: any) {
    console.error("Error sending LINE report notification:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการส่งแจ้งเตือนเข้า LINE" },
      { status: 500 }
    );
  }
}

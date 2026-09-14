import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import LinePendingUser from "@/models/LinePendingUser";
import User from "@/models/User";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูล" }, { status: 403 });
    }

    await connectDB();
    const pendingUsers = await LinePendingUser.find({ status: "pending" })
      .sort({ updatedAt: -1 })
      .limit(20);

    return NextResponse.json({ pendingUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูล" }, { status: 403 });
    }

    const { userId, pendingId, lineUserId, canAccessLineReports } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "กรุณาระบุบัญชีผู้ใช้งาน (userId)" }, { status: 400 });
    }

    await connectDB();

    let targetLineUserId = lineUserId;

    if (pendingId) {
      const pendingDoc = await LinePendingUser.findById(pendingId);
      if (pendingDoc) {
        targetLineUserId = pendingDoc.lineUserId;
        pendingDoc.status = "linked";
        pendingDoc.linkedUserId = userId;
        await pendingDoc.save();
      }
    }

    if (!targetLineUserId) {
      return NextResponse.json({ error: "ไม่พบ LINE User ID สำหรับผูกบัญชี" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้งานที่ระบุ" }, { status: 404 });
    }

    user.lineUserId = targetLineUserId.trim();
    user.canAccessLineReports = canAccessLineReports !== undefined ? Boolean(canAccessLineReports) : true;
    await user.save();

    // Mark any other pending requests from same lineUserId as linked
    await LinePendingUser.updateMany(
      { lineUserId: targetLineUserId.trim() },
      { status: "linked", linkedUserId: userId }
    );

    return NextResponse.json({
      success: true,
      message: `ผูกบัญชี LINE กับ "${user.name}" สำเร็จเรียบร้อย!`,
      user,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูล" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const pendingId = searchParams.get("id");

    if (!pendingId) {
      return NextResponse.json({ error: "กรุณาระบุ ID ของคำขอ" }, { status: 400 });
    }

    await connectDB();
    await LinePendingUser.findByIdAndUpdate(pendingId, { status: "ignored" });

    return NextResponse.json({ success: true, message: "ยกเลิกคำขอเรียบร้อยแล้ว" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "ต้องใช้สิทธิ์ Admin เท่านั้น" }, { status: 403 });
    }

    const { id } = await params;
    const { allowedPages, role } = await request.json();

    await connectDB();
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้ที่ต้องการแก้ไข" }, { status: 404 });
    }

    if (allowedPages && Array.isArray(allowedPages)) {
      user.allowedPages = allowedPages;
    }

    if (role && (role === "admin" || role === "user")) {
      user.role = role;
    }

    await user.save();

    return NextResponse.json({
      message: "อัปเดตสิทธิ์การใช้งานสำเร็จ",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        allowedPages: user.allowedPages,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการแก้ไขสิทธิ์" }, { status: 500 });
  }
}

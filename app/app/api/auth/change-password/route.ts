import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "ยังไม่ได้เข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลผู้ใช้ในระบบ" },
        { status: 404 }
      );
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password!);
    if (!isMatch) {
      return NextResponse.json(
        { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // Hash new password & save
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return NextResponse.json({
      message: "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว",
    });
  } catch (error: any) {
    console.error("Change Password Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" },
      { status: 500 }
    );
  }
}

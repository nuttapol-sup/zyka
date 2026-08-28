import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";

// PUT /api/admin/users/[id] - Edit user details (name, username, password, role, allowedPages)
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
    const { name, username, newPassword, role, allowedPages, referId } = await request.json();

    await connectDB();
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้งาน" }, { status: 404 });
    }

    // If username is changed, check for duplicate
    if (username && username.trim().toLowerCase() !== user.username) {
      const existing = await User.findOne({ username: username.trim().toLowerCase() });
      if (existing) {
        return NextResponse.json({ error: "ชื่อผู้ใช้งาน (Username) นี้มีในระบบแล้ว" }, { status: 400 });
      }
      user.username = username.trim().toLowerCase();
    }

    if (name) user.name = name.trim();
    if (role) user.role = role;
    if (Array.isArray(allowedPages)) user.allowedPages = allowedPages;
    if (referId !== undefined) user.referId = referId || null;

    // Optional password update
    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json({ error: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword.trim(), salt);
    }

    await user.save();

    return NextResponse.json({
      message: "อัปเดตข้อมูลผู้ใช้งานสำเร็จ",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        allowedPages: user.allowedPages,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete user account
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "ต้องใช้สิทธิ์ Admin เท่านั้น" }, { status: 403 });
    }

    const { id } = await params;

    // Prevent Admin from deleting their own current session account
    if (session.userId === id) {
      return NextResponse.json({ error: "ไม่สามารถลบบัญชีผู้ใช้ที่กำลังใช้งานอยู่ได้" }, { status: 400 });
    }

    await connectDB();
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้งานที่ต้องการลบ" }, { status: 404 });
    }

    return NextResponse.json({ message: "ลบผู้ใช้งานสำเร็จเรียบร้อย" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}

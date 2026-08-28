import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Refer from "@/models/Refer"; // Ensure Refer schema registered for populate
import { getSession } from "@/lib/auth";

// GET /api/admin/users - Fetch all users with linked personnel (referId)
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "ต้องใช้สิทธิ์ Admin เท่านั้น" }, { status: 403 });
    }

    await connectDB();
    // Register Refer model explicitly
    if (!Refer) console.log("Refer model loaded");

    const users = await User.find()
      .select("-password")
      .populate("referId", "prefix fullname position phone referType")
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลรายการผู้ใช้" }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user (Admin Only) with optional referId
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "ต้องใช้สิทธิ์ Admin เท่านั้นในการสร้างผู้ใช้งาน" }, { status: 403 });
    }

    const { name, username, password, role, allowedPages, referId } = await request.json();

    if (!name || !username || !password) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูล Name, Username และ Password ให้ครบถ้วน" }, { status: 400 });
    }

    await connectDB();

    // Check existing username
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้วในระบบ" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      username: username.toLowerCase(),
      password: hashedPassword,
      role: role || "user",
      allowedPages: allowedPages || ["/dashboard"],
      referId: referId || null,
    });

    const populatedUser = await User.findById(newUser._id)
      .select("-password")
      .populate("referId", "prefix fullname position phone referType");

    return NextResponse.json({
      message: "สร้างผู้ใช้งานสำเร็จ",
      user: populatedUser,
    });
  } catch (error: any) {
    console.error("Create User Error:", error);
    return NextResponse.json({ error: error.message || "ไม่สามารถสร้างผู้ใช้ได้" }, { status: 500 });
  }
}

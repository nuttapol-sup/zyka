import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import UserLog from "@/models/UserLog";
import { signToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user by username or fallback to email field if existing data
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await signToken({
      userId: user._id.toString(),
      name: user.name,
      username: user.username,
      role: user.role,
      allowedPages: Array.from(user.allowedPages || ["/dashboard"]),
    });

    // Determine target page according to user permissions
    let targetPage = "/dashboard";
    if (user.role !== "admin") {
      if (user.allowedPages && user.allowedPages.length > 0) {
        if (user.allowedPages.includes("/dashboard")) {
          targetPage = "/dashboard";
        } else {
          targetPage = user.allowedPages[0];
        }
      }
    }

    // Record user login in UserLog
    try {
      await UserLog.updateMany(
        { userId: user._id, status: "online" },
        { status: "offline", logoutTime: new Date() }
      );
      await UserLog.create({
        userId: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        currentPath: targetPage,
        status: "online",
        lastActive: new Date(),
        loginTime: new Date(),
      });
    } catch (logErr) {
      console.error("Failed to record login log:", logErr);
    }

    const response = NextResponse.json({
      message: "เข้าสู่ระบบสำเร็จ",
      targetPage,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        allowedPages: user.allowedPages,
      },
    });

    // Set HTTP-Only Cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}

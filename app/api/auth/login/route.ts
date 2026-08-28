import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import UserLog from "@/models/UserLog";
import { signToken, COOKIE_NAME } from "@/lib/auth";

// Anti-Brute Force Rate Limiter (Max 5 attempts per 15 minutes per IP/User)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" },
        { status: 400 }
      );
    }

    // Rate Limiting Key based on IP or Username
    const clientIp = request.headers.get("x-forwarded-for") || "client_ip";
    const rateKey = `${clientIp}_${username.toLowerCase()}`;
    const now = Date.now();

    const attemptData = loginAttempts.get(rateKey);
    if (attemptData) {
      if (now > attemptData.resetTime) {
        loginAttempts.delete(rateKey);
      } else if (attemptData.count >= MAX_ATTEMPTS) {
        const remainingMinutes = Math.ceil((attemptData.resetTime - now) / 60000);
        return NextResponse.json(
          { error: `⚠️ พยายามเข้าสู่ระบบผิดเกินกำหนด กรุณารออีก ${remainingMinutes} นาทีแล้วลองใหม่` },
          { status: 429 }
        );
      }
    }

    await connectDB();

    // Find user by username (Strict String Search - Prevent NoSQL Injection)
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() },
      ],
    });

    if (!user) {
      // Record failed attempt
      const current = loginAttempts.get(rateKey) || { count: 0, resetTime: now + WINDOW_MS };
      loginAttempts.set(rateKey, { count: current.count + 1, resetTime: current.resetTime });

      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      // Record failed attempt
      const current = loginAttempts.get(rateKey) || { count: 0, resetTime: now + WINDOW_MS };
      loginAttempts.set(rateKey, { count: current.count + 1, resetTime: current.resetTime });

      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // Clear rate limit on successful login
    loginAttempts.delete(rateKey);

    // Generate JWT token
    const token = await signToken({
      userId: user._id.toString(),
      name: user.name,
      username: user.username,
      role: user.role,
      allowedPages: Array.from(user.allowedPages || ["/dashboard"]),
    });

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

    // Set Secure HTTP-Only Cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
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

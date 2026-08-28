import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getSession, signToken, COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้ล็อกอิน" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    // Refresh token with latest permissions
    const refreshedToken = await signToken({
      userId: user._id.toString(),
      name: user.name,
      username: user.username,
      role: user.role,
      allowedPages: Array.from(user.allowedPages || ["/dashboard"]),
    });

    const response = NextResponse.json({ user });
    response.cookies.set(COOKIE_NAME, refreshedToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" }, { status: 500 });
  }
}

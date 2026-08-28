import { NextResponse } from "next/server";
import { COOKIE_NAME, getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import UserLog from "@/models/UserLog";

export async function POST() {
  try {
    const session = await getSession();
    if (session) {
      await connectDB();
      await UserLog.updateMany(
        { userId: session.userId, status: "online" },
        { status: "offline", logoutTime: new Date() }
      );
    }
  } catch (err) {
    console.error("Logout log update error:", err);
  }

  const response = NextResponse.json({ message: "ออกจากระบบสำเร็จ" });
  response.cookies.delete(COOKIE_NAME);
  return response;
}

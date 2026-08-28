import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserLog from "@/models/UserLog";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const { currentPath } = await request.json();

    await connectDB();

    const now = new Date();

    // Find active log for this user or create a new active session log
    let log = await UserLog.findOne({
      userId: session.userId,
      status: "online",
    }).sort({ createdAt: -1 });

    if (!log) {
      log = await UserLog.create({
        userId: session.userId,
        username: session.username,
        name: session.name,
        role: session.role,
        currentPath: currentPath || "/dashboard",
        status: "online",
        lastActive: now,
        loginTime: now,
      });
    } else {
      log.currentPath = currentPath || log.currentPath || "/dashboard";
      log.status = "online";
      log.lastActive = now;
      log.username = session.username;
      log.name = session.name;
      log.role = session.role;
      await log.save();
    }

    return NextResponse.json({ success: true, lastActive: log.lastActive });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

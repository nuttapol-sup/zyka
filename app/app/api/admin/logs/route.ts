import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserLog from "@/models/UserLog";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "ต้องใช้สิทธิ์ Admin เท่านั้น" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    await connectDB();

    // Build MongoDB Date Filter
    const filterQuery: any = {};
    if (startDate || endDate) {
      filterQuery.loginTime = {};
      if (startDate) {
        // Start of the day in local time
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filterQuery.loginTime.$gte = start;
      }
      if (endDate) {
        // End of the day in local time
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filterQuery.loginTime.$lte = end;
      }
    }

    // Threshold for online status: active within 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);

    // Fetch logs sorted by lastActive desc
    const logs = await UserLog.find(filterQuery).sort({ lastActive: -1 }).limit(300);

    // Map logs with real-time online status determination
    const formattedLogs = logs.map((log) => {
      const isRecentlyActive = log.lastActive && new Date(log.lastActive) > thirtySecondsAgo;
      const isOnline = log.status === "online" && isRecentlyActive;

      return {
        _id: log._id,
        userId: log.userId,
        username: log.username,
        name: log.name,
        role: log.role,
        currentPath: log.currentPath || "/dashboard",
        status: isOnline ? "online" : "offline",
        lastActive: log.lastActive,
        loginTime: log.loginTime,
        logoutTime: log.logoutTime || (isOnline ? null : log.lastActive),
      };
    });

    const onlineCount = formattedLogs.filter((l) => l.status === "online").length;
    const offlineCount = formattedLogs.length - onlineCount;

    return NextResponse.json({
      logs: formattedLogs,
      stats: {
        onlineCount,
        offlineCount,
        totalLogs: formattedLogs.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "ไม่สามารถดึงข้อมูล Logs ได้" }, { status: 500 });
  }
}

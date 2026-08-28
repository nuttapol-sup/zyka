import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserLog from "@/models/UserLog";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const preset = searchParams.get("preset"); // "today" | "7days" | "30days" | "custom"
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    await connectDB();

    let startDate: Date;
    let endDate: Date = new Date();
    endDate.setHours(23, 59, 59, 999);

    const now = new Date();

    if (preset === "today") {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (preset === "7days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (preset === "30days") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    } else if (startDateParam || endDateParam) {
      if (startDateParam) {
        startDate = new Date(startDateParam);
        startDate.setHours(0, 0, 0, 0);
      } else {
        startDate = new Date(0);
      }
      if (endDateParam) {
        endDate = new Date(endDateParam);
        endDate.setHours(23, 59, 59, 999);
      }
    } else {
      // Default: Last 7 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    }

    // Query MongoDB for logs in date range
    const filterQuery = {
      loginTime: { $gte: startDate, $lte: endDate },
    };

    const logs = await UserLog.find(filterQuery).sort({ loginTime: -1 });

    // 1. Calculate Aggregate Metrics
    const totalSessions = logs.length;
    const uniqueUsernames = new Set(logs.map((l) => l.username));
    const uniqueUsersCount = uniqueUsernames.size;

    // Online status threshold (active in last 30s)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const currentlyOnlineCount = logs.filter(
      (l) => l.status === "online" && new Date(l.lastActive) > thirtySecondsAgo
    ).length;

    // 2. Page Visit Breakdown
    const pageCounts: Record<string, number> = {};
    logs.forEach((l) => {
      const page = l.currentPath || "/dashboard";
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });

    const pageBreakdown = Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count);

    // 3. Per-User Usage Summary
    const userSummaryMap: Record<
      string,
      {
        username: string;
        name: string;
        role: string;
        sessionCount: number;
        pages: Record<string, number>;
        lastLogin: Date;
        lastActive: Date;
        status: string;
      }
    > = {};

    logs.forEach((l) => {
      if (!userSummaryMap[l.username]) {
        userSummaryMap[l.username] = {
          username: l.username,
          name: l.name,
          role: l.role,
          sessionCount: 0,
          pages: {},
          lastLogin: l.loginTime,
          lastActive: l.lastActive,
          status: l.status,
        };
      }

      const u = userSummaryMap[l.username];
      u.sessionCount += 1;
      const page = l.currentPath || "/dashboard";
      u.pages[page] = (u.pages[page] || 0) + 1;

      if (new Date(l.loginTime) > new Date(u.lastLogin)) {
        u.lastLogin = l.loginTime;
      }
      if (new Date(l.lastActive) > new Date(u.lastActive)) {
        u.lastActive = l.lastActive;
        u.status = l.status;
      }
    });

    const userSummaries = Object.values(userSummaryMap).map((u) => {
      // Find top page for this user
      let topPage = "/dashboard";
      let maxPageCount = 0;
      Object.entries(u.pages).forEach(([p, c]) => {
        if (c > maxPageCount) {
          maxPageCount = c;
          topPage = p;
        }
      });

      const isOnline =
        u.status === "online" && new Date(u.lastActive) > thirtySecondsAgo;

      return {
        username: u.username,
        name: u.name,
        role: u.role,
        sessionCount: u.sessionCount,
        topPage,
        lastLogin: u.lastLogin,
        lastActive: u.lastActive,
        isOnline,
      };
    });

    return NextResponse.json({
      summary: {
        totalSessions,
        uniqueUsersCount,
        currentlyOnlineCount,
        startDate,
        endDate,
      },
      pageBreakdown,
      userSummaries,
      logs: logs.slice(0, 100), // Recent 100 logs
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการดึงรายงาน" }, { status: 500 });
  }
}

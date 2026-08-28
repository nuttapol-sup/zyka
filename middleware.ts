import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "./lib/auth";

// Public routes that don't require authentication
const PUBLIC_PATHS = ["/login", "/api/auth/login"];

// Admin-only paths
const ADMIN_PATHS = [
  "/admin/create-user",
  "/admin/manage-permissions",
  "/admin/manage-logo",
  "/admin/user-logs",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public static assets and next internal requests
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Allow public auth paths
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path))) {
    // If user is already logged in and visits /login, redirect to /dashboard
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token && pathname === "/login") {
      const payload = await verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  // 3. Verify Token
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // 4. Admin-Only Route Check
  if (ADMIN_PATHS.some((path) => pathname.startsWith(path)) || pathname.startsWith("/api/admin")) {
    if (payload.role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "ต้องใช้สิทธิ์ Admin เท่านั้น" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/unauthorized?reason=admin_required", request.url));
    }
  }

  // 5. Page Level Permission Check for Users (Admin always has access to all pages)
  if (payload.role !== "admin") {
    // List of configurable feature pages
    const checkablePages = [
      "/dashboard",
      "/orders",
      "/reports",
      "/analytics",
      "/categories",
      "/sub-categories",
      "/products",
      "/inventory",
      "/locations",
      "/personnel",
      "/customers",
    ];
    const matchedPage = checkablePages.find((page) => pathname === page || pathname.startsWith(page + "/"));

    if (matchedPage) {
      const hasPermission = payload.allowedPages && payload.allowedPages.includes(matchedPage);
      if (!hasPermission) {
        return NextResponse.redirect(new URL(`/unauthorized?page=${encodeURIComponent(matchedPage)}`, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

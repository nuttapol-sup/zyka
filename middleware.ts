import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "./lib/auth";

// Public routes that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/settings/logo",
  "/api/settings/menu-order",
];

// Admin-only paths
const ADMIN_PATHS = [
  "/admin/create-user",
  "/admin/manage-permissions",
  "/admin/manage-logo",
  "/admin/user-logs",
];

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

function createRedirect(targetPath: string, request: NextRequest): NextResponse {
  const urlString = request.url;
  const isSubpath = urlString.includes("/zyka") || request.nextUrl.pathname.startsWith("/zyka");

  let fullPath = targetPath;
  if (isSubpath && !targetPath.startsWith("/zyka")) {
    fullPath = `/zyka${targetPath.startsWith("/") ? "" : "/"}${targetPath}`;
  }

  const redirectUrl = new URL(fullPath, request.url);
  return withSecurityHeaders(NextResponse.redirect(redirectUrl));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Helper: Strip /zyka prefix if present to normalize path checks
  const cleanPath = pathname.replace(/^\/zyka/, "") || "/";
  const isApi = cleanPath.startsWith("/api/");

  // 1. Allow public static assets and next internal requests
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Allow public auth paths
  if (PUBLIC_PATHS.some((path) => cleanPath === path || cleanPath.startsWith(path))) {
    // If user is already logged in and visits /login, redirect to /dashboard
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token && cleanPath === "/login") {
      const payload = await verifyToken(token);
      if (payload) {
        return createRedirect("/dashboard", request);
      }
    }
    return withSecurityHeaders(NextResponse.next());
  }

  // 3. Verify Token
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    if (isApi) {
      return withSecurityHeaders(NextResponse.json({ error: "ยังไม่ได้เข้าสู่ระบบ" }, { status: 401 }));
    }
    return createRedirect("/login", request);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    if (isApi) {
      return withSecurityHeaders(NextResponse.json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" }, { status: 401 }));
    }
    const response = createRedirect("/login", request);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // 4. Admin-Only Route Check
  const isAdminRoute = ADMIN_PATHS.some((path) => cleanPath.startsWith(path)) || cleanPath.startsWith("/api/admin");
  if (isAdminRoute) {
    if (payload.role !== "admin") {
      if (isApi) {
        return withSecurityHeaders(NextResponse.json({ error: "ต้องใช้สิทธิ์ Admin เท่านั้น" }, { status: 403 }));
      }
      return createRedirect("/unauthorized?reason=admin_required", request);
    }
  }

  // 5. Page Level Permission Check for Users (Admin always has access to all pages)
  if (payload.role !== "admin") {
    // List of configurable feature pages
    const checkablePages = [
      "/dashboard",
      "/orders",
      "/reports",
      "/categories",
      "/sub-categories",
      "/products",
      "/inventory",
      "/locations",
      "/personnel",
      "/customers",
    ];
    const matchedPage = checkablePages.find((page) => cleanPath === page || cleanPath.startsWith(page + "/"));

    if (matchedPage) {
      const hasPermission = payload.allowedPages && payload.allowedPages.includes(matchedPage);
      if (!hasPermission) {
        return createRedirect(`/unauthorized?page=${encodeURIComponent(matchedPage)}`, request);
      }
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

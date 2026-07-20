// Triangle Black - Route Protection (proxy.ts)
// Program A - Task A4
// Next.js 16 uses proxy.ts instead of middleware.ts
// DEV mode (AUTH_BYPASS=true): all routes pass through
// PROD mode: unauthenticated requests redirect to /login
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/_next/",
  "/favicon.ico",
  "/api/auth/",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // DEV bypass - allow all routes in development
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return NextResponse.next();
  }

  // Check for auth cookie (set by login flow)
  const token = req.cookies.get("tb_access_token")?.value;
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

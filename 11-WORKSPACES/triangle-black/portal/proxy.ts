// Triangle Black - Route Protection (proxy.ts)
// Fix: allow internal API proxy routes and health route
// Fix: allow Authorization header as alternate auth proof
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/_next/",
  "/favicon.ico",
  "/api/auth/",
  "/api/health",
  "/api/v1/",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // DEV bypass
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return NextResponse.next();
  }

  // Accept either cookie OR Authorization header
  const cookieToken = req.cookies.get("tb_access_token")?.value;
  const authHeader  = req.headers.get("authorization");
  const hasBearer   = !!authHeader && authHeader.toLowerCase().startsWith("bearer ");

  if (!cookieToken && !hasBearer) {
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

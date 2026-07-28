// Triangle Black - Next.js Middleware
// Protects all /app routes — redirects to /login if no token in cookie

import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/", "/_next/", "/favicon"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for token in cookies
  const token =
    request.cookies.get("tb_access_token")?.value ||
    request.cookies.get("tb_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|api|_next/static|_next/image|favicon.ico).*)",
  ],
};

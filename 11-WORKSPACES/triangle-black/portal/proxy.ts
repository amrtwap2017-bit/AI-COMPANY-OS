import { NextRequest, NextResponse } from "next/server";

const PUBLIC = ["/login", "/api/auth", "/api/health", "/api/v1", "/_next", "/favicon"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // DEV BYPASS — always allow
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return NextResponse.next();
  }

  // Check httpOnly cookie
  const token = request.cookies.get("tb_access_token")?.value;
  if (token) return NextResponse.next();

  // Redirect to login
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

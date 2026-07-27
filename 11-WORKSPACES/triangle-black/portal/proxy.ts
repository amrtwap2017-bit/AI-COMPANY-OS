import { NextRequest, NextResponse } from "next/server";

const PUBLIC = ["/login","/api/auth","/_next","/favicon","/static","/sw.js","/manifest","/icons"];

function getTokenFromRequest(request: NextRequest): string {
  // Try cookie names the login page sets
  const token = 
    request.cookies.get("tb_access_token")?.value ||
    request.cookies.get("tb_token")?.value ||
    "";
  return token;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths through without auth check
  if (PUBLIC.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Bypass auth in dev mode
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return NextResponse.next();
  }

  const token = getTokenFromRequest(request);

  // For API proxy requests — inject Authorization header so backend gets the token
  if (pathname.startsWith("/api/v1/")) {
    if (!token) {
      // No token — return 401 directly instead of proxying
      return new NextResponse(JSON.stringify({ detail: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Clone request and add Authorization header for the backend
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("Authorization", `Bearer ${token}`);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // For page routes — redirect to login if no token
  if (!token) {
    return NextResponse.redirect(
      new URL("/login?from=" + encodeURIComponent(pathname), request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

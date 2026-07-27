import { NextRequest, NextResponse } from "next/server";

const PUBLIC = ["/login", "/api/auth", "/_next", "/favicon", "/static", "/sw.js", "/manifest", "/icons"];

function getToken(request: NextRequest): string {
  return (
    request.cookies.get("tb_access_token")?.value ||
    request.cookies.get("tb_token")?.value ||
    ""
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return NextResponse.next();
  }

  const token = getToken(request);

  // Inject Authorization header for ALL API proxy requests
  if (pathname.startsWith("/api/v1/")) {
    if (!token) {
      return new NextResponse(JSON.stringify({ detail: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("Authorization", `Bearer ${token}`);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Page routes
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

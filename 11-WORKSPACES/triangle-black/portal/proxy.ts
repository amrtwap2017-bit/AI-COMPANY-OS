import { NextRequest, NextResponse } from "next/server";

const PUBLIC = ["/login","/api/","/auth/","/_next","/favicon","/static"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next();
  // DEV: bypass all auth
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") return NextResponse.next();
  // Check cookie
  if (request.cookies.get("tb_access_token")?.value) return NextResponse.next();
  // Redirect
  return NextResponse.redirect(new URL("/login?from="+encodeURIComponent(pathname), request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

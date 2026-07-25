import { NextRequest, NextResponse } from "next/server";

const PUBLIC = ["/login","/api/","/auth/","/_next","/favicon","/static","/sw.js","/manifest","/icons"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next();
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") return NextResponse.next();
  const token = request.cookies.get("tb_access_token")?.value
             || request.cookies.get("tb_token")?.value;
  if (token) return NextResponse.next();
  return NextResponse.redirect(new URL("/login?from="+encodeURIComponent(pathname), request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

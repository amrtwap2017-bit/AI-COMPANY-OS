import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// DEV MODE: Passthrough — no auth redirect
// Production: implement proper JWT check here
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};

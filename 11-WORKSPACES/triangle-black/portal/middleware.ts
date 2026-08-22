import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/solutions',
  '/how-it-works',
  '/case-studies',
  '/api/v1/onboarding',
  '/api/v1/commercial',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths without auth
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // For protected routes, check for auth token cookie
  const token = request.cookies.get('tb_access_token')?.value;

  if (!token && pathname.startsWith('/(app)')) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
};

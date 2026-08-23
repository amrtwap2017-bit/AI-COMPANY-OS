import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/solutions',
  '/how-it-works',
  '/case-studies',
  '/api/',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths without auth
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // For protected routes under /(app), check for auth token
  if (pathname.startsWith('/(app)') || pathname.startsWith('/operations') || pathname.startsWith('/maintenance') || pathname.startsWith('/executive') || pathname.startsWith('/administration') || pathname.startsWith('/ai') || pathname.startsWith('/graph') || pathname.startsWith('/financial')) {
    const token = request.cookies.get('tb_access_token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets|api).*)',
  ],
};

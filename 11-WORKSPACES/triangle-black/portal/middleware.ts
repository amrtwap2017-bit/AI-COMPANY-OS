import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Marketing routes that should NEVER require authentication
const PUBLIC_MARKETING_ROUTES = [
  '/',
  '/solutions',
  '/how-it-works',
  '/platform',
  '/industries',
  '/case-studies',
  '/resources',
  '/about',
  '/contact',
  '/request-demo',
]

const PUBLIC_PREFIXES = [
  '/login',
  '/api/v1/health',
  '/_next',
  '/favicon',
  '/images',
  '/fonts',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow marketing routes
  if (PUBLIC_MARKETING_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // Always allow public prefixes
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

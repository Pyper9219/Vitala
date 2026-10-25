import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PUBLIC_PATHS = [
  '/api/auth',
  '/login',
  '/signup',
  '/auth/error',
  '/auth/callback',
  '/api/webhooks',
];

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/meals',
  '/workouts',
  '/shopping',
  '/progress',
  '/account',
  '/onboarding',
  '/subscription',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isStatic =
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    /\.[a-z]+$/.test(pathname);

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname === '/' ||
    isStatic;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  const token = request.cookies.get('vitala_session')?.value;
  const payload = token ? verifyToken(token) : null;

  if (isProtected && !payload) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === '/login' || pathname === '/signup') && payload) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};

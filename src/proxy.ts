import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for the client authentication cookie
  const isAuthenticated = request.cookies.has('remindology_logged_in');

  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';
  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/contents') ||
    pathname.startsWith('/profile');

  if (isDashboardRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/contents/:path*',
    '/profile/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ],
};

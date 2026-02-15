import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get user from cookie (in production, use real auth token)
  const userCookie = request.cookies.get('aurion-user');
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isHomePage = request.nextUrl.pathname === '/';

  // Page d'accueil (/) : non connecté → login, connecté → dashboard
  if (isHomePage) {
    if (!userCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si non connecté et route protégée → login
  if (!userCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si connecté et sur la page login → dashboard
  if (userCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/sites/:path*',
    '/alertes/:path*',
    '/carte/:path*',
    '/analytics/:path*',
    '/historique/:path*',
    '/rapports/:path*',
    '/admin/:path*',
    '/login',
  ],
};

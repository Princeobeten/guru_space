import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route configurations
const ROUTE_CONFIG = {
  auth: ['/login', '/sign-up', '/forgot-password'],
  protected: ['/dashboard', '/profile', '/book', '/transaction'],
} as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('authToken')?.value;

  try {
    // If token exists (user is logged in)
    if (token) {
      // Redirect from auth routes to dashboard
      if (ROUTE_CONFIG.auth.some(route => pathname === route)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Allow access to protected routes
      if (ROUTE_CONFIG.protected.some(route => pathname.startsWith(route))) {
        const response = NextResponse.next();
        // Add security headers
        response.headers.set('x-middleware-cache', 'no-cache');
        return response;
      }
    } else {
      // No token exists (user is not logged in)
      if (ROUTE_CONFIG.protected.some(route => pathname.startsWith(route))) {
        // Store the attempted URL to redirect back after login
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('authToken');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
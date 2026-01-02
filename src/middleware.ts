import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Ambil cookie 'auth_role' yang kita set di SignInForm.tsx
  const authRole = request.cookies.get('auth_role')?.value;
  
  const { pathname } = request.nextUrl;

  // Daftar path yang public (tidak perlu login)
  const publicPaths = ['/signin', '/signup', '/forgot-password'];
  
  // Cek apakah path saat ini adalah public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // KASUS 1: User SUDAH login tapi buka halaman public (signin/signup)
  // Redirect ke dashboard
  if (authRole && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // KASUS 2: User BELUM login tapi buka halaman private (selain public)
  // Redirect ke signin
  if (!authRole && !isPublicPath) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Lanjutkan request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - images (folder gambar public)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, etc)
     */
    '/((?!api|_next/static|_next/image|images|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
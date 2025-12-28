import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Ambil cookie 'auth_role'
  const authRole = request.cookies.get('auth_role')?.value;
  
  // 2. Tentukan halaman yang boleh diakses tanpa login
  // Kita tambahkan /signin dan folder public images agar tidak blank
  const { pathname } = request.nextUrl;

  // Jika user sudah login (punya cookie) dan mencoba akses halaman signin
  if (authRole && pathname === '/signin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Jika user BELUM login dan mencoba akses halaman selain signin
  if (!authRole && pathname !== '/signin') {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

// Konfigurasi agar middleware tidak memblokir file statis (gambar, css, js)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - images (folder gambar public)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
  ],
};
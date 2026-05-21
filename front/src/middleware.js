import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('vector_store_token')?.value;

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isLoginRoute = request.nextUrl.pathname === '/login';

  if (isDashboardRoute) {
    if (!token) {
      // Redirigir al login si no tiene token
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isLoginRoute) {
    if (token) {
      // Redirigir al dashboard si ya tiene sesión activa
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};

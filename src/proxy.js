import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Admin pages: require session cookie (except login page)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }
    const hasSession = request.cookies.get('has_admin_session')?.value === '1';
    if (!hasSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Redirect /en and /en/* → / and /* (301) — avoid duplicate content
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const newPath = pathname.replace(/^\/en/, '') || '/';
    return NextResponse.redirect(new URL(newPath, request.url), 301);
  }

  // Spanish paths: pass through with locale header
  if (pathname.startsWith('/es')) {
    const response = NextResponse.next();
    response.headers.set('x-locale', 'es');
    return response;
  }

  // English (non-prefixed): rewrite internally to /en/...
  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname}`;
  const response = NextResponse.rewrite(url);
  response.headers.set('x-locale', 'en');
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next|reservation|sitemap\\.xml|robots\\.txt|manifest\\.json|.*\\..*).*)',
  ],
};

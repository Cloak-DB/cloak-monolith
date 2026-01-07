import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, locales } from '@/lib/i18n/config';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname starts with a locale
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  // If a locale is found in the path, let it through (including /en)
  // SEO canonical URLs are handled via metadata, not redirects
  if (pathnameLocale) {
    return NextResponse.next();
  }

  // For paths without locale prefix, rewrite internally to default locale
  // e.g., / → /en, /about → /en/about (URL stays the same for user)
  const url = new URL(`/${defaultLocale}${pathname}`, request.url);
  return NextResponse.rewrite(url);
}

export const config = {
  // Match all paths except:
  // - _next (Next.js internals)
  // - api (API routes)
  // - Static files (favicon, images, fonts, files with extensions)
  matcher: ['/((?!_next|api|favicon.ico|images|fonts|.*\\..*).*)'],
};

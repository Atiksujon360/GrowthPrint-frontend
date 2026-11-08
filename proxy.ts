import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isNoIndexPath, resolveLegacyRoute } from './lib/routes.ts';

/**
 * Edge routing rules (Next.js 16 Proxy). This is routing hygiene, NOT authorization: tokens live in the
 * browser and every protected API call is authorized by the backend.
 * - Legacy /portal/* -> 308 to /client-hub/*; legacy /admin/* -> 404 (no hint where the studio moved).
 * - X-Robots-Tag: noindex on private workspace and one-time-link pages.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const decision = resolveLegacyRoute(pathname);

  if (decision.kind === 'redirect') {
    const target = request.nextUrl.clone();
    target.pathname = decision.location;
    target.search = search;
    return NextResponse.redirect(target, 308);
  }

  if (decision.kind === 'not-found') {
    return new NextResponse('Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }

  const response = NextResponse.next();
  if (isNoIndexPath(pathname)) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store');
  }
  return response;
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/admin/:path*',
    '/studio/:path*',
    '/client-hub/:path*',
    '/workspace/:path*',
    '/join-business',
    '/reset-password',
    '/accept-invite',
  ],
};

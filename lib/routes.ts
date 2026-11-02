/**
 * Central route map for GrowthPrint.
 *
 * Route design (see ARCHITECTURE.md "Route map" and SECURITY.md):
 * - Public marketing and account-recovery pages keep short, readable paths.
 * - The internal studio (ADMIN + TEAM_MEMBER) lives under a non-obvious prefix, /studio/ops.
 * - The client workspace lives under /client-hub (clients bookmark it, so old /portal links redirect).
 *
 * The prefixes are NOT a security control: every protected API call is authorized by the backend
 * (JWT + per-request account check + role/permission rules). Obscure paths only reduce noise from
 * scanners probing /admin and keep internal screens out of search indexes.
 */

import type { UserRole } from '../types/auth.ts';

export const STUDIO_BASE = '/studio/ops';
export const CLIENT_HUB_BASE = '/client-hub';

export const ROUTES = {
  public: {
    home: '/',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    acceptInvite: '/accept-invite',
  } as const,

  portal: {
    home: CLIENT_HUB_BASE,
    login: `${CLIENT_HUB_BASE}/login`,
    settings: `${CLIENT_HUB_BASE}/settings`,
  } as const,

  admin: {
    home: STUDIO_BASE,
    login: `${STUDIO_BASE}/login`,
    settings: `${STUDIO_BASE}/settings`,
  } as const,
} as const;

export type PublicRoute = keyof typeof ROUTES.public;
export type PortalRoute = keyof typeof ROUTES.portal;
export type AdminRoute = keyof typeof ROUTES.admin;

const startsWithSegment = (path: string, base: string): boolean =>
  path === base || path.startsWith(`${base}/`);

export const isPublicRoute = (path: string): boolean =>
  (Object.values(ROUTES.public) as string[]).includes(path);

export const isPortalRoute = (path: string): boolean => startsWithSegment(path, CLIENT_HUB_BASE);

export const isAdminRoute = (path: string): boolean => startsWithSegment(path, STUDIO_BASE);

export const isProtectedRoute = (path: string): boolean => isPortalRoute(path) || isAdminRoute(path);

/** Where a signed-in user lands. Team members share the internal studio with the admin. */
export const getDefaultRouteForRole = (role: UserRole): string => {
  switch (role) {
    case 'ADMIN':
    case 'TEAM_MEMBER':
      return ROUTES.admin.home;
    case 'CLIENT':
      return ROUTES.portal.home;
    case 'GUEST':
    default:
      return ROUTES.public.home;
  }
};

/** Login page that belongs to a role (used after password reset / sign-out). */
export const getLoginRouteForRole = (role: UserRole): string =>
  role === 'CLIENT' ? ROUTES.portal.login : role === 'GUEST' ? ROUTES.portal.login : ROUTES.admin.login;

export type LegacyRouteDecision =
  | { kind: 'redirect'; location: string }
  | { kind: 'not-found' }
  | { kind: 'pass' };

/**
 * Old URLs from before the route change:
 * - /portal and /portal/* -> permanent redirect to the same sub-path under /client-hub (client bookmarks
 *   and links in old emails keep working).
 * - /admin and /admin/* -> 404 without a redirect, so the internal studio path is not advertised to
 *   anyone probing the conventional admin URL. The only user of the old path is the agency owner.
 */
export function resolveLegacyRoute(pathname: string): LegacyRouteDecision {
  if (startsWithSegment(pathname, '/portal')) {
    return { kind: 'redirect', location: CLIENT_HUB_BASE + pathname.slice('/portal'.length) };
  }
  if (startsWithSegment(pathname, '/admin')) {
    return { kind: 'not-found' };
  }
  return { kind: 'pass' };
}

/** Private workspace pages and one-time-link pages must never be indexed or cached. */
export const isNoIndexPath = (pathname: string): boolean =>
  isProtectedRoute(pathname) || pathname === ROUTES.public.resetPassword
  || pathname === ROUTES.public.acceptInvite;

/**
 * Central route definitions for GrowthPrint SaaS application
 * Provides type-safe route builders and constants for navigation
 */

// Base paths
export const ROUTES = {
  // Public routes
  public: {
    home: '/',
    services: '/services',
    about: '/about',
    contact: '/contact',
  } as const,

  // Portal routes
  portal: {
    home: '/portal',
    login: '/portal/login',
    projects: '/portal/projects',
    support: '/portal/support',
    proposals: '/portal/proposals',
    invoices: '/portal/invoices',
    messages: '/portal/messages',
    settings: '/portal/settings',
  } as const,

  // Admin routes
  admin: {
    home: '/admin',
    login: '/admin/login',
    clients: '/admin/clients',
    leads: '/admin/leads',
    projects: '/admin/projects',
    support: '/admin/support',
    proposals: '/admin/proposals',
    invoices: '/admin/invoices',
    automation: '/admin/automation',
    activity: '/admin/activity',
    settings: '/admin/settings',
  } as const,
} as const;

// Route type helpers
export type PublicRoute = keyof typeof ROUTES.public;
export type PortalRoute = keyof typeof ROUTES.portal;
export type AdminRoute = keyof typeof ROUTES.admin;

// Navigation helpers
export const isPublicRoute = (path: string): boolean => {
  return Object.values(ROUTES.public).includes(path as any);
};

export const isPortalRoute = (path: string): boolean => {
  return path.startsWith('/portal');
};

export const isAdminRoute = (path: string): boolean => {
  return path.startsWith('/admin');
};

export const isProtectedRoute = (path: string): boolean => {
  return isPortalRoute(path) || isAdminRoute(path);
};

// Default redirect destinations based on role
export const getDefaultRouteForRole = (role: 'ADMIN' | 'CLIENT' | 'GUEST'): string => {
  switch (role) {
    case 'ADMIN':
      return ROUTES.admin.home;
    case 'CLIENT':
      return ROUTES.portal.home;
    case 'GUEST':
    default:
      return ROUTES.public.home;
  }
};

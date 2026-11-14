import type { NextConfig } from 'next';

/**
 * Security headers for every response (production hardening R3, docs/production/SECURITY-AUDIT.md S3).
 *
 * CSP notes:
 * - Scripts: only this origin. Next.js injects inline bootstrap scripts, so 'unsafe-inline' is required until
 *   nonce-based CSP is adopted (follow-up); no third-party script origin is allowed.
 * - 'unsafe-eval' only in development (React Refresh / Turbopack dev runtime).
 * - Styles: 'unsafe-inline' because React style attributes and Next font CSS are inline.
 * - connect-src: this origin plus the configured API origin (NEXT_PUBLIC_API_BASE_URL, read at build time).
 * - Fonts are self-hosted by next/font, so no font CDN is allowed.
 */
const isDev = process.env.NODE_ENV !== 'production';

function apiOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!raw || raw.startsWith('/')) return '';
  try {
    return new URL(raw).origin;
  } catch {
    return '';
  }
}

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin()}${isDev ? ' ws: wss:' : ''}`.trim(),
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;

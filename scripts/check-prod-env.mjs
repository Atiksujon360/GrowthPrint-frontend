#!/usr/bin/env node
/**
 * Production build guard (production hardening R5, SECURITY-AUDIT S9 and S5).
 * Fails when a production build would ship demo data or the sample-data workspace preview, or has no API URL.
 * Usage: GP_TARGET=production node scripts/check-prod-env.mjs   (CI runs it before the production build)
 */
const target = process.env.GP_TARGET ?? 'production';
const errors = [];

if (target === 'production') {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') errors.push('NEXT_PUBLIC_USE_MOCK_API must not be "true" in production (demo data).');
  if (process.env.NEXT_PUBLIC_ENABLE_WORKSPACE_PREVIEW === 'true') errors.push('NEXT_PUBLIC_ENABLE_WORKSPACE_PREVIEW must not be "true" in production (sample-data preview).');
  const api = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  if (!api) errors.push('NEXT_PUBLIC_API_BASE_URL is required.');
  else if (!api.startsWith('https://') && !api.startsWith('/')) errors.push('NEXT_PUBLIC_API_BASE_URL must use https:// in production.');
}

if (errors.length) {
  for (const e of errors) console.error(`✖ ${e}`);
  process.exit(1);
}
console.log(`✔ Environment OK for ${target} build.`);

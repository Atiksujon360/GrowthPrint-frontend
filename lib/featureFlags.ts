/**
 * Build-time feature flags (NEXT_PUBLIC_* values are inlined by Next.js at build time).
 *
 * WORKSPACE_PREVIEW: the MVP2 business workspace runs on sample data kept in the browser until backend Phase 2 is
 * integrated (docs/production/SECURITY-AUDIT.md S5). Off unless NEXT_PUBLIC_ENABLE_WORKSPACE_PREVIEW === 'true',
 * so production never exposes it by accident.
 */
export function isWorkspacePreviewEnabled(value: string | undefined = process.env.NEXT_PUBLIC_ENABLE_WORKSPACE_PREVIEW): boolean {
  return value === 'true';
}

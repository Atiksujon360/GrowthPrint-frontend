'use client';

import { notFound } from 'next/navigation';
import { WorkspaceGuard } from '../../components/shell/WorkspaceGuard.tsx';
import { isWorkspacePreviewEnabled } from '../../lib/featureFlags.ts';

/** MVP2 business workspaces: staff accounts only (same gate as the studio). Business-level access is checked per business. */
export default function WorkspaceRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Sample-data preview: hidden unless NEXT_PUBLIC_ENABLE_WORKSPACE_PREVIEW=true (production hardening R4).
  if (!isWorkspacePreviewEnabled()) notFound();
  return <div className="gp-app min-h-screen"><WorkspaceGuard workspace="admin">{children}</WorkspaceGuard></div>;
}

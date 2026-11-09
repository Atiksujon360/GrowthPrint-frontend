'use client';

import { WorkspaceGuard } from '../../components/shell/WorkspaceGuard.tsx';

/** MVP2 business workspaces: staff accounts only (same gate as the studio). Business-level access is checked per business. */
export default function WorkspaceRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceGuard workspace="admin">{children}</WorkspaceGuard>;
}

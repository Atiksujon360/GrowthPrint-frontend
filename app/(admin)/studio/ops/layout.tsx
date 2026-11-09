'use client';

import { WorkspaceGuard } from '../../../../components/shell/WorkspaceGuard.tsx';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="gp-app min-h-screen"><WorkspaceGuard workspace="admin">{children}</WorkspaceGuard></div>;
}

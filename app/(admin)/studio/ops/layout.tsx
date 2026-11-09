'use client';

import { WorkspaceGuard } from '../../../../components/shell/WorkspaceGuard.tsx';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceGuard workspace="admin">{children}</WorkspaceGuard>;
}

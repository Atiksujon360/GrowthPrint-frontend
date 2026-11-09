'use client';

import { WorkspaceGuard } from '../../../components/shell/WorkspaceGuard.tsx';

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceGuard workspace="portal">{children}</WorkspaceGuard>;
}

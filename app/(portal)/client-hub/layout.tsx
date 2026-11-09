'use client';

import { WorkspaceGuard } from '../../../components/shell/WorkspaceGuard.tsx';

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="gp-app min-h-screen"><WorkspaceGuard workspace="portal">{children}</WorkspaceGuard></div>;
}

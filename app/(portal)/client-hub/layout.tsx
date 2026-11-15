'use client';

import { WorkspaceGuard } from '../../../components/shell/WorkspaceGuard.tsx';
import { ToastContainer } from '../../../components/ui/ToastContainer.tsx';

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="gp-app min-h-screen">
    <WorkspaceGuard workspace="portal">{children}</WorkspaceGuard>
    {/* Confirmations and errors raised with addToast (they were never shown here before). */}
    <ToastContainer />
  </div>;
}

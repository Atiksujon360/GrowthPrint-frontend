'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  PortalLayout,
  PortalDashboard,
  PortalProjectsView,
  PortalRequestsView,
  PortalProposalsView,
  PortalInvoicesView,
  PortalMessagesView,
  type PortalTab
} from '../../../features/portal/index.ts';
import { AccountSettings } from '../../../features/settings/components/AccountSettings.tsx';
import { ROUTES } from '../../../lib/routes.ts';

/** The client hub is one client-side workspace; /client-hub/settings opens it on the settings tab. */
export default function ClientHubPage() {
  const pathname = usePathname();
  const [portalTab, setPortalTab] = useState<PortalTab>(pathname === ROUTES.portal.settings ? 'SETTINGS' : 'DASHBOARD');
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  useEffect(() => {
    if (pathname === ROUTES.portal.settings) setPortalTab('SETTINGS');
  }, [pathname]);

  const handleOpenNewRequest = () => {
    setPortalTab('REQUESTS');
    setIsNewRequestModalOpen(true);
  };

  return (
    <PortalLayout currentTab={portalTab} onTabChange={setPortalTab} onOpenNewRequest={handleOpenNewRequest}>
      {portalTab === 'DASHBOARD' && (
        <PortalDashboard onNavigateTab={setPortalTab} onOpenNewRequest={handleOpenNewRequest} />
      )}
      {portalTab === 'PROJECTS' && <PortalProjectsView />}
      {portalTab === 'REQUESTS' && (
        <PortalRequestsView
          isModalOpen={isNewRequestModalOpen}
          onOpenModal={() => setIsNewRequestModalOpen(true)}
          onCloseModal={() => setIsNewRequestModalOpen(false)}
        />
      )}
      {portalTab === 'PROPOSALS' && <PortalProposalsView />}
      {portalTab === 'INVOICES' && <PortalInvoicesView />}
      {portalTab === 'MESSAGES' && <PortalMessagesView />}
      {portalTab === 'SETTINGS' && <AccountSettings />}
    </PortalLayout>
  );
}

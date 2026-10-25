'use client';

import { useState } from 'react';
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

export default function PortalPage() {
  const [portalTab, setPortalTab] = useState<PortalTab>('DASHBOARD');
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  return (
    <PortalLayout
      currentTab={portalTab}
      onTabChange={setPortalTab}
      onOpenNewRequest={() => setIsNewRequestModalOpen(true)}
    >
      {portalTab === 'DASHBOARD' && (
        <PortalDashboard
          onNavigateTab={setPortalTab}
          onOpenNewRequest={() => setIsNewRequestModalOpen(true)}
        />
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
    </PortalLayout>
  );
}

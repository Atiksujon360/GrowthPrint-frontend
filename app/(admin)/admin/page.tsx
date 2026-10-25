'use client';

import { useState } from 'react';
import {
  AdminLayout,
  AdminDashboard,
  AdminLeadsView,
  AdminOutreachStudio,
  AdminRequestsQueue,
  AdminProjectsView,
  AdminClientsView,
  AdminInvoicesView,
  AdminAutomationView,
  AdminActivityView,
  type AdminTab
} from '../../../features/admin/index.ts';

const ADMIN_TABS: readonly AdminTab[] = [
  'DASHBOARD',
  'LEADS',
  'OUTREACH',
  'REQUESTS',
  'PROJECTS',
  'CLIENTS',
  'INVOICES',
  'AUTOMATION',
  'ACTIVITY'
];

function isAdminTab(tab: string): tab is AdminTab {
  return ADMIN_TABS.includes(tab as AdminTab);
}

export default function AdminPage() {
  const [adminTab, setAdminTab] = useState<AdminTab>('DASHBOARD');
  const [preselectedLeadId, setPreselectedLeadId] = useState<string | undefined>(undefined);

  const handleOpenOutreachFromLead = (leadId: string) => {
    setPreselectedLeadId(leadId);
    setAdminTab('OUTREACH');
  };

  return (
    <AdminLayout
      currentTab={adminTab}
      onTabChange={setAdminTab}
    >
      {adminTab === 'DASHBOARD' && (
        <AdminDashboard onNavigateTab={setAdminTab} />
      )}

      {adminTab === 'LEADS' && (
        <AdminLeadsView onOpenOutreach={handleOpenOutreachFromLead} />
      )}

      {adminTab === 'OUTREACH' && (
        <AdminOutreachStudio preselectedLeadId={preselectedLeadId} />
      )}

      {adminTab === 'REQUESTS' && <AdminRequestsQueue />}

      {adminTab === 'PROJECTS' && <AdminProjectsView />}

      {adminTab === 'CLIENTS' && <AdminClientsView />}

      {adminTab === 'INVOICES' && <AdminInvoicesView />}

      {adminTab === 'AUTOMATION' && <AdminAutomationView />}

      {adminTab === 'ACTIVITY' && <AdminActivityView />}
    </AdminLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
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
  AdminAiSettingsView,
  type AdminTab
} from '../../../../features/admin/index.ts';
import { AccountSettings } from '../../../../features/settings/components/AccountSettings.tsx';
import { TeamManagement } from '../../../../features/settings/components/TeamManagement.tsx';
import { Notice } from '../../../../components/ui/forms.tsx';
import { canUseStudioTab } from '../../../../lib/access.ts';
import { ROUTES } from '../../../../lib/routes.ts';
import { useAppSelector } from '../../../../store/hooks.ts';

/** The studio is one client-side workspace; /studio/ops/settings opens it on the settings tab. */
export default function StudioPage() {
  const pathname = usePathname();
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const [adminTab, setAdminTab] = useState<AdminTab>(pathname === ROUTES.admin.settings ? 'SETTINGS' : 'DASHBOARD');
  const [preselectedLeadId, setPreselectedLeadId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (pathname === ROUTES.admin.settings) setAdminTab('SETTINGS');
  }, [pathname]);

  const handleOpenOutreachFromLead = (leadId: string) => {
    setPreselectedLeadId(leadId);
    setAdminTab('OUTREACH');
  };

  const allowed = canUseStudioTab(currentUser, adminTab);

  return (
    <AdminLayout currentTab={adminTab} onTabChange={setAdminTab}>
      {!allowed && (
        <Notice tone="warning" title="You don't have access to this area">
          Ask the administrator to grant you this module. Your available areas are listed in the menu.
        </Notice>
      )}
      {allowed && adminTab === 'DASHBOARD' && (
        currentUser.role === 'ADMIN'
          ? <AdminDashboard onNavigateTab={setAdminTab} />
          : <Notice tone="info" title={`Welcome, ${currentUser.name}`}>
              Use the menu to open the areas you work on. Your access is managed by the administrator.
            </Notice>
      )}
      {allowed && adminTab === 'LEADS' && <AdminLeadsView onOpenOutreach={handleOpenOutreachFromLead} />}
      {allowed && adminTab === 'OUTREACH' && <AdminOutreachStudio preselectedLeadId={preselectedLeadId} />}
      {allowed && adminTab === 'REQUESTS' && <AdminRequestsQueue />}
      {allowed && adminTab === 'PROJECTS' && <AdminProjectsView />}
      {allowed && adminTab === 'CLIENTS' && <AdminClientsView />}
      {allowed && adminTab === 'INVOICES' && <AdminInvoicesView />}
      {allowed && adminTab === 'AUTOMATION' && <AdminAutomationView />}
      {allowed && adminTab === 'ACTIVITY' && <AdminActivityView />}
      {allowed && adminTab === 'AI_SETTINGS' && <AdminAiSettingsView />}
      {allowed && adminTab === 'TEAM' && <TeamManagement />}
      {allowed && adminTab === 'SETTINGS' && <AccountSettings />}
    </AdminLayout>
  );
}

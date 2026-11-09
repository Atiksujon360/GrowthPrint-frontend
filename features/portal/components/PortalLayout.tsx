import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { useRouter } from 'next/navigation';
import { logout } from '../../auth/authSlice.ts';
import { initialsOf } from '../../../lib/access.ts';
import { ROUTES } from '../../../lib/routes.ts';
import {
  LayoutDashboard,
  FolderKanban,
  TicketCheck,
  FileText,
  CreditCard,
  MessageSquare,
  LogOut,
  Plus,
  Settings
} from 'lucide-react';
import { NotificationDropdown } from '../../../components/ui/NotificationDropdown.tsx';
import { LiveSyncIndicator } from '../../../components/ui/LiveSyncIndicator.tsx';
import { AppShell, type ShellNavGroup } from '../../../components/shell/AppShell.tsx';

export type PortalTab = 'DASHBOARD' | 'PROJECTS' | 'REQUESTS' | 'PROPOSALS' | 'INVOICES' | 'MESSAGES' | 'SETTINGS';

interface PortalLayoutProps {
  currentTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  onOpenNewRequest: () => void;
  children: React.ReactNode;
}

const TAB_META: Record<PortalTab, { title: string; subtitle: string }> = {
  DASHBOARD: { title: 'Overview', subtitle: 'Your projects, requests and billing at a glance' },
  PROJECTS: { title: 'Projects', subtitle: 'Milestones and progress on your work' },
  REQUESTS: { title: 'Requests', subtitle: 'Support requests, estimates and approvals' },
  PROPOSALS: { title: 'Proposals', subtitle: 'Proposals waiting for your review' },
  INVOICES: { title: 'Billing', subtitle: 'Invoices, payments and payment reports' },
  MESSAGES: { title: 'Messages', subtitle: 'Conversations with the GrowthPrint team' },
  SETTINGS: { title: 'Account settings', subtitle: 'Your profile, password and sessions' },
};

export function PortalLayout({ currentTab, onTabChange, onOpenNewRequest, children }: PortalLayoutProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { currentUser } = useAppSelector(state => state.auth);

  const handleSignOut = async () => {
    await dispatch(logout());
    router.replace(ROUTES.portal.login);
  };
  const requests = useAppSelector(state => state.agency.requests);
  const invoices = useAppSelector(state => state.agency.invoices);

  // Client-scoped pending badges
  const pendingApprovals = requests.filter(
    r => r.clientId === currentUser.clientId && r.status === 'AWAITING_CLIENT_APPROVAL'
  ).length;
  const unpaidInvoices = invoices.filter(
    i => i.clientId === currentUser.clientId && i.status === 'ISSUED'
  ).length;

  const navItems: Array<{ id: PortalTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: { count: number; label: string } }> = [
    { id: 'DASHBOARD', label: 'Overview', icon: LayoutDashboard },
    { id: 'PROJECTS', label: 'Projects', icon: FolderKanban },
    { id: 'REQUESTS', label: 'Requests', icon: TicketCheck,
      badge: pendingApprovals > 0 ? { count: pendingApprovals, label: 'to approve' } : undefined },
    { id: 'PROPOSALS', label: 'Proposals', icon: FileText },
    { id: 'INVOICES', label: 'Billing', icon: CreditCard,
      badge: unpaidInvoices > 0 ? { count: unpaidInvoices, label: 'due' } : undefined },
    { id: 'MESSAGES', label: 'Messages', icon: MessageSquare },
  ];
  const groups: ShellNavGroup[] = [
    { label: 'Client hub', items: navItems.map(item => ({ key: item.id, label: item.label, icon: item.icon, badge: item.badge,
      active: currentTab === item.id, onSelect: () => onTabChange(item.id) })) },
    { label: 'Account', items: [{ key: 'SETTINGS', label: 'Account settings', icon: Settings,
      active: currentTab === 'SETTINGS', onSelect: () => onTabChange('SETTINGS') }] },
  ];

  const meta = TAB_META[currentTab];

  return (
    <AppShell
      brand={{ title: 'GrowthPrint', href: ROUTES.portal.home }}
      navLabel="Client hub navigation"
      groups={groups}
      sidebarTop={(
        <div className="space-y-3">
          <div className="rounded-gp-control bg-white/8 px-3 py-2.5">
            <p className="text-xs text-white/55">Client organization</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-white">{currentUser.clientName || 'Client Portal'}</p>
          </div>
          <button type="button" onClick={onOpenNewRequest}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-gp-control bg-gp-primary text-sm font-semibold text-white transition-colors hover:bg-gp-primary-hover">
            <Plus className="h-4 w-4" aria-hidden="true" /> Submit request
          </button>
        </div>
      )}
      user={{ name: currentUser.name, subtitle: currentUser.email, initials: initialsOf(currentUser.name, currentUser.email) }}
      userMenu={[
        { label: 'Account settings', icon: Settings, onSelect: () => onTabChange('SETTINGS') },
        { label: 'Sign out', icon: LogOut, onSelect: () => void handleSignOut(), danger: true },
      ]}
      title={meta.title}
      subtitle={meta.subtitle}
      topbarActions={(
        <>
          <div className="hidden 2xl:block"><LiveSyncIndicator /></div>
          <NotificationDropdown onNavigateTab={(tab) => onTabChange(tab as PortalTab)} />
          {/* On narrower screens the sidebar is a rail or a drawer, so the main action lives here too. */}
          <button type="button" onClick={onOpenNewRequest}
            className="flex h-9 items-center gap-1.5 rounded-gp-control bg-gp-primary px-3 text-sm font-semibold text-white hover:bg-gp-primary-hover xl:hidden">
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Submit request</span>
            <span className="sr-only sm:hidden">Submit request</span>
          </button>
        </>
      )}
    >
      {children}
    </AppShell>
  );
}

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { useRouter } from 'next/navigation';
import { logout } from '../../auth/authSlice.ts';
import { canUseStudioTab, initialsOf } from '../../../lib/access.ts';
import { ROUTES } from '../../../lib/routes.ts';
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderKanban,
  TicketCheck,
  Sparkles,
  Send,
  CreditCard,
  Workflow,
  History,
  LogOut,
  Search,
  Plus,
  Keyboard,
  Bot,
  Settings,
  UserCog
} from 'lucide-react';
import { CommandPalette } from '../../../components/ui/CommandPalette.tsx';
import { QuickCreateModal } from './QuickCreateModal.tsx';
import { NotificationDropdown } from '../../../components/ui/NotificationDropdown.tsx';
import { LiveSyncIndicator } from '../../../components/ui/LiveSyncIndicator.tsx';
import { SystemAlertBanner } from '../../../components/ui/SystemAlertBanner.tsx';
import { KeyboardShortcutsModal } from '../../../components/ui/KeyboardShortcutsModal.tsx';
import { setShortcutsModalOpen } from '../../../store/index.ts';
import { AppShell, TopbarIconButton, type ShellNavGroup } from '../../../components/shell/AppShell.tsx';

export type AdminTab =
  | 'DASHBOARD'
  | 'LEADS'
  | 'OUTREACH'
  | 'REQUESTS'
  | 'PROJECTS'
  | 'CLIENTS'
  | 'INVOICES'
  | 'AUTOMATION'
  | 'ACTIVITY'
  | 'AI_SETTINGS'
  | 'SETTINGS'
  | 'TEAM';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: React.ReactNode;
}

/** Page title and one-line description shown in the top bar for each studio area. */
const TAB_META: Record<AdminTab, { title: string; subtitle: string }> = {
  DASHBOARD: { title: 'Dashboard', subtitle: 'Cash, pipeline, delivery and what needs you today' },
  LEADS: { title: 'Leads & CRM', subtitle: 'Find, qualify and move leads through the pipeline' },
  OUTREACH: { title: 'Outreach approvals', subtitle: 'Review drafted outreach before anything is sent' },
  CLIENTS: { title: 'Clients', subtitle: 'Client accounts, contacts and retainers' },
  PROJECTS: { title: 'Projects', subtitle: 'Active delivery, milestones and progress' },
  REQUESTS: { title: 'Support queue', subtitle: 'Client requests, triage and service levels' },
  INVOICES: { title: 'Invoices & revenue', subtitle: 'Billing, payments and payment reports' },
  AUTOMATION: { title: 'Automation', subtitle: 'Background jobs and their latest runs' },
  ACTIVITY: { title: 'Activity log', subtitle: 'Everything that changed, newest first' },
  AI_SETTINGS: { title: 'AI providers', subtitle: 'Models, keys and usage limits for AI features' },
  TEAM: { title: 'Users & team', subtitle: 'Studio accounts, roles and module access' },
  SETTINGS: { title: 'Account settings', subtitle: 'Your profile, password and sessions' },
};

export function AdminLayout({ currentTab, onTabChange, children }: AdminLayoutProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { currentUser } = useAppSelector(state => state.auth);
  const isAdmin = currentUser.role === 'ADMIN';

  const handleSignOut = async () => {
    await dispatch(logout());
    router.replace(ROUTES.admin.login);
  };
  const requests = useAppSelector(state => state.agency.requests);
  const outreach = useAppSelector(state => state.agency.outreachDrafts);
  const leads = useAppSelector(state => state.agency.leads);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const pendingClassification = requests.filter(r => r.status === 'NEW' || r.status === 'NEEDS_CLASSIFICATION').length;
  const pendingOutreachApprovals = outreach.filter(d => d.status === 'AWAITING_HUMAN_APPROVAL').length;
  const readyOutreachLeads = leads.filter(l => l.pipelineStage === 'READY_FOR_OUTREACH').length;

  const allNavGroups: Array<{ group: string; items: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: { count: number; label: string } }> }> = [
    { group: 'Overview', items: [{ id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard }] },
    {
      group: 'Growth',
      items: [
        { id: 'LEADS', label: 'Leads & CRM', icon: Sparkles,
          badge: readyOutreachLeads > 0 ? { count: readyOutreachLeads, label: 'ready for outreach' } : undefined },
        { id: 'OUTREACH', label: 'Outreach approvals', icon: Send,
          badge: pendingOutreachApprovals > 0 ? { count: pendingOutreachApprovals, label: 'to review' } : undefined },
        { id: 'CLIENTS', label: 'Clients', icon: Users },
      ]
    },
    {
      group: 'Delivery',
      items: [
        { id: 'PROJECTS', label: 'Projects', icon: FolderKanban },
        { id: 'REQUESTS', label: 'Support queue', icon: TicketCheck,
          badge: pendingClassification > 0 ? { count: pendingClassification, label: 'new' } : undefined },
        { id: 'INVOICES', label: 'Invoices & revenue', icon: CreditCard },
      ]
    },
    {
      group: 'System',
      items: [
        { id: 'AUTOMATION', label: 'Automation', icon: Workflow },
        { id: 'ACTIVITY', label: 'Activity log', icon: History },
        { id: 'AI_SETTINGS', label: 'AI providers', icon: Bot },
      ]
    },
    {
      group: 'Account',
      items: [
        { id: 'TEAM', label: 'Users & team', icon: UserCog },
        { id: 'SETTINGS', label: 'Settings', icon: Settings },
      ]
    }
  ];

  // Team members only see the modules an admin granted them. Convenience only: the backend answers 403
  // for anything else.
  const groups: ShellNavGroup[] = allNavGroups
    .map(group => ({
      label: group.group,
      items: group.items
        .filter(item => canUseStudioTab(currentUser, item.id))
        .map(item => ({ key: item.id, label: item.label, icon: item.icon, badge: item.badge,
          active: currentTab === item.id, onSelect: () => onTabChange(item.id) })),
    }))
    .filter(group => group.items.length > 0);
  groups.push({
    label: 'Preview',
    items: [{ key: 'workspaces', label: 'Business workspaces', icon: Building2, active: false, href: ROUTES.workspace.home }],
  });

  const meta = TAB_META[currentTab];

  return (
    <>
      <AppShell
        brand={{ title: 'GrowthPrint Studio', href: ROUTES.admin.home }}
        navLabel="Studio navigation"
        groups={groups}
        user={{
          name: currentUser.name || currentUser.email,
          subtitle: isAdmin ? 'Administrator, full access' : `Team member, ${currentUser.permissions?.length ?? 0} modules`,
          initials: initialsOf(currentUser.name, currentUser.email),
        }}
        userMenu={[
          { label: 'Account settings', icon: Settings, onSelect: () => onTabChange('SETTINGS') },
          { label: 'Keyboard shortcuts', icon: Keyboard, onSelect: () => dispatch(setShortcutsModalOpen(true)) },
          { label: 'Business workspaces', icon: Building2, href: ROUTES.workspace.home },
          { label: 'Sign out', icon: LogOut, onSelect: () => void handleSignOut(), danger: true },
        ]}
        title={meta.title}
        subtitle={meta.subtitle}
        topbarActions={(
          <>
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden h-9 w-60 items-center gap-2 rounded-gp-control border border-gp-border bg-gp-canvas px-3 text-sm text-gp-text-secondary transition-colors hover:border-ink-300 lg:flex"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="flex-1 truncate text-left">Search or jump to…</span>
              <kbd className="rounded border border-gp-border bg-gp-surface px-1.5 text-[0.7rem] font-medium">⌘K</kbd>
            </button>
            <TopbarIconButton label="Search" onClick={() => setIsCommandPaletteOpen(true)} className="lg:hidden">
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            </TopbarIconButton>
            <div className="hidden 2xl:block"><LiveSyncIndicator /></div>
            <NotificationDropdown onNavigateTab={(tab) => onTabChange(tab as AdminTab)} />
            <TopbarIconButton label="Keyboard shortcuts" onClick={() => dispatch(setShortcutsModalOpen(true))} className="hidden sm:flex">
              <Keyboard className="h-[18px] w-[18px]" aria-hidden="true" />
            </TopbarIconButton>
            <button
              type="button"
              onClick={() => setIsQuickCreateOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-gp-control bg-gp-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-gp-primary-hover"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">New record</span>
              <span className="sr-only sm:hidden">New record</span>
            </button>
          </>
        )}
        banner={<SystemAlertBanner onNavigateTab={(tab) => onTabChange(tab as AdminTab)} />}
      >
        {children}
      </AppShell>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={onTabChange}
        onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
      />

      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
      />

      <KeyboardShortcutsModal
        onNavigateTab={(tab) => onTabChange(tab as AdminTab)}
        onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
      />
    </>
  );
}

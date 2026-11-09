import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Menu,
  X,
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
import { GrowthPrintMark } from '../../public/components/GrowthPrintMark.tsx';

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

/** Page title and one-line description shown in the header for each studio area. */
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const pendingClassification = requests.filter(r => r.status === 'NEW' || r.status === 'NEEDS_CLASSIFICATION').length;
  const pendingOutreachApprovals = outreach.filter(d => d.status === 'AWAITING_HUMAN_APPROVAL').length;
  const readyOutreachLeads = leads.filter(l => l.pipelineStage === 'READY_FOR_OUTREACH').length;

  // Escape closes the mobile menu and returns focus to its button.
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    if (mobileMenuOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Focus trap for the mobile menu.
  useEffect(() => {
    const menu = menuRef.current;
    if (!mobileMenuOpen || !menu) return;
    const focusable = menu.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    menu.addEventListener('keydown', handleTab);
    return () => menu.removeEventListener('keydown', handleTab);
  }, [mobileMenuOpen]);

  const allNavGroups = [
    {
      group: 'Overview',
      items: [{ id: 'DASHBOARD' as AdminTab, label: 'Dashboard', icon: LayoutDashboard }]
    },
    {
      group: 'Growth',
      items: [
        { id: 'LEADS' as AdminTab, label: 'Leads & CRM', icon: Sparkles,
          badge: readyOutreachLeads > 0 ? { count: readyOutreachLeads, label: 'ready for outreach' } : undefined },
        { id: 'OUTREACH' as AdminTab, label: 'Outreach approvals', icon: Send,
          badge: pendingOutreachApprovals > 0 ? { count: pendingOutreachApprovals, label: 'to review' } : undefined },
        { id: 'CLIENTS' as AdminTab, label: 'Clients', icon: Users },
      ]
    },
    {
      group: 'Delivery',
      items: [
        { id: 'PROJECTS' as AdminTab, label: 'Projects', icon: FolderKanban },
        { id: 'REQUESTS' as AdminTab, label: 'Support queue', icon: TicketCheck,
          badge: pendingClassification > 0 ? { count: pendingClassification, label: 'new' } : undefined },
        { id: 'INVOICES' as AdminTab, label: 'Invoices & revenue', icon: CreditCard },
      ]
    },
    {
      group: 'System',
      items: [
        { id: 'AUTOMATION' as AdminTab, label: 'Automation', icon: Workflow },
        { id: 'ACTIVITY' as AdminTab, label: 'Activity log', icon: History },
        { id: 'AI_SETTINGS' as AdminTab, label: 'AI providers', icon: Bot },
      ]
    },
    {
      group: 'Account',
      items: [
        { id: 'TEAM' as AdminTab, label: 'Users & team', icon: UserCog },
        { id: 'SETTINGS' as AdminTab, label: 'Settings', icon: Settings },
      ]
    }
  ];

  // Team members only see the modules an admin granted them. Convenience only: the backend answers 403
  // for anything else.
  const navGroups = allNavGroups
    .map(group => ({ ...group, items: group.items.filter(item => canUseStudioTab(currentUser, item.id)) }))
    .filter(group => group.items.length > 0);

  const meta = TAB_META[currentTab];

  const navList = (onPick?: () => void) => (
    <>
      {navGroups.map(grp => (
        <div key={grp.group} className="space-y-0.5">
          <p className="px-3 pb-1 pt-4 text-xs font-medium text-ink-400">{grp.group}</p>
          {grp.items.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); onPick?.(); }}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[0.92rem] font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-950'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-brand-600' : 'text-ink-400 group-hover:text-ink-700'}`} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[0.72rem] font-semibold tabular-nums text-amber-800">
                    {item.badge.count}<span className="sr-only"> {item.badge.label}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
      <div className="space-y-0.5">
        <p className="px-3 pb-1 pt-4 text-xs font-medium text-ink-400">Preview</p>
        <a href={ROUTES.workspace.home}
          className="group flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-[0.92rem] font-medium text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-950">
          <Building2 className="h-[18px] w-[18px] shrink-0 text-ink-400 group-hover:text-ink-700" aria-hidden="true" />
          <span className="truncate">Business workspaces</span>
        </a>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink-200 bg-white md:flex" aria-label="Studio">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <GrowthPrintMark className="h-7 w-7" />
          <span className="gp-display text-[1.05rem] font-semibold text-ink-950">GrowthPrint Studio</span>
        </div>
        <nav aria-label="Studio navigation" className="flex-1 overflow-y-auto px-3 pb-4">
          {navList()}
        </nav>
        <div className="border-t border-ink-200 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-950 text-xs font-semibold text-white" aria-hidden="true">
              {initialsOf(currentUser.name, currentUser.email)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink-900">{currentUser.name || currentUser.email}</span>
              <span className="block truncate text-xs text-ink-500">{isAdmin ? 'Administrator, full access' : `Team member, ${currentUser.permissions?.length ?? 0} modules`}</span>
            </span>
            <button onClick={() => void handleSignOut()} aria-label="Sign out"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              ref={menuButtonRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="-ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 md:hidden"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="gp-display truncate text-lg font-semibold leading-tight text-ink-950">{meta.title}</h1>
              <p className="hidden truncate text-sm text-ink-500 sm:block">{meta.subtitle}</p>
            </div>

            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden h-10 w-64 items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 text-sm text-ink-500 transition-colors hover:border-ink-300 hover:bg-white lg:flex"
            >
              <Search className="h-4 w-4 text-ink-400" aria-hidden="true" />
              <span className="flex-1 truncate text-left">Search or jump to…</span>
              <kbd className="rounded border border-ink-200 bg-white px-1.5 text-[0.7rem] font-medium text-ink-500">⌘K</kbd>
            </button>
            <button onClick={() => setIsCommandPaletteOpen(true)} aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 lg:hidden">
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="hidden xl:block"><LiveSyncIndicator /></div>

            <NotificationDropdown onNavigateTab={(tab) => onTabChange(tab as AdminTab)} />

            <button
              onClick={() => dispatch(setShortcutsModalOpen(true))}
              title="Keyboard shortcuts (?)"
              aria-label="Keyboard shortcuts"
              className="hidden h-10 w-10 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 sm:flex"
            >
              <Keyboard className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>

            <button
              onClick={() => setIsQuickCreateOpen(true)}
              className="flex h-10 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">New record</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('SETTINGS')}
              className="flex h-10 w-10 items-center justify-center rounded-full md:hidden"
              aria-label="Open account settings"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-950 text-xs font-semibold text-white" aria-hidden="true">
                {initialsOf(currentUser.name, currentUser.email)}
              </span>
            </button>
          </div>
        </header>

        <SystemAlertBanner onNavigateTab={(tab) => onTabChange(tab as AdminTab)} />

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <motion.button
                type="button" aria-label="Close navigation menu" tabIndex={-1}
                className="absolute inset-0 bg-navy-950/40"
                onClick={() => setMobileMenuOpen(false)}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              />
              <motion.div
                ref={menuRef}
                id="mobile-menu"
                role="navigation"
                aria-label="Mobile navigation"
                className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col bg-white shadow-xl"
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.22, ease: [0.2, 0, 0, 1] }}
              >
                <div className="flex h-16 items-center justify-between px-4">
                  <span className="flex items-center gap-2.5">
                    <GrowthPrintMark className="h-7 w-7" />
                    <span className="gp-display font-semibold text-ink-950">GrowthPrint Studio</span>
                  </span>
                  <button onClick={() => { setMobileMenuOpen(false); menuButtonRef.current?.focus(); }} aria-label="Close navigation menu"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100">
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-3 pb-4">{navList(() => setMobileMenuOpen(false))}</div>
                <div className="border-t border-ink-200 p-3">
                  <button onClick={() => void handleSignOut()}
                    className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-ink-600 hover:bg-ink-50">
                    <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <main className="mx-auto w-full max-w-[90rem] flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

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
    </div>
  );
}

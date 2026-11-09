import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Settings,
  Menu,
  X
} from 'lucide-react';
import { NotificationDropdown } from '../../../components/ui/NotificationDropdown.tsx';
import { LiveSyncIndicator } from '../../../components/ui/LiveSyncIndicator.tsx';
import { GrowthPrintMark } from '../../public/components/GrowthPrintMark.tsx';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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

  const navItems = [
    { id: 'DASHBOARD' as PortalTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'PROJECTS' as PortalTab, label: 'Projects', icon: FolderKanban },
    { id: 'REQUESTS' as PortalTab, label: 'Requests', icon: TicketCheck,
      badge: pendingApprovals > 0 ? `${pendingApprovals} to approve` : undefined },
    { id: 'PROPOSALS' as PortalTab, label: 'Proposals', icon: FileText },
    { id: 'INVOICES' as PortalTab, label: 'Billing', icon: CreditCard,
      badge: unpaidInvoices > 0 ? `${unpaidInvoices} due` : undefined },
    { id: 'MESSAGES' as PortalTab, label: 'Messages', icon: MessageSquare },
    { id: 'SETTINGS' as PortalTab, label: 'Account settings', icon: Settings }
  ];

  // Escape and focus trap for the mobile drawer.
  useEffect(() => {
    const menu = menuRef.current;
    if (!mobileMenuOpen || !menu) return;
    const focusable = menu.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMobileMenuOpen(false); menuButtonRef.current?.focus(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const meta = TAB_META[currentTab];

  const nav = (onPick?: () => void) => (
    <div className="space-y-0.5">
      {navItems.map(item => {
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
            {item.badge && <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[0.7rem] font-semibold text-amber-800">{item.badge}</span>}
          </button>
        );
      })}
    </div>
  );

  const clientCard = (
    <div className="rounded-xl border border-ink-200 bg-ink-50 px-3 py-2.5">
      <p className="text-xs text-ink-500">Client organization</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-ink-950">{currentUser.clientName || 'Client Portal'}</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink-200 bg-white md:flex" aria-label="Client hub">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <GrowthPrintMark className="h-7 w-7" />
          <span className="gp-display text-[1.05rem] font-semibold text-ink-950">GrowthPrint</span>
        </div>
        <div className="space-y-3 px-3">
          {clientCard}
          <button onClick={onOpenNewRequest}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
            <Plus className="h-4 w-4" aria-hidden="true" /> Submit request
          </button>
        </div>
        <nav aria-label="Client hub navigation" className="mt-4 flex-1 overflow-y-auto px-3">{nav()}</nav>
        <div className="border-t border-ink-200 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800" aria-hidden="true">
              {initialsOf(currentUser.name, currentUser.email)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink-900">{currentUser.name}</span>
              <span className="block truncate text-xs text-ink-500">{currentUser.email}</span>
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
            <button ref={menuButtonRef} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="-ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 md:hidden"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen} aria-controls="portal-mobile-menu">
              {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="gp-display truncate text-lg font-semibold leading-tight text-ink-950">{meta.title}</h1>
              <p className="hidden truncate text-sm text-ink-500 sm:block">{meta.subtitle}</p>
            </div>
            <div className="hidden lg:block"><LiveSyncIndicator /></div>
            <NotificationDropdown onNavigateTab={(tab) => onTabChange(tab as PortalTab)} />
            <button onClick={onOpenNewRequest}
              className="flex h-10 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-sm font-semibold text-white hover:bg-brand-700 md:hidden">
              <Plus className="h-4 w-4" aria-hidden="true" /><span className="sr-only sm:not-sr-only">Request</span>
            </button>
            <button type="button" onClick={() => onTabChange('SETTINGS')} aria-label="Open account settings"
              className="flex h-10 w-10 items-center justify-center rounded-full">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800" aria-hidden="true">
                {initialsOf(currentUser.name, currentUser.email)}
              </span>
            </button>
          </div>
        </header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <motion.button type="button" aria-label="Close navigation menu" tabIndex={-1}
                className="absolute inset-0 bg-navy-950/40" onClick={() => setMobileMenuOpen(false)}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              <motion.div ref={menuRef} id="portal-mobile-menu" role="navigation" aria-label="Mobile navigation"
                className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col gap-4 bg-white p-3 shadow-xl"
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.22, ease: [0.2, 0, 0, 1] }}>
                <div className="flex h-12 items-center justify-between px-2">
                  <span className="flex items-center gap-2.5">
                    <GrowthPrintMark className="h-7 w-7" />
                    <span className="gp-display font-semibold text-ink-950">GrowthPrint</span>
                  </span>
                  <button onClick={() => { setMobileMenuOpen(false); menuButtonRef.current?.focus(); }} aria-label="Close navigation menu"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100">
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                {clientCard}
                <div className="flex-1 overflow-y-auto">{nav(() => setMobileMenuOpen(false))}</div>
                <button onClick={() => void handleSignOut()}
                  className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-ink-600 hover:bg-ink-50">
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <main className="mx-auto w-full max-w-[90rem] flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

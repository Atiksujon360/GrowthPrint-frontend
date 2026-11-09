'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity as ActivityIcon, ArrowLeftRight, Briefcase, Check, ChevronDown, LayoutDashboard, LogOut, Menu, Plus,
  Settings, Target, Users, X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { logout } from '../../auth/authSlice.ts';
import { initialsOf } from '../../../lib/access.ts';
import { ROUTES, workspaceRoutes } from '../../../lib/routes.ts';
import { ROLE_LABEL, can } from '../model/permissions.ts';
import type { Business } from '../model/types.ts';
import { useBusinessQuery, useMyBusinessesQuery } from '../api/workspaceApi.ts';
import { USING_MOCK_WORKSPACE_DATA, resetWorkspaceDemoData } from '../services/index.ts';
import { workspaceApi } from '../api/workspaceApi.ts';
import { AppShell } from '../../../components/shell/AppShell.tsx';

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

function useNav(businessId: string, business: Business | undefined) {
  const r = workspaceRoutes(businessId);
  const role = business?.myRole;
  return [
    { href: r.home, label: 'Command Centre', icon: LayoutDashboard, exact: true, show: true },
    { href: r.clients, label: 'Clients', icon: Briefcase, show: can(role, 'clients.view') },
    { href: r.leads, label: 'Leads & pipeline', icon: Target, show: can(role, 'leads.view') },
    { href: r.team, label: 'Team', icon: Users, show: can(role, 'members.view') },
    { href: r.activity, label: 'Activity', icon: ActivityIcon, show: true },
    { href: r.settings, label: 'Settings', icon: Settings, show: true },
  ].filter(i => i.show);
}

/** Business switcher: a disclosure button with a list of the user's businesses. */
export function BusinessSwitcher({ current }: { current?: Business }) {
  const { data: businesses = [] } = useMyBusinessesQuery();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls={menuId}
        aria-label={current ? `Current business: ${current.name}. Switch business` : 'Choose a business'}
        className="flex w-full items-center gap-3 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-ink-300">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold text-white" aria-hidden="true">
          {initialsOf(current?.name ?? '?')}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink-950">{current?.name ?? 'Choose a business'}</span>
          <span className="block truncate text-xs text-ink-500">{current ? ROLE_LABEL[current.myRole] : ''}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-ink-400" aria-hidden="true" />
      </button>
      {open && (
        <div id={menuId} className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-xl">
          <p className="px-3 pt-3 text-xs font-medium text-ink-500">Your businesses</p>
          <ul className="max-h-64 overflow-y-auto p-1.5">
            {businesses.map(b => (
              <li key={b.id}>
                <button type="button" onClick={() => { setOpen(false); router.push(workspaceRoutes(b.id).home); }}
                  aria-current={b.id === current?.id ? 'true' : undefined}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-ink-50">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink-100 text-xs font-semibold text-ink-700" aria-hidden="true">
                    {initialsOf(b.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-ink-900">{b.name}</span>
                    <span className="block text-xs text-ink-500">{ROLE_LABEL[b.myRole]}</span>
                  </span>
                  {b.id === current?.id && <Check className="h-4 w-4 text-brand-600" aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-ink-100 p-1.5">
            <Link href={ROUTES.workspace.newBusiness} onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
              <Plus className="h-4 w-4" aria-hidden="true" /> Create a business
            </Link>
            <Link href={ROUTES.workspace.home} onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-700 hover:bg-ink-50">
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" /> All businesses
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function MockDataBanner() {
  const dispatch = useAppDispatch();
  if (!USING_MOCK_WORKSPACE_DATA) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900">
      <span><strong>Preview data.</strong> This workspace runs on sample data stored in this browser tab until the backend is connected.</span>
      <button type="button" className="font-semibold underline underline-offset-2"
        onClick={() => { resetWorkspaceDemoData(); dispatch(workspaceApi.util.resetApiState()); }}>
        Reset sample data
      </button>
    </div>
  );
}

export function WorkspaceShell({ businessId, children }: { businessId: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.currentUser);
  const { data: business } = useBusinessQuery(businessId);
  const nav = useNav(businessId, business);

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  const signOut = async () => {
    dispatch(workspaceApi.util.resetApiState());
    await dispatch(logout());
    router.replace(ROUTES.admin.login);
  };

  const active = nav.find(item => isActive(item.href, item.exact));

  return (
    <AppShell
      brand={{ title: 'GrowthPrint', href: ROUTES.workspace.home }}
      navLabel="Workspace"
      groups={[{ label: business?.name ?? 'Business', items: nav.map(item => ({
        key: item.href, label: item.label, icon: item.icon, href: item.href, active: isActive(item.href, item.exact),
      })) }]}
      user={{ name: user.name || user.email, subtitle: user.email, initials: initialsOf(user.name, user.email) }}
      userMenu={[
        { label: 'All businesses', icon: ArrowLeftRight, href: ROUTES.workspace.home },
        { label: 'Back to studio', icon: LayoutDashboard, href: ROUTES.admin.home },
        { label: 'Sign out', icon: LogOut, onSelect: () => void signOut(), danger: true },
      ]}
      // Workspace pages render their own h1 (PageHeader), so the top bar title is not a heading.
      titleAs="p"
      title={active?.label ?? 'Workspace'}
      subtitle={business ? `${business.name} · ${ROLE_LABEL[business.myRole]}` : undefined}
      topbarContext={<div className="w-64"><BusinessSwitcher current={business} /></div>}
      banner={<MockDataBanner />}
    >
      {children}
    </AppShell>
  );
}

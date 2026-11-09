'use client';

import { useEffect, useId, useRef, useState, type ComponentType, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { GrowthPrintMark } from '../../features/public/components/GrowthPrintMark.tsx';

/**
 * Presentational application shell (Enterprise UI Kit, reference A): navy navigation rail, white top bar, canvas.
 * Used by the studio, client hub and business workspace layouts, which keep all state and logic (permissions,
 * badges, sign-out, tabs) and pass it in. Responsive: full sidebar >= 1280px, 72px icon rail 768-1279px, drawer < 768px.
 */
export interface ShellNavItem {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active: boolean;
  href?: string;
  onSelect?: () => void;
  badge?: { count: number; label: string };
}
export interface ShellNavGroup { label: string; items: ShellNavItem[] }
export interface ShellMenuItem { label: string; icon?: ComponentType<{ className?: string }>; onSelect?: () => void; href?: string; danger?: boolean }

export function AppShell({
  brand, navLabel, groups, sidebarTop, user, userMenu, title, subtitle, titleAs = 'h1', topbarContext, topbarActions,
  banner, children,
}: {
  brand: { title: string; href: string };
  /** Accessible name of the main navigation (tests and screen readers address it by this name). */
  navLabel: string;
  groups: ShellNavGroup[];
  sidebarTop?: ReactNode;
  user: { name: string; subtitle: string; initials: string };
  userMenu: ShellMenuItem[];
  title: ReactNode;
  subtitle?: ReactNode;
  titleAs?: 'h1' | 'p';
  topbarContext?: ReactNode;
  topbarActions?: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const TitleTag = titleAs;

  // Drawer: focus moves inside, Tab is trapped, Escape closes and returns focus to the menu button.
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawerOpen || !drawer) return;
    const focusable = drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDrawerOpen(false); menuButtonRef.current?.focus(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const nav = (mode: 'sidebar' | 'drawer') => (
    <div className="space-y-5">
      {groups.map(group => (
        <div key={group.label}>
          <p className={`px-3 pb-1.5 text-xs font-medium text-white/45 ${mode === 'sidebar' ? 'hidden xl:block' : ''}`}>{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map(item => (
              <li key={item.key}>
                <NavEntry item={item} compact={mode === 'sidebar'} onAfterSelect={mode === 'drawer' ? () => setDrawerOpen(false) : undefined} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gp-canvas">
      {/* Navigation rail (md: icons only, xl: full) */}
      <aside className="sticky top-0 hidden h-screen w-[72px] shrink-0 flex-col bg-gp-sidebar text-white md:flex xl:w-60" aria-label={brand.title}>
        <Link href={brand.href} className="flex h-16 shrink-0 items-center gap-2.5 px-5 xl:px-5" title={brand.title}>
          <GrowthPrintMark className="h-8 w-8 shrink-0" tone="light" />
          <span className="hidden truncate text-[0.98rem] font-semibold xl:inline">{brand.title}</span>
        </Link>
        {sidebarTop && <div className="hidden px-3 pb-2 xl:block">{sidebarTop}</div>}
        <nav aria-label={navLabel} className="flex-1 overflow-y-auto px-3 py-3">{nav('sidebar')}</nav>
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 px-1 py-1" title={user.name}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold" aria-hidden="true">{user.initials}</span>
            <span className="hidden min-w-0 xl:block">
              <span className="block truncate text-sm font-medium">{user.name}</span>
              <span className="block truncate text-xs text-white/55">{user.subtitle}</span>
            </span>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-gp-border bg-gp-surface">
          <div className="flex h-16 items-center gap-2 px-4 sm:gap-3 sm:px-6">
            <button ref={menuButtonRef} type="button" onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu" aria-expanded={drawerOpen} aria-controls="app-drawer"
              className="-ml-1 flex h-9 w-9 items-center justify-center rounded-gp-control text-gp-text-secondary hover:bg-gp-canvas md:hidden">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex min-w-0 flex-1 items-baseline gap-3">
              <TitleTag className="truncate text-xl font-semibold text-gp-text">{title}</TitleTag>
              {subtitle && <p className="hidden truncate text-sm text-gp-text-secondary lg:block">{subtitle}</p>}
            </div>
            {topbarContext && <div className="hidden md:block">{topbarContext}</div>}
            {topbarActions}
            <UserMenu user={user} items={userMenu} />
          </div>
        </header>
        {banner}

        <main className="mx-auto w-full max-w-[100rem] flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" tabIndex={-1} aria-label="Close navigation menu" className="absolute inset-0 bg-gp-text/40"
            onClick={() => setDrawerOpen(false)} />
          <div ref={drawerRef} id="app-drawer" role="dialog" aria-modal="true" aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col bg-gp-sidebar text-white">
            <div className="flex h-16 items-center justify-between px-4">
              <span className="flex items-center gap-2.5">
                <GrowthPrintMark className="h-8 w-8" tone="light" />
                <span className="font-semibold">{brand.title}</span>
              </span>
              <button type="button" onClick={() => { setDrawerOpen(false); menuButtonRef.current?.focus(); }} aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-gp-control text-white/70 hover:bg-gp-sidebar-hover">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {sidebarTop && <div className="px-3 pb-2">{sidebarTop}</div>}
            {topbarContext && <div className="px-3 pb-3">{topbarContext}</div>}
            <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-3 py-2">{nav('drawer')}</nav>
          </div>
        </div>
      )}
    </div>
  );
}

function NavEntry({ item, compact, onAfterSelect }: { item: ShellNavItem; compact: boolean; onAfterSelect?: () => void }) {
  const Icon = item.icon;
  const cls = `group relative flex min-h-10 w-full items-center gap-3 rounded-gp-control px-3 text-left text-[0.84rem] font-medium transition-colors ${
    item.active ? 'bg-gp-sidebar-active text-white' : 'text-white/70 hover:bg-gp-sidebar-hover hover:text-white'
  } ${compact ? 'max-xl:justify-center max-xl:px-0' : ''}`;
  const body = (
    <>
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      <span className={`min-w-0 flex-1 truncate ${compact ? 'max-xl:sr-only' : ''}`}>{item.label}</span>
      {item.badge && (
        <span className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-gp-primary px-1.5 text-[0.7rem] font-semibold tabular-nums text-white ${
          compact ? 'max-xl:absolute max-xl:right-1 max-xl:top-0.5 max-xl:h-4 max-xl:min-w-4 max-xl:px-1 max-xl:text-[0.62rem]' : ''}`}>
          {item.badge.count}<span className="sr-only"> {item.badge.label}</span>
        </span>
      )}
    </>
  );
  const common = { className: cls, 'aria-current': item.active ? ('page' as const) : undefined, title: compact ? item.label : undefined };
  if (item.href) return <Link href={item.href} {...common} onClick={onAfterSelect}>{body}</Link>;
  return <button type="button" {...common} onClick={() => { item.onSelect?.(); onAfterSelect?.(); }}>{body}</button>;
}

/** Avatar menu (button + role="menu"): arrow keys move, Escape and outside click close. */
function UserMenu({ user, items }: { user: { name: string; subtitle: string; initials: string }; items: ShellMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const menuItems = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    menuItems()[0]?.focus();
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => {
      const list = menuItems();
      const i = list.indexOf(document.activeElement as HTMLElement);
      if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length]?.focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length]?.focus(); }
      else if (e.key === 'Tab') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const itemCls = (danger?: boolean) => `flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm ${
    danger ? 'text-gp-danger hover:bg-gp-danger-soft' : 'text-gp-text hover:bg-gp-canvas'} focus:outline-none focus-visible:bg-gp-canvas`;

  return (
    <div ref={ref} className="relative">
      <button ref={buttonRef} type="button" onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open}
        aria-controls={menuId} aria-label={`Account menu for ${user.name}`}
        className="flex h-9 items-center gap-1.5 rounded-gp-control pl-0.5 pr-1.5 hover:bg-gp-canvas">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gp-primary-soft text-xs font-semibold text-gp-primary" aria-hidden="true">{user.initials}</span>
        <ChevronDown className="hidden h-4 w-4 text-gp-text-secondary sm:block" aria-hidden="true" />
      </button>
      {open && (
        <div id={menuId} role="menu" aria-label="Account"
          className="absolute right-0 z-50 mt-2 w-60 rounded-gp-card border border-gp-border bg-gp-surface p-1.5 shadow-gp-pop">
          <div className="border-b border-gp-divider px-2.5 pb-2 pt-1.5">
            <p className="truncate text-sm font-semibold text-gp-text">{user.name}</p>
            <p className="truncate text-xs text-gp-text-secondary">{user.subtitle}</p>
          </div>
          <div className="pt-1">
            {items.map(item => {
              const Icon = item.icon;
              const content = <>{Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}{item.label}</>;
              return item.href
                ? <Link key={item.label} href={item.href} role="menuitem" tabIndex={-1} className={itemCls(item.danger)} onClick={() => setOpen(false)}>{content}</Link>
                : <button key={item.label} type="button" role="menuitem" tabIndex={-1} className={itemCls(item.danger)}
                    onClick={() => { setOpen(false); item.onSelect?.(); }}>{content}</button>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** Square icon button for the top bar (search, shortcuts). */
export function TopbarIconButton({ label, onClick, children, className = '' }: { label: string; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-gp-control text-gp-text-secondary hover:bg-gp-canvas hover:text-gp-text ${className}`}>
      {children}
    </button>
  );
}

'use client';

import { useEffect, useId, useRef, useState, type ComponentType, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { GrowthPrintMark } from '../../features/public/components/GrowthPrintMark.tsx';
import { ThemeSwitcher } from '../ui/ThemeSwitcher.tsx';

/**
 * Presentational application shell (COMPREO reference): white sidebar with teal icon tiles and a solid teal active
 * item, minimal top bar (context, search and actions, account menu), page title inside the content area.
 * Used by the studio, client hub and business workspace layouts, which keep all state and logic and pass it in.
 * Responsive: full sidebar >= 1280px, 72px icon rail 768-1279px, drawer < 768px.
 */
export interface ShellNavItem {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active: boolean;
  href?: string;
  onSelect?: () => void;
  /** 'attention' (red) for items that need action, otherwise teal. */
  badge?: { count: number; label: string; tone?: 'attention' | 'default' };
}
export interface ShellNavGroup { label: string; items: ShellNavItem[] }
export interface ShellMenuItem { label: string; icon?: ComponentType<{ className?: string }>; onSelect?: () => void; href?: string; danger?: boolean }

export function AppShell({
  brand, navLabel, groups, sidebarTop, user, userMenu, title, subtitle, headerActions, topbarContext, topbarActions,
  banner, children,
}: {
  brand: { title: string; href: string };
  /** Accessible name of the main navigation (tests and screen readers address it by this name). */
  navLabel: string;
  groups: ShellNavGroup[];
  sidebarTop?: ReactNode;
  user: { name: string; subtitle: string; initials: string };
  userMenu: ShellMenuItem[];
  /** Page title shown as the h1 at the top of the content. Omit when the page renders its own h1. */
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned actions beside the page title (period filter, primary action). */
  headerActions?: ReactNode;
  topbarContext?: ReactNode;
  topbarActions?: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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
    <div className="space-y-1">
      {groups.map((group, i) => (
        <div key={group.label} className={i > 0 ? 'pt-2' : undefined}>
          {groups.length > 1 && (
            <p className={`px-3 pb-1 pt-2 text-xs font-medium text-gp-text-muted ${mode === 'sidebar' ? 'hidden xl:block' : ''}`}>{group.label}</p>
          )}
          <ul className="space-y-1">
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
      <aside className="sticky top-0 hidden h-screen w-[72px] shrink-0 flex-col border-r border-gp-border bg-gp-surface md:flex xl:w-60" aria-label={brand.title}>
        <Link href={brand.href} className="flex h-[72px] shrink-0 items-center gap-2.5 border-b border-gp-divider px-5" title={brand.title}>
          <GrowthPrintMark className="h-8 w-8 shrink-0" />
          <span className="hidden truncate text-[1.05rem] font-bold tracking-tight text-gp-text xl:inline">{brand.title}</span>
        </Link>
        {sidebarTop && <div className="hidden px-3 pt-3 xl:block">{sidebarTop}</div>}
        <nav aria-label={navLabel} className="flex-1 overflow-y-auto px-3 py-3">{nav('sidebar')}</nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-gp-border bg-gp-surface">
          <div className="flex h-[72px] items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
            <button ref={menuButtonRef} type="button" onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu" aria-expanded={drawerOpen} aria-controls="app-drawer"
              className="-ml-1 flex h-10 w-10 items-center justify-center rounded-gp-control text-gp-text-secondary hover:bg-gp-canvas md:hidden">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            {topbarContext && <div className="hidden md:block">{topbarContext}</div>}
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              {topbarActions}
              <div className="hidden sm:block"><ThemeSwitcher /></div>
              <UserMenu user={user} items={userMenu} />
            </div>
          </div>
        </header>
        {banner}

        <main className="mx-auto w-full max-w-[100rem] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
          {title && (
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-[1.625rem] font-bold leading-tight tracking-tight text-gp-text">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-gp-text-secondary">{subtitle}</p>}
              </div>
              {headerActions && <div className="flex flex-wrap items-center gap-2">{headerActions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" tabIndex={-1} aria-label="Close navigation menu" className="absolute inset-0 bg-gp-text/40"
            onClick={() => setDrawerOpen(false)} />
          <div ref={drawerRef} id="app-drawer" role="dialog" aria-modal="true" aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col bg-gp-surface shadow-gp-pop">
            <div className="flex h-16 items-center justify-between border-b border-gp-divider px-4">
              <span className="flex items-center gap-2.5">
                <GrowthPrintMark className="h-8 w-8" />
                <span className="font-bold text-gp-text">{brand.title}</span>
              </span>
              <button type="button" onClick={() => { setDrawerOpen(false); menuButtonRef.current?.focus(); }} aria-label="Close navigation menu"
                className="flex h-10 w-10 items-center justify-center rounded-gp-control text-gp-text-secondary hover:bg-gp-canvas">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {sidebarTop && <div className="px-3 pt-3">{sidebarTop}</div>}
            {topbarContext && <div className="px-3 pt-3">{topbarContext}</div>}
            <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-3 py-3">{nav('drawer')}</nav>
            <div className="border-t border-gp-divider p-3">
              <p className="mb-2 text-xs font-medium text-gp-text-muted">Theme</p>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavEntry({ item, compact, onAfterSelect }: { item: ShellNavItem; compact: boolean; onAfterSelect?: () => void }) {
  const Icon = item.icon;
  const cls = `group relative flex min-h-11 w-full items-center gap-3 rounded-gp-control px-2 text-left text-sm font-medium transition-colors ${
    item.active ? 'bg-gp-primary text-gp-primary-foreground' : 'text-gp-text hover:bg-gp-canvas'
  } ${compact ? 'max-xl:justify-center max-xl:px-0' : ''}`;
  const body = (
    <>
      <span className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-gp-control ${
        item.active ? 'bg-white/15 text-gp-primary-foreground' : 'bg-gp-primary-soft text-gp-primary-strong'}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className={`min-w-0 flex-1 truncate ${compact ? 'max-xl:sr-only' : ''}`}>{item.label}</span>
      {item.badge && (
        <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.7rem] font-semibold tabular-nums ${
          item.active ? 'bg-gp-primary-foreground text-gp-primary' : item.badge.tone === 'attention' ? 'bg-gp-danger text-gp-danger-foreground' : 'bg-gp-primary text-gp-primary-foreground'
        } ${compact ? 'max-xl:absolute max-xl:right-0.5 max-xl:top-0 max-xl:h-4 max-xl:min-w-4 max-xl:px-1 max-xl:text-[0.62rem]' : ''}`}>
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
        className="flex h-10 items-center gap-1 rounded-full pl-0.5 pr-1 hover:bg-gp-canvas">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gp-primary text-sm font-semibold text-gp-primary-foreground" aria-hidden="true">{user.initials}</span>
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

/** Square icon button for the top bar (help, settings, search on small screens). */
export function TopbarIconButton({ label, onClick, children, className = '' }: { label: string; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-gp-control text-gp-text-secondary hover:bg-gp-canvas hover:text-gp-text ${className}`}>
      {children}
    </button>
  );
}

/** COMPREO top-bar search field: opens the command palette (search is global, not per page). */
export function TopbarSearch({ onOpen, placeholder = 'Search anything…' }: { onOpen: () => void; placeholder?: string }) {
  return (
    <button type="button" onClick={onOpen}
      className="hidden h-10 w-72 items-center gap-2 rounded-gp-control bg-gp-surface-secondary px-3 text-sm text-gp-text-muted transition-colors hover:bg-gp-border lg:flex">
      <SearchGlyph />
      <span className="flex-1 truncate text-left">{placeholder}</span>
      <kbd className="rounded border border-gp-border bg-gp-surface px-1.5 text-[0.7rem] font-medium text-gp-text-secondary">⌘K</kbd>
    </button>
  );
}
function SearchGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );
}

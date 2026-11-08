'use client';

/**
 * Layout and feedback primitives for the MVP2 workspace (reusable by any screen): Dialog, PageHeader,
 * Pagination, StatusPill, StatCard, Toolbar, DefinitionList. Accessible by default: dialogs trap focus, close on
 * Escape, restore focus and label themselves; pagination is a labelled nav with disabled states.
 */
import { useEffect, useId, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

// ---------------------------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------------------------

export function Dialog({ open, onClose, title, description, children, footer, size = 'md', dismissible = true }: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** False while a request is in flight so the dialog cannot be closed mid-save. */
  dismissible?: boolean;
}) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement;
    const panel = panelRef.current;
    const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? []);
    (focusables()[0] ?? panel)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Tab') {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      (restoreRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, dismissible, onClose]);

  if (!open) return null;
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink-950/40" aria-hidden="true" onClick={() => dismissible && onClose()} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cx('relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl', widths[size])}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-ink-900">{title}</h2>
            {description && <div id={descId} className="mt-1 text-sm text-ink-500">{description}</div>}
          </div>
          <button type="button" onClick={onClose} disabled={!dismissible} aria-label="Close dialog"
            className="-mr-2 rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-700 disabled:opacity-40">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {children && <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>}
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-ink-100 bg-ink-50/60 px-5 py-3 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Page structure
// ---------------------------------------------------------------------------------------------

export function PageHeader({ title, description, actions, breadcrumb }: {
  title: ReactNode; description?: ReactNode; actions?: ReactNode;
  breadcrumb?: Array<{ label: string; href?: string }>;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-500">
              {breadcrumb.map((b, i) => (
                <li key={`${b.label}-${i}`} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
                  {b.href ? <Link href={b.href} className="hover:text-brand-700 hover:underline">{b.label}</Link>
                    : <span aria-current="page" className="text-ink-700">{b.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="truncate text-2xl font-semibold tracking-tight text-ink-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>;
}

export function SearchInput({ value, onChange, placeholder, label }: {
  value: string; onChange: (v: string) => void; placeholder: string; label: string;
}) {
  const id = useId();
  return (
    <div className="w-full sm:max-w-xs">
      <label htmlFor={id} className="sr-only">{label}</label>
      <input id={id} type="search" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="block min-h-10 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-900 shadow-xs placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100" />
    </div>
  );
}

export function FilterTabs<T extends string>({ value, onChange, options, label }: {
  value: T; onChange: (v: T) => void; options: ReadonlyArray<{ value: T; label: string; count?: number }>; label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-ink-200 bg-white p-1">
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} aria-pressed={value === o.value}
          className={cx('min-h-8 shrink-0 rounded-lg px-3 text-xs font-medium transition-colors',
            value === o.value ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100')}>
          {o.label}{o.count !== undefined && <span className="ml-1.5 tabular-nums opacity-70">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------------------------

export function Pagination({ page, pageSize, total, onPage, noun = 'results' }: {
  page: number; pageSize: number; total: number; onPage: (p: number) => void; noun?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 border-t border-ink-100 px-4 py-3 sm:flex-row">
      <p className="text-xs text-ink-500" aria-live="polite">
        Showing <span className="tabular-nums font-medium text-ink-800">{from}–{to}</span> of{' '}
        <span className="tabular-nums font-medium text-ink-800">{total}</span> {noun}
      </p>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page"
          className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40">
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> Previous
        </button>
        <span className="px-2 text-xs tabular-nums text-ink-600">Page {page} of {pages}</span>
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Next page"
          className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40">
          Next <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------------------------
// Status and numbers
// ---------------------------------------------------------------------------------------------

export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
  brand: 'bg-brand-50 text-brand-800 ring-brand-200',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-mint-50 text-mint-800 ring-mint-200',
};

export function StatusPill({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', TONES[tone])}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, hint, href }: { label: string; value: ReactNode; hint?: ReactNode; href?: string }) {
  const body = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-ink-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </>
  );
  const cls = 'block rounded-2xl border border-ink-200 bg-white p-4 shadow-xs';
  return href
    ? <Link href={href} className={cx(cls, 'transition-colors hover:border-brand-300')}>{body}</Link>
    : <div className={cls}>{body}</div>;
}

export function DefinitionList({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map(i => (
        <div key={i.label} className="min-w-0">
          <dt className="text-xs font-medium text-ink-500">{i.label}</dt>
          <dd className="mt-0.5 break-words text-sm text-ink-900">{i.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TableShell({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export const th = 'border-b border-ink-100 bg-ink-50/70 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-ink-500';
export const td = 'border-b border-ink-100 px-4 py-3 align-middle';

export function LoadingRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <tbody aria-hidden="true">
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }, (_, c) => (
            <td key={c} className={td}><div className="h-3.5 w-3/4 animate-pulse rounded bg-ink-100" /></td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

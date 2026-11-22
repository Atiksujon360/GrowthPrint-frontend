'use client';

import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Right-hand details sheet for studio modules (COMPREO phase 6).
 * A modal dialog: focus moves inside on open, Tab stays inside, Escape or the backdrop closes it, and focus
 * goes back to whatever opened it (usually the table row).
 */
export function DetailDrawer({ open, onClose, title, subtitle, badge, children, footer }: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab' || !panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="gp-app fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-gp-text/30 motion-safe:animate-[gp-fade_160ms_ease-out]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full max-w-[min(100vw,30rem)] flex-col bg-gp-surface shadow-[-12px_0_32px_-12px_rgba(33,25,35,0.25)] motion-safe:animate-[gp-sheet-in_200ms_cubic-bezier(0.2,0.8,0.2,1)]"
      >
        <header className="flex items-start gap-3 border-b border-gp-border px-6 pb-4 pt-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id={titleId} className="min-w-0 break-words text-lg font-semibold leading-snug text-gp-text">{title}</h2>
              {badge}
            </div>
            {subtitle && <div className="mt-0.5 text-sm text-gp-text-secondary">{subtitle}</div>}
          </div>
          <button type="button" onClick={onClose} data-autofocus aria-label="Close details"
            className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-gp-control text-gp-text-secondary hover:bg-gp-canvas hover:text-gp-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gp-primary">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="flex flex-wrap items-center gap-2 border-t border-gp-border px-6 py-4">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

/** A labelled group inside a drawer. */
export function DrawerSection({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="border-b border-gp-divider py-5 first:pt-0 last:border-b-0 last:pb-0">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-gp-text">{title}</h3>
        {aside && <div className="text-xs text-gp-text-secondary">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

/** Two-column facts list (term / value). Empty values show an en dash, never invented data. */
export function FactList({ items }: { items: Array<{ term: string; value: React.ReactNode }> }) {
  return (
    <dl className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-x-4 gap-y-2.5 text-sm">
      {items.map(({ term, value }) => (
        <React.Fragment key={term}>
          <dt className="text-gp-text-secondary">{term}</dt>
          <dd className="min-w-0 break-words text-gp-text">{value === undefined || value === null || value === '' ? '–' : value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

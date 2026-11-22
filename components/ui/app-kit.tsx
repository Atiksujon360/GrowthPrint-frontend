'use client';

import type { ReactNode } from 'react';

/**
 * Application design kit (Nexora-style): white panels on a cool-grey canvas, quiet borders, compact headers,
 * KPI cards with an optional sparkline. Shared by the studio, the client hub and the business workspace.
 * Every number passed in must come from loaded data; nothing here invents trends.
 */

export function Panel({ title, description, action, children, className = '', bodyClassName = 'p-5' }: {
  title?: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode;
  className?: string; bodyClassName?: string;
}) {
  return (
    <section className={`rounded-gp-card border border-gp-border bg-gp-surface shadow-gp-card ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-gp-divider px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-[0.98rem] font-semibold text-gp-text">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-gp-text-secondary">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function Sparkline({ values, className = 'h-10 w-28', label }: { values: number[]; className?: string; label?: string }) {
  if (values.length < 2 || values.every(v => v === 0)) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const points = values.map((v, i) => [(i / (values.length - 1)) * 100, 36 - ((v - min) / span) * 32 - 2]);
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <svg viewBox="0 0 100 36" preserveAspectRatio="none" className={className} role={label ? 'img' : undefined}
      aria-label={label} aria-hidden={label ? undefined : true}>
      <path d={`${line} L100 36 L0 36 Z`} fill="var(--color-gp-primary-soft)" />
      <path d={line} fill="none" stroke="var(--color-gp-accent)" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export type Delta = { value: number; label: string } | null;

/**
 * KPI card: icon, label, large value, optional change versus a real previous period, context line, sparkline.
 */
export function KpiCard({ label, value, icon: Icon, context, delta, spark, onClick, sparkLabel, tone = 'primary' }: {
  label: string; value: ReactNode; icon?: React.ComponentType<{ className?: string }>;
  context?: ReactNode; delta?: Delta; spark?: number[]; onClick?: () => void; sparkLabel?: string;
  /** Icon tint. Semantic only: 'danger' or 'warning' when the value itself needs attention. */
  tone?: 'primary' | 'success' | 'warning' | 'danger';
}) {
  const iconTone = {
    primary: 'bg-gp-primary-soft text-gp-primary-strong',
    success: 'bg-gp-success-soft text-gp-success',
    warning: 'bg-gp-warning-soft text-gp-warning',
    danger: 'bg-gp-danger-soft text-gp-danger',
  }[tone];
  const body = (
    <>
      {/* Premium layout: icon tile beside the label, value, then change / context. */}
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-gp-control ${iconTone}`}>
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
        )}
        <span className="text-[0.8125rem] font-medium leading-snug text-gp-text-secondary">{label}</span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight tabular-nums text-gp-text">{value}</p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[0.8125rem] text-gp-text-secondary">
            {delta && (
              <span className={`font-semibold tabular-nums ${delta.value >= 0 ? 'text-gp-success' : 'text-gp-danger'}`}>
                {delta.value >= 0 ? '▲' : '▼'} {Math.abs(delta.value)}%
                <span className="sr-only"> {delta.value >= 0 ? 'up' : 'down'} {delta.label}</span>
              </span>
            )}
            {context}
          </p>
        </div>
        {spark && <Sparkline values={spark} label={sparkLabel} className="h-9 w-20" />}
      </div>
    </>
  );
  const cls = 'block w-full rounded-gp-card border border-gp-border bg-gp-surface p-5 text-left shadow-gp-card';
  return onClick
    ? <button type="button" onClick={onClick} className={`${cls} transition-colors hover:border-gp-primary/50`}>{body}</button>
    : <div className={cls}>{body}</div>;
}

/** Compact inline metric for secondary figures (a row of these under the KPI cards). */
export function MiniStat({ label, value, tone = 'neutral' }: { label: string; value: ReactNode; tone?: 'neutral' | 'warning' | 'danger' }) {
  const color = tone === 'danger' ? 'text-gp-danger' : tone === 'warning' ? 'text-gp-warning' : 'text-gp-text';
  return (
    <div className="min-w-0">
      <dt className="truncate text-sm text-gp-text-muted">{label}</dt>
      <dd className={`mt-1 text-lg font-semibold tabular-nums ${color}`}>{value}</dd>
    </div>
  );
}

/** Percent change between two real values; null when there is no previous value to compare with. */
export function percentChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/** Compact module summary: a row of labelled real figures above a module's table. */
export function SummaryStrip({ items, label }: {
  label: string;
  items: Array<{ label: string; value: ReactNode; tone?: 'default' | 'attention' | 'success' }>;
}) {
  return (
    <dl aria-label={label}
      className="grid grid-cols-2 gap-px overflow-hidden rounded-gp-card border border-gp-border bg-gp-border shadow-gp-card sm:grid-cols-4">
      {items.map(item => (
        <div key={item.label} className="bg-gp-surface px-5 py-4">
          <dt className="text-[0.8125rem] font-medium text-gp-text-secondary">{item.label}</dt>
          <dd className={`mt-1 text-xl font-bold tabular-nums ${
            item.tone === 'attention' ? 'text-gp-danger' : item.tone === 'success' ? 'text-gp-success' : 'text-gp-text'}`}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

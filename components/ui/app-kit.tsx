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
    <section className={`rounded-2xl border border-ink-200 bg-white ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-[0.98rem] font-semibold text-ink-950">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
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
      <path d={`${line} L100 36 L0 36 Z`} fill="var(--color-brand-100)" opacity="0.7" />
      <path d={line} fill="none" stroke="var(--color-brand-600)" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
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
    primary: 'bg-gp-primary-soft text-gp-primary',
    success: 'bg-gp-success-soft text-gp-success',
    warning: 'bg-gp-warning-soft text-gp-warning',
    danger: 'bg-gp-danger-soft text-gp-danger',
  }[tone];
  const body = (
    <>
      {/* Reference layout: label top-left, soft icon circle top-right, value, then change / context. */}
      <div className="flex items-start justify-between gap-3">
        <span className="pt-1 text-sm font-medium text-ink-600">{label}</span>
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconTone}`}>
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="mt-1 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[1.65rem] font-semibold leading-tight tabular-nums text-ink-950">{value}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs text-ink-500">
            {delta && (
              <span className={`font-semibold tabular-nums ${delta.value >= 0 ? 'text-gp-success' : 'text-gp-danger'}`}>
                {delta.value >= 0 ? '↑' : '↓'} {Math.abs(delta.value)}%
                <span className="sr-only"> {delta.value >= 0 ? 'up' : 'down'} {delta.label}</span>
              </span>
            )}
            {context}
          </p>
        </div>
        {spark && <Sparkline values={spark} label={sparkLabel} className="h-9 w-24" />}
      </div>
    </>
  );
  const cls = 'block w-full rounded-gp-card border border-gp-border bg-gp-surface p-5 text-left shadow-gp-card';
  return onClick
    ? <button type="button" onClick={onClick} className={`${cls} transition-colors hover:border-ink-300`}>{body}</button>
    : <div className={cls}>{body}</div>;
}

/** Compact inline metric for secondary figures (a row of these under the KPI cards). */
export function MiniStat({ label, value, tone = 'neutral' }: { label: string; value: ReactNode; tone?: 'neutral' | 'warning' | 'danger' }) {
  const color = tone === 'danger' ? 'text-rose-700' : tone === 'warning' ? 'text-amber-700' : 'text-ink-950';
  return (
    <div className="min-w-0">
      <dt className="truncate text-sm text-ink-500">{label}</dt>
      <dd className={`mt-1 text-lg font-semibold tabular-nums ${color}`}>{value}</dd>
    </div>
  );
}

/** Percent change between two real values; null when there is no previous value to compare with. */
export function percentChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}

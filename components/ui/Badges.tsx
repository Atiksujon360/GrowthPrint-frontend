import React from 'react';
import { humanizeCode } from '../../lib/labels.ts';

export function StatusBadge({ status }: { status: string }) {
  const getStyle = () => {
    switch (status) {
      case 'IN_PROGRESS':
      case 'ACTIVE':
      case 'READY_TO_START':
      case 'OUTREACH_APPROVED':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'COMPLETED':
      case 'ACCEPTED':
      case 'PAID':
      case 'WON':
      case 'SUCCESS':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'AWAITING_CLIENT_APPROVAL':
      case 'AWAITING_HUMAN_APPROVAL':
      case 'ESTIMATE_PENDING':
      case 'NEEDS_REVIEW':
      case 'ISSUED':
      case 'WAITING_FOR_CLIENT':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'URGENT':
      case 'CRITICAL_BLOCKER':
      case 'OVERDUE':
      case 'FAILED':
      case 'SUSPENDED':
      case 'LOST':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStyle()}`}>
      {humanizeCode(status)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' }) {
  const getStyle = () => {
    switch (priority) {
      case 'URGENT':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'HIGH':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'MEDIUM':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStyle()}`}>
      {humanizeCode(priority)}
    </span>
  );
}

export function StatCard({
  label,
  value,
  subtext,
  trend,
  icon: Icon
}: {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <span className="text-sm font-medium text-ink-600">{label}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="gp-display text-[1.7rem] font-semibold leading-none text-ink-950">{value}</span>
        {trend && <span className="text-sm font-semibold text-emerald-700">{trend}</span>}
      </div>
      {subtext && <p className="mt-2 text-sm text-ink-500">{subtext}</p>}
    </div>
  );
}

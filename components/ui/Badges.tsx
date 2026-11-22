import React from 'react';
import { humanizeCode } from '../../lib/labels.ts';
import { KpiCard } from './app-kit.tsx';

export function StatusBadge({ status }: { status: string }) {
  const getStyle = () => {
    switch (status) {
      case 'IN_PROGRESS':
      case 'ACTIVE':
      case 'READY_TO_START':
      case 'OUTREACH_APPROVED':
        return 'text-gp-info bg-gp-info-soft border-gp-info/30';
      case 'COMPLETED':
      case 'ACCEPTED':
      case 'PAID':
      case 'WON':
      case 'SUCCESS':
        return 'text-gp-success bg-gp-success-soft border-gp-success/30';
      case 'AWAITING_CLIENT_APPROVAL':
      case 'AWAITING_HUMAN_APPROVAL':
      case 'ESTIMATE_PENDING':
      case 'NEEDS_REVIEW':
      case 'ISSUED':
      case 'WAITING_FOR_CLIENT':
        return 'text-gp-warning bg-gp-warning-soft border-gp-warning/30';
      case 'URGENT':
      case 'CRITICAL_BLOCKER':
      case 'OVERDUE':
      case 'FAILED':
      case 'SUSPENDED':
      case 'LOST':
        return 'text-gp-danger bg-gp-danger-soft border-gp-danger/30';
      default:
        return 'text-gp-text-secondary bg-gp-surface-secondary border-gp-border';
    }
  };

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-gp-badge border px-2 py-0.5 text-xs font-medium ${getStyle()}`}>
      {humanizeCode(status)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' }) {
  const getStyle = () => {
    switch (priority) {
      case 'URGENT':
        return 'text-gp-danger bg-gp-danger-soft border-gp-danger/30';
      case 'HIGH':
        return 'text-gp-warning bg-gp-warning-soft border-gp-warning/30';
      case 'MEDIUM':
        return 'text-gp-info bg-gp-info-soft border-gp-info/30';
      default:
        return 'text-gp-text-secondary bg-gp-surface-secondary border-gp-border';
    }
  };

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-gp-badge border px-2 py-0.5 text-xs font-medium ${getStyle()}`}>
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
  // Same markup as the application KPI card (one card style everywhere).
  return (
    <KpiCard
      label={label}
      value={value}
      icon={Icon}
      context={<>{trend && <span className="font-semibold text-gp-success">{trend}</span>}{subtext}</>}
    />
  );
}

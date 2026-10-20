import React from 'react';

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

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStyle()} whitespace-nowrap`}>
      {formatText(status)}
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStyle()} whitespace-nowrap`}>
      {priority}
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
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{value}</span>
        {trend && (
          <span className="text-xs font-medium text-emerald-600">{trend}</span>
        )}
      </div>
      {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
}

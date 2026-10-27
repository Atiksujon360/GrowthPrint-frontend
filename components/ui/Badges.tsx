import React from 'react';
import { motion } from 'motion/react';

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
    <motion.span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStyle()} whitespace-nowrap`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {formatText(status)}
    </motion.span>
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
    <motion.span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStyle()} whitespace-nowrap`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {priority}
    </motion.span>
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
    <motion.div
      className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        {Icon && (
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Icon className="w-4 h-4 text-slate-400" />
          </motion.div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <motion.span
          className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {value}
        </motion.span>
        {trend && (
          <motion.span
            className="text-xs font-medium text-emerald-600"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {trend}
          </motion.span>
        )}
      </div>
      {subtext && (
        <motion.p
          className="mt-1 text-xs text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {subtext}
        </motion.p>
      )}
    </motion.div>
  );
}

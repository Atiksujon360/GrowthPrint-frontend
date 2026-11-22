import React from 'react';
import { isMockModeEnv } from '../../../lib/api/client.ts';
import { EmptyState } from '../../../components/ui/AsyncState.tsx';
import { useAppSelector } from '../../../store/hooks.ts';
import { History, Shield, Clock } from 'lucide-react';

export function AdminActivityView() {
  if (!isMockModeEnv()) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Activity log is not connected yet"
          message="There is no activity/audit API in MVP-1, so no events can be shown. Entries shown in demo (mock) mode are sample data."
          illustration="/illustrations/empty/empty-activity.webp"
        />
      </div>
    );
  }
  return <AdminActivityViewDemo />;
}

function AdminActivityViewDemo() {
  const activities = useAppSelector(state => state.agency.activities);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-gp-text">
          Activity
        </h2>
        <p className="mt-1 text-sm text-gp-text-muted">
          Immutable event log of client requests, approvals, proposals, and settlements.
        </p>
      </div>

      <div className="bg-gp-surface rounded-2xl border border-gp-border/90 overflow-hidden">
        <div className="p-4 border-b border-gp-divider flex items-center justify-between text-xs text-gp-text-muted font-medium">
          <span>Recorded Events ({activities.length})</span>
          <span>Role-attributed timestamps</span>
        </div>

        <div className="divide-y divide-gp-divider">
          {activities.map((act) => (
            <div key={act.id} className="p-4 hover:bg-gp-surface-secondary/50 transition-colors flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-gp-primary-soft text-gp-primary-strong flex items-center justify-center shrink-0 mt-0.5">
                <History className="w-4 h-4" />
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-gp-text">{act.action}</span>
                  <span className="text-xs text-gp-text-muted bg-gp-surface-secondary px-1.5 py-0.5 rounded">
                    {act.entityType}: {act.entityId}
                  </span>
                </div>
                <p className="text-xs text-gp-text-secondary">
                  {act.details}
                </p>
                <div className="text-xs text-gp-text-muted">
                  Actor: <strong className="text-gp-text">{act.actor}</strong> ({act.role}) · {new Date(act.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useAppSelector } from '../../store/hooks.ts';
import { History, Shield, Clock } from 'lucide-react';

export function AdminActivityView() {
  const activities = useAppSelector(state => state.agency.activities);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          System-Wide Audit Trail & Event Log
        </h2>
        <p className="text-xs text-slate-500">
          Immutable event log of client requests, founder approvals, proposal acceptance, and financial settlements.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Recorded Events ({activities.length})</span>
          <span>Role-attributed timestamps</span>
        </div>

        <div className="divide-y divide-slate-100">
          {activities.map((act) => (
            <div key={act.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <History className="w-4 h-4" />
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{act.action}</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {act.entityType}: {act.entityId}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {act.details}
                </p>
                <div className="text-[11px] text-slate-400">
                  Actor: <strong className="text-slate-700">{act.actor}</strong> ({act.role}) · {new Date(act.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

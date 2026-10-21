import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { triggerWorkflowRun, addToast, addNotification } from '../../../store/index.ts';
import { Workflow, Play, CheckCircle2, Clock, ShieldCheck, AlertCircle, ArrowUpRight } from 'lucide-react';

export function AdminAutomationView() {
  const dispatch = useAppDispatch();
  const workflows = useAppSelector(state => state.agency.workflows);
  const [runningId, setRunningId] = useState<string | null>(null);

  const handleRun = (wfId: string) => {
    const wf = workflows.find(w => w.id === wfId);
    setRunningId(wfId);
    setTimeout(() => {
      dispatch(triggerWorkflowRun({ workflowId: wfId }));
      dispatch(addToast({
        type: 'success',
        title: 'Workflow Executed',
        message: `Workflow "${wf?.name || wfId}" completed without errors.`
      }));
      dispatch(addNotification({
        category: 'SYSTEM',
        title: 'Workflow Executed',
        message: `Manual run of "${wf?.name || wfId}" completed successfully.`,
        priority: 'LOW',
        targetTab: 'AUTOMATION'
      }));
      setRunningId(null);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Workflow Automation Engine
            </h2>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Workflow className="w-3.5 h-3.5" /> n8n Architecture Ready
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Named automation workflows handling event webhooks, background qualification, and SLA monitoring.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {workflows.map((wf) => (
          <div 
            key={wf.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Workflow className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{wf.name}</h3>
                  <div className="text-xs text-slate-400">Trigger: {wf.triggerEvent}</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pl-12">
                {wf.description}
              </p>

              <div className="pl-12 flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span>Total Executions: <strong className="text-slate-800 tabular-nums">{wf.runCount}</strong></span>
                <span>Last Run: <strong className="text-slate-700">{wf.lastRunAt ? new Date(wf.lastRunAt).toLocaleTimeString() : 'Never'}</strong></span>
                {wf.requiresHumanApproval && (
                  <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200">
                    Human Approval Required
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              <button
                onClick={() => handleRun(wf.id)}
                disabled={runningId === wf.id}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{runningId === wf.id ? 'Executing...' : 'Trigger Now'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

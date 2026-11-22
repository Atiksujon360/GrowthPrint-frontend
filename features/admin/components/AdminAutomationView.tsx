import React, { useState } from 'react';
import { isMockModeEnv } from '../../../lib/api/client.ts';
import { EmptyState } from '../../../components/ui/AsyncState.tsx';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { triggerWorkflowRun, addToast, addNotification } from '../../../store/index.ts';
import { Workflow, Play, CheckCircle2, Clock, ShieldCheck, AlertCircle, ArrowUpRight } from 'lucide-react';

export function AdminAutomationView() {
  if (!isMockModeEnv()) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Workflow automation is not connected yet"
          message="Automations have no backend in MVP-1, so nothing can be listed or run here. Workflows shown in demo (mock) mode are sample data."
          illustration="/illustrations/empty/empty-integrations.webp"
        />
      </div>
    );
  }
  return <AdminAutomationViewDemo />;
}

function AdminAutomationViewDemo() {
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-semibold tracking-tight text-gp-text">
              Automation
            </h2>
            <span className="text-xs font-semibold bg-gp-success-soft text-gp-success px-2 py-0.5 rounded-full flex items-center gap-1">
              <Workflow className="w-3.5 h-3.5" /> n8n Ready
            </span>
          </div>
          <p className="mt-1 text-sm text-gp-text-muted">
            Workflows handling event webhooks, qualification, and SLA monitoring.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {workflows.map((wf) => (
          <div 
            key={wf.id}
            className="bg-gp-surface rounded-2xl border border-gp-border/90 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gp-primary-soft text-gp-primary-strong flex items-center justify-center shrink-0">
                  <Workflow className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gp-text">{wf.name}</h3>
                  <div className="text-xs text-gp-text-muted">Trigger: {wf.triggerEvent}</div>
                </div>
              </div>

              <p className="text-xs text-gp-text-secondary leading-relaxed pl-12">
                {wf.description}
              </p>

              <div className="pl-12 flex flex-wrap items-center gap-4 text-xs text-gp-text-muted pt-1">
                <span>Total Executions: <strong className="text-gp-text tabular-nums">{wf.runCount}</strong></span>
                <span>Last Run: <strong className="text-gp-text">{wf.lastRunAt ? new Date(wf.lastRunAt).toLocaleTimeString() : 'Never'}</strong></span>
                {wf.requiresHumanApproval && (
                  <span className="text-gp-warning bg-gp-warning-soft px-2 py-0.5 rounded text-xs font-semibold border border-gp-warning/30">
                    Human Approval Required
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              <button
                onClick={() => handleRun(wf.id)}
                disabled={runningId === wf.id}
                className="px-4 py-2 bg-gp-primary hover:bg-gp-primary-hover disabled:opacity-50 text-gp-primary-foreground rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
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

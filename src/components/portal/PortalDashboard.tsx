import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { clientApproveEstimate, toggleTaskStatus, addToast } from '../../store/index.ts';
import { StatusBadge, PriorityBadge, StatCard } from '../common/Badges.tsx';
import { 
  FolderKanban, 
  TicketCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  CreditCard,
  PlusCircle,
  FileCheck2
} from 'lucide-react';
import type { PortalTab } from './PortalLayout.tsx';

interface PortalDashboardProps {
  onNavigateTab: (tab: PortalTab) => void;
  onOpenNewRequest: () => void;
}

export function PortalDashboard({ onNavigateTab, onOpenNewRequest }: PortalDashboardProps) {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(state => state.auth);
  const clientId = currentUser.clientId || 'client-meridian';

  const projects = useAppSelector(state => state.agency.projects.filter(p => p.clientId === clientId));
  const requests = useAppSelector(state => state.agency.requests.filter(r => r.clientId === clientId));
  const tasks = useAppSelector(state => state.agency.tasks.filter(t => t.clientId === clientId && t.isClientVisible));
  const invoices = useAppSelector(state => state.agency.invoices.filter(i => i.clientId === clientId));

  // Pending estimates requiring client approval
  const estimateApprovals = requests.filter(r => r.status === 'AWAITING_CLIENT_APPROVAL' && r.estimate);
  const tasksRequiringAction = tasks.filter(t => t.requiresClientAction && t.status !== 'COMPLETED');
  const unpaidInvoices = invoices.filter(i => i.status === 'ISSUED');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Client Workspace
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {currentUser.clientName} · Retainer active (8.5 of 15.0 hours utilized this billing cycle)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewRequest}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Request</span>
          </button>
        </div>
      </div>

      {/* Action Banner: Pending Estimate Approvals */}
      {estimateApprovals.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Estimate Awaiting Your Authorization ({estimateApprovals.length})
                </h3>
                <p className="text-xs text-slate-600">
                  GrowthPrint has reviewed your urgent ticket and prepared a written estimate. Engineering work will begin immediately upon your confirmation.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {estimateApprovals.map((req) => (
              <div 
                key={req.id} 
                className="bg-white rounded-xl p-4 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400 font-semibold">{req.reference}</span>
                    <span className="text-xs font-bold text-slate-900">{req.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 max-w-xl">
                    {req.estimate?.explanation}
                  </p>
                  <div className="text-xs font-medium text-slate-700 pt-1">
                    Estimated: <span className="font-bold text-slate-900">{req.estimate?.estimatedHours} hours</span> @ ${req.estimate?.hourlyRate}/h = <span className="text-blue-700 font-bold">${req.estimate?.totalAmount} USD</span> (Timeline: {req.estimate?.deliveryTimelineDays} day)
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      dispatch(clientApproveEstimate({ requestId: req.id, clientUser: currentUser.name }));
                      dispatch(addToast({
                        type: 'success',
                        title: 'Work Authorized',
                        message: `Estimate of $${req.estimate?.totalAmount} authorized. Engineering sprint scheduled.`
                      }));
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize Work ($ {req.estimate?.totalAmount})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Active Projects" 
          value={projects.length} 
          subtext="On-track for milestone targets"
          icon={FolderKanban}
        />
        <StatCard 
          label="Open Tickets" 
          value={requests.filter(r => r.status !== 'COMPLETED').length} 
          subtext={`${requests.filter(r => r.status === 'IN_PROGRESS').length} in active engineering`}
          icon={TicketCheck}
        />
        <StatCard 
          label="Actions Needed" 
          value={tasksRequiringAction.length + estimateApprovals.length} 
          subtext="Approvals & feedback"
          icon={AlertCircle}
        />
        <StatCard 
          label="Retainer Available" 
          value="6.5 hrs" 
          subtext="Reset on Nov 1, 2026"
          icon={Clock}
        />
      </div>

      {/* 2-Column Split: Active Projects & Actions Required */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Projects (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Active Engagements
            </h3>
            <button
              onClick={() => onNavigateTab('PROJECTS')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>View details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-[11px] text-slate-400 font-medium">{p.reference}</span>
                    <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Overall Milestone Completion</span>
                    <span className="font-semibold text-slate-800 tabular-nums">{p.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${p.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Target: {p.targetCompletionDate}</span>
                  <span>Lead: {p.assignedLead}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items & Support Tickets (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action Items */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Client Action Items ({tasksRequiringAction.length})
            </h3>

            <div className="mt-4 space-y-3">
              {tasksRequiringAction.length > 0 ? (
                tasksRequiringAction.map((t) => (
                  <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900">{t.title}</div>
                      <p className="text-[11px] text-slate-500">{t.description}</p>
                      <div className="text-[10px] text-amber-700 font-medium">Due: {t.dueDate}</div>
                    </div>
                    <button
                      onClick={() => dispatch(toggleTaskStatus({ taskId: t.id }))}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      Complete
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  No pending action items for your team today.
                </div>
              )}
            </div>
          </div>

          {/* Recent Support Tickets */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Support Requests
              </h3>
              <button
                onClick={() => onNavigateTab('REQUESTS')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <span>All tickets</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {requests.slice(0, 3).map((r) => (
                <div key={r.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="space-y-0.5 truncate mr-2">
                    <div className="text-xs font-semibold text-slate-800 truncate">{r.title}</div>
                    <div className="text-[11px] text-slate-400">{r.reference} · {r.category}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

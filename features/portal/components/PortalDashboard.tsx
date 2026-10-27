import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { clientApproveEstimate, toggleTaskStatus, addToast } from '../../../store/index.ts';
import { StatusBadge, PriorityBadge, StatCard } from '../../../components/ui/Badges.tsx';
import { 
  CircularProgress, 
  FloatingActionButton, 
  InteractiveTooltip, 
  SuccessCelebration, 
  TimeIndicator,
  StatusCard
} from '../../../components/ui/EngagingComponents.tsx';
import { 
  FolderKanban, 
  TicketCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  CreditCard,
  PlusCircle,
  FileCheck2,
  Zap
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
  const [showCelebration, setShowCelebration] = useState(false);

  const projects = useAppSelector(state => state.agency.projects.filter(p => p.clientId === clientId));
  const requests = useAppSelector(state => state.agency.requests.filter(r => r.clientId === clientId));
  const tasks = useAppSelector(state => state.agency.tasks.filter(t => t.clientId === clientId && t.isClientVisible));
  const invoices = useAppSelector(state => state.agency.invoices.filter(i => i.clientId === clientId));

  // Pending estimates requiring client approval
  const estimateApprovals = requests.filter(r => r.status === 'AWAITING_CLIENT_APPROVAL' && r.estimate);
  const tasksRequiringAction = tasks.filter(t => t.requiresClientAction && t.status !== 'COMPLETED');
  const unpaidInvoices = invoices.filter(i => i.status === 'ISSUED');

  const handleApprove = (req: any) => {
    dispatch(clientApproveEstimate({ requestId: req.id, clientUser: currentUser.name }));
    dispatch(addToast({
      type: 'success',
      title: 'Work Authorized',
      message: `Estimate of $${req.estimate?.totalAmount} authorized. Engineering sprint scheduled.`
    }));
    setShowCelebration(true);
  };

  return (
    <div className="space-y-8 relative">
      {/* Floating Action Button */}
      <FloatingActionButton
        icon={PlusCircle}
        label="New Request"
        onClick={onOpenNewRequest}
        color="blue"
      />

      {/* Success Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <SuccessCelebration
            message="Your estimate has been authorized! Work will begin shortly."
            onComplete={() => setShowCelebration(false)}
          />
        )}
      </AnimatePresence>
      {/* Welcome Banner */}
      <motion.div
        className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <motion.div
            className="text-xs font-semibold text-blue-600 uppercase tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Client Workspace
          </motion.div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {currentUser.clientName} · Retainer active (8.5 of 15.0 hours utilized this billing cycle)
          </p>
        </div>

        <motion.button
          onClick={onOpenNewRequest}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit New Request</span>
        </motion.button>
      </motion.div>

      {/* Action Banner: Pending Estimate Approvals */}
      {estimateApprovals.length > 0 && (
        <motion.div
          className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 glass-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <motion.div
                className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <AlertCircle className="w-5 h-5" />
              </motion.div>
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
            {estimateApprovals.map((req, idx) => (
              <motion.div
                key={req.id}
                className="bg-white rounded-xl p-4 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                whileHover={{ y: -2 }}
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
                  <motion.button
                    onClick={() => handleApprove(req)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize Work ($ {req.estimate?.totalAmount})</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* KPI Overview Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
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
      </motion.div>

      {/* 2-Column Split: Active Projects & Actions Required */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Projects (7 cols) */}
        <motion.div
          className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs glass-card"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Active Engagements
            </h3>
            <motion.button
              onClick={() => onNavigateTab('PROJECTS')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span>View details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          <div className="mt-4 space-y-4">
            {projects.map((p, idx) => (
              <motion.div
                key={p.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.1 }}
                whileHover={{ y: -2 }}
              >
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
                    <motion.div 
                      className="h-full bg-blue-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${p.progressPercent}%` }}
                      transition={{ duration: 1, delay: 0.8 + idx * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Target: {p.targetCompletionDate}</span>
                  <span>Lead: {p.assignedLead}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Items & Support Tickets (5 cols) */}
        <motion.div
          className="lg:col-span-5 space-y-6"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {/* Action Items */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs glass-card">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Client Action Items ({tasksRequiringAction.length})
            </h3>

            <div className="mt-4 space-y-3">
              {tasksRequiringAction.length > 0 ? (
                tasksRequiringAction.map((t, idx) => (
                  <motion.div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + idx * 0.1 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900">{t.title}</div>
                      <p className="text-[11px] text-slate-500">{t.description}</p>
                      <div className="text-[10px] text-amber-700 font-medium">Due: {t.dueDate}</div>
                    </div>
                    <motion.button
                      onClick={() => dispatch(toggleTaskStatus({ taskId: t.id }))}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Complete
                    </motion.button>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="py-4 text-center text-xs text-slate-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  No pending action items for your team today.
                </motion.div>
              )}
            </div>
          </div>

          {/* Recent Support Tickets */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs glass-card">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Support Requests
              </h3>
              <motion.button
                onClick={() => onNavigateTab('REQUESTS')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <span>All tickets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            <div className="mt-3 space-y-2.5">
              {requests.slice(0, 3).map((r, idx) => (
                <motion.div
                  key={r.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + idx * 0.05 }}
                  whileHover={{ y: -1 }}
                >
                  <div className="space-y-0.5 truncate mr-2">
                    <div className="text-xs font-semibold text-slate-800 truncate">{r.title}</div>
                    <div className="text-[11px] text-slate-400">{r.reference} · {r.category}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

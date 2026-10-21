import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { approveOutreachDraft, updateRequestStatus, payInvoice } from '../../../store/index.ts';
import { StatCard, StatusBadge } from '../../../components/ui/Badges.tsx';
import { 
  Users, 
  FolderKanban, 
  Sparkles, 
  DollarSign, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Workflow,
  TrendingUp,
  FileText,
  Calendar,
  AlertTriangle,
  Play,
  CreditCard
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Cell
} from 'recharts';
import type { AdminTab } from './AdminLayout.tsx';

interface AdminDashboardProps {
  onNavigateTab: (tab: AdminTab) => void;
}

export function AdminDashboard({ onNavigateTab }: { onNavigateTab: (tab: AdminTab) => void }) {
  const dispatch = useAppDispatch();
  const clients = useAppSelector(state => state.agency.clients);
  const projects = useAppSelector(state => state.agency.projects);
  const requests = useAppSelector(state => state.agency.requests);
  const leads = useAppSelector(state => state.agency.leads);
  const drafts = useAppSelector(state => state.agency.outreachDrafts);
  const invoices = useAppSelector(state => state.agency.invoices);
  const activities = useAppSelector(state => state.agency.activities);

  const [dateRange, setDateRange] = useState('OCT_2026');

  // Computed metrics
  const pendingDrafts = drafts.filter(d => d.status === 'AWAITING_HUMAN_APPROVAL');
  const pendingRequests = requests.filter(r => r.status === 'NEW' || r.status === 'NEEDS_CLASSIFICATION');
  const requestsAwaitingClientApproval = requests.filter(r => r.status === 'AWAITING_CLIENT_APPROVAL');
  const readyToStartRequests = requests.filter(r => r.status === 'READY_TO_START');

  const cashCollected = invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const outstandingReceivables = invoices
    .filter(i => i.status === 'ISSUED')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE');

  // Qualified pipeline value (e.g. sum of estimated project sizes)
  const qualifiedLeads = leads.filter(l => l.qualificationScore >= 80);
  const qualifiedPipelineValue = qualifiedLeads.length * 18500; // Average project value $18.5k
  const weightedPipelineForecast = Math.round(qualifiedPipelineValue * 0.45); // 45% closing probability

  // Active retainers
  const activeRetainers = clients.filter(c => c.retainerTier && c.retainerTier !== 'NONE');
  const mrrEstimate = activeRetainers.length * 1800; // Estimated monthly recurring retainer revenue

  // Cash flow chart data (Honest historical and invoiced breakdown)
  const cashFlowData = [
    { month: 'Jul 2026', collected: 14200, invoiced: 14200 },
    { month: 'Aug 2026', collected: 16800, invoiced: 18500 },
    { month: 'Sep 2026', collected: 19475, invoiced: 21000 },
    { month: 'Oct 2026', collected: cashCollected, invoiced: cashCollected + outstandingReceivables }
  ];

  // Sales Funnel Data
  const funnelData = [
    { stage: 'Discovered', count: leads.length, color: '#3867E8' },
    { stage: 'Qualified', count: leads.filter(l => l.pipelineStage !== 'DISCOVERED').length, color: '#16A6A1' },
    { stage: 'Outreach Ready', count: leads.filter(l => ['READY_FOR_OUTREACH', 'OUTREACH_APPROVED', 'CONTACTED', 'MEETING_SCHEDULED', 'WON'].includes(l.pipelineStage)).length, color: '#5489FF' },
    { stage: 'Contacted', count: leads.filter(l => ['CONTACTED', 'MEETING_SCHEDULED', 'WON'].includes(l.pipelineStage)).length, color: '#FF8066' },
    { stage: 'Meeting Set', count: leads.filter(l => ['MEETING_SCHEDULED', 'WON'].includes(l.pipelineStage)).length, color: '#16835D' }
  ];

  // Founder Action Center: Prioritized High-Value Actions
  const actionItems = [
    ...(pendingDrafts.length > 0 ? [{
      id: 'act-outreach',
      priority: 'HIGH' as const,
      title: `Review outreach note for ${pendingDrafts[0].recipientName} (${pendingDrafts[0].companyName})`,
      reason: 'Personalized email prepared referencing their terminal wait times. Ready for your review and sign-off before sending.',
      cta: 'Review in Outreach Studio',
      onExecute: () => onNavigateTab('OUTREACH')
    }] : []),
    ...(readyToStartRequests.length > 0 ? [{
      id: 'act-start-work',
      priority: 'MEDIUM' as const,
      title: `Client approved estimate: ${readyToStartRequests[0].title}`,
      reason: `${readyToStartRequests[0].clientName} authorized the estimate. Clear to begin implementation in this week's sprint.`,
      cta: 'Open Support Queue',
      onExecute: () => onNavigateTab('REQUESTS')
    }] : []),
    ...(outstandingReceivables > 0 ? [{
      id: 'act-invoices',
      priority: 'MEDIUM' as const,
      title: `Keep an eye on pending invoice ($${outstandingReceivables.toLocaleString()} USD)`,
      reason: 'Issued to Meridian Retail Group for emergency checkout latency optimization. Reconcile once ACH arrives.',
      cta: 'View Invoices',
      onExecute: () => onNavigateTab('INVOICES')
    }] : []),
    {
      id: 'act-lead-followup',
      priority: 'LOW' as const,
      title: 'Review new logistics opportunity: Vanguard Freight',
      reason: 'High-fit prospect (92/100 match). Cross-dock operations bottleneck very similar to what we solved for Nexus.',
      cta: 'View Prospect',
      onExecute: () => onNavigateTab('LEADS')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & Timezone Status Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <span>Agency Command Center</span>
            <span>·</span>
            <span className="text-slate-400">Asia/Kuala_Lumpur (UTC+8)</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
            Good morning, Alex. Here&apos;s where things stand today.
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            A clear view of active client work, cash in the bank, pending approvals, and your next best steps.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-medium">
            Period: <strong>October 2026</strong>
          </div>
          <button
            onClick={() => onNavigateTab('OUTREACH')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Outreach Queue ({pendingDrafts.length})</span>
          </button>
        </div>
      </div>

      {/* 10 Executive KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Cash Collected"
          value={`$${cashCollected.toLocaleString()}`}
          subtext="Cleared payments this month"
          trend="+18% MoM"
          icon={DollarSign}
        />
        <StatCard
          label="Receivables"
          value={`$${outstandingReceivables.toLocaleString()}`}
          subtext="Billed & awaiting payment"
          icon={CreditCard}
        />
        <StatCard
          label="Pipeline Value"
          value={`$${(qualifiedPipelineValue / 1000).toFixed(1)}k`}
          subtext="Qualified discussions"
          icon={Sparkles}
        />
        <StatCard
          label="Weighted Forecast"
          value={`$${(weightedPipelineForecast / 1000).toFixed(1)}k`}
          subtext="Conservative 45% close rate"
          icon={TrendingUp}
        />
        <StatCard
          label="Paying Clients"
          value={clients.length}
          subtext="Active partnerships"
          icon={Users}
        />
        <StatCard
          label="Active Projects"
          value={projects.filter(p => p.status === 'IN_PROGRESS').length}
          subtext="In active sprint delivery"
          icon={FolderKanban}
        />
        <StatCard
          label="Retainer MRR"
          value={`$${mrrEstimate.toLocaleString()}`}
          subtext="Predictable recurring revenue"
          icon={Clock}
        />
        <StatCard
          label="Overdue Invoices"
          value={overdueInvoices.length}
          subtext={overdueInvoices.length === 0 ? 'All client accounts current' : 'Requires follow-up'}
          icon={AlertCircle}
        />
        <StatCard
          label="Support Queue"
          value={requests.length}
          subtext={`${pendingRequests.length} needing review`}
          icon={AlertCircle}
        />
        <StatCard
          label="Automations"
          value="5 Active"
          subtext="Background jobs running"
          icon={Workflow}
        />
      </div>

      {/* Founder Action Center: Prioritized High-Value Next Actions */}
      <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Founder Action Center: What Needs Your Focus Today
              </h2>
              <p className="text-xs text-slate-600">
                Prioritized items pulled directly from live client requests, pipeline milestones, and cash-flow deadlines.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
            {actionItems.length} Actions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {actionItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 border border-amber-200/70 shadow-2xs flex flex-col justify-between gap-3 hover:border-amber-300 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    item.priority === 'HIGH' 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.priority}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.reason}
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={item.onExecute}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <span>{item.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics Split: Revenue Cash Flow & CRM Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cash Flow Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Cash in the Bank vs. Invoiced Revenue
              </h3>
              <p className="text-xs text-slate-500">
                Real dollars collected each month compared with total billing sent out.
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-400">USD</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                  formatter={(val: any) => [`$${Number(val).toLocaleString()} USD`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="collected" name="Cash Collected" fill="#16835D" radius={[4, 4, 0, 0]} />
                <Bar dataKey="invoiced" name="Invoiced Total" fill="#3867E8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#16835D]" />
              <span>Cash Collected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#3867E8]" />
              <span>Invoiced Revenue</span>
            </div>
          </div>
        </div>

        {/* CRM Sales Funnel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Sales Pipeline Conversion Funnel
              </h3>
              <p className="text-xs text-slate-500">
                Stage-by-stage lead progression in active CRM.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('LEADS')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>View CRM</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {funnelData.map((stage, idx) => {
              const maxVal = Math.max(1, funnelData[0].count);
              const percent = Math.round((stage.count / maxVal) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{stage.stage}</span>
                    <span className="font-bold text-slate-900 tabular-nums">{stage.count} leads</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%`, backgroundColor: stage.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Average conversion from Qualification to Scheduled Meeting: <strong>33%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

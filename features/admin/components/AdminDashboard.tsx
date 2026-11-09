import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { fetchClients, fetchCrmLeads, fetchProjects, fetchSupportRequests, fetchInvoices, fetchOutreachDrafts } from '../../../store/index.ts';
import { buildCashFlowSeries, countPipeline, countActiveClients, countRetainerClients } from '../../../lib/dashboardMetrics.ts';
import { isMockModeEnv } from '../../../lib/api/client.ts';
import dynamic from 'next/dynamic';
import { Users, FolderKanban, DollarSign, Send, ArrowRight, TrendingUp, CreditCard, TicketCheck } from 'lucide-react';
import { KpiCard, Panel, percentChange } from '../../../components/ui/app-kit.tsx';
import { humanizeCode } from '../../../lib/labels.ts';

// Recharts is heavy and client-only: load it after the page shell (React best practice bundle-dynamic-imports).
const CashFlowChart = dynamic(() => import('./CashFlowChart.tsx'), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-gp-control bg-gp-canvas" aria-hidden="true" />,
});
import type { AdminTab } from './AdminLayout.tsx';

const money = (n: number) => `$${n.toLocaleString()}`;

export function AdminDashboard({ onNavigateTab }: { onNavigateTab: (tab: AdminTab) => void }) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = (currentUser.name || '').split(' ')[0];
  const periodLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(now);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const clients = useAppSelector(state => state.agency.clients);
  const projects = useAppSelector(state => state.agency.projects);
  const requests = useAppSelector(state => state.agency.requests);
  const leads = useAppSelector(state => state.agency.leads);
  const drafts = useAppSelector(state => state.agency.outreachDrafts);
  const invoices = useAppSelector(state => state.agency.invoices);
  const activities = useAppSelector(state => state.agency.activities);
  // There is no activity API in MVP1: events exist only in demo mode (same rule as the Activity log tab).
  const activityConnected = isMockModeEnv();

  // The dashboard loads its own data instead of showing whatever the store happened to hold.
  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchCrmLeads());
    dispatch(fetchProjects());
    dispatch(fetchSupportRequests());
    dispatch(fetchInvoices());
    dispatch(fetchOutreachDrafts());
  }, [dispatch]);

  const pendingDrafts = drafts.filter(d => d.status === 'AWAITING_HUMAN_APPROVAL');
  const pendingRequests = requests.filter(r => r.status === 'NEW' || r.status === 'NEEDS_CLASSIFICATION');
  const readyToStartRequests = requests.filter(r => r.status === 'READY_TO_START');

  const cashCollected = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.totalAmount, 0);
  const outstandingReceivables = invoices.filter(i => i.status === 'ISSUED').reduce((sum, i) => sum + i.totalAmount, 0);
  const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE');

  // Real counts only.
  const pipeline = countPipeline(leads);
  const activeClients = countActiveClients(clients);
  const retainerClients = countRetainerClients(clients);
  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS');

  // Cash flow from actual invoices; month-over-month change only when last month had collections.
  const cashFlowData = buildCashFlowSeries(invoices, new Date());
  const thisMonth = cashFlowData[cashFlowData.length - 1]?.collected ?? 0;
  const lastMonth = cashFlowData[cashFlowData.length - 2]?.collected ?? 0;
  const cashChange = percentChange(thisMonth, lastMonth);

  const funnelData = [
    { stage: 'Discovered', count: leads.length },
    { stage: 'Qualified', count: leads.filter(l => l.pipelineStage !== 'DISCOVERED').length },
    { stage: 'Outreach ready', count: leads.filter(l => ['READY_FOR_OUTREACH', 'OUTREACH_APPROVED', 'CONTACTED', 'MEETING_SCHEDULED', 'WON'].includes(l.pipelineStage)).length },
    { stage: 'Contacted', count: leads.filter(l => ['CONTACTED', 'MEETING_SCHEDULED', 'WON'].includes(l.pipelineStage)).length },
    { stage: 'Meeting set', count: leads.filter(l => ['MEETING_SCHEDULED', 'WON'].includes(l.pipelineStage)).length },
  ];
  // Computed from the funnel (previously a hard-coded "33%").
  const qualifiedToMeeting = funnelData[1].count ? Math.round((funnelData[4].count / funnelData[1].count) * 100) : null;

  // Prioritised next actions from live data.
  const actionItems = [
    ...(pendingDrafts.length > 0 ? [{
      id: 'act-outreach', priority: 'High' as const, area: 'Outreach',
      title: `Review outreach note for ${pendingDrafts[0].recipientName} (${pendingDrafts[0].companyName})`,
      reason: `${pendingDrafts.length} draft${pendingDrafts.length === 1 ? '' : 's'} waiting for your sign-off before sending.`,
      cta: 'Review drafts', onExecute: () => onNavigateTab('OUTREACH'),
    }] : []),
    ...(readyToStartRequests.length > 0 ? [{
      id: 'act-start-work', priority: 'Medium' as const, area: 'Support',
      title: `Client approved estimate: ${readyToStartRequests[0].title}`,
      reason: `${readyToStartRequests[0].clientName} approved the estimate. Ready to schedule.`,
      cta: 'Open queue', onExecute: () => onNavigateTab('REQUESTS'),
    }] : []),
    ...(pendingRequests.length > 0 ? [{
      id: 'act-triage', priority: 'Medium' as const, area: 'Support',
      title: `${pendingRequests.length} new request${pendingRequests.length === 1 ? '' : 's'} to classify`,
      reason: 'New client requests need a type, priority and estimate.',
      cta: 'Triage', onExecute: () => onNavigateTab('REQUESTS'),
    }] : []),
    ...(outstandingReceivables > 0 ? [{
      id: 'act-invoices', priority: overdueInvoices.length ? 'High' as const : 'Low' as const, area: 'Finance',
      title: `${money(outstandingReceivables)} awaiting payment`,
      reason: overdueInvoices.length ? `${overdueInvoices.length} invoice${overdueInvoices.length === 1 ? ' is' : 's are'} overdue.` : 'Issued invoices not yet paid. Reconcile when payment arrives.',
      cta: 'View invoices', onExecute: () => onNavigateTab('INVOICES'),
    }] : []),
  ];

  const recent = [...activities].slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold text-ink-950">
            {greeting}{firstName ? `, ${firstName}` : ''}
          </h2>
          <p className="mt-1 text-[0.95rem] text-ink-500">Here is where client work, cash and the pipeline stand today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-10 items-center rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-600">
            {periodLabel}<span className="mx-2 text-ink-300" aria-hidden="true">|</span>{timeZone}
          </span>
          <button onClick={() => onNavigateTab('OUTREACH')}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-800 hover:border-ink-300">
            <Send className="h-4 w-4 text-brand-600" aria-hidden="true" />
            Outreach queue ({pendingDrafts.length})
          </button>
        </div>
      </div>

      {/* KPI row: six cards, real values only (reference A) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <KpiCard label="Cash collected" icon={DollarSign} value={money(cashCollected)}
          delta={cashChange === null ? null : { value: cashChange, label: 'versus last month' }}
          context={cashChange === null ? 'All paid invoices' : 'vs last month'}
          spark={cashFlowData.map(p => p.collected)} sparkLabel="Cash collected over the last four months"
          onClick={() => onNavigateTab('INVOICES')} />
        <KpiCard label="Receivables" icon={CreditCard} value={money(outstandingReceivables)}
          tone={overdueInvoices.length ? 'danger' : 'primary'}
          context={overdueInvoices.length
            ? <span className="font-medium text-gp-danger">{overdueInvoices.length} overdue</span>
            : 'No overdue invoices'}
          onClick={() => onNavigateTab('INVOICES')} />
        <KpiCard label="Open pipeline" icon={TrendingUp} value={pipeline.open}
          context={`${pipeline.qualified} qualified (score 80+)`} onClick={() => onNavigateTab('LEADS')} />
        <KpiCard label="Active clients" icon={Users} value={activeClients}
          context={`${retainerClients} on a retainer, ${clients.length} total`} onClick={() => onNavigateTab('CLIENTS')} />
        <KpiCard label="Active projects" icon={FolderKanban} value={activeProjects.length}
          context={`${projects.length} projects in total`} onClick={() => onNavigateTab('PROJECTS')} />
        <KpiCard label="Support requests" icon={TicketCheck} value={requests.length}
          tone={pendingRequests.length ? 'warning' : 'primary'}
          context={pendingRequests.length ? `${pendingRequests.length} need triage` : 'Nothing to triage'}
          onClick={() => onNavigateTab('REQUESTS')} />
      </div>

      {/* Main chart + breakdown */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Panel className="xl:col-span-8" title="Cash collected vs invoiced"
          description="Paid invoices by payment month, compared with invoices issued. USD."
          action={(
            <div className="flex items-center gap-4 text-sm text-ink-600">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-gp-primary" />Collected</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-slate-300" />Invoiced</span>
            </div>
          )}>
          <div className="h-72 w-full">
            <CashFlowChart data={cashFlowData} />
          </div>
        </Panel>

        <Panel className="xl:col-span-4" title="Pipeline breakdown" description="How far leads have progressed"
          action={(
            <button onClick={() => onNavigateTab('LEADS')} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
              View CRM <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}>
          <ul className="space-y-4">
            {funnelData.map(stage => {
              const percent = Math.round((stage.count / Math.max(1, funnelData[0].count)) * 100);
              return (
                <li key={stage.stage}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-700">{stage.stage}</span>
                    <span className="font-semibold tabular-nums text-ink-950">{stage.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink-100" aria-hidden="true">
                    <div className="h-full rounded-full bg-brand-500 transition-[width] duration-500" style={{ width: `${percent}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 border-t border-ink-100 pt-4 text-sm text-ink-500">
            {qualifiedToMeeting === null
              ? 'No qualified leads yet.'
              : <>Qualified to meeting: <strong className="font-semibold text-ink-900">{qualifiedToMeeting}%</strong></>}
          </p>
        </Panel>
      </div>

      {/* Task overview + recent activity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Panel className="xl:col-span-8" title="Needs your attention" description="Prioritised from live requests, pipeline and invoices"
          bodyClassName="p-0">
          {actionItems.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-500">Nothing needs your attention right now.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Prioritised actions</caption>
                <thead>
                  <tr className="border-b border-ink-100 text-ink-500">
                    <th scope="col" className="px-5 py-2.5 font-medium">Task</th>
                    <th scope="col" className="hidden px-3 py-2.5 font-medium md:table-cell">Area</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Priority</th>
                    <th scope="col" className="hidden px-5 py-2.5 text-right font-medium sm:table-cell"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {actionItems.map(item => (
                    <tr key={item.id} className="border-b border-ink-100 last:border-0">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-ink-900">{item.title}</p>
                        <p className="mt-0.5 text-ink-500">{item.reason}</p>
                        <button onClick={item.onExecute}
                          className="mt-2 inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-brand-700 sm:hidden">
                          {item.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                      <td className="hidden px-3 py-3.5 text-ink-600 md:table-cell">{item.area}</td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.priority === 'High' ? 'bg-rose-50 text-rose-700' : item.priority === 'Medium' ? 'bg-amber-50 text-amber-800' : 'bg-ink-100 text-ink-700'
                        }`}>{item.priority}</span>
                      </td>
                      <td className="hidden px-5 py-3.5 text-right sm:table-cell">
                        <button onClick={item.onExecute}
                          className="inline-flex min-h-9 items-center gap-1 whitespace-nowrap rounded-lg px-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                          {item.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel className="xl:col-span-4" title="Recent activity" bodyClassName="p-0"
          action={activityConnected ? (
            <button onClick={() => onNavigateTab('ACTIVITY')} className="text-sm font-semibold text-brand-700 hover:text-brand-800">See all</button>
          ) : undefined}>
          {!activityConnected ? (
            <p className="px-5 py-8 text-sm text-ink-500">The activity log is not connected yet: there is no activity API in MVP1.</p>
          ) : recent.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-500">No activity yet.</p>
          ) : (
            <ol className="divide-y divide-ink-100">
              {recent.map(a => (
                <li key={a.id} className="flex gap-3 px-5 py-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
                  <div className="min-w-0 text-sm">
                    <p className="text-ink-900">{humanizeCode(a.action)}</p>
                    <p className="mt-0.5 truncate text-ink-500">{a.actor}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </div>
  );
}

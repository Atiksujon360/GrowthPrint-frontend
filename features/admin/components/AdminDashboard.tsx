import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { fetchClients, fetchCrmLeads, fetchProjects, fetchSupportRequests, fetchInvoices, fetchOutreachDrafts, fetchAllProposals } from '../../../store/index.ts';
import {
  buildCashFlowSeries, countPipeline, countActiveClients, countRetainerClients, countActiveProjects, projectsByTargetMonth,
  milestoneCounts, milestonePerformance, acceptedValueByService, countBy, newLeadsThisAndLastMonth, OPEN_PROPOSAL_STATUSES,
  ACTIVE_PROJECT_STATUSES,
} from '../../../lib/dashboardMetrics.ts';
import { isMockModeEnv } from '../../../lib/api/client.ts';
import { Send, ArrowRight } from 'lucide-react';
import { KpiCard, Panel, percentChange } from '../../../components/ui/app-kit.tsx';
import { StatusBadge } from '../../../components/ui/Badges.tsx';
import { humanizeCode } from '../../../lib/labels.ts';

import { AreaTrend, DonutBreakdown, HorizontalBars, GroupedBars, ComboBarLine } from '../../../components/charts/lazy.tsx';
import type { AdminTab } from './AdminLayout.tsx';

const money = (n: number) => `$${n.toLocaleString()}`;

// Corporate motion personality: MD3-standard curve, ~320ms rise-and-fade, 40ms card stagger.
// [&>*]:h-full keeps grid children (KpiCard, Panel) filling their cell so rows stay equal-height.
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={`[&>*]:h-full ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: [0.2, 0, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function AdminDashboard({ onNavigateTab }: { onNavigateTab: (tab: AdminTab) => void }) {
  const dispatch = useAppDispatch();
  const now = new Date();
  const periodLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(now);
  const clients = useAppSelector(state => state.agency.clients);
  const projects = useAppSelector(state => state.agency.projects);
  const requests = useAppSelector(state => state.agency.requests);
  const leads = useAppSelector(state => state.agency.leads);
  const drafts = useAppSelector(state => state.agency.outreachDrafts);
  const invoices = useAppSelector(state => state.agency.invoices);
  const proposals = useAppSelector(state => state.agency.proposals);
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
    dispatch(fetchAllProposals());
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

  // COMPREO figures (docs/ui-transformation/DATA-REQUIREMENTS.md): real data or labelled interims only.
  const activeProjectCount = countActiveProjects(projects);
  const waitingProjects = projects.filter(p => p.status === 'WAITING_FOR_CLIENT').length;
  const newLeads = newLeadsThisAndLastMonth(leads, now);
  const milestones = milestoneCounts(projects, now);
  const openProposals = proposals.filter(p => OPEN_PROPOSAL_STATUSES.has(p.status));
  const openProposalValue = openProposals.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
  const outstanding = invoices.filter(i => i.status === 'ISSUED' || i.status === 'OVERDUE');
  const outstandingTotal = outstanding.reduce((sum, i) => sum + i.totalAmount, 0);
  const leadsDelta = percentChange(newLeads.thisMonth, newLeads.lastMonth);

  const targetTrend = projectsByTargetMonth(projects, now);
  const serviceRevenue = acceptedValueByService(proposals).map(d => ({ ...d, label: humanizeCode(d.label) }));
  const leadSources = countBy(leads, l => l.source).map(d => ({ ...d, label: humanizeCode(d.label) }));
  const projectStatus = countBy(projects, p => p.status).map(d => ({ ...d, label: humanizeCode(d.label) }));
  const milestoneTrend = milestonePerformance(projects, now);
  const collectedVsInvoiced = cashFlowData.map(p => ({ label: p.month.split(' ')[0], bar: p.invoiced, line: p.collected }));
  const activeProjectRows = projects.filter(p => ACTIVE_PROJECT_STATUSES.has(p.status)).slice(0, 5);
  const recentLeads = [...leads].sort((a, b) => (b.createdAt || b.discoveredDate || '').localeCompare(a.createdAt || a.discoveredDate || '')).slice(0, 5);
  const recent = [...activities].slice(0, 6);
  const shortMoney = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`;

  const empty = (text: string) => <p className="flex h-full items-center justify-center text-center text-sm text-gp-text-secondary">{text}</p>;

  return (
    <div className="space-y-6">
      {/* Context header: the period is the title, actions sit beside it. */}
      <Reveal>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-gp-text">
            {periodLabel}
          </h1>
          <p className="text-sm text-gp-text-secondary">Pipeline, delivery and revenue across studio operations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pendingDrafts.length > 0 && (
            <button onClick={() => onNavigateTab('OUTREACH')}
              className="inline-flex h-10 items-center gap-2 rounded-gp-control border border-gp-border bg-gp-surface px-3 text-sm font-semibold text-gp-text transition-colors hover:border-gp-primary/50 hover:text-gp-primary-strong">
              <Send className="h-4 w-4 text-gp-primary-strong" aria-hidden="true" />
              Outreach queue ({pendingDrafts.length})
            </button>
          )}
        </div>
      </div>
      </Reveal>

      {/* Operational pulse: four compact stats, then the money strip — the dashboard's one bright element. */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Reveal delay={0.04}><KpiCard label="Active projects" value={activeProjectCount}
          context={waitingProjects ? `${waitingProjects} waiting for client` : `${projects.length} in total`} onClick={() => onNavigateTab('PROJECTS')} /></Reveal>
        <Reveal delay={0.08}><KpiCard label="Total leads" value={leads.length}
          delta={leadsDelta === null ? null : { value: leadsDelta, label: 'new leads versus last month' }}
          context={leadsDelta === null ? `${newLeads.thisMonth} new this month` : 'new vs last month'} onClick={() => onNavigateTab('LEADS')} /></Reveal>
        <Reveal delay={0.12}><KpiCard label="Active clients" value={activeClients}
          context={`${retainerClients} on a retainer`} onClick={() => onNavigateTab('CLIENTS')} /></Reveal>
        <Reveal delay={0.16}><KpiCard label="Open milestones" value={milestones.open}
          context={milestones.overdue ? <span className="font-medium text-gp-danger">{milestones.overdue} overdue</span> : 'None overdue'}
          onClick={() => onNavigateTab('PROJECTS')} /></Reveal>
      </div>

      <Reveal delay={0.18}>
      <Panel title="Money" description="Invoiced, collected and in proposal review"
        action={<button onClick={() => onNavigateTab('INVOICES')} className="text-sm font-semibold text-gp-primary-strong hover:underline">View invoices</button>}
        bodyClassName="p-0">
        <dl className="grid grid-cols-1 gap-px bg-gp-border sm:grid-cols-3">
          <div className="bg-gp-surface px-5 py-4">
            <dt className="text-[0.8125rem] font-medium text-gp-text-secondary">Outstanding</dt>
            <dd className={`mt-1 text-2xl font-bold tabular-nums ${overdueInvoices.length ? 'text-gp-danger' : 'text-gp-text'}`}>{money(outstandingTotal)}</dd>
            <dd className="mt-1 text-xs text-gp-text-secondary">{overdueInvoices.length ? <span className="font-medium text-gp-danger">{overdueInvoices.length} overdue</span> : `${outstanding.length} issued`}</dd>
          </div>
          <div className="bg-gp-surface px-5 py-4">
            <dt className="text-[0.8125rem] font-medium text-gp-text-secondary">Collected to date</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-gp-text">{money(cashCollected)}</dd>
            <dd className="mt-1 text-xs text-gp-text-secondary">from paid invoices</dd>
          </div>
          <div className="bg-gp-surface px-5 py-4">
            <dt className="text-[0.8125rem] font-medium text-gp-text-secondary">In proposal review</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-gp-text">{openProposals.length ? money(openProposalValue) : '—'}</dd>
            <dd className="mt-1 text-xs text-gp-text-secondary">{openProposals.length ? `${openProposals.length} open proposal${openProposals.length === 1 ? '' : 's'}` : 'No open proposals'}</dd>
          </div>
        </dl>
      </Panel>
      </Reveal>

      {/* Analytics row 1 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Reveal delay={0.2}><Panel title="Projects by target month" description="Delivery load by target completion month">
          <div className="h-60">{projects.length ? <AreaTrend data={targetTrend} valueLabel="Projects" /> : empty('No projects yet.')}</div>
        </Panel></Reveal>
        <Reveal delay={0.24}><Panel title="Revenue by service" description="Accepted proposal value">
          {serviceRevenue.length ? <DonutBreakdown data={serviceRevenue} centerLabel="Total" format={shortMoney} /> : <div className="h-40">{empty('No accepted proposals yet.')}</div>}
        </Panel></Reveal>
        <Reveal delay={0.28}><Panel title="Lead sources" description="CRM leads by source">
          <div className="h-60">{leadSources.length ? <HorizontalBars data={leadSources} valueLabel="Leads" /> : empty('No leads yet.')}</div>
        </Panel></Reveal>
      </div>

      {/* Analytics row 2 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Reveal delay={0.3}><Panel title="Project status" description="All projects">
          <div className="h-60">{projectStatus.length ? <HorizontalBars data={projectStatus} valueLabel="Projects" /> : empty('No projects yet.')}</div>
        </Panel></Reveal>
        <Reveal delay={0.34}><Panel title="Milestone performance" description="Done vs open milestones by due month"
          action={<span className="flex gap-3 text-xs text-gp-text-secondary"><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-gp-accent" />Done</span><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-gp-divider" />Open</span></span>}>
          <div className="h-60">{milestones.total ? <GroupedBars data={milestoneTrend} aLabel="Done" bLabel="Open" /> : empty('No milestones yet.')}</div>
        </Panel></Reveal>
        <Reveal delay={0.38}><Panel title="Collected vs invoiced" description="USD by month"
          action={<span className="flex gap-3 text-xs text-gp-text-secondary"><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-gp-primary-soft ring-1 ring-gp-primary/40" />Invoiced</span><span className="flex items-center gap-1"><i className="h-0.5 w-3 bg-gp-primary" />Collected</span></span>}>
          <div className="h-60"><ComboBarLine data={collectedVsInvoiced} barLabel="Invoiced" lineLabel="Collected" /></div>
          <p className="mt-2 text-xs text-gp-text-secondary">Collected to date: <strong className="tabular-nums text-gp-text">{money(cashCollected)}</strong></p>
        </Panel></Reveal>
      </div>

      {/* Operational tables */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Reveal delay={0.4} className="xl:col-span-2"><Panel title="Active projects" bodyClassName="p-0"
          action={<button onClick={() => onNavigateTab('PROJECTS')} className="text-sm font-semibold text-gp-primary-strong hover:underline">View all</button>}>
          {activeProjectRows.length === 0 ? <p className="px-5 py-8 text-sm text-gp-text-secondary">No active projects.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[0.8125rem]">
                <caption className="sr-only">Active projects</caption>
                <thead><tr className="border-b border-gp-border bg-gp-canvas text-gp-text-secondary">
                  <th scope="col" className="px-5 py-2.5 font-medium">Project</th><th scope="col" className="px-3 py-2.5 font-medium">Client</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Status</th><th scope="col" className="px-3 py-2.5 font-medium">Progress</th>
                  <th scope="col" className="px-5 py-2.5 text-right font-medium">Target</th></tr></thead>
                <tbody>
                  {activeProjectRows.map(p => (
                    <tr key={p.id} className="border-b border-gp-divider last:border-0">
                      <td className="px-5 py-3"><p className="font-semibold text-gp-text">{p.name}</p><p className="text-xs text-gp-text-secondary">{p.reference}</p></td>
                      <td className="px-3 py-3 text-gp-text">{p.clientName}</td>
                      <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-3 py-3"><span className="flex items-center gap-2"><span className="h-1.5 w-24 overflow-hidden rounded-full bg-gp-divider" role="progressbar" aria-valuenow={p.progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`${p.name} progress`}><span className="block h-full bg-gp-accent" style={{ width: `${p.progressPercent}%` }} /></span><span className="tabular-nums">{p.progressPercent}%</span></span></td>
                      <td className="px-5 py-3 text-right tabular-nums text-gp-text">{p.targetCompletionDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel></Reveal>
        <Reveal delay={0.44}><Panel title="Recent leads" bodyClassName="p-0"
          action={<button onClick={() => onNavigateTab('LEADS')} className="text-sm font-semibold text-gp-primary-strong hover:underline">View all</button>}>
          {recentLeads.length === 0 ? <p className="px-5 py-8 text-sm text-gp-text-secondary">No leads yet.</p> : (
            <table className="w-full text-left text-[0.8125rem]">
              <caption className="sr-only">Recent leads</caption>
              <thead><tr className="border-b border-gp-border bg-gp-canvas text-gp-text-secondary">
                <th scope="col" className="px-5 py-2.5 font-medium">Company</th><th scope="col" className="px-3 py-2.5 font-medium">Source</th>
                <th scope="col" className="px-5 py-2.5 text-right font-medium">Score</th></tr></thead>
              <tbody>
                {recentLeads.map(l => (
                  <tr key={l.id} className="border-b border-gp-divider last:border-0">
                    <td className="px-5 py-3 font-semibold text-gp-text">{l.companyName}</td>
                    <td className="px-3 py-3 text-gp-text-secondary">{humanizeCode(l.source)}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-gp-text">{l.qualificationScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Pipeline conversion (kept from the original dashboard). */}
          <div className="border-t border-gp-divider px-5 py-4">
            <p className="text-sm font-semibold text-gp-text">Pipeline progress</p>
            <ul className="mt-3 space-y-2.5">
              {funnelData.map(stage => (
                <li key={stage.stage}>
                  <div className="flex justify-between text-xs"><span className="text-gp-text-secondary">{stage.stage}</span><span className="font-semibold tabular-nums text-gp-text">{stage.count}</span></div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gp-divider" aria-hidden="true"><div className="h-full bg-gp-accent" style={{ width: `${Math.round((stage.count / Math.max(1, funnelData[0].count)) * 100)}%` }} /></div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gp-text-secondary">{qualifiedToMeeting === null ? 'No qualified leads yet.' : <>Qualified to meeting: <strong className="text-gp-text">{qualifiedToMeeting}%</strong>, {pipeline.open} open</>}</p>
          </div>
        </Panel></Reveal>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Reveal delay={0.46} className="xl:col-span-2"><Panel title="Needs your attention" description="Prioritised from live requests, pipeline and invoices" bodyClassName="p-0">
          {actionItems.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gp-text-secondary">Nothing needs your attention right now.</p>
          ) : (
            <ul className="divide-y divide-gp-divider">
              {actionItems.map(item => (
                <li key={item.id} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium text-gp-text">{item.title}</p>
                    <p className="mt-0.5 text-gp-text-secondary">{item.area} · {item.reason}</p>
                  </div>
                  <span className={`w-fit rounded-gp-badge px-2 py-0.5 text-xs font-medium ${
                    item.priority === 'High' ? 'bg-gp-danger-soft text-gp-danger' : item.priority === 'Medium' ? 'bg-gp-warning-soft text-gp-warning' : 'bg-gp-surface-secondary text-gp-text-secondary'}`}>{item.priority}</span>
                  <button onClick={item.onExecute} className="inline-flex min-h-9 w-fit items-center gap-1 rounded-gp-control px-2 text-sm font-semibold text-gp-primary-strong hover:bg-gp-primary-soft">
                    {item.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel></Reveal>
        <Reveal delay={0.5}><Panel title="Recent activity" bodyClassName="p-0"
          action={activityConnected ? <button onClick={() => onNavigateTab('ACTIVITY')} className="text-sm font-semibold text-gp-primary-strong hover:underline">See all</button> : undefined}>
          {!activityConnected ? (
            <p className="px-5 py-8 text-sm text-gp-text-secondary">The activity log is not connected yet: there is no activity API in MVP1.</p>
          ) : recent.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gp-text-secondary">No activity yet.</p>
          ) : (
            <ol className="divide-y divide-gp-divider">
              {recent.map(a => (
                <li key={a.id} className="flex gap-3 px-5 py-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gp-accent" aria-hidden="true" />
                  <div className="min-w-0 text-sm"><p className="text-gp-text">{humanizeCode(a.action)}</p><p className="mt-0.5 truncate text-gp-text-secondary">{a.actor}</p></div>
                </li>
              ))}
            </ol>
          )}
        </Panel></Reveal>
      </div>
    </div>
  );
}

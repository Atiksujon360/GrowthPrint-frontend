'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, Info, Plus } from 'lucide-react';
import { useDashboardQuery, errorMessage } from '../api/workspaceApi.ts';
import { useBusinessScope } from '../components/BusinessScope.tsx';
import { ROLE_LABEL } from '../model/permissions.ts';
import { workspaceRoutes } from '../../../lib/routes.ts';
import { ErrorState, Skeleton } from '../../../components/ui/forms.tsx';
import { PageHeader, StatCard, StatusPill } from '../../../components/ui/workspace-kit.tsx';
import { ActivityList } from '../components/ActivityList.tsx';
import { formatMoney } from '../model/format.ts';

export function CommandCentreScreen() {
  const { businessId, business, role, can } = useBusinessScope();
  const r = workspaceRoutes(businessId);
  const { data, isLoading, error, refetch } = useDashboardQuery(businessId);
  const currency = business.currency ?? 'USD';
  const maxStage = Math.max(1, ...(data?.stageCounts.map(s => s.count) ?? [1]));

  return (
    <>
      <PageHeader
        title="Command Centre"
        description={<>Today in <span className="font-medium text-ink-800">{business.name}</span> · you're {ROLE_LABEL[role].toLowerCase()}</>}
        actions={(
          <>
            {can('leads.create') && (
              <Link href={`${r.leads}?new=1`} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3.5 text-sm font-semibold text-ink-800 hover:bg-ink-50">
                <Plus className="h-4 w-4" aria-hidden="true" /> New lead
              </Link>
            )}
            {can('clients.create') && (
              <Link href={`${r.clients}?new=1`} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 text-sm font-semibold text-white hover:bg-brand-700">
                <Plus className="h-4 w-4" aria-hidden="true" /> New client
              </Link>
            )}
          </>
        )}
      />

      {error && <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Loading dashboard">
          {[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <section aria-label="Key numbers" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Active clients" value={data.clients.active} href={r.clients}
              hint={`${data.clients.total} total · ${data.clients.newThisMonth} new this month`} />
            <StatCard label="Open leads" value={data.leads.open} href={r.leads}
              hint={`${formatMoney(data.leads.pipelineValue, currency)} in the pipeline`} />
            <StatCard label="Win rate" value={`${data.leads.conversionRate}%`}
              hint={`${data.leads.won} won · ${data.leads.lost} lost`} />
            <StatCard label="Team" value={data.team.members} href={can('members.view') ? r.team : undefined}
              hint={data.team.pendingInvitations ? `${data.team.pendingInvitations} invitation${data.team.pendingInvitations > 1 ? 's' : ''} pending` : 'Active members'} />
          </section>

          <div className="grid gap-6 lg:grid-cols-5">
            <section aria-labelledby="priorities" className="rounded-2xl border border-ink-200 bg-white shadow-xs lg:col-span-3">
              <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
                <h2 id="priorities" className="text-sm font-semibold text-ink-900">Needs your attention</h2>
                <StatusPill tone={data.priorities.length ? 'warning' : 'success'}>{data.priorities.length || 'All clear'}</StatusPill>
              </header>
              {data.priorities.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-ink-500">Nothing urgent. Every open lead has a recent update and a next step.</p>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {data.priorities.map(p => {
                    const Icon = p.tone === 'warning' ? AlertTriangle : Info;
                    return (
                      <li key={p.id}>
                        <Link href={`${r.home}${p.href}`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-ink-50">
                          <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${p.tone === 'warning' ? 'text-amber-600' : 'text-brand-600'}`} aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-ink-900">{p.title}</span>
                            <span className="block text-xs text-ink-500">{p.detail}</span>
                          </span>
                          <ArrowRight className="mt-0.5 h-4 w-4 text-ink-400" aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section aria-labelledby="pipeline" className="rounded-2xl border border-ink-200 bg-white p-5 shadow-xs lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="pipeline" className="text-sm font-semibold text-ink-900">Pipeline</h2>
                <Link href={r.leads} className="text-xs font-medium text-brand-700 hover:underline">View leads</Link>
              </div>
              <ul className="space-y-3">
                {data.stageCounts.map(s => (
                  <li key={s.key}>
                    <Link href={`${r.leads}?stage=${s.key}`} className="block rounded-lg p-1 hover:bg-ink-50">
                      <div className="flex justify-between text-xs">
                        <span className="text-ink-700">{s.label}</span>
                        <span className="tabular-nums font-medium text-ink-900">{s.count}</span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-ink-100" aria-hidden="true">
                        <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(s.count / maxStage) * 100}%` }} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section aria-labelledby="recent" className="rounded-2xl border border-ink-200 bg-white shadow-xs">
            <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <h2 id="recent" className="text-sm font-semibold text-ink-900">Recent activity</h2>
              <Link href={r.activity} className="text-xs font-medium text-brand-700 hover:underline">See all</Link>
            </header>
            <ActivityList items={data.recentActivity} businessHome={r.home} />
          </section>
        </div>
      )}
    </>
  );
}

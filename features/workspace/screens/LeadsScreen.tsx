'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Target } from 'lucide-react';
import { useCreateLeadMutation, useLeadsQuery, errorMessage } from '../api/workspaceApi.ts';
import { useBusinessScope } from '../components/BusinessScope.tsx';
import { LeadFormDialog } from '../components/LeadFormDialog.tsx';
import { useDebounced } from '../components/useDebounced.ts';
import { STAGE_GROUPS, STAGE_LABEL, type PipelineStage } from '../model/types.ts';
import { formatMoney, formatRelative } from '../model/format.ts';
import { workspaceRoutes } from '../../../lib/routes.ts';
import { Button, EmptyState, ErrorState } from '../../../components/ui/forms.tsx';
import {
  FilterTabs, LoadingRows, PageHeader, Pagination, SearchInput, StatusPill, TableShell, Toolbar, td, th, type Tone,
} from '../../../components/ui/workspace-kit.tsx';
import { useAppDispatch } from '../../../store/hooks.ts';
import { addToast } from '../../../store/index.ts';

export function stageTone(stage: PipelineStage): Tone {
  if (stage === 'WON') return 'success';
  if (stage === 'LOST' || stage === 'DO_NOT_CONTACT') return 'danger';
  if (['CONTACTED', 'REPLIED', 'MEETING_SCHEDULED', 'PROPOSAL_SENT'].includes(stage)) return 'brand';
  if (['QUALIFIED', 'READY_FOR_OUTREACH', 'OUTREACH_APPROVED'].includes(stage)) return 'info';
  return 'neutral';
}

export function LeadsScreen() {
  const { businessId, business, can } = useBusinessScope();
  const r = workspaceRoutes(businessId);
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState(params.get('stage') ?? '');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const debounced = useDebounced(search, 250);
  const { data, isLoading, isFetching, error, refetch } = useLeadsQuery({
    businessId, query: { search: debounced, status: group || undefined, page, pageSize: 10 },
  });
  const [createLead, { isLoading: saving }] = useCreateLeadMutation();
  const currency = business.currency ?? 'USD';

  useEffect(() => { setPage(1); }, [debounced, group]);
  useEffect(() => { if (params.get('new') === '1' && can('leads.create')) setCreating(true); }, [params, can]);

  const filtered = Boolean(debounced || group);

  return (
    <>
      <PageHeader
        title="Leads & pipeline"
        description="Potential clients and where each conversation stands."
        breadcrumb={[{ label: business.name, href: r.home }, { label: 'Leads' }]}
        actions={can('leads.create') ? (
          <Button onClick={() => setCreating(true)} icon={<Plus className="h-4 w-4" aria-hidden="true" />}>New lead</Button>
        ) : undefined}
      />
      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search company, contact or industry" label="Search leads" />
        <FilterTabs label="Filter by pipeline stage" value={group} onChange={setGroup}
          options={[{ value: '', label: 'All' }, ...STAGE_GROUPS.map(g => ({ value: g.key, label: g.label }))]} />
      </Toolbar>

      {error ? <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} /> : (
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xs" aria-busy={isFetching}>
          {data && data.total === 0 ? (
            <div className="p-6">
              <EmptyState icon={<Target className="h-8 w-8" />}
                title={filtered ? 'No leads match your filters' : 'No leads yet'}
                description={filtered ? 'Try another search or stage.' : 'Add the businesses you are talking to and track them through to a signed client.'}
                action={!filtered && can('leads.create') ? <Button onClick={() => setCreating(true)}>New lead</Button>
                  : filtered ? <Button variant="secondary" onClick={() => { setSearch(''); setGroup(''); }}>Clear filters</Button> : undefined} />
            </div>
          ) : (
            <>
              <TableShell caption="Leads">
                <thead>
                  <tr>
                    <th scope="col" className={th}>Lead</th>
                    <th scope="col" className={th}>Stage</th>
                    <th scope="col" className={`${th} hidden md:table-cell`}>Next action</th>
                    <th scope="col" className={`${th} hidden sm:table-cell text-right`}>Value</th>
                    <th scope="col" className={`${th} hidden lg:table-cell`}>Updated</th>
                  </tr>
                </thead>
                {isLoading ? <LoadingRows cols={5} /> : (
                  <tbody>
                    {data?.items.map(l => (
                      <tr key={l.id} className="cursor-pointer hover:bg-ink-50" onClick={() => router.push(r.lead(l.id))}>
                        <td className={td}>
                          <Link href={r.lead(l.id)} onClick={e => e.stopPropagation()} className="font-medium text-ink-900 hover:text-brand-700 hover:underline">
                            {l.companyName}
                          </Link>
                          <span className="block text-xs text-ink-500">{l.contactName}{l.industry ? ` · ${l.industry}` : ''}</span>
                        </td>
                        <td className={td}>
                          <div className="flex flex-wrap gap-1">
                            <StatusPill tone={stageTone(l.pipelineStage)}>{STAGE_LABEL[l.pipelineStage]}</StatusPill>
                            {l.convertedClientId && <StatusPill tone="success">Client</StatusPill>}
                          </div>
                        </td>
                        <td className={`${td} hidden max-w-[16rem] truncate text-ink-700 md:table-cell`}>{l.nextAction ?? <span className="text-ink-400">—</span>}</td>
                        <td className={`${td} hidden text-right tabular-nums text-ink-700 sm:table-cell`}>{l.estimatedValue != null ? formatMoney(l.estimatedValue, currency) : '—'}</td>
                        <td className={`${td} hidden text-xs text-ink-500 lg:table-cell`}><time dateTime={l.updatedAt}>{formatRelative(l.updatedAt)}</time></td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </TableShell>
              {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} noun="leads" />}
            </>
          )}
        </div>
      )}

      <LeadFormDialog open={creating} onClose={() => setCreating(false)} saving={saving}
        onSubmit={async input => {
          const result = await createLead({ businessId, input });
          if ('data' in result && result.data) {
            setCreating(false);
            dispatch(addToast({ type: 'success', message: `${result.data.companyName} was added to your leads.` }));
            router.push(r.lead(result.data.id));
            return {};
          }
          return { error: result.error };
        }} />
    </>
  );
}

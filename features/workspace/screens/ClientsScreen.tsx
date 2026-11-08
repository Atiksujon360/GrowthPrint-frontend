'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Briefcase, Plus } from 'lucide-react';
import { useClientsQuery, useCreateClientMutation, errorMessage } from '../api/workspaceApi.ts';
import { useBusinessScope } from '../components/BusinessScope.tsx';
import { ClientFormDialog } from '../components/ClientFormDialog.tsx';
import { useDebounced } from '../components/useDebounced.ts';
import { workspaceRoutes } from '../../../lib/routes.ts';
import { Button, EmptyState, ErrorState } from '../../../components/ui/forms.tsx';
import {
  FilterTabs, LoadingRows, PageHeader, Pagination, SearchInput, StatusPill, TableShell, Toolbar, td, th,
} from '../../../components/ui/workspace-kit.tsx';
import { useAppDispatch } from '../../../store/hooks.ts';
import { addToast } from '../../../store/index.ts';
import type { ClientStatus } from '../model/types.ts';

export const CLIENT_STATUS_TONE: Record<ClientStatus, 'success' | 'info' | 'danger'> = {
  ACTIVE: 'success', INVITED: 'info', SUSPENDED: 'danger',
};
export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = { ACTIVE: 'Active', INVITED: 'Invited', SUSPENDED: 'Suspended' };

type StatusFilter = '' | ClientStatus;

export function ClientsScreen() {
  const { businessId, business, can } = useBusinessScope();
  const r = workspaceRoutes(businessId);
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const debounced = useDebounced(search, 250);
  const { data, isFetching, isLoading, error, refetch } = useClientsQuery({
    businessId, query: { search: debounced, status: status || undefined, page, pageSize: 10 },
  });
  const [createClient, { isLoading: saving }] = useCreateClientMutation();

  useEffect(() => { setPage(1); }, [debounced, status]);
  useEffect(() => {
    if (params.get('new') === '1' && can('clients.create')) setCreating(true);
  }, [params, can]);

  const filtered = Boolean(debounced || status);

  return (
    <>
      <PageHeader
        title="Clients"
        description="Everyone you work with in this business."
        breadcrumb={[{ label: business.name, href: r.home }, { label: 'Clients' }]}
        actions={can('clients.create') ? (
          <Button onClick={() => setCreating(true)} icon={<Plus className="h-4 w-4" aria-hidden="true" />}>New client</Button>
        ) : undefined}
      />
      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search name, email or manager" label="Search clients" />
        <FilterTabs label="Filter by status" value={status} onChange={setStatus} options={[
          { value: '', label: 'All' }, { value: 'ACTIVE', label: 'Active' }, { value: 'INVITED', label: 'Invited' },
          { value: 'SUSPENDED', label: 'Suspended' },
        ]} />
      </Toolbar>

      {error ? <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} /> : (
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xs" aria-busy={isFetching}>
          {data && data.total === 0 ? (
            <div className="p-6">
              <EmptyState icon={<Briefcase className="h-8 w-8" />}
                title={filtered ? 'No clients match your filters' : 'No clients yet'}
                description={filtered ? 'Try a different search or status.' : 'Add your first client, or convert a lead once you win the work.'}
                action={!filtered && can('clients.create')
                  ? <Button onClick={() => setCreating(true)}>New client</Button>
                  : filtered ? <Button variant="secondary" onClick={() => { setSearch(''); setStatus(''); }}>Clear filters</Button> : undefined} />
            </div>
          ) : (
            <>
              <TableShell caption="Clients">
                <thead>
                  <tr>
                    <th scope="col" className={th}>Client</th>
                    <th scope="col" className={th}>Status</th>
                    <th scope="col" className={`${th} hidden md:table-cell`}>Account manager</th>
                    <th scope="col" className={`${th} hidden sm:table-cell`}>Retainer</th>
                    <th scope="col" className={th}>Source</th>
                  </tr>
                </thead>
                {isLoading ? <LoadingRows cols={5} /> : (
                  <tbody>
                    {data?.items.map(c => (
                      <tr key={c.id} className="cursor-pointer hover:bg-ink-50" onClick={() => router.push(r.client(c.id))}>
                        <td className={td}>
                          <Link href={r.client(c.id)} onClick={e => e.stopPropagation()} className="font-medium text-ink-900 hover:text-brand-700 hover:underline">
                            {c.name}
                          </Link>
                          <span className="block text-xs text-ink-500">{c.contactEmail}</span>
                        </td>
                        <td className={td}><StatusPill tone={CLIENT_STATUS_TONE[c.status]}>{CLIENT_STATUS_LABEL[c.status]}</StatusPill></td>
                        <td className={`${td} hidden text-ink-700 md:table-cell`}>{c.accountManager}</td>
                        <td className={`${td} hidden text-ink-700 sm:table-cell`}>
                          {c.monthlyRetainerHours ? `${c.monthlyRetainerHours} h / month` : '—'}
                        </td>
                        <td className={td}>{c.convertedFromLeadId ? <StatusPill tone="brand">Converted lead</StatusPill> : <span className="text-xs text-ink-500">Added directly</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </TableShell>
              {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} noun="clients" />}
            </>
          )}
        </div>
      )}

      <ClientFormDialog open={creating} onClose={() => setCreating(false)} defaultCurrency={business.currency ?? 'USD'} saving={saving}
        onSubmit={async input => {
          const result = await createClient({ businessId, input });
          if ('data' in result && result.data) {
            setCreating(false);
            dispatch(addToast({ type: 'success', message: `${result.data.name} was added.` }));
            router.push(r.client(result.data.id));
            return {};
          }
          return { error: result.error };
        }} />
    </>
  );
}

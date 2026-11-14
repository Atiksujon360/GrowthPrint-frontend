'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { useClientQuery, useUpdateClientMutation, errorMessage, errorStatus } from '../api/workspaceApi.ts';
import { useBusinessScope, useRouteParam } from '../components/BusinessScope.tsx';
import { ClientFormDialog } from '../components/ClientFormDialog.tsx';
import { CLIENT_STATUS_LABEL, CLIENT_STATUS_TONE } from './ClientsScreen.tsx';
import { formatDate } from '../model/format.ts';
import { workspaceRoutes } from '../../../lib/routes.ts';
import { Button, Card, ErrorState, Skeleton } from '../../../components/ui/forms.tsx';
import { DefinitionList, PageHeader, StatusPill } from '../../../components/ui/workspace-kit.tsx';
import { useAppDispatch } from '../../../store/hooks.ts';
import { addToast } from '../../../store/index.ts';

const RETAINER_LABEL = { ESSENTIAL_MAINTENANCE: 'Essential maintenance', PRO_GROWTH: 'Pro growth', NONE: 'None' } as const;

export function ClientDetailScreen() {
  const { businessId, business, can } = useBusinessScope();
  const clientId = useRouteParam('clientId');
  const r = workspaceRoutes(businessId);
  const dispatch = useAppDispatch();
  const { data: client, isLoading, error, refetch } = useClientQuery({ businessId, clientId });
  const [updateClient, { isLoading: saving }] = useUpdateClientMutation();
  const [editing, setEditing] = useState(false);

  if (isLoading) return <div className="space-y-4" role="status" aria-label="Loading client"><Skeleton className="h-10 w-72" /><Skeleton className="h-56" /></div>;
  if (error && errorStatus(error) === 404) {
    return <ErrorState message="This client doesn't exist in this business." />;
  }
  if (error || !client) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;

  return (
    <>
      <PageHeader
        title={client.name}
        description={client.legalName !== client.name ? client.legalName : undefined}
        breadcrumb={[{ label: business.name, href: r.home }, { label: 'Clients', href: r.clients }, { label: client.name }]}
        actions={can('clients.edit') ? (
          <Button variant="secondary" onClick={() => setEditing(true)} icon={<Pencil className="h-4 w-4" aria-hidden="true" />}>Edit</Button>
        ) : undefined}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Details" className="lg:col-span-2">
          <DefinitionList items={[
            { label: 'Status', value: <StatusPill tone={CLIENT_STATUS_TONE[client.status]}>{CLIENT_STATUS_LABEL[client.status]}</StatusPill> },
            { label: 'Contact email', value: <a className="text-brand-700 hover:underline" href={`mailto:${client.contactEmail}`}>{client.contactEmail}</a> },
            { label: 'Phone', value: client.phone },
            { label: 'Website', value: client.website ? <a className="text-brand-700 hover:underline" href={client.website} target="_blank" rel="noreferrer noopener">{client.website}</a> : null },
            { label: 'Account manager', value: client.accountManager },
            { label: 'Billing currency', value: client.billingCurrency },
            { label: 'Contract start', value: formatDate(client.contractStartDate) },
            { label: 'Retainer', value: client.retainerTier ? `${RETAINER_LABEL[client.retainerTier]}${client.monthlyRetainerHours ? ` · ${client.monthlyRetainerHours} h / month` : ''}` : 'No retainer' },
          ]} />
          {client.notes && (
            <div className="mt-6 border-t border-ink-100 pt-4">
              <p className="text-xs font-medium text-ink-500">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink-800">{client.notes}</p>
            </div>
          )}
        </Card>
        <Card title="History">
          <ul className="space-y-3 text-sm">
            <li><span className="text-ink-500">Added</span><span className="block text-ink-900">{formatDate(client.createdAt)}</span></li>
            <li>
              <span className="text-ink-500">Source</span>
              <span className="block text-ink-900">
                {client.convertedFromLeadId
                  ? <Link href={r.lead(client.convertedFromLeadId)} className="text-brand-700 hover:underline">Converted from a lead</Link>
                  : 'Added directly'}
              </span>
            </li>
          </ul>
        </Card>
      </div>
      <ClientFormDialog open={editing} onClose={() => setEditing(false)} client={client} defaultCurrency={client.billingCurrency} saving={saving}
        onSubmit={async input => {
          const result = await updateClient({ businessId, clientId, input });
          if ('data' in result) {
            setEditing(false);
            dispatch(addToast({ type: 'success', message: 'Client updated.' }));
            return {};
          }
          return { error: result.error };
        }} />
    </>
  );
}

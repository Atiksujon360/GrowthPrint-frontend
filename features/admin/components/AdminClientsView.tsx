import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks.ts';
import { fetchClients, addToast } from '../../../store/index.ts';
import { StatusBadge } from '../../../components/ui/Badges.tsx';
import { DataTable, type ColumnDef } from '../../../components/ui/DataTable.tsx';
import { CopyButton } from '../../../components/ui/CopyButton.tsx';
import {
  Users,
  Mail,
  Phone,
  ExternalLink,
  Calendar,
  ShieldCheck,
  Clock,
  Columns,
  Table as TableIcon,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import type { Client } from '../../../types/agency.ts';
import { humanizeCode } from '../../../lib/labels.ts';
import { SummaryStrip } from '../../../components/ui/app-kit.tsx';
import { ClientDetailDrawer } from './ClientDetailDrawer.tsx';

export function AdminClientsView() {
  const dispatch = useAppDispatch();
  const clients = useAppSelector(state => state.agency.clients);
  const isLoadingClients = useAppSelector(state => state.agency.isLoadingClients);
  const clientsError = useAppSelector(state => state.agency.clientsError);
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('TABLE');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const selectedClient = clients.find(c => c.id === selectedClientId) ?? null;

  // Fetch clients on mount
  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchClients());
    dispatch(addToast({
      type: 'info',
      title: 'Refreshing',
      message: 'Fetching latest client data...'
    }));
  };

  const columns: ColumnDef<Client>[] = [
    {
      id: 'name',
      header: 'Client / Legal Name',
      accessorKey: 'name',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-gp-text">{row.name}</div>
          <div className="text-xs text-gp-text-muted">{row.legalName}</div>
        </div>
      )
    },
    {
      id: 'contactEmail',
      header: 'Contact Info',
      accessorKey: 'contactEmail',
      sortable: true,
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-gp-text">
            <Mail className="w-3 h-3 text-gp-text-muted" />
            <span>{row.contactEmail}</span>
            <CopyButton value={row.contactEmail} title="Copy client email" />
          </div>
          {row.phone && (
            <div className="flex items-center gap-1.5 text-gp-text-muted text-xs">
              <Phone className="w-3 h-3" />
              <span>{row.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'website',
      header: 'Digital Property',
      accessorKey: 'website',
      sortable: false,
      cell: ({ row }) => (
        <a 
          href={row.website} 
          target="_blank" 
          rel="noreferrer" 
          className="text-gp-primary-strong hover:text-gp-primary-strong flex items-center gap-1 text-xs"
        >
          <span>{row.website.replace('https://', '')}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )
    },
    {
      id: 'retainerTier',
      header: 'Retainer Plan',
      accessorKey: 'retainerTier',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-gp-text text-xs">
            {humanizeCode(row.retainerTier) || 'None'}
          </div>
          {row.monthlyRetainerHours ? (
            <div className="text-xs text-gp-text-muted tabular-nums">
              {row.consumedHoursCurrentMonth} / {row.monthlyRetainerHours} hrs used
            </div>
          ) : (
            <div className="text-xs text-gp-text-muted">Ad-hoc billing</div>
          )}
        </div>
      )
    },
    {
      id: 'contractStartDate',
      header: 'Since',
      accessorKey: 'contractStartDate',
      sortable: true,
      cell: ({ row }) => (
        <span className="text-gp-text-muted text-xs">
          {row.contractStartDate}
        </span>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: ({ row }) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="space-y-6">
      <SummaryStrip label="Client summary" items={[
        { label: 'Total clients', value: clients.length },
        { label: 'Active', value: clients.filter(c => c.status === 'ACTIVE').length, tone: 'success' },
        { label: 'On a retainer', value: clients.filter(c => c.retainerTier && c.retainerTier !== 'NONE').length },
        { label: 'Suspended', value: clients.filter(c => c.status === 'SUSPENDED').length,
          tone: clients.some(c => c.status === 'SUSPENDED') ? 'attention' : 'default' },
      ]} />
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-semibold tracking-tight text-gp-text">
              Clients
            </h2>
            <button
              onClick={handleRefresh}
              disabled={isLoadingClients}
              className="p-1.5 hover:bg-gp-surface-secondary rounded-lg transition-colors disabled:opacity-50"
              title="Refresh clients"
            >
              <RefreshCw className={`w-4 h-4 text-gp-text-muted ${isLoadingClients ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="mt-1 text-sm text-gp-text-muted">
            Client accounts, retainer utilization, contacts, and relationship notes.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-gp-surface-secondary p-1 rounded-xl self-start sm:self-auto border border-gp-border">
          <button
            onClick={() => setViewMode('TABLE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
              viewMode === 'TABLE' ? 'bg-gp-surface text-gp-text shadow-2xs' : 'text-gp-text-secondary hover:text-gp-text'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
          <button
            onClick={() => setViewMode('CARDS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
              viewMode === 'CARDS' ? 'bg-gp-surface text-gp-text shadow-2xs' : 'text-gp-text-secondary hover:text-gp-text'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Card View</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingClients && (
        <div className="bg-gp-surface rounded-2xl border border-gp-border/90 p-8 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gp-text-muted">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading clients...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {clientsError && !isLoadingClients && (
        <div className="bg-gp-danger-soft border border-gp-danger/30 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-gp-danger flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gp-danger">Failed to load clients</h3>
            <p className="text-xs text-gp-danger mt-1">{clientsError}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 px-3 py-1.5 text-xs font-semibold text-gp-danger bg-gp-danger-soft hover:bg-gp-danger/30 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingClients && !clientsError && clients.length === 0 && (
        <div className="bg-gp-surface rounded-2xl border border-gp-border/90 px-6 py-10 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative brand illustration */}
          <img src="/illustrations/empty/empty-clients.webp" alt="" aria-hidden="true" width={144} height={144}
            className="mx-auto mb-5 h-36 w-36 object-contain" loading="lazy" decoding="async" />
          <h3 className="text-base font-semibold text-gp-text mb-2">No clients yet</h3>
          <p className="text-sm text-gp-text-muted">Client accounts will appear here once they are added to the system.</p>
        </div>
      )}

      {/* Data Views */}
      {!isLoadingClients && !clientsError && clients.length > 0 && (
        <>
          {viewMode === 'TABLE' ? (
            <DataTable
              title="Client Directory"
              subtitle="Overview of ongoing client partnerships, monthly retainer hours, and primary contacts"
              data={clients}
              columns={columns}
              statusFilter={{
                statusKey: 'status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: 'All Accounts', value: 'ALL', count: clients.length },
                  { label: 'Active', value: 'ACTIVE', count: clients.filter(c => c.status === 'ACTIVE').length },
                  { label: 'Invited', value: 'INVITED', count: clients.filter(c => c.status === 'INVITED').length },
                  { label: 'Suspended', value: 'SUSPENDED', count: clients.filter(c => c.status === 'SUSPENDED').length }
                ]
              }}
              searchConfig={{
                placeholder: 'Search clients by name, legal entity, or email...',
                searchKeys: ['name', 'legalName', 'contactEmail', 'billingCurrency']
              }}
              pageSize={10}
              defaultSortKey="name"
              defaultSortDirection="asc"
              exportFilename="growthprint-clients"
              onRowClick={(row) => setSelectedClientId(row.id)}
            />
          ) : (
            <div className="bg-gp-surface rounded-2xl border border-gp-border/90 overflow-hidden">
              <div className="divide-y divide-gp-divider">
                {clients.map((c) => (
                  <div key={c.id} className="p-6 hover:bg-gp-surface-secondary/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-gp-text">
                            <button type="button" onClick={() => setSelectedClientId(c.id)}
                              className="rounded-sm text-left hover:text-gp-primary-strong hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gp-primary">
                              {c.name}
                            </button>
                          </h3>
                          <StatusBadge status={c.status} />
                        </div>
                        <div className="text-xs text-gp-text-muted">
                          Legal: <strong className="text-gp-text">{c.legalName}</strong>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gp-text-muted pt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-gp-text-muted" />
                            {c.contactEmail}
                          </span>
                          {c.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-gp-text-muted" />
                              {c.phone}
                            </span>
                          )}
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gp-primary-strong hover:text-gp-primary-strong flex items-center gap-1"
                          >
                            <span>Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Retainer & Contract status */}
                      <div className="flex items-center gap-6">
                        <div className="bg-gp-canvas p-3.5 rounded-xl border border-gp-border/80 text-xs space-y-1 min-w-[200px]">
                          <div className="text-gp-text-muted font-medium text-xs flex items-center justify-between">
                            <span>Monthly Retainer</span>
                            <span className="font-semibold text-gp-primary-strong">{humanizeCode(c.retainerTier) || 'None'}</span>
                          </div>
                          {c.monthlyRetainerHours ? (
                            <div>
                              <div className="flex justify-between font-medium text-gp-text text-xs">
                                <span>Hours Consumed</span>
                                <span className="tabular-nums font-bold">{c.consumedHoursCurrentMonth} / {c.monthlyRetainerHours} hrs</span>
                              </div>
                              <div className="w-full h-1.5 bg-gp-border rounded-full overflow-hidden mt-1.5">
                                <div
                                  className="h-full bg-gp-primary rounded-full"
                                  style={{ width: `${Math.min(100, ((c.consumedHoursCurrentMonth || 0) / c.monthlyRetainerHours) * 100)}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-gp-text-muted text-xs">No active retainer hours</div>
                          )}
                        </div>

                        <div className="text-right text-xs space-y-1">
                          <div className="text-gp-text-muted font-medium">Contract Start</div>
                          <div className="font-bold text-gp-text">{c.contractStartDate}</div>
                          <div className="text-gp-text-muted">Currency: {c.billingCurrency}</div>
                        </div>
                      </div>
                    </div>

                    {c.notes && (
                      <div className="mt-4 pt-3 border-t border-gp-divider text-xs text-gp-text-muted">
                        <span className="font-semibold text-gp-text">Internal Agency Notes: </span>
                        {c.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <ClientDetailDrawer client={selectedClient} onClose={() => setSelectedClientId(null)} />
    </div>
  );
}

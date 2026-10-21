import React, { useState } from 'react';
import { useAppSelector } from '../../../store/hooks.ts';
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
  Table as TableIcon 
} from 'lucide-react';
import type { Client } from '../../../types/agency.ts';

export function AdminClientsView() {
  const clients = useAppSelector(state => state.agency.clients);
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('TABLE');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const columns: ColumnDef<Client>[] = [
    {
      id: 'name',
      header: 'Client / Legal Name',
      accessorKey: 'name',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="text-[11px] text-slate-400">{row.legalName}</div>
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
          <div className="flex items-center gap-1.5 text-slate-800">
            <Mail className="w-3 h-3 text-slate-400" />
            <span>{row.contactEmail}</span>
            <CopyButton value={row.contactEmail} title="Copy client email" />
          </div>
          {row.phone && (
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
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
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-mono text-[11px]"
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
          <div className="font-semibold text-slate-800 text-xs">
            {row.retainerTier || 'None'}
          </div>
          {row.monthlyRetainerHours ? (
            <div className="text-[11px] text-slate-500 tabular-nums">
              {row.consumedHoursCurrentMonth} / {row.monthlyRetainerHours} hrs used
            </div>
          ) : (
            <div className="text-[11px] text-slate-400">Ad-hoc billing</div>
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
        <span className="font-mono text-slate-500 text-[11px]">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Client Partnerships & Retainers
          </h2>
          <p className="text-xs text-slate-500">
            Active client accounts, monthly retainer hour utilization, primary contacts, and relationship notes.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setViewMode('TABLE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
          <button
            onClick={() => setViewMode('CARDS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'CARDS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Card View</span>
          </button>
        </div>
      </div>

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
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {clients.map((c) => (
              <div key={c.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="text-xs text-slate-500">
                      Legal: <strong className="text-slate-700">{c.legalName}</strong>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {c.contactEmail}
                      </span>
                      {c.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {c.phone}
                        </span>
                      )}
                      <a 
                        href={c.website} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <span>Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Retainer & Contract status */}
                  <div className="flex items-center gap-6">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1 min-w-[200px]">
                      <div className="text-slate-400 font-medium text-[11px] uppercase tracking-wider flex items-center justify-between">
                        <span>Monthly Retainer</span>
                        <span className="font-semibold text-blue-700">{c.retainerTier || 'None'}</span>
                      </div>
                      {c.monthlyRetainerHours ? (
                        <div>
                          <div className="flex justify-between font-medium text-slate-800 text-xs">
                            <span>Hours Consumed</span>
                            <span className="tabular-nums font-bold">{c.consumedHoursCurrentMonth} / {c.monthlyRetainerHours} hrs</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5">
                            <div 
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${Math.min(100, ((c.consumedHoursCurrentMonth || 0) / c.monthlyRetainerHours) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500 text-xs">No active retainer hours</div>
                      )}
                    </div>

                    <div className="text-right text-xs space-y-1">
                      <div className="text-slate-400 font-medium">Contract Start</div>
                      <div className="font-bold text-slate-900">{c.contractStartDate}</div>
                      <div className="text-slate-500">Currency: {c.billingCurrency}</div>
                    </div>
                  </div>
                </div>

                {c.notes && (
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Internal Agency Notes: </span>
                    {c.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

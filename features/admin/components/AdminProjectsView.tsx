import React, { useState } from 'react';
import { useAppSelector } from '../../../store/hooks.ts';
import { StatusBadge } from '../../../components/ui/Badges.tsx';
import { DataTable, type ColumnDef } from '../../../components/ui/DataTable.tsx';
import { CopyButton } from '../../../components/ui/CopyButton.tsx';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Layers, 
  Columns, 
  Table as TableIcon 
} from 'lucide-react';
import type { Project } from '../../../types/agency.ts';

export function AdminProjectsView() {
  const projects = useAppSelector(state => state.agency.projects);
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('TABLE');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const columns: ColumnDef<Project>[] = [
    {
      id: 'reference',
      header: 'Reference',
      accessorKey: 'reference',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-slate-800 text-xs">
            {row.reference}
          </span>
          <CopyButton value={row.reference} title="Copy project reference" />
        </div>
      )
    },
    {
      id: 'name',
      header: 'Project / Scope',
      accessorKey: 'name',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="text-[11px] text-slate-400">{row.serviceCategory}</div>
        </div>
      )
    },
    {
      id: 'clientName',
      header: 'Client Organization',
      accessorKey: 'clientName',
      sortable: true,
      cell: ({ row }) => (
        <span className="font-semibold text-slate-800 text-xs">
          {row.clientName}
        </span>
      )
    },
    {
      id: 'budgetSpent',
      header: 'Budget & Spend',
      accessorFn: (row) => row.budgetSpent,
      sortable: true,
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-slate-900 tabular-nums text-xs">
            ${row.budgetSpent.toLocaleString()} / ${row.budgetTotal.toLocaleString()} USD
          </div>
          <div className="text-[11px] text-slate-400">
            {Math.round((row.budgetSpent / row.budgetTotal) * 100)}% consumed
          </div>
        </div>
      )
    },
    {
      id: 'progressPercent',
      header: 'Progress',
      accessorKey: 'progressPercent',
      sortable: true,
      cell: ({ row }) => (
        <div className="min-w-[120px]">
          <div className="flex justify-between text-[11px] text-slate-600 mb-1">
            <span className="font-medium">Milestones</span>
            <span className="font-bold text-slate-800 tabular-nums">{row.progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${row.progressPercent}%` }}
            />
          </div>
        </div>
      )
    },
    {
      id: 'targetCompletionDate',
      header: 'Target Delivery',
      accessorKey: 'targetCompletionDate',
      sortable: true,
      cell: ({ row }) => (
        <span className="font-mono text-slate-500 text-[11px]">
          {row.targetCompletionDate}
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
            Client Projects & Delivery Sprints
          </h2>
          <p className="text-xs text-slate-500">
            Active engineering engagements, milestone schedules, deliverable checklists, and budget tracking.
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
          title="Client Projects"
          subtitle="Overview of active development initiatives, upcoming milestone deadlines, and budget health"
          data={projects}
          columns={columns}
          statusFilter={{
            statusKey: 'status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Projects', value: 'ALL', count: projects.length },
              { label: 'In Progress', value: 'IN_PROGRESS', count: projects.filter(p => p.status === 'IN_PROGRESS').length },
              { label: 'Planned', value: 'PLANNED', count: projects.filter(p => p.status === 'PLANNED').length },
              { label: 'Discovery', value: 'DISCOVERY', count: projects.filter(p => p.status === 'DISCOVERY').length },
              { label: 'Completed', value: 'COMPLETED', count: projects.filter(p => p.status === 'COMPLETED').length }
            ]
          }}
          searchConfig={{
            placeholder: 'Search projects by title, client, or category...',
            searchKeys: ['name', 'reference', 'clientName', 'serviceCategory']
          }}
          pageSize={10}
          defaultSortKey="reference"
          defaultSortDirection="asc"
          exportFilename="growthprint-projects"
        />
      ) : (
        <div className="space-y-6">
          {projects.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{p.reference}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                  <div className="text-xs text-slate-500">
                    Client: <strong className="text-slate-800">{p.clientName}</strong> · Service: <strong>{p.serviceCategory}</strong>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-xs text-slate-400 font-medium">Budget & Spend</div>
                  <div className="text-sm font-bold text-slate-900 tabular-nums">
                    ${p.budgetSpent.toLocaleString()} / ${p.budgetTotal.toLocaleString()} USD
                  </div>
                  <div className="text-xs text-slate-500">Delivery: {p.targetCompletionDate}</div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Overall Milestone Completion</span>
                    <span className="font-bold text-slate-900 tabular-nums">{p.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${p.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Milestones ({p.milestones.length})
                    </h4>
                    <div className="space-y-2">
                      {p.milestones.map((m) => (
                        <div key={m.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className={`w-3.5 h-3.5 ${m.status === 'COMPLETED' ? 'text-emerald-600' : 'text-slate-300'}`} />
                            <span className={m.status === 'COMPLETED' ? 'text-slate-700' : 'text-slate-900 font-medium'}>
                              {m.title}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">{m.dueDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Deliverables & Scope
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {p.deliverables.map((d, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

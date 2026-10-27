import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { updateLeadStage, addToast, fetchCrmLeads, updateCrmLeadPipelineStage } from '../../../store/index.ts';
import { StatusBadge } from '../../../components/ui/Badges.tsx';
import { DataTable, type ColumnDef } from '../../../components/ui/DataTable.tsx';
import { CopyButton } from '../../../components/ui/CopyButton.tsx';
import {
  Sparkles,
  ExternalLink,
  Mail,
  Building,
  Calendar,
  CheckCircle2,
  Table as TableIcon,
  Columns,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import type { Lead, LeadPipelineStage } from '../../../types/agency.ts';

export function AdminLeadsView({ onOpenOutreach }: { onOpenOutreach: (leadId: string) => void }) {
  const dispatch = useAppDispatch();
  const leads = useAppSelector(state => state.agency.leads);
  const isLoadingLeads = useAppSelector(state => state.agency.isLoadingLeads);
  const leadsError = useAppSelector(state => state.agency.leadsError);

  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'SPLIT' | 'FULL_TABLE'>('SPLIT');

  // Fetch leads on mount
  useEffect(() => {
    dispatch(fetchCrmLeads());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCrmLeads());
    dispatch(addToast({
      type: 'info',
      title: 'Refreshing',
      message: 'Fetching latest CRM leads...'
    }));
  };

  const handleStageChange = async (leadId: string, newStage: LeadPipelineStage) => {
    // Call the API to persist the change - no optimistic update
    try {
      await dispatch(updateCrmLeadPipelineStage({ id: leadId, pipelineStage: newStage })).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Stage Updated',
        message: 'Pipeline stage updated successfully.'
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update pipeline stage. Please try again.'
      }));
    }
  };

  const activeLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  const columns: ColumnDef<Lead>[] = [
    {
      id: 'companyName',
      header: 'Company / Lead',
      accessorKey: 'companyName',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-slate-900">{row.companyName}</div>
          <div className="text-[11px] text-slate-400">{row.industry}</div>
        </div>
      )
    },
    {
      id: 'contactName',
      header: 'Primary Contact',
      accessorKey: 'contactName',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-slate-800">{row.contactName}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="truncate max-w-[130px]">{row.contactEmail}</span>
            <CopyButton value={row.contactEmail} title="Copy email address" />
          </div>
        </div>
      )
    },
    {
      id: 'targetService',
      header: 'Service Track',
      accessorKey: 'targetService',
      sortable: true,
      cell: ({ row }) => (
        <span className="font-medium text-slate-700 text-xs">
          {row.targetService}
        </span>
      )
    },
    {
      id: 'qualificationScore',
      header: 'Match Score',
      accessorKey: 'qualificationScore',
      sortable: true,
      align: 'right',
      cell: ({ row }) => (
        <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full tabular-nums text-xs">
          {row.qualificationScore}/100
        </span>
      )
    },
    {
      id: 'pipelineStage',
      header: 'Stage',
      accessorKey: 'pipelineStage',
      sortable: true,
      cell: ({ row }) => <StatusBadge status={row.pipelineStage} />
    },
    {
      id: 'discoveredDate',
      header: 'Discovered',
      accessorKey: 'discoveredDate',
      sortable: true,
      cell: ({ row }) => (
        <span className="text-slate-500 font-mono text-[11px]">{row.discoveredDate}</span>
      )
    },
    {
      id: 'actions',
      header: 'Action',
      sortable: false,
      align: 'right',
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenOutreach(row.id);
          }}
          className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-1 ml-auto"
        >
          <Mail className="w-3 h-3" />
          <span>Outreach</span>
        </button>
      )
    }
  ];

  const statusOptions = [
    { label: 'All Stages', value: 'ALL', count: leads.length },
    { label: 'Qualified', value: 'QUALIFIED', count: leads.filter(l => l.pipelineStage === 'QUALIFIED').length },
    { label: 'Outreach Ready', value: 'READY_FOR_OUTREACH', count: leads.filter(l => l.pipelineStage === 'READY_FOR_OUTREACH').length },
    { label: 'Approved', value: 'OUTREACH_APPROVED', count: leads.filter(l => l.pipelineStage === 'OUTREACH_APPROVED').length },
    { label: 'Contacted', value: 'CONTACTED', count: leads.filter(l => l.pipelineStage === 'CONTACTED').length },
    { label: 'Meeting Set', value: 'MEETING_SCHEDULED', count: leads.filter(l => l.pipelineStage === 'MEETING_SCHEDULED').length }
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Prospects & Opportunity Pipeline
            </h2>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
              Opportunity Matcher
            </span>
            <button
              onClick={handleRefresh}
              disabled={isLoadingLeads}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh leads"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoadingLeads ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Searchable pipeline with stage tracking, technical qualification notes, and founder outreach links.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('SPLIT')}
            className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
              viewMode === 'SPLIT' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Inspector Split</span>
          </button>
          <button
            onClick={() => setViewMode('FULL_TABLE')}
            className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
              viewMode === 'FULL_TABLE' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Full Table</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingLeads && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-8 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading CRM leads...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {leadsError && !isLoadingLeads && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900">Failed to load CRM leads</h3>
            <p className="text-xs text-red-700 mt-1">{leadsError}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 px-3 py-1.5 text-xs font-semibold text-red-900 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingLeads && !leadsError && leads.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-12 text-center">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-slate-900 mb-2">No leads yet</h3>
          <p className="text-sm text-slate-500">CRM leads will appear here once they are added to the pipeline.</p>
        </div>
      )}

      {/* Main Content Area */}
      {!isLoadingLeads && !leadsError && leads.length > 0 && (
        <div className={viewMode === 'SPLIT' ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : 'space-y-6'}>
        {/* Table Container */}
        <div className={viewMode === 'SPLIT' ? 'lg:col-span-7' : 'w-full'}>
          <DataTable
            data={leads}
            columns={columns}
            statusFilter={{
              statusKey: 'pipelineStage',
              options: statusOptions,
              value: statusFilter,
              onChange: setStatusFilter
            }}
            searchConfig={{
              placeholder: 'Search lead company, contact, service...',
              searchKeys: ['companyName', 'contactName', 'contactEmail', 'targetService', 'identifiedProblem']
            }}
            pageSize={6}
            pageSizeOptions={[5, 6, 10, 20]}
            onRowClick={(lead) => setSelectedLeadId(lead.id)}
            defaultSortKey="qualificationScore"
            defaultSortDirection="desc"
            exportFilename="growthprint-leads"
            title="CRM Leads Directory"
            subtitle="Click row to inspect AI research dossier"
          />
        </div>

        {/* Lead Inspector (Right Column in Split View) */}
        {activeLead && (
          <div className={viewMode === 'SPLIT' ? 'lg:col-span-5' : 'w-full'}>
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5 sticky top-20">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{activeLead.companyName}</h3>
                    <a
                      href={activeLead.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-blue-600"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="text-xs text-slate-500">
                    {activeLead.industry} · {activeLead.location}
                  </div>
                </div>

                <div className="text-right">
                  <StatusBadge status={activeLead.pipelineStage} />
                </div>
              </div>

              {/* Stage Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Pipeline Stage
                </label>
                <select
                  value={activeLead.pipelineStage}
                  onChange={(e) => {
                    const newStage = e.target.value as LeadPipelineStage;
                    handleStageChange(activeLead.id, newStage);
                  }}
                  className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  <option value="DISCOVERED">Discovered</option>
                  <option value="RESEARCHING">Researching</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="READY_FOR_OUTREACH">Ready for Outreach</option>
                  <option value="OUTREACH_APPROVED">Outreach Approved</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="MEETING_SCHEDULED">Meeting Scheduled</option>
                  <option value="WON">Won Deal</option>
                </select>
              </div>

              {/* Opportunity Match Scorecard */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">Fit & Feasibility Breakdown</span>
                  </div>
                  <span className="text-sm font-extrabold text-blue-700 tabular-nums">
                    {activeLead.qualificationScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <div className="text-[10px] text-slate-400">Agency Fit</div>
                    <div className="font-bold text-slate-800 tabular-nums">{activeLead.qualificationBreakdown.businessFit}/25</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <div className="text-[10px] text-slate-400">Clear Operational Need</div>
                    <div className="font-bold text-slate-800 tabular-nums">{activeLead.qualificationBreakdown.evidenceOfNeed}/25</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <div className="text-[10px] text-slate-400">Direct Decision Maker</div>
                    <div className="font-bold text-slate-800 tabular-nums">{activeLead.qualificationBreakdown.contactability}/25</div>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <div className="text-[10px] text-slate-400">Service Track Match</div>
                    <div className="font-bold text-slate-800 tabular-nums">{activeLead.qualificationBreakdown.serviceRelevance}/25</div>
                  </div>
                </div>
              </div>

              {/* Technical Challenge */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="font-semibold text-slate-700">Identified Operational Bottleneck:</div>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 mt-1 leading-relaxed">
                    {activeLead.identifiedProblem}
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-slate-700">Research Notes & Clues:</div>
                  <p className="text-slate-500 leading-relaxed mt-1">
                    {activeLead.researchSummary}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => onOpenOutreach(activeLead.id)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Draft Personalized Outreach</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

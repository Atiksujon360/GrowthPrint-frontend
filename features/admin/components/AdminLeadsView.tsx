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
import { humanizeCode } from '../../../lib/labels.ts';
import { SummaryStrip } from '../../../components/ui/app-kit.tsx';
import { LeadDetailDrawer, LeadInspectorPanel } from './LeadDossier.tsx';

export function AdminLeadsView({ onOpenOutreach }: { onOpenOutreach: (leadId: string) => void }) {
  const dispatch = useAppDispatch();
  const leads = useAppSelector(state => state.agency.leads);
  const isLoadingLeads = useAppSelector(state => state.agency.isLoadingLeads);
  const leadsError = useAppSelector(state => state.agency.leadsError);

  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'SPLIT' | 'FULL_TABLE'>('SPLIT');
  const [drawerLeadId, setDrawerLeadId] = useState<string | null>(null);
  const drawerLead = leads.find(l => l.id === drawerLeadId) ?? null;

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
          <div className="text-xs text-slate-400">{row.industry}</div>
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
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
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
          {humanizeCode(row.targetService)}
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
        <span className="text-slate-500 text-xs">{row.discoveredDate}</span>
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
      <SummaryStrip label="Lead summary" items={[
        { label: 'Total leads', value: leads.length },
        { label: 'Qualified (score 80+)', value: leads.filter(l => l.qualificationScore >= 80).length },
        { label: 'Ready for outreach', value: leads.filter(l => l.pipelineStage === 'READY_FOR_OUTREACH').length },
        { label: 'Won', value: leads.filter(l => l.pipelineStage === 'WON').length, tone: 'success' },
      ]} />
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-ink-950">
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
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 flex items-center justify-center">
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
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center">
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
            onRowClick={(lead) => {
              setSelectedLeadId(lead.id);
              if (viewMode === 'FULL_TABLE') setDrawerLeadId(lead.id);
            }}
            defaultSortKey="qualificationScore"
            defaultSortDirection="desc"
            exportFilename="growthprint-leads"
            title="CRM Leads Directory"
            subtitle={viewMode === 'SPLIT' ? 'Select a lead to see its research and evidence' : 'Open a lead to see its research and evidence'}
          />
        </div>

        {/* Lead inspector: inline beside the table in the split view; the full table opens a drawer instead. */}
        {activeLead && viewMode === 'SPLIT' && (
          <div className="lg:col-span-5">
            <LeadInspectorPanel lead={activeLead} onStageChange={(stage) => handleStageChange(activeLead.id, stage)}
              onOpenOutreach={onOpenOutreach} />
          </div>
        )}
      </div>
      )}

      <LeadDetailDrawer lead={drawerLead} onClose={() => setDrawerLeadId(null)}
        onStageChange={(stage) => drawerLead && handleStageChange(drawerLead.id, stage)} onOpenOutreach={onOpenOutreach} />
    </div>
  );
}

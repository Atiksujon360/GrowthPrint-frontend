import React, { useState, useEffect } from 'react';
import { SupportTriagePanel } from './SupportTriagePanel.tsx';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { classifyRequest, attachEstimate, updateRequestStatus, addToast, fetchSupportRequests } from '../../../store/index.ts';
import { StatusBadge, PriorityBadge } from '../../../components/ui/Badges.tsx';
import { DataTable, type ColumnDef } from '../../../components/ui/DataTable.tsx';
import { CopyButton } from '../../../components/ui/CopyButton.tsx';
import { 
  TicketCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Layers, 
  Columns,
  Table as TableIcon,
  RefreshCw
} from 'lucide-react';
import type { SupportRequest, SupportCategory, SupportRequestStatus } from '../../../types/agency.ts';
import { humanizeCode } from '../../../lib/labels.ts';

export function AdminRequestsQueue() {
  const dispatch = useAppDispatch();
  const requests = useAppSelector(state => state.agency.requests);
  const isLoadingRequests = useAppSelector(state => state.agency.isLoadingRequests);
  const requestsError = useAppSelector(state => state.agency.requestsError);

  const [selectedReqId, setSelectedReqId] = useState<string>(requests[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'SPLIT' | 'FULL_TABLE'>('SPLIT');

  const activeReq = requests.find(r => r.id === selectedReqId) || requests[0];

  // Classification Form
  const [category, setCategory] = useState<SupportCategory>(activeReq?.category || 'PAID_AD_HOC_SUPPORT');
  const [adminNotes, setAdminNotes] = useState(activeReq?.adminNotes || '');

  // Estimate Form
  const [estimateHours, setEstimateHours] = useState(activeReq?.estimate?.estimatedHours || 6);
  const [hourlyRate, setHourlyRate] = useState(activeReq?.estimate?.hourlyRate || 135);
  const [deliveryDays, setDeliveryDays] = useState(activeReq?.estimate?.deliveryTimelineDays || 2);
  const [explanation, setExplanation] = useState(activeReq?.estimate?.explanation || '');

  // Fetch support requests on mount
  useEffect(() => {
    dispatch(fetchSupportRequests());
  }, [dispatch]);

  const handleClassify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReq) return;
    try {
      await dispatch(classifyRequest({
        requestId: activeReq.id,
        category,
        adminNotes
    })).unwrap();
      dispatch(addToast({
        type: 'info',
        title: 'Classification Saved',
        message: `Ticket ${activeReq.reference} scope verified and saved.`
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Classification Failed',
        message: 'Failed to save classification. Please try again.'
      }));
    }
  };

  const handleSendEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReq) return;
    try {
      await dispatch(attachEstimate({
        requestId: activeReq.id,
        hours: Number(estimateHours),
        hourlyRate: Number(hourlyRate),
        explanation: explanation || `Estimated ${estimateHours} engineering hours for resolution.`,
        deliveryTimelineDays: Number(deliveryDays)
      })).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Estimate Prepared',
        message: `Estimate of ${estimateHours}h ($${Number(estimateHours) * Number(hourlyRate)} USD) submitted for client review.`
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Estimate Failed',
        message: 'Failed to prepare estimate. Please try again.'
      }));
    }
  };

  const handleUpdateStatus = async (requestId: string, status: SupportRequestStatus) => {
    try {
      await dispatch(updateRequestStatus({ requestId, status })).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Ticket status updated to ${status}.`
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Status Update Failed',
        message: 'Failed to update status. Please try again.'
      }));
    }
  };

  const handleRefresh = () => {
    dispatch(fetchSupportRequests());
  };

  const columns: ColumnDef<SupportRequest>[] = [
    {
      id: 'reference',
      header: 'Reference',
      accessorKey: 'reference',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span className="whitespace-nowrap font-semibold tabular-nums text-gp-text text-xs">
            {row.reference}
          </span>
          <CopyButton value={row.reference} title="Copy ticket reference" />
        </div>
      )
    },
    {
      id: 'title',
      header: 'Request Summary',
      accessorKey: 'title',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-gp-text line-clamp-1">{row.title}</div>
          <div className="text-xs text-gp-text-muted">{row.clientName}</div>
        </div>
      )
    },
    {
      id: 'category',
      header: 'Classification',
      accessorKey: 'category',
      sortable: true,
      cell: ({ row }) => (
        <span className="font-medium text-gp-text text-xs">
          {humanizeCode(row.category)}
        </span>
      )
    },
    {
      id: 'urgency',
      header: 'Urgency',
      accessorKey: 'urgency',
      sortable: true,
      cell: ({ row }) => (
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
          row.urgency === 'URGENT' ? 'bg-gp-danger-soft text-gp-danger' : 'bg-gp-surface-secondary text-gp-text'
        }`}>
          {humanizeCode(row.urgency)}
        </span>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: ({ row }) => <StatusBadge status={row.status} />
    },
    {
      id: 'createdAt',
      header: 'Logged',
      accessorKey: 'createdAt',
      sortable: true,
      cell: ({ row }) => (
        <span className="text-gp-text-muted text-xs">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  const statusOptions = [
    { label: 'All Tickets', value: 'ALL', count: requests.length },
    { label: 'New', value: 'NEW', count: requests.filter(r => r.status === 'NEW').length },
    { label: 'Needs Classification', value: 'NEEDS_CLASSIFICATION', count: requests.filter(r => r.status === 'NEEDS_CLASSIFICATION').length },
    { label: 'Estimate Pending', value: 'ESTIMATE_PENDING', count: requests.filter(r => r.status === 'ESTIMATE_PENDING').length },
    { label: 'Awaiting Client Approval', value: 'AWAITING_CLIENT_APPROVAL', count: requests.filter(r => r.status === 'AWAITING_CLIENT_APPROVAL').length },
    { label: 'Ready to Start', value: 'READY_TO_START', count: requests.filter(r => r.status === 'READY_TO_START').length },
    { label: 'In Progress', value: 'IN_PROGRESS', count: requests.filter(r => r.status === 'IN_PROGRESS').length },
    { label: 'Completed', value: 'COMPLETED', count: requests.filter(r => r.status === 'COMPLETED').length }
  ];

  // Loading, error, and empty states
  if (isLoadingRequests && requests.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-gp-text">
              Support
            </h2>
            <p className="mt-1 text-sm text-gp-text-muted">
              Client tickets, retainer coverage, and estimates before work begins.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-gp-text-muted animate-spin mx-auto mb-3" />
            <p className="text-sm text-gp-text-muted">Loading support requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (requestsError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-gp-text">
              Support
            </h2>
            <p className="mt-1 text-sm text-gp-text-muted">
              Client tickets, retainer coverage, and estimates before work begins.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-gp-surface border border-gp-border rounded-lg text-xs font-medium text-gp-text-secondary hover:bg-gp-canvas flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <AlertCircle className="w-8 h-8 text-gp-danger mx-auto mb-3" />
            <p className="text-sm font-medium text-gp-text mb-1">Failed to load support requests</p>
            <p className="text-xs text-gp-text-muted mb-3">{requestsError}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gp-primary hover:bg-gp-primary-hover text-gp-primary-foreground rounded-lg text-xs font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-gp-text">
              Support
            </h2>
            <p className="mt-1 text-sm text-gp-text-muted">
              Client tickets, retainer coverage, and estimates before work begins.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoadingRequests}
            className="px-3 py-1.5 bg-gp-surface border border-gp-border rounded-lg text-xs font-medium text-gp-text-secondary hover:bg-gp-canvas disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRequests ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <TicketCheck className="w-8 h-8 text-gp-text-muted mx-auto mb-3" />
            <p className="text-sm font-medium text-gp-text mb-1">No support requests</p>
            <p className="text-xs text-gp-text-muted">Support requests from clients will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-gp-text">
            Support
          </h2>
          <p className="mt-1 text-sm text-gp-text-muted">
            Client tickets, retainer coverage, and estimates before work begins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gp-surface-secondary p-1 rounded-xl border border-gp-border">
            <button
              onClick={() => setViewMode('SPLIT')}
              className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                viewMode === 'SPLIT' ? 'bg-gp-surface text-gp-text shadow-2xs font-semibold' : 'text-gp-text-secondary'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Triage Split</span>
            </button>
            <button
              onClick={() => setViewMode('FULL_TABLE')}
              className={`px-3 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                viewMode === 'FULL_TABLE' ? 'bg-gp-surface text-gp-text shadow-2xs font-semibold' : 'text-gp-text-secondary'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Full Table</span>
            </button>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoadingRequests}
            className="px-3 py-1.5 bg-gp-surface border border-gp-border rounded-lg text-xs font-medium text-gp-text-secondary hover:bg-gp-canvas disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRequests ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className={viewMode === 'SPLIT' ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : 'space-y-6'}>
        {/* Table Container */}
        <div className={viewMode === 'SPLIT' ? 'lg:col-span-7' : 'w-full'}>
          <DataTable
            data={requests}
            columns={columns}
            statusFilter={{
              statusKey: 'status',
              options: statusOptions,
              value: statusFilter,
              onChange: setStatusFilter
            }}
            searchConfig={{
              placeholder: 'Search tickets by reference, title, client...',
              searchKeys: ['reference', 'title', 'clientName', 'description']
            }}
            pageSize={6}
            pageSizeOptions={[5, 6, 10, 20]}
            onRowClick={(req) => {
              setSelectedReqId(req.id);
              setCategory(req.category);
              setAdminNotes(req.adminNotes || '');
              setEstimateHours(req.estimate?.estimatedHours || 6);
              setHourlyRate(req.estimate?.hourlyRate || 135);
              setDeliveryDays(req.estimate?.deliveryTimelineDays || 2);
              setExplanation(req.estimate?.explanation || '');
            }}
            defaultSortKey="createdAt"
            defaultSortDirection="desc"
            exportFilename="growthprint-tickets"
            title="Support Tickets Queue"
            subtitle="Click any ticket to review details, assess retainer coverage, and prepare an estimate"
          />
        </div>

        {/* Classification & Estimate Station */}
        {activeReq && (
          <div className={viewMode === 'SPLIT' ? 'lg:col-span-5' : 'w-full'}>
            <div className="bg-gp-surface rounded-2xl border border-gp-border/90 p-6 space-y-5 sticky top-20">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gp-divider">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gp-text-muted">{activeReq.reference}</span>
                    <StatusBadge status={activeReq.status} />
                  </div>
                  <h3 className="text-base font-bold text-gp-text">{activeReq.title}</h3>
                  <div className="text-xs text-gp-text-muted">
                    Client: <strong>{activeReq.clientName}</strong> · Urgency: <strong>{humanizeCode(activeReq.urgency)}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeReq.status === 'READY_TO_START' && (
                    <button
                      onClick={() => handleUpdateStatus(activeReq.id, 'IN_PROGRESS')}
                      className="px-3 py-1 bg-gp-primary hover:bg-gp-primary-hover text-gp-primary-foreground rounded-lg text-xs font-semibold"
                    >
                      Start Work
                    </button>
                  )}

                  {activeReq.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleUpdateStatus(activeReq.id, 'COMPLETED')}
                      className="px-3 py-1 bg-gp-success hover:bg-gp-success text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 bg-gp-canvas/70 rounded-xl border border-gp-border/70 text-xs text-gp-text leading-relaxed">
                <strong className="text-gp-text block mb-1">Client&apos;s Message:</strong>
                {activeReq.description}
              </div>

              {/* Optional AI help (nothing is applied until the admin saves the form below) */}
              <SupportTriagePanel requestId={activeReq.id} onUseCategory={setCategory} />

              {/* Classification Form */}
              <form onSubmit={handleClassify} className="space-y-3 pt-2 border-t border-gp-divider">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gp-text">
                    Retainer & Scope Check
                  </span>
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-gp-primary-hover hover:bg-gp-primary text-gp-primary-foreground rounded-md text-xs font-medium"
                  >
                    Save
                  </button>
                </div>

                <div>
                  <select
                    aria-label="Request category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SupportCategory)}
                    className="w-full px-3 py-1.5 text-xs border border-gp-border rounded-lg bg-gp-surface"
                  >
                    <option value="INCLUDED_SUPPORT">INCLUDED SUPPORT (Retainer applies)</option>
                    <option value="PAID_AD_HOC_SUPPORT">PAID AD-HOC SUPPORT (Estimate needed)</option>
                    <option value="NEW_PROJECT">NEW PROJECT (Separate scope)</option>
                    <option value="WARRANTY_OR_DEFECT_REVIEW">WARRANTY REVIEW (Zero fee)</option>
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    aria-label="Internal assessment notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Technical assessment notes..."
                    className="w-full px-3 py-1.5 text-xs border border-gp-border rounded-lg"
                  />
                </div>
              </form>

              {/* Estimate Builder if Paid Ad-Hoc */}
              {category === 'PAID_AD_HOC_SUPPORT' && (
                <form onSubmit={handleSendEstimate} className="space-y-3 pt-3 border-t border-gp-divider">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gp-text">
                      Written Scope & Estimate
                    </span>
                    <span className="text-xs font-bold text-gp-primary-strong tabular-nums">
                      ${(Number(estimateHours) * Number(hourlyRate)).toLocaleString()} USD
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gp-text-muted">Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        value={estimateHours}
                        onChange={(e) => setEstimateHours(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border border-gp-border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gp-text-muted">Rate ($)</label>
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border border-gp-border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gp-text-muted">Days</label>
                      <input
                        type="number"
                        value={deliveryDays}
                        onChange={(e) => setDeliveryDays(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border border-gp-border rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Scope details for client approval..."
                      className="w-full px-3 py-1.5 text-xs border border-gp-border rounded-lg"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-gp-primary hover:bg-gp-primary-hover text-gp-primary-foreground rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Send Estimate for Authorization</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

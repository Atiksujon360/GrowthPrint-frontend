import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { createSupportRequest, clientApproveEstimate, addToast, addNotification, fetchSupportRequests, approveEstimate } from '../../../store/index.ts';
import { StatusBadge } from '../../../components/ui/Badges.tsx';
import { EmptyState } from '../../../components/ui/AsyncState.tsx';
import { 
  PlusCircle, 
  TicketCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  X,
  FileText,
  RefreshCw
} from 'lucide-react';
import type { SupportCategory } from '../../../types/agency.ts';

interface PortalRequestsViewProps {
  isModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
}

export function PortalRequestsView({ isModalOpen, onOpenModal, onCloseModal }: PortalRequestsViewProps) {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(state => state.auth);
  const clientId = currentUser.clientId || 'client-meridian';
  const requests = useAppSelector(state => state.agency.requests.filter(r => r.clientId === clientId));
  const projects = useAppSelector(state => state.agency.projects.filter(p => p.clientId === clientId));
  const isLoadingRequests = useAppSelector(state => state.agency.isLoadingRequests);
  const requestsError = useAppSelector(state => state.agency.requestsError);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'PAID_AD_HOC_SUPPORT' as SupportCategory,
    projectId: projects[0]?.id || '',
    businessImpact: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'CRITICAL_BLOCKER',
    urgency: 'NORMAL' as 'NORMAL' | 'URGENT',
    description: ''
  });

  const [formError, setFormError] = useState('');

  // Fetch support requests on mount
  useEffect(() => {
    dispatch(fetchSupportRequests());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchSupportRequests());
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Please provide a descriptive title for this request.');
      return;
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setFormError('Please provide details on what is needed (minimum 10 characters).');
      return;
    }

    const matchedProject = projects.find(p => p.id === formData.projectId);

    dispatch(createSupportRequest({
      clientId,
      clientName: currentUser.clientName || 'Meridian Retail Group',
      projectId: formData.projectId,
      projectName: matchedProject?.name || 'General Operations',
      title: formData.title,
      category: formData.category,
      description: formData.description,
      businessImpact: formData.businessImpact,
      urgency: formData.urgency
    }));

    dispatch(addToast({
      type: 'success',
      title: 'Ticket Submitted',
      message: `Your request "${formData.title}" has been logged. GrowthPrint team will review within 4 hours.`
    }));

    dispatch(addNotification({
      category: 'ACTION_REQUIRED',
      title: 'New Client Support Ticket',
      message: `${currentUser.clientName || 'Client'} logged: "${formData.title}".`,
      priority: 'HIGH',
      targetTab: 'REQUESTS'
    }));

    setFormData({
      title: '',
      category: 'PAID_AD_HOC_SUPPORT',
      projectId: projects[0]?.id || '',
      businessImpact: 'MEDIUM',
      urgency: 'NORMAL',
      description: ''
    });
    setFormError('');
    onCloseModal();
  };

  // Loading, error, and empty states
  if (isLoadingRequests && requests.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Support & Service Requests
            </h2>
            <p className="text-xs text-slate-500">
              Submit bug reports, feature extensions, and technical requests under your service agreement.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading support requests...</p>
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
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Support & Service Requests
            </h2>
            <p className="text-xs text-slate-500">
              Submit bug reports, feature extensions, and technical requests under your service agreement.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-900 mb-1">Failed to load support requests</p>
            <p className="text-xs text-slate-500 mb-3">{requestsError}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Support & Service Requests
          </h2>
          <p className="text-xs text-slate-500">
            Submit bug reports, feature extensions, and technical requests under your service agreement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoadingRequests}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRequests ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onOpenModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 self-start"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Support Request</span>
          </button>
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>All Requests ({requests.length})</span>
          <span>SLA: 4hr acknowledgment</span>
        </div>

        <div className="divide-y divide-slate-100">
          {requests.length === 0 ? (
            <div className="p-5"><EmptyState title="No support requests" message="Submit a request when your team needs help with a bug, feature, or technical question." actionLabel="Create Support Request" onAction={onOpenModal} /></div>
          ) : requests.map((r) => (
            <div key={r.id} className="p-5 hover:bg-slate-50/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700">{r.reference}</span>
                    <h3 className="text-sm font-bold text-slate-900">{r.title}</h3>
                    <StatusBadge status={r.status} />
                    {r.urgency === 'URGENT' && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                        URGENT
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {r.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Category: <strong className="text-slate-700">{r.category}</strong></span>
                    <span>Impact: <strong className="text-slate-700">{r.businessImpact}</strong></span>
                    <span>Logged: {new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Admin notes if present */}
                  {r.adminNotes && (
                    <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 text-slate-700">
                      <span className="font-semibold text-slate-900">Engineering Assessment: </span>
                      {r.adminNotes}
                    </div>
                  )}
                </div>

                {/* Estimate approval action */}
                {r.status === 'AWAITING_CLIENT_APPROVAL' && r.estimate && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-right space-y-2 shrink-0">
                    <div className="text-xs font-bold text-slate-900">
                      Estimate: {r.estimate.estimatedHours}h @ ${r.estimate.hourlyRate}/h = ${r.estimate.totalAmount}
                    </div>
                    <div className="text-[11px] text-slate-600 max-w-xs text-right">
                      {r.estimate.explanation}
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await dispatch(approveEstimate({ requestId: r.id, approvedBy: currentUser.name })).unwrap();
                          dispatch(addToast({
                            type: 'success',
                            title: 'Work Authorized',
                            message: `Estimate for ${r.reference} was approved and queued for delivery.`
                          }));
                          dispatch(addNotification({
                            category: 'ACTION_REQUIRED',
                            title: 'Estimate Approved',
                            message: `${currentUser.name} approved estimate ${r.reference}.`,
                            priority: 'MEDIUM',
                            targetTab: 'REQUESTS',
                            entityId: r.id
                          }));
                        } catch (error) {
                          dispatch(addToast({
                            type: 'error',
                            title: 'Approval Failed',
                            message: 'Failed to approve estimate. Please try again.'
                          }));
                        }
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 ml-auto"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Authorize ($ {r.estimate.totalAmount})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Submit Support or Feature Request
              </h3>
              <button
                onClick={onCloseModal}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
              {formError && (
                <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Request Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Broken checkout coupon calculation on mobile"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Related Project
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Business Impact
                  </label>
                  <select
                    value={formData.businessImpact}
                    onChange={(e) => setFormData({ ...formData, businessImpact: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  >
                    <option value="LOW">Low (Minor visual / non-critical)</option>
                    <option value="MEDIUM">Medium (Degraded workflow)</option>
                    <option value="CRITICAL_BLOCKER">Critical Blocker (Revenue impacting)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide steps to reproduce, expected vs actual behavior, or specific changes required..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Subject to GrowthPrint contract terms & retainer allocation.</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onCloseModal}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    Submit Ticket
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

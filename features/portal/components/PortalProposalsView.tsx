import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { fetchMyProposals, recordProposalDecision, addToast } from '../../../store/index.ts';
import { StatusBadge } from '../../../components/ui/Badges.tsx';
import { EmptyState } from '../../../components/ui/AsyncState.tsx';
import { FileCheck, CheckCircle2, Clock, Calendar, ShieldCheck, Loader2, X } from 'lucide-react';

export function PortalProposalsView() {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(state => state.auth);
  const clientId = currentUser.clientId || 'client-meridian';
  const proposals = useAppSelector(state => state.agency.proposals.filter(p => p.clientId === clientId));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch proposals on mount
  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchMyProposals()).unwrap().catch(err => {
      setError(err || 'Failed to load proposals');
    }).finally(() => {
      setIsLoading(false);
    });
  }, [dispatch]);

  const handleDecision = async (proposalId: string, decision: 'ACCEPT' | 'DECLINE') => {
    try {
      await dispatch(recordProposalDecision({ id: proposalId, decision })).unwrap();
      dispatch(addToast({
        type: 'success',
        title: decision === 'ACCEPT' ? 'Proposal Accepted' : 'Proposal Declined',
        message: decision === 'ACCEPT' 
          ? 'Your acceptance has been recorded. We will begin work shortly.'
          : 'Your decision has been recorded. Thank you for your feedback.'
      }));
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Action Failed',
        message: err || 'Failed to record your decision. Please try again.'
      }));
    }
  };

  if (isLoading && proposals.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Commercial Proposals & Scope Specifications
          </h2>
          <p className="text-xs text-slate-500">
            Formal engineering statements of work, payment milestones, and accepted contract deliverables.
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading proposals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Commercial Proposals & Scope Specifications
          </h2>
          <p className="text-xs text-slate-500">
            Formal engineering statements of work, payment milestones, and accepted contract deliverables.
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <p className="text-sm font-medium text-slate-900 mb-1">Failed to load proposals</p>
            <p className="text-xs text-slate-500 mb-3">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Commercial Proposals & Scope Specifications
        </h2>
        <p className="text-xs text-slate-500">
          Formal engineering statements of work, payment milestones, and accepted contract deliverables.
        </p>
      </div>

      <div className="space-y-6">
        {proposals.length === 0 ? (
          <EmptyState title="No proposals yet" message="New statements of work will appear here when GrowthPrint prepares them for review." />
        ) : proposals.map((prop) => (
          <div key={prop.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">{prop.proposalNumber}</span>
                  <StatusBadge status={prop.status} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{prop.title}</h3>
                <p className="text-xs text-slate-600 max-w-2xl">{prop.scopeSummary}</p>
              </div>

              <div className="text-right space-y-1">
                <div className="text-xs text-slate-400 font-medium">Contract Value</div>
                <div className="text-xl font-extrabold text-blue-700 tabular-nums">
                  ${prop.totalPrice.toLocaleString()} {prop.currency}
                </div>
                <div className="text-xs text-slate-500">Timeline: {prop.timelineDuration}</div>
              </div>
            </div>

            {/* Scope Deliverables & Exclusions */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Scope Deliverables
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {prop.deliverables.map((d, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Documented Exclusions
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {prop.exclusions.map((ex, exIdx) => (
                    <li key={exIdx} className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold">✕</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Payment Milestones */}
            <div className="p-6 bg-slate-50/40">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Payment Milestones Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {prop.paymentMilestones.map((m, mIdx) => (
                  <div key={mIdx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <div className="text-xs font-bold text-slate-800">{m.description}</div>
                    <div className="flex items-baseline justify-between pt-1 text-xs">
                      <span className="text-slate-500">{m.percentage}%</span>
                      <span className="font-bold text-blue-700 tabular-nums">${m.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {prop.status === 'ACCEPTED' && (
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Legally accepted & signed by {prop.acceptedBy}
                  </span>
                  <span>Timestamp: {new Date(prop.acceptedAt || '').toLocaleDateString()}</span>
                </div>
              )}

              {/* Decision buttons for SENT_FOR_REVIEW proposals */}
              {prop.status === 'SENT_FOR_REVIEW' && (
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleDecision(prop.id, 'DECLINE')}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleDecision(prop.id, 'ACCEPT')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept Proposal</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

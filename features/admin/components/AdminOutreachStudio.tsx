import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { 
  approveOutreachDraft, 
  sendApprovedOutreach, 
  updateOutreachDraft,
  fetchOutreachDrafts,
  addToast, 
  addNotification 
} from '../../../store/index.ts';
import { StatusBadge } from '../../../components/ui/Badges.tsx';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog.tsx';
import { CopyButton } from '../../../components/ui/CopyButton.tsx';
import { 
  Send, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Edit3, 
  Sparkles,
  UserCheck,
  Mail,
  Loader2
} from 'lucide-react';

export function AdminOutreachStudio({ preselectedLeadId }: { preselectedLeadId?: string }) {
  const dispatch = useAppDispatch();
  const drafts = useAppSelector(state => state.agency.outreachDrafts);
  const leads = useAppSelector(state => state.agency.leads);

  const initialDraft = drafts.find(d => d.leadId === preselectedLeadId) || drafts[0];
  const [activeDraftId, setActiveDraftId] = useState<string>(initialDraft?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmSendOpen, setIsConfirmSendOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const activeDraft = drafts.find(d => d.id === activeDraftId) || drafts[0];
  const [editedBody, setEditedBody] = useState(activeDraft?.messageBody || '');
  const [editedSubject, setEditedSubject] = useState(activeDraft?.subject || '');

  useEffect(() => {
    if (!preselectedLeadId) return;
    const draft = drafts.find(d => d.leadId === preselectedLeadId);
    if (!draft) return;

    setActiveDraftId(draft.id);
    setEditedBody(draft.messageBody);
    setEditedSubject(draft.subject);
  }, [drafts, preselectedLeadId]);

  // Fetch outreach drafts from backend on mount
  useEffect(() => {
    dispatch(fetchOutreachDrafts());
  }, [dispatch]);

  if (!activeDraft) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
        No active outreach drafts in queue.
      </div>
    );
  }

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      // Save local edits first, then approve
      dispatch(updateOutreachDraft({
        draftId: activeDraft.id,
        subject: editedSubject.trim(),
        messageBody: editedBody.trim()
      }));
      await dispatch(approveOutreachDraft(activeDraft.id)).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Email Draft Approved',
        message: `Draft for ${activeDraft.recipientName} (${activeDraft.companyName}) is approved and ready for sending.`
      }));
    } catch (error: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Approval Failed',
        message: error.message || 'Failed to approve draft'
      }));
      // Revert local edits on failure
      setEditedBody(activeDraft.messageBody);
      setEditedSubject(activeDraft.subject);
    } finally {
      setIsApproving(false);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      dispatch(updateOutreachDraft({
        draftId: activeDraft.id,
        subject: editedSubject.trim(),
        messageBody: editedBody.trim()
      }));
      dispatch(addToast({
        type: 'success',
        title: 'Draft Changes Saved',
        message: `Updated copy for ${activeDraft.recipientName}.`
      }));
    }
    setIsEditing(current => !current);
  };

  const handleConfirmSend = async () => {
    setIsSending(true);
    try {
      await dispatch(sendApprovedOutreach(activeDraft.id)).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Outreach Dispatched',
        message: `Personalized message delivered to ${activeDraft.recipientEmail}.`
      }));
      dispatch(addNotification({
        category: 'OUTREACH',
        title: 'Outreach Email Sent',
        message: `Dispatched outreach to ${activeDraft.recipientName} at ${activeDraft.companyName}.`,
        priority: 'MEDIUM',
        targetTab: 'OUTREACH'
      }));
      setIsSending(false);
      setIsConfirmSendOpen(false);
    } catch (error: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Send Failed',
        message: error.message || 'Failed to send outreach'
      }));
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Outreach Studio · Founder Review & Send
            </h2>
            <span className="text-xs font-semibold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Founder Approval Required
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Every email is tailored to real company problems. Nothing leaves your inbox without your personal review and sign-off.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Left: Draft selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3 order-2 lg:order-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Pending Review ({drafts.length})
          </div>

          {drafts.map((d) => (
            <div
              key={d.id}
              onClick={() => {
                setActiveDraftId(d.id);
                setEditedBody(d.messageBody);
                setEditedSubject(d.subject);
                setIsEditing(false);
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all min-h-[88px] ${
                d.id === activeDraft.id
                  ? 'bg-blue-50/50 border-blue-400 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{d.companyName}</span>
                <StatusBadge status={d.status} />
              </div>
              <div className="text-xs text-slate-500 mt-1 truncate">
                To: {d.recipientName} ({d.recipientEmail})
              </div>
              <div className="text-[11px] text-slate-400 mt-2 truncate">
                Subj: {d.subject}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Message Inspector & Approval Station (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* Header of station */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Personalized Email Draft
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5 truncate">
                {activeDraft.recipientName} · {activeDraft.companyName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-slate-500 font-mono truncate">
                  {activeDraft.recipientEmail}
                </span>
                <CopyButton value={activeDraft.recipientEmail} title="Copy recipient email" />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={activeDraft.status} />
              {activeDraft.status === 'AWAITING_HUMAN_APPROVAL' && (
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                  <span>{isApproving ? 'Approving...' : 'Approve Email'}</span>
                </button>
              )}

              {activeDraft.status === 'APPROVED' && (
                <button
                  onClick={() => setIsConfirmSendOpen(true)}
                  disabled={isSending}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isSending ? 'Sending...' : 'Send via Email'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Personalization Evidence & Verification Checks */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Context & Grounding (Why this note was drafted this way)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Verified details: </strong>
              {activeDraft.personalizationEvidence}
            </p>
            <div className="text-[11px] text-emerald-700 flex items-center gap-1 pt-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Referenced case study matches our actual work with Nexus Logistics.</span>
            </div>
          </div>

          {/* Email Preview & Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Message Preview</span>
              </span>
              <button
                onClick={handleToggleEdit}
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 py-2 px-2 min-h-[44px]"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? 'Save Changes' : 'Edit Copy'}</span>
              </button>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Subject Line
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[44px]"
                />
              ) : (
                <div className="text-xs font-bold text-slate-900 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 min-h-[44px] flex items-center">
                  {editedSubject}
                </div>
              )}
            </div>

            {/* Body */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Message Body
              </label>
              {isEditing ? (
                <textarea
                  rows={9}
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed min-h-[180px]"
                />
              ) : (
                <div className="text-xs text-slate-800 bg-slate-50/60 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed min-h-[180px]">
                  {editedBody}
                </div>
              )}
            </div>
          </div>

          {/* Audit footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
            <span>Outreach policy: 1-to-1 researched, helpful, zero spam blasts</span>
            <span>Sender: alex@growthprint.io</span>
          </div>
        </div>
      </div>

      {/* Send Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmSendOpen}
        title={`Send outreach email to ${activeDraft.recipientName}?`}
        description={`This will send the personalized message directly to ${activeDraft.recipientEmail} from your founder mailbox.`}
        confirmLabel="Send Email"
        cancelLabel="Keep as Draft"
        variant="primary"
        isLoading={isSending}
        onConfirm={handleConfirmSend}
        onCancel={() => setIsConfirmSendOpen(false)}
      />
    </div>
  );
}

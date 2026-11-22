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
import { isMockModeEnv } from '../../../lib/api/client.ts';

/** There is no API to update draft copy yet; editing only changed local state, so it is mock-mode only. */
const DRAFT_EDITING_AVAILABLE = isMockModeEnv();
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
      <div className="p-8 text-center text-xs text-gp-text-muted bg-gp-surface rounded-2xl border border-gp-border">
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-semibold tracking-tight text-gp-text">
              Outreach
            </h2>
            <span className="text-xs font-semibold bg-gp-success-soft text-gp-success px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Approval required
            </span>
          </div>
          <p className="mt-1 text-sm text-gp-text-muted">
            Review personalized drafts — nothing sends without your sign-off.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Left: Draft selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3 order-2 lg:order-1">
          <div className="text-xs font-semibold text-gp-text-muted mb-2">
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
              className={`p-4 rounded-xl border cursor-pointer transition-colors min-h-[88px] ${
                d.id === activeDraft.id
                  ? 'bg-gp-primary-soft/50 border-gp-primary/60'
                  : 'bg-gp-surface border-gp-border hover:border-gp-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gp-text">{d.companyName}</span>
                <StatusBadge status={d.status} />
              </div>
              <div className="text-xs text-gp-text-muted mt-1 truncate">
                To: {d.recipientName} ({d.recipientEmail})
              </div>
              <div className="text-xs text-gp-text-muted mt-2 truncate">
                Subj: {d.subject}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Message Inspector & Approval Station (8 cols) */}
        <div className="lg:col-span-8 bg-gp-surface rounded-2xl border border-gp-border/90 p-4 sm:p-6 space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* Header of station */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-gp-divider">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gp-primary-strong">
                Personalized Email Draft
              </div>
              <h3 className="text-base font-bold text-gp-text mt-0.5 truncate">
                {activeDraft.recipientName} · {activeDraft.companyName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-gp-text-muted truncate">
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
                  className="px-4 py-2.5 bg-gp-success hover:bg-gp-success text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-11"
                >
                  {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                  <span>{isApproving ? 'Approving...' : 'Approve Email'}</span>
                </button>
              )}

              {activeDraft.status === 'APPROVED' && (
                <button
                  onClick={() => setIsConfirmSendOpen(true)}
                  disabled={isSending}
                  className="px-4 py-2.5 bg-gp-primary hover:bg-gp-primary-hover text-gp-primary-foreground rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-11"
                >
                  {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isSending ? 'Sending...' : 'Send via Email'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Personalization Evidence & Verification Checks */}
          <div className="bg-gp-canvas rounded-xl p-4 border border-gp-border/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gp-text">
              <Sparkles className="w-4 h-4 text-gp-primary-strong" />
              <span>Context & Grounding (Why this note was drafted this way)</span>
            </div>
            <p className="text-xs text-gp-text-secondary leading-relaxed">
              <strong className="text-gp-text">Verified details: </strong>
              {activeDraft.personalizationEvidence}
            </p>
          </div>

          {/* Email Preview & Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-gp-text">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gp-text-muted" />
                <span>Message Preview</span>
              </span>
              {DRAFT_EDITING_AVAILABLE && (
                <button
                  type="button"
                  onClick={handleToggleEdit}
                  className="text-gp-primary-strong hover:text-gp-primary-strong font-semibold flex items-center gap-1 py-2 px-2 min-h-11"
                >
                  <Edit3 className="w-3 h-3" aria-hidden="true" />
                  <span>{isEditing ? 'Save Changes' : 'Edit Copy'}</span>
                </button>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-gp-text-muted mb-1">
                Subject Line
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gp-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gp-primary/30 min-h-11"
                />
              ) : (
                <div className="text-xs font-bold text-gp-text bg-gp-canvas px-3 py-2.5 rounded-lg border border-gp-border min-h-11 flex items-center">
                  {editedSubject}
                </div>
              )}
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-semibold text-gp-text-muted mb-1">
                Message Body
              </label>
              {isEditing ? (
                <textarea
                  rows={9}
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gp-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gp-primary/30 leading-relaxed min-h-[180px]"
                />
              ) : (
                <div className="text-xs text-gp-text bg-gp-canvas/60 p-4 rounded-xl border border-gp-border whitespace-pre-wrap leading-relaxed min-h-[180px]">
                  {editedBody}
                </div>
              )}
            </div>
          </div>

          {/* Audit footer */}
          <div className="pt-4 border-t border-gp-divider flex flex-wrap items-center justify-between gap-4 text-xs text-gp-text-muted">
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

import React, { useEffect, useId, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import {
  addToast,
  fetchInvoices,
  fetchInvoicePaymentReports,
  verifyPaymentReport,
  rejectPaymentReport
} from '../../../store/index.ts';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog.tsx';
import { formatMoney } from '../../../lib/money.ts';
import type { Invoice, PaymentReport } from '../../../types/agency.ts';

const OPEN_STATUSES: Invoice['status'][] = ['ISSUED', 'OVERDUE'];

const METHOD_LABEL: Record<PaymentReport['paymentMethod'], string> = {
  BANK_TRANSFER: 'Bank transfer',
  CARD: 'Card',
  CHECK: 'Check',
  OTHER: 'Other'
};

/**
 * Payments that clients say they have made, waiting for an admin to check them against the bank.
 * Confirming marks the invoice paid (server-side); rejecting keeps it open and records the reason.
 */
export function AdminPaymentReportsPanel() {
  const dispatch = useAppDispatch();
  const invoices = useAppSelector(state => state.agency.invoices);
  const reportsByInvoice = useAppSelector(state => state.agency.paymentReports);

  // There is no "all pending reports" endpoint yet, so load the reports of each open invoice.
  const openIds = invoices.filter(i => OPEN_STATUSES.includes(i.status)).map(i => i.id).join(',');
  useEffect(() => {
    if (!openIds) return;
    openIds.split(',').forEach(invoiceId => dispatch(fetchInvoicePaymentReports(invoiceId)));
  }, [dispatch, openIds]);

  const pending = Object.values(reportsByInvoice)
    .flat()
    .filter(report => report.status === 'PENDING')
    .sort((a, b) => a.reportedAt.localeCompare(b.reportedAt));

  if (pending.length === 0) {
    return null;
  }

  const invoiceById = new Map(invoices.map(invoice => [invoice.id, invoice]));

  return (
    <section aria-labelledby="pending-payments-heading" className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-3">
      <div>
        <h3 id="pending-payments-heading" className="text-sm font-semibold text-slate-900">
          Payments to confirm ({pending.length})
        </h3>
        <p className="text-xs text-slate-600">
          Clients have told us they paid these invoices. Check that the money has arrived before confirming.
        </p>
      </div>
      
      <ul className="space-y-3">
        {pending.map(report => (
          <PendingReportItem key={report.id} report={report} invoice={invoiceById.get(report.invoiceId)} onReviewed={() => dispatch(fetchInvoices())} />
        ))}
      </ul>
    </section>
  );
}

function PendingReportItem({ report, invoice, onReviewed }: { report: PaymentReport; invoice?: Invoice; onReviewed: () => void }) {
  const dispatch = useAppDispatch();
  const id = useId();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [busy, setBusy] = useState<'verify' | 'reject' | null>(null);

  const amountMismatch = invoice && Math.abs(invoice.totalAmount - report.amount) >= 0.01;

  const handleVerify = async () => {
    setBusy('verify');
    setError(null);
    try {
      await dispatch(verifyPaymentReport({ reportId: report.id, note })).unwrap();
      setIsConfirmOpen(false);
      dispatch(addToast({ type: 'success', title: 'Payment confirmed', message: `${report.invoiceNumber} is now marked as paid.` }));
      onReviewed();
    } catch (err) {
      setIsConfirmOpen(false);
      setError(typeof err === 'string' && err ? err : 'We couldn’t confirm this payment. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async () => {
    if (!note.trim()) {
      setError('Add a short note explaining why, so the client knows what to do next.');
      return;
    }
    setBusy('reject');
    setError(null);
    try {
      await dispatch(rejectPaymentReport({ reportId: report.id, note })).unwrap();
      dispatch(addToast({ type: 'info', title: 'Payment report rejected', message: `${report.invoiceNumber} stays open.` }));
      onReviewed();
    } catch (err) {
      setError(typeof err === 'string' && err ? err : 'We couldn’t reject this report. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <li className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2 text-xs">
        <div className="space-y-0.5">
          <div className="font-semibold text-slate-900">
            {report.invoiceNumber}{invoice ? ` · ${invoice.clientName}` : ''}
          </div>
          <div className="text-slate-700">
            {formatMoney(report.amount, report.currency)} by {METHOD_LABEL[report.paymentMethod]} on {report.paidOn}
            {report.reference ? ` · ref ${report.reference}` : ''}
          </div>
          <div className="text-slate-500">Reported {new Date(report.reportedAt).toLocaleString()}</div>
          {report.note && <div className="text-slate-600">Client note: {report.note}</div>}
        </div>
        {amountMismatch && invoice && (
          <span className="px-2 py-0.5 rounded-md border text-[11px] font-medium bg-amber-50 text-amber-800 border-amber-200">
            Invoice total is {formatMoney(invoice.totalAmount, invoice.currency)}
          </span>
        )}
      </div>

      <div>
        <label htmlFor={`${id}-note`} className="block text-[11px] font-medium text-slate-700 mb-1">
          Review note (required if you reject)
        </label>
        <textarea
          id={`${id}-note`}
          rows={2}
          maxLength={2000}
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleReject}
          disabled={busy !== null}
          className="px-3 py-2 text-xs font-semibold text-rose-700 border border-rose-200 hover:bg-rose-50 rounded-lg disabled:opacity-50 min-h-[36px]"
        >
          {busy === 'reject' ? 'Rejecting…' : 'Reject'}
        </button>
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          disabled={busy !== null}
          className="px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 min-h-[36px]"
        >
          Confirm payment received
        </button>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Confirm this payment?"
        description={`This marks ${report.invoiceNumber} as paid. Only confirm once you've seen ${formatMoney(report.amount, report.currency)} arrive.`}
        confirmLabel="Yes, mark as paid"
        variant="primary"
        isLoading={busy === 'verify'}
        onConfirm={handleVerify}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </li>
  );
}

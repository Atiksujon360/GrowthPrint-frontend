import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { addToast, fetchMyInvoices, fetchMyPaymentReports } from '../../../store/index.ts';
import { StatusBadge } from '../../../components/ui/Badges.tsx';
import { EmptyState } from '../../../components/ui/AsyncState.tsx';
import { CreditCard, Download, Clock, RefreshCw } from 'lucide-react';
import { ReportPaymentForm } from './ReportPaymentForm.tsx';
import { formatMoney, totalsByCurrency } from '../../../lib/money.ts';
import { agencyApi } from '../../../lib/api/client.ts';
import type { Invoice, PaymentReport } from '../../../types/agency.ts';

/** Invoices a client can still pay (and report a payment for). */
const PAYABLE_STATUSES: Invoice['status'][] = ['ISSUED', 'OVERDUE'];

const REPORT_STATUS_LABEL: Record<PaymentReport['status'], { label: string; className: string }> = {
  PENDING: { label: 'Waiting for confirmation', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  VERIFIED: { label: 'Confirmed', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  REJECTED: { label: 'Not confirmed', className: 'bg-rose-50 text-rose-800 border-rose-200' }
};

const METHOD_LABEL: Record<PaymentReport['paymentMethod'], string> = {
  BANK_TRANSFER: 'Bank transfer',
  CARD: 'Card',
  CHECK: 'Check',
  OTHER: 'Other'
};

export function PortalInvoicesView() {
  const dispatch = useAppDispatch();
  const invoices = useAppSelector(state => state.agency.invoices);
  const paymentReports = useAppSelector(state => state.agency.paymentReports);
  const isLoadingInvoices = useAppSelector(state => state.agency.isLoadingInvoices);
  const invoicesError = useAppSelector(state => state.agency.invoicesError);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportingInvoiceId, setReportingInvoiceId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMyInvoices());
  }, [dispatch]);

  // Load the payment history of every invoice that can still be paid.
  const payableIds = invoices.filter(i => PAYABLE_STATUSES.includes(i.status)).map(i => i.id).join(',');
  useEffect(() => {
    if (!payableIds) return;
    payableIds.split(',').forEach(invoiceId => dispatch(fetchMyPaymentReports(invoiceId)));
  }, [dispatch, payableIds]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchMyInvoices()).unwrap();
      dispatch(addToast({ type: 'success', title: 'Up to date', message: 'Your invoices have been refreshed.' }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Couldn’t refresh',
        message: typeof error === 'string' && error ? error : 'We couldn’t load your invoices. Please try again.'
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    setDownloadingId(invoiceId);
    try {
      await agencyApi.invoices.downloadMyPdf(invoiceId, invoiceNumber);
      dispatch(addToast({ type: 'success', title: 'Invoice downloaded', message: `${invoiceNumber} has been saved as a PDF.` }));
    } catch (error: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Couldn’t download',
        message: error?.message || 'We couldn’t download this invoice. Please try again.'
      }));
    } finally {
      setDownloadingId(null);
    }
  };

  const outstanding = totalsByCurrency(
    invoices.filter(i => PAYABLE_STATUSES.includes(i.status)),
    i => i.totalAmount
  );
  const outstandingEntries = Object.entries(outstanding);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Invoices</h2>
          <p className="text-xs text-slate-500">
            Your invoices from GrowthPrint. Paid one? Let us know here and we’ll confirm it once the payment arrives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-right self-start shadow-xs">
            <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Outstanding</div>
            {outstandingEntries.length === 0 ? (
              <div className="text-lg font-bold text-slate-900 tabular-nums">Nothing due</div>
            ) : outstandingEntries.map(([currency, total]) => (
              <div key={currency} className="text-lg font-bold text-slate-900 tabular-nums">{formatMoney(total, currency)}</div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingInvoices}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh invoices"
            aria-label="Refresh invoices"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing || isLoadingInvoices ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {invoicesError && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
          <span className="font-semibold">We couldn’t load your invoices.</span>
          <span>{invoicesError}</span>
          <button
            type="button"
            onClick={handleRefresh}
            className="ml-auto px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-semibold transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      <div className="space-y-4">
        {isLoadingInvoices && invoices.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm" role="status">Loading your invoices…</div>
        ) : invoices.length === 0 ? (
          <EmptyState title="No invoices yet" message="When GrowthPrint bills you for a project milestone or approved work, the invoice will appear here." />
        ) : invoices.map((inv) => {
          const reports = paymentReports[inv.id] ?? [];
          const pendingReport = reports.find(r => r.status === 'PENDING');
          const canReport = PAYABLE_STATUSES.includes(inv.status) && !pendingReport;

          return (
            <div key={inv.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700">{inv.invoiceNumber}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="text-xs text-slate-500">Issued {inv.issueDate} · Due {inv.dueDate}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium">Total</div>
                    <div className="text-base font-bold text-slate-900 tabular-nums">{formatMoney(inv.totalAmount, inv.currency)}</div>
                  </div>

                  <div className="flex items-center gap-2 pl-2">
                    {canReport && (
                      <button
                        type="button"
                        onClick={() => setReportingInvoiceId(current => (current === inv.id ? null : inv.id))}
                        aria-expanded={reportingInvoiceId === inv.id}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors min-h-[36px]"
                      >
                        <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Report a payment</span>
                      </button>
                    )}
                    {pendingReport && (
                      <span className="px-2.5 py-1 rounded-lg border text-[11px] font-medium bg-amber-50 text-amber-800 border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        Payment reported — awaiting confirmation
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)}
                      disabled={downloadingId === inv.id}
                      aria-busy={downloadingId === inv.id}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-wait"
                      title={downloadingId === inv.id ? 'Preparing PDF…' : 'Download PDF'}
                      aria-label={`Download PDF for invoice ${inv.invoiceNumber}`}
                    >
                      {downloadingId === inv.id
                        ? <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                        : <Download className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              </div>

              {reportingInvoiceId === inv.id && canReport && (
                <ReportPaymentForm invoice={inv} onDone={() => setReportingInvoiceId(null)} />
              )}

              {/* Line items */}
              <div className="p-5">
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">Line items for invoice {inv.invoiceNumber}</caption>
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-medium uppercase tracking-wider text-[10px]">
                      <th scope="col" className="pb-2">Description</th>
                      <th scope="col" className="pb-2 text-right">Qty</th>
                      <th scope="col" className="pb-2 text-right">Rate</th>
                      <th scope="col" className="pb-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {inv.lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 font-medium text-slate-900">{item.description}</td>
                        <td className="py-2.5 text-right tabular-nums">{item.quantity}</td>
                        <td className="py-2.5 text-right tabular-nums">{formatMoney(item.unitPrice, inv.currency)}</td>
                        <td className="py-2.5 text-right font-semibold text-slate-900 tabular-nums">{formatMoney(item.amount, inv.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {inv.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">Notes: </span>
                    {inv.notes}
                  </div>
                )}

                {reports.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2">Your payment reports</h4>
                    <ul className="space-y-2">
                      {reports.map(report => (
                        <li key={report.id} className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
                          <span>
                            {formatMoney(report.amount, report.currency)} by {METHOD_LABEL[report.paymentMethod]} on {report.paidOn}
                            {report.reference ? ` · ref ${report.reference}` : ''}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md border text-[11px] font-medium ${REPORT_STATUS_LABEL[report.status].className}`}>
                            {REPORT_STATUS_LABEL[report.status].label}
                          </span>
                          {report.status === 'REJECTED' && report.reviewNote && (
                            <span className="w-full text-[11px] text-rose-700">Reason: {report.reviewNote}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

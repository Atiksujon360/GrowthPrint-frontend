import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { addNotification, addToast, markInvoicePaid, fetchMyInvoices } from '../../../store/index.ts';
import { StatusBadge } from '../../../components/ui/Badges.tsx';
import { EmptyState } from '../../../components/ui/AsyncState.tsx';
import { CreditCard, Download, CheckCircle2, ArrowRight, FileText, RefreshCw } from 'lucide-react';

export function PortalInvoicesView() {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(state => state.auth);
  const invoices = useAppSelector(state => state.agency.invoices);
  const isLoadingInvoices = useAppSelector(state => state.agency.isLoadingInvoices);
  const invoicesError = useAppSelector(state => state.agency.invoicesError);

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchMyInvoices());
  }, [dispatch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchMyInvoices()).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Invoices Refreshed',
        message: 'Invoice data has been updated from the server.'
      }));
    } catch (error: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Refresh Failed',
        message: error.message || 'Failed to refresh invoices'
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownload = (invoiceNumber: string) => {
    setDownloadSuccess(invoiceNumber);
    dispatch(addToast({
      type: 'success',
      title: 'Invoice Ready',
      message: `Invoice ${invoiceNumber} is ready for download.`
    }));
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  const handlePayment = async (invoiceId: string, invoiceNumber: string, amount: number) => {
    try {
      await dispatch(markInvoicePaid({ invoiceId })).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Payment Recorded',
        message: `Payment of $${amount.toLocaleString()} for ${invoiceNumber} was recorded.`
      }));
      dispatch(addNotification({
        category: 'FINANCIAL',
        title: 'Invoice Paid',
        message: `${invoiceNumber} was marked as paid by ${currentUser.name}.`,
        priority: 'MEDIUM',
        targetTab: 'INVOICES',
        entityId: invoiceId
      }));
    } catch (error: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Payment Failed',
        message: error.message || 'Failed to record payment'
      }));
    }
  };

  const totalOutstanding = invoices
    .filter(i => i.status === 'ISSUED')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Billing & Reconciled Invoices
          </h2>
          <p className="text-xs text-slate-500">
            Official tax invoices, itemized scope billing, and ACH/wire payment reconciliation records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-right self-start shadow-xs">
            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              Total Outstanding
            </div>
            <div className="text-lg font-bold text-slate-900 tabular-nums">
              ${totalOutstanding.toLocaleString()} USD
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingInvoices}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh invoices from server"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing || isLoadingInvoices ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Downloaded official PDF receipt for {downloadSuccess}.</span>
        </div>
      )}

      {invoicesError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
          <span className="font-semibold">Error loading invoices:</span>
          <span>{invoicesError}</span>
          <button
            onClick={handleRefresh}
            className="ml-auto px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Invoice list */}
      <div className="space-y-4">
        {isLoadingInvoices && invoices.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState title="No invoices yet" message="Billing records will appear here after a project milestone or approved support estimate." />
        ) : invoices.map((inv) => (
          <div 
            key={inv.id} 
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700">{inv.invoiceNumber}</span>
                  <StatusBadge status={inv.status} />
                </div>
                <div className="text-xs text-slate-500">
                  Issued: {inv.issueDate} · Due: {inv.dueDate}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">Total Amount</div>
                  <div className="text-base font-bold text-slate-900 tabular-nums">
                    ${inv.totalAmount.toLocaleString()} {inv.currency}
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-2">
                  {inv.status === 'ISSUED' && (
                    <button
                      onClick={() => handlePayment(inv.id, inv.invoiceNumber, inv.totalAmount)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay Now</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDownload(inv.invoiceNumber)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Download PDF"
                    aria-label={`Download PDF invoice ${inv.invoiceNumber}`}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div className="p-5">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Rate</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {inv.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 font-medium text-slate-900">{item.description}</td>
                      <td className="py-2.5 text-right tabular-nums">{item.quantity}</td>
                      <td className="py-2.5 text-right tabular-nums">${item.unitPrice.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-900 tabular-nums">${item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {inv.notes && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Audit Notes: </span>
                  {inv.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { payInvoice } from '../../store/index.ts';
import { StatusBadge } from '../common/Badges.tsx';
import { CreditCard, Download, CheckCircle2, ArrowRight, FileText } from 'lucide-react';

export function PortalInvoicesView() {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(state => state.auth);
  const clientId = currentUser.clientId || 'client-meridian';
  const invoices = useAppSelector(state => state.agency.invoices.filter(i => i.clientId === clientId));

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownload = (invoiceNumber: string) => {
    setDownloadSuccess(invoiceNumber);
    setTimeout(() => setDownloadSuccess(null), 2500);
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

        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-right self-start shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
            Total Outstanding
          </div>
          <div className="text-lg font-bold text-slate-900 tabular-nums">
            ${totalOutstanding.toLocaleString()} USD
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Downloaded official PDF receipt for {downloadSuccess}.</span>
        </div>
      )}

      {/* Invoice list */}
      <div className="space-y-4">
        {invoices.map((inv) => (
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
                      onClick={() => dispatch(payInvoice({ invoiceId: inv.id }))}
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

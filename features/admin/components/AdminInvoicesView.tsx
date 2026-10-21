import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { payInvoice, addToast, addNotification } from '../../../store/index.ts';
import { StatusBadge } from '../../../components/ui/Badges.tsx';
import { DataTable, type ColumnDef } from '../../../components/ui/DataTable.tsx';
import { CopyButton } from '../../../components/ui/CopyButton.tsx';
import { DollarSign, Download, CheckCircle2, FileText, CreditCard, FileSpreadsheet } from 'lucide-react';
import { exportToCsv, exportToJson } from '../../../lib/utils.ts';
import type { Invoice } from '../../../types/index.ts';

export function AdminInvoicesView() {
  const dispatch = useAppDispatch();
  const invoices = useAppSelector(state => state.agency.invoices);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.totalAmount, 0);
  const totalIssued = invoices.filter(i => i.status === 'ISSUED').reduce((sum, i) => sum + i.totalAmount, 0);

  const handleDownload = (invNum: string) => {
    setDownloadSuccess(invNum);
    dispatch(addToast({
      type: 'info',
      title: 'Invoice Downloaded',
      message: `Downloaded PDF receipt for ${invNum}.`
    }));
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  const handleExportCsv = () => {
    exportToCsv('growthprint-invoices.csv', invoices.map(i => ({
      invoiceNumber: i.invoiceNumber,
      clientName: i.clientName,
      clientEmail: i.clientEmail,
      issueDate: i.issueDate,
      dueDate: i.dueDate,
      totalAmount: i.totalAmount,
      currency: i.currency,
      status: i.status,
      notes: i.notes || ''
    })));
    dispatch(addToast({
      type: 'success',
      title: 'CSV Exported',
      message: `Exported ${invoices.length} invoices to growthprint-invoices.csv`
    }));
  };

  const handleExportJson = () => {
    exportToJson('growthprint-invoices.json', invoices);
    dispatch(addToast({
      type: 'success',
      title: 'JSON Exported',
      message: `Exported ${invoices.length} invoice records for API / backend import.`
    }));
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      id: 'invoiceNumber',
      header: 'Invoice #',
      accessorKey: 'invoiceNumber',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-slate-800 text-xs">
            {row.invoiceNumber}
          </span>
          <CopyButton value={row.invoiceNumber} title="Copy invoice number" />
        </div>
      )
    },
    {
      id: 'clientName',
      header: 'Client Organization',
      accessorKey: 'clientName',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-slate-900">{row.clientName}</div>
          <div className="text-[11px] text-slate-400">{row.clientEmail}</div>
        </div>
      )
    },
    {
      id: 'issueDate',
      header: 'Issued Date',
      accessorKey: 'issueDate',
      sortable: true,
      cell: ({ row }) => (
        <span className="font-mono text-slate-500 text-[11px]">{row.issueDate}</span>
      )
    },
    {
      id: 'dueDate',
      header: 'Due Date',
      accessorKey: 'dueDate',
      sortable: true,
      cell: ({ row }) => (
        <span className="font-mono text-slate-500 text-[11px]">{row.dueDate}</span>
      )
    },
    {
      id: 'totalAmount',
      header: 'Total Amount',
      accessorKey: 'totalAmount',
      sortable: true,
      align: 'right',
      cell: ({ row }) => (
        <span className="font-bold text-slate-900 tabular-nums text-xs">
          ${row.totalAmount.toLocaleString()} {row.currency}
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
      id: 'actions',
      header: 'Actions',
      sortable: false,
      align: 'right',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {row.status === 'ISSUED' && (
            <button
              onClick={() => {
                dispatch(payInvoice({ invoiceId: row.id }));
                dispatch(addToast({
                  type: 'success',
                  title: 'Payment Reconciled',
                  message: `Payment of $${row.totalAmount.toLocaleString()} USD confirmed for invoice ${row.invoiceNumber}.`
                }));
                dispatch(addNotification({
                  category: 'FINANCIAL',
                  title: 'Invoice Settled',
                  message: `Reconciled payment of $${row.totalAmount.toLocaleString()} for ${row.clientName}.`,
                  priority: 'MEDIUM',
                  targetTab: 'INVOICES'
                }));
              }}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Reconcile</span>
            </button>
          )}

          <button
            onClick={() => handleDownload(row.invoiceNumber)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Download PDF"
            aria-label={`Download PDF invoice ${row.invoiceNumber}`}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  const statusOptions = [
    { label: 'All Invoices', value: 'ALL', count: invoices.length },
    { label: 'Issued / Due', value: 'ISSUED', count: invoices.filter(i => i.status === 'ISSUED').length },
    { label: 'Reconciled / Paid', value: 'PAID', count: invoices.filter(i => i.status === 'PAID').length },
    { label: 'Overdue', value: 'OVERDUE', count: invoices.filter(i => i.status === 'OVERDUE').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Invoices & Revenue Administration
          </h2>
          <p className="text-xs text-slate-500">
            Reconcile payments, monitor outstanding receivables, and download official PDF receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs shadow-2xs">
            <span className="text-slate-400">Total Collected: </span>
            <strong className="text-emerald-700 font-bold tabular-nums">${totalPaid.toLocaleString()} USD</strong>
          </div>
          <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs shadow-2xs">
            <span className="text-slate-400">Receivables: </span>
            <strong className="text-blue-700 font-bold tabular-nums">${totalIssued.toLocaleString()} USD</strong>
          </div>

          <div className="flex items-center gap-1.5 pl-1">
            <button
              onClick={handleExportCsv}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5 transition-colors"
              title="Export ledger as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportJson}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5 transition-colors"
              title="Export ledger as JSON"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Downloaded official tax invoice PDF for {downloadSuccess}.</span>
        </div>
      )}

      {/* DataTable */}
      <DataTable
        data={invoices}
        columns={columns}
        statusFilter={{
          statusKey: 'status',
          options: statusOptions,
          value: statusFilter,
          onChange: setStatusFilter
        }}
        searchConfig={{
          placeholder: 'Search by invoice number or client...',
          searchKeys: ['invoiceNumber', 'clientName', 'clientEmail', 'notes']
        }}
        pageSize={10}
        pageSizeOptions={[5, 10, 20]}
        defaultSortKey="issueDate"
        defaultSortDirection="desc"
        title="Commercial Invoices Ledger"
        subtitle="Sort by invoice number, client, date, or amount"
      />
    </div>
  );
}

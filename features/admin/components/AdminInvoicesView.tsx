import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { markInvoicePaid, addToast, addNotification, fetchInvoices } from '../../../store/index.ts';
import { StatusBadge } from '../../../components/ui/Badges.tsx';
import { DataTable, type ColumnDef } from '../../../components/ui/DataTable.tsx';
import { CopyButton } from '../../../components/ui/CopyButton.tsx';
import { DollarSign, Download, CheckCircle2, FileText, CreditCard, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { exportToCsv, exportToJson } from '../../../lib/utils.ts';
import type { Invoice } from '../../../types/agency.ts';
import { AdminPaymentReportsPanel } from './AdminPaymentReportsPanel.tsx';
import { formatMoney } from '../../../lib/money.ts';
import { agencyApi } from '../../../lib/api/client.ts';

export function AdminInvoicesView() {
  const dispatch = useAppDispatch();
  const invoices = useAppSelector(state => state.agency.invoices);
  const isLoadingInvoices = useAppSelector(state => state.agency.isLoadingInvoices);
  const invoicesError = useAppSelector(state => state.agency.invoicesError);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchInvoices()).unwrap();
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

  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    setDownloadingId(invoiceId);
    try {
      const { filename } = await agencyApi.invoices.downloadPdf(invoiceId, invoiceNumber);
      dispatch(addToast({
        type: 'success',
        title: 'PDF downloaded',
        message: `${filename} has been saved.`
      }));
    } catch (error: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Download failed',
        message: error?.message || `Could not download the PDF for ${invoiceNumber}.`
      }));
    } finally {
      setDownloadingId(null);
    }
  };

  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.totalAmount, 0);
  const totalIssued = invoices.filter(i => i.status === 'ISSUED').reduce((sum, i) => sum + i.totalAmount, 0);

  const handleMarkPaid = async (invoiceId: string, invoiceNumber: string, amount: number, clientName: string) => {
    try {
      await dispatch(markInvoicePaid({ invoiceId })).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Invoice marked as paid',
        message: `${invoiceNumber} is now marked as paid.`
      }));
      dispatch(addNotification({
        category: 'FINANCIAL',
        title: 'Invoice Settled',
        message: `${invoiceNumber} for ${clientName} was marked as paid.`,
        priority: 'MEDIUM',
        targetTab: 'INVOICES'
      }));
    } catch (error: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Reconciliation Failed',
        message: error.message || 'Failed to mark invoice as paid'
      }));
    }
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
              onClick={() => handleMarkPaid(row.id, row.invoiceNumber, row.totalAmount, row.clientName)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Reconcile</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleDownloadPdf(row.id, row.invoiceNumber)}
            disabled={downloadingId === row.id}
            aria-busy={downloadingId === row.id}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-wait"
            title={downloadingId === row.id ? 'Preparing PDF…' : 'Download PDF'}
            aria-label={`Download PDF for invoice ${row.invoiceNumber}`}
          >
            {downloadingId === row.id
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              : <Download className="w-3.5 h-3.5" aria-hidden="true" />}
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
              onClick={handleRefresh}
              disabled={isRefreshing || isLoadingInvoices}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh invoices from server"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing || isLoadingInvoices ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
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


      <AdminPaymentReportsPanel />

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

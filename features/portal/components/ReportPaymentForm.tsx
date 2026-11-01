import React, { useId, useState } from 'react';
import { useAppDispatch } from '../../../store/hooks.ts';
import { reportInvoicePayment, addToast } from '../../../store/index.ts';
import type { Invoice, PaymentMethod } from '../../../types/agency.ts';
import { isValidPaymentAmount } from '../../../lib/money.ts';

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'CARD', label: 'Card' },
  { value: 'CHECK', label: 'Check' },
  { value: 'OTHER', label: 'Other' }
];

function todayIso(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

interface ReportPaymentFormProps {
  invoice: Invoice;
  onDone: () => void;
}

/**
 * Lets a client tell GrowthPrint that they have paid an invoice. This only records a report:
 * the invoice stays unpaid until GrowthPrint confirms the money has arrived.
 */
export function ReportPaymentForm({ invoice, onDone }: ReportPaymentFormProps) {
  const dispatch = useAppDispatch();
  const id = useId();
  const [amount, setAmount] = useState(invoice.totalAmount.toFixed(2));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [reference, setReference] = useState('');
  const [paidOn, setPaidOn] = useState(todayIso());
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!isValidPaymentAmount(amount)) next.amount = 'Enter the amount you paid, for example 1250.00.';
    if (!paidOn) next.paidOn = 'Choose the date you made the payment.';
    else if (paidOn > todayIso()) next.paidOn = 'The payment date can’t be in the future.';
    if (reference.length > 120) next.reference = 'Please keep the reference under 120 characters.';
    if (note.length > 2000) next.note = 'Please keep the note under 2,000 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || !validate()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await dispatch(reportInvoicePayment({
        invoiceId: invoice.id,
        amount: Number(amount),
        paymentMethod,
        reference,
        paidOn,
        note
      })).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Payment reported',
        message: `Thanks — we’ve noted your payment for ${invoice.invoiceNumber}. We’ll mark the invoice as paid once it arrives.`
      }));
      onDone();
    } catch (error) {
      setSubmitError(typeof error === 'string' && error ? error : 'We couldn’t record your payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (name: string) => ({
    id: `${id}-${name}`,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${id}-${name}-error` : undefined
  });
  const errorText = (name: string) =>
    errors[name] ? <p id={`${id}-${name}-error`} className="mt-1 text-[11px] text-rose-700">{errors[name]}</p> : null;
  const inputClass = 'w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30';

  return (
    <form onSubmit={handleSubmit} noValidate className="p-5 border-b border-slate-100 bg-blue-50/40 space-y-4" aria-labelledby={`${id}-title`}>
      <div>
        <h3 id={`${id}-title`} className="text-sm font-semibold text-slate-900">Report a payment for {invoice.invoiceNumber}</h3>
        <p className="text-xs text-slate-600 mt-0.5">
          Let us know once you’ve sent the payment. The invoice stays open until we confirm the money has arrived.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${id}-amount`} className="block text-xs font-medium text-slate-700 mb-1">Amount paid ({invoice.currency})</label>
          <input {...field('amount')} type="text" inputMode="decimal" required value={amount}
            onChange={e => setAmount(e.target.value)} className={inputClass} />
          {errorText('amount')}
        </div>
        <div>
          <label htmlFor={`${id}-paidOn`} className="block text-xs font-medium text-slate-700 mb-1">Payment date</label>
          <input {...field('paidOn')} type="date" required max={todayIso()} value={paidOn}
            onChange={e => setPaidOn(e.target.value)} className={inputClass} />
          {errorText('paidOn')}
        </div>
        <div>
          <label htmlFor={`${id}-method`} className="block text-xs font-medium text-slate-700 mb-1">How did you pay?</label>
          <select id={`${id}-method`} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className={inputClass}>
            {METHODS.map(method => <option key={method.value} value={method.value}>{method.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-reference`} className="block text-xs font-medium text-slate-700 mb-1">Payment reference (optional)</label>
          <input {...field('reference')} type="text" maxLength={120} value={reference} placeholder="e.g. bank transaction ID"
            onChange={e => setReference(e.target.value)} className={inputClass} />
          {errorText('reference')}
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-note`} className="block text-xs font-medium text-slate-700 mb-1">Anything we should know? (optional)</label>
        <textarea {...field('note')} rows={2} maxLength={2000} value={note} onChange={e => setNote(e.target.value)} className={inputClass} />
        {errorText('note')}
      </div>

      {submitError && (
        <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{submitError}</p>
      )}

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={onDone} className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 min-h-[36px]">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs disabled:opacity-50 min-h-[36px]">
          {isSubmitting ? 'Sending…' : 'Report payment'}
        </button>
      </div>
    </form>
  );
}

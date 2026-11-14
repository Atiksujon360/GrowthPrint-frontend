'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Dialog } from '../../../components/ui/workspace-kit.tsx';
import { Button, Notice, SelectField, TextField } from '../../../components/ui/forms.tsx';
import { CURRENCIES, type Client, type ClientInput, type ClientStatus, type Currency, type RetainerTier } from '../model/types.ts';
import { errorMessage, fieldErrors } from '../api/workspaceApi.ts';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  name: string; legalName: string; contactEmail: string; phone: string; website: string;
  billingCurrency: Currency; retainerTier: RetainerTier | ''; monthlyRetainerHours: string; contractStartDate: string;
  accountManager: string; notes: string; status: ClientStatus;
}

function initial(client: Client | undefined, currency: Currency): FormState {
  return {
    name: client?.name ?? '', legalName: client?.legalName ?? '', contactEmail: client?.contactEmail ?? '',
    phone: client?.phone ?? '', website: client?.website ?? '', billingCurrency: client?.billingCurrency ?? currency,
    retainerTier: client?.retainerTier ?? '', monthlyRetainerHours: client?.monthlyRetainerHours?.toString() ?? '',
    contractStartDate: client?.contractStartDate ?? '', accountManager: client?.accountManager ?? '',
    notes: client?.notes ?? '', status: client?.status ?? 'ACTIVE',
  };
}

/** Client-side checks for instant feedback; the service/backend validates again. */
export function validateClientForm(f: Pick<FormState, 'name' | 'contactEmail' | 'monthlyRetainerHours' | 'website'>): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e.name = 'Enter the client name.';
  else if (f.name.trim().length > 120) e.name = 'Use at most 120 characters.';
  if (!f.contactEmail.trim()) e.contactEmail = 'Enter a contact email.';
  else if (!EMAIL.test(f.contactEmail.trim())) e.contactEmail = 'Enter a valid email address.';
  if (f.monthlyRetainerHours && (!/^\d+$/.test(f.monthlyRetainerHours) || Number(f.monthlyRetainerHours) > 744)) {
    e.monthlyRetainerHours = 'Use a whole number between 0 and 744.';
  }
  if (f.website && !/^https?:\/\/\S+\.\S+/.test(f.website.trim())) e.website = 'Start with http:// or https://';
  return e;
}

export function ClientFormDialog({ open, onClose, client, defaultCurrency, onSubmit, saving }: {
  open: boolean;
  onClose: () => void;
  client?: Client;
  defaultCurrency: Currency;
  onSubmit: (input: ClientInput) => Promise<{ error?: unknown }>;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(() => initial(client, defaultCurrency));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (open) { setForm(initial(client, defaultCurrency)); setErrors({}); setFormError(null); }
  }, [open, client, defaultCurrency]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return;
    const found = validateClientForm(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    inFlight.current = true;
    setFormError(null);
    const result = await onSubmit({
      name: form.name, legalName: form.legalName, contactEmail: form.contactEmail, phone: form.phone,
      website: form.website, billingCurrency: form.billingCurrency, retainerTier: form.retainerTier || null,
      monthlyRetainerHours: form.monthlyRetainerHours ? Number(form.monthlyRetainerHours) : null,
      contractStartDate: form.contractStartDate || undefined, accountManager: form.accountManager,
      notes: form.notes, status: form.status,
    });
    inFlight.current = false;
    if (result.error) {
      const fe = fieldErrors(result.error);
      if (Object.keys(fe).length) setErrors(fe); else setFormError(errorMessage(result.error));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} dismissible={!saving} size="lg"
      title={client ? `Edit ${client.name}` : 'New client'}
      description={client ? 'Changes are visible to everyone in this business.' : 'Add a client you work with. Name and contact email are required.'}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="client-form" loading={saving} loadingText="Saving…">{client ? 'Save changes' : 'Create client'}</Button>
        </>
      )}>
      <form id="client-form" noValidate onSubmit={submit} className="space-y-5">
        {formError && <Notice tone="error">{formError}</Notice>}
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Client name" required value={form.name} maxLength={120} onChange={e => set('name', e.target.value)} error={errors.name} />
          <TextField label="Legal name" value={form.legalName} maxLength={160} onChange={e => set('legalName', e.target.value)}
            help="Defaults to the client name." />
          <TextField label="Contact email" type="email" required value={form.contactEmail} maxLength={254}
            onChange={e => set('contactEmail', e.target.value)} error={errors.contactEmail} />
          <TextField label="Phone" type="tel" value={form.phone} maxLength={50} onChange={e => set('phone', e.target.value)} />
          <TextField label="Website" type="url" value={form.website} placeholder="https://" onChange={e => set('website', e.target.value)} error={errors.website} />
          <TextField label="Account manager" value={form.accountManager} maxLength={120} onChange={e => set('accountManager', e.target.value)}
            help="Defaults to you." />
          <SelectField label="Billing currency" value={form.billingCurrency} onChange={e => set('billingCurrency', e.target.value as Currency)}
            options={CURRENCIES.map(c => ({ value: c, label: c }))} />
          <TextField label="Contract start" type="date" value={form.contractStartDate} onChange={e => set('contractStartDate', e.target.value)}
            help="Defaults to today." />
          <SelectField label="Retainer" value={form.retainerTier} onChange={e => set('retainerTier', e.target.value as RetainerTier | '')}
            options={[{ value: '', label: 'No retainer' }, { value: 'ESSENTIAL_MAINTENANCE', label: 'Essential maintenance' },
              { value: 'PRO_GROWTH', label: 'Pro growth' }]} />
          <TextField label="Retainer hours per month" inputMode="numeric" value={form.monthlyRetainerHours}
            onChange={e => set('monthlyRetainerHours', e.target.value)} error={errors.monthlyRetainerHours} />
          {client && (
            <SelectField label="Status" value={form.status} onChange={e => set('status', e.target.value as ClientStatus)}
              options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INVITED', label: 'Invited' }, { value: 'SUSPENDED', label: 'Suspended' }]} />
          )}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="client-notes" className="block text-sm font-medium text-ink-800">Notes <span className="text-xs font-normal text-ink-400">(optional)</span></label>
          <textarea id="client-notes" rows={3} maxLength={5000} value={form.notes} onChange={e => set('notes', e.target.value)}
            className="block w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100" />
        </div>
      </form>
    </Dialog>
  );
}

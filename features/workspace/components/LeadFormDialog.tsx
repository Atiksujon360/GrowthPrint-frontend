'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Dialog } from '../../../components/ui/workspace-kit.tsx';
import { Button, Notice, SelectField, TextField } from '../../../components/ui/forms.tsx';
import {
  LEAD_SOURCE_LABEL, PIPELINE_STAGES, STAGE_LABEL, type Lead, type LeadInput, type LeadSource, type PipelineStage,
} from '../model/types.ts';
import { errorMessage, fieldErrors } from '../api/workspaceApi.ts';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  companyName: string; contactName: string; contactEmail: string; website: string; industry: string; location: string;
  source: LeadSource; pipelineStage: PipelineStage; qualificationScore: string; estimatedValue: string;
  nextAction: string; notes: string;
}

const initial = (lead?: Lead): FormState => ({
  companyName: lead?.companyName ?? '', contactName: lead?.contactName ?? '', contactEmail: lead?.contactEmail ?? '',
  website: lead?.website ?? '', industry: lead?.industry ?? '', location: lead?.location ?? '',
  source: lead?.source ?? 'INBOUND_INQUIRY', pipelineStage: lead?.pipelineStage ?? 'DISCOVERED',
  qualificationScore: lead?.qualificationScore?.toString() ?? '', estimatedValue: lead?.estimatedValue?.toString() ?? '',
  nextAction: lead?.nextAction ?? '', notes: lead?.notes ?? '',
});

export function validateLeadForm(f: Pick<FormState, 'companyName' | 'contactName' | 'contactEmail' | 'qualificationScore' | 'estimatedValue'>): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.companyName.trim()) e.companyName = 'Enter the company name.';
  if (!f.contactName.trim()) e.contactName = 'Enter a contact name.';
  if (f.contactEmail.trim() && !EMAIL.test(f.contactEmail.trim())) e.contactEmail = 'Enter a valid email address.';
  if (f.qualificationScore && (!/^\d+$/.test(f.qualificationScore) || Number(f.qualificationScore) > 100)) {
    e.qualificationScore = 'Use a whole number from 0 to 100.';
  }
  if (f.estimatedValue && !/^\d+(\.\d{1,2})?$/.test(f.estimatedValue)) e.estimatedValue = 'Use a positive amount, like 4500.';
  return e;
}

export function LeadFormDialog({ open, onClose, lead, onSubmit, saving }: {
  open: boolean; onClose: () => void; lead?: Lead;
  onSubmit: (input: LeadInput) => Promise<{ error?: unknown }>; saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(() => initial(lead));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => { if (open) { setForm(initial(lead)); setErrors({}); setFormError(null); } }, [open, lead]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return;
    const found = validateLeadForm(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    inFlight.current = true;
    setFormError(null);
    const result = await onSubmit({
      companyName: form.companyName, contactName: form.contactName, contactEmail: form.contactEmail,
      website: form.website, industry: form.industry, location: form.location, source: form.source,
      pipelineStage: lead ? undefined : form.pipelineStage,
      qualificationScore: form.qualificationScore ? Number(form.qualificationScore) : null,
      estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : null,
      nextAction: form.nextAction, notes: form.notes,
    });
    inFlight.current = false;
    if (result.error) {
      const fe = fieldErrors(result.error);
      if (Object.keys(fe).length) setErrors(fe); else setFormError(errorMessage(result.error));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} dismissible={!saving} size="lg"
      title={lead ? `Edit ${lead.companyName}` : 'New lead'}
      description={lead ? 'Change the stage from the lead page.' : 'Company and contact name are required.'}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="lead-form" loading={saving} loadingText="Saving…">{lead ? 'Save changes' : 'Create lead'}</Button>
        </>
      )}>
      <form id="lead-form" noValidate onSubmit={submit} className="space-y-5">
        {formError && <Notice tone="error">{formError}</Notice>}
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Company name" required value={form.companyName} maxLength={160} onChange={e => set('companyName', e.target.value)} error={errors.companyName} />
          <TextField label="Contact name" required value={form.contactName} maxLength={120} onChange={e => set('contactName', e.target.value)} error={errors.contactName} />
          <TextField label="Contact email" type="email" value={form.contactEmail} maxLength={254} onChange={e => set('contactEmail', e.target.value)}
            error={errors.contactEmail} help="Needed before the lead can become a client." />
          <TextField label="Website" type="url" value={form.website} placeholder="https://" onChange={e => set('website', e.target.value)} />
          <TextField label="Industry" value={form.industry} maxLength={120} onChange={e => set('industry', e.target.value)} />
          <TextField label="Location" value={form.location} maxLength={120} onChange={e => set('location', e.target.value)} />
          <SelectField label="Source" value={form.source} onChange={e => set('source', e.target.value as LeadSource)}
            options={(Object.keys(LEAD_SOURCE_LABEL) as LeadSource[]).map(s => ({ value: s, label: LEAD_SOURCE_LABEL[s] }))} />
          {!lead && (
            <SelectField label="Stage" value={form.pipelineStage} onChange={e => set('pipelineStage', e.target.value as PipelineStage)}
              options={PIPELINE_STAGES.filter(s => s !== 'WON').map(s => ({ value: s, label: STAGE_LABEL[s] }))} />
          )}
          <TextField label="Fit score (0–100)" inputMode="numeric" value={form.qualificationScore}
            onChange={e => set('qualificationScore', e.target.value)} error={errors.qualificationScore} />
          <TextField label="Estimated value" inputMode="decimal" value={form.estimatedValue}
            onChange={e => set('estimatedValue', e.target.value)} error={errors.estimatedValue} />
          <TextField label="Next action" value={form.nextAction} maxLength={200} className="sm:col-span-2"
            onChange={e => set('nextAction', e.target.value)} help="What happens next, and when." />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="lead-notes" className="block text-sm font-medium text-ink-800">Notes <span className="text-xs font-normal text-ink-400">(optional)</span></label>
          <textarea id="lead-notes" rows={3} maxLength={5000} value={form.notes} onChange={e => set('notes', e.target.value)}
            className="block w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100" />
        </div>
      </form>
    </Dialog>
  );
}

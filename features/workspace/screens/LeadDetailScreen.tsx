'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRightLeft, CheckCircle2, Lock, Pencil, Trash2 } from 'lucide-react';
import {
  useChangeLeadStageMutation, useConvertLeadMutation, useDeleteLeadMutation, useLeadQuery, useUpdateLeadMutation,
  errorMessage, errorStatus,
} from '../api/workspaceApi.ts';
import { useBusinessScope, useRouteParam } from '../components/BusinessScope.tsx';
import { LeadFormDialog } from '../components/LeadFormDialog.tsx';
import { stageTone } from './LeadsScreen.tsx';
import { conversionBlocker, CONVERSION_BLOCKER_TEXT, minimumRoleFor, ROLE_LABEL } from '../model/permissions.ts';
import { CURRENCIES, LEAD_SOURCE_LABEL, PIPELINE_STAGES, STAGE_LABEL, type Currency, type PipelineStage } from '../model/types.ts';
import { formatDate, formatMoney } from '../model/format.ts';
import { workspaceRoutes } from '../../../lib/routes.ts';
import { Button, Card, ErrorState, Notice, SelectField, Skeleton, TextField } from '../../../components/ui/forms.tsx';
import { DefinitionList, Dialog, PageHeader, StatusPill } from '../../../components/ui/workspace-kit.tsx';
import { useAppDispatch } from '../../../store/hooks.ts';
import { addToast } from '../../../store/index.ts';

export function LeadDetailScreen() {
  const { businessId, business, can } = useBusinessScope();
  const leadId = useRouteParam('leadId');
  const r = workspaceRoutes(businessId);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: lead, isLoading, error, refetch } = useLeadQuery({ businessId, leadId });
  const [updateLead, { isLoading: savingEdit }] = useUpdateLeadMutation();
  const [changeStage, { isLoading: savingStage }] = useChangeLeadStageMutation();
  const [convertLead, { isLoading: converting, error: convertError, reset: resetConvert }] = useConvertLeadMutation();
  const [deleteLead, { isLoading: deleting }] = useDeleteLeadMutation();
  const [editing, setEditing] = useState(false);
  const [confirmConvert, setConfirmConvert] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [convertForm, setConvertForm] = useState<{ legalName: string; billingCurrency: Currency }>({ legalName: '', billingCurrency: 'USD' });
  const converted = useRef(false);

  useEffect(() => {
    if (lead) setConvertForm({ legalName: lead.companyName, billingCurrency: business.currency ?? 'USD' });
  }, [lead, business.currency]);

  if (isLoading) return <div className="space-y-4" role="status" aria-label="Loading lead"><Skeleton className="h-10 w-72" /><Skeleton className="h-64" /></div>;
  if (error && errorStatus(error) === 404) return <ErrorState message="This lead doesn't exist in this business." />;
  if (error || !lead) return <ErrorState message={errorMessage(error)} onRetry={() => void refetch()} />;

  const blocker = conversionBlocker(lead);
  const isConverted = Boolean(lead.convertedClientId);
  const currency = business.currency ?? 'USD';

  const onStage = async (stage: PipelineStage) => {
    const result = await changeStage({ businessId, leadId, stage });
    if ('error' in result) dispatch(addToast({ type: 'error', title: 'Stage not changed', message: errorMessage(result.error) }));
    else dispatch(addToast({ type: 'success', message: `Moved to ${STAGE_LABEL[stage]}.` }));
  };

  const onConvert = async () => {
    if (converted.current) return; // duplicate-click guard; the service also rejects a second conversion (409)
    converted.current = true;
    const result = await convertLead({ businessId, leadId, input: convertForm });
    if ('data' in result && result.data) {
      setConfirmConvert(false);
      dispatch(addToast({ type: 'success', title: 'Lead converted', message: `${result.data.name} is now a client.` }));
      router.push(r.client(result.data.id));
    } else {
      converted.current = false;
    }
  };

  const onDelete = async () => {
    const result = await deleteLead({ businessId, leadId });
    if ('error' in result) {
      dispatch(addToast({ type: 'error', title: 'Lead not deleted', message: errorMessage(result.error) }));
      setConfirmDelete(false);
    } else {
      dispatch(addToast({ type: 'success', message: `${lead.companyName} was deleted.` }));
      router.push(r.leads);
    }
  };

  return (
    <>
      <PageHeader
        title={lead.companyName}
        description={`${lead.contactName}${lead.industry ? ` · ${lead.industry}` : ''}`}
        breadcrumb={[{ label: business.name, href: r.home }, { label: 'Leads', href: r.leads }, { label: lead.companyName }]}
        actions={(
          <>
            {can('leads.edit') && <Button variant="secondary" onClick={() => setEditing(true)} icon={<Pencil className="h-4 w-4" aria-hidden="true" />}>Edit</Button>}
            {can('leads.convert') && !isConverted && (
              <Button onClick={() => { resetConvert(); setConfirmConvert(true); }} disabled={Boolean(blocker)}
                title={blocker ? CONVERSION_BLOCKER_TEXT[blocker] : undefined}
                icon={<ArrowRightLeft className="h-4 w-4" aria-hidden="true" />}>Convert to client</Button>
            )}
          </>
        )}
      />

      {isConverted && (
        <Notice tone="success" title="Converted to a client" className="mb-6">
          This lead became a client on {formatDate(lead.convertedAt)}.{' '}
          <Link className="font-semibold underline" href={r.client(lead.convertedClientId as string)}>Open the client</Link>.
          Its stage stays Won and it can no longer be deleted, so the history is kept.
        </Notice>
      )}
      {!isConverted && blocker && can('leads.convert') && (
        <Notice tone="warning" className="mb-6">{CONVERSION_BLOCKER_TEXT[blocker]}</Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Details" className="lg:col-span-2">
          <DefinitionList items={[
            { label: 'Contact', value: lead.contactName },
            { label: 'Contact email', value: lead.contactEmail ? <a className="text-brand-700 hover:underline" href={`mailto:${lead.contactEmail}`}>{lead.contactEmail}</a> : null },
            { label: 'Website', value: lead.website },
            { label: 'Location', value: lead.location },
            { label: 'Source', value: LEAD_SOURCE_LABEL[lead.source] },
            { label: 'Fit score', value: lead.qualificationScore != null ? `${lead.qualificationScore} / 100` : null },
            { label: 'Estimated value', value: lead.estimatedValue != null ? formatMoney(lead.estimatedValue, currency) : null },
            { label: 'Next action', value: lead.nextAction },
            { label: 'Added', value: formatDate(lead.createdAt) },
            { label: 'Last updated', value: formatDate(lead.updatedAt) },
          ]} />
          {lead.notes && (
            <div className="mt-6 border-t border-ink-100 pt-4">
              <p className="text-xs font-medium text-ink-500">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink-800">{lead.notes}</p>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Pipeline stage">
            <div className="mb-4"><StatusPill tone={stageTone(lead.pipelineStage)}>{STAGE_LABEL[lead.pipelineStage]}</StatusPill></div>
            {isConverted ? (
              <p className="flex items-start gap-2 text-sm text-ink-600"><Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Locked after conversion.</p>
            ) : can('leads.edit') ? (
              <SelectField label="Move to stage" value={lead.pipelineStage} disabled={savingStage}
                onChange={e => void onStage(e.target.value as PipelineStage)}
                options={PIPELINE_STAGES.filter(s => s !== 'WON' || s === lead.pipelineStage).map(s => ({ value: s, label: STAGE_LABEL[s] }))}
                help="Use “Convert to client” to mark a lead as won." />
            ) : (
              <p className="text-sm text-ink-500">{ROLE_LABEL[minimumRoleFor('leads.edit')]}s and above can change the stage.</p>
            )}
          </Card>
          {can('leads.delete') && (
            <Card title="Delete lead">
              {isConverted ? (
                <p className="text-sm text-ink-500">Converted leads are kept for your records and can't be deleted.</p>
              ) : (
                <Button variant="danger" onClick={() => setConfirmDelete(true)} icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}>Delete lead</Button>
              )}
            </Card>
          )}
        </div>
      </div>

      <LeadFormDialog open={editing} onClose={() => setEditing(false)} lead={lead} saving={savingEdit}
        onSubmit={async input => {
          const result = await updateLead({ businessId, leadId, input });
          if ('data' in result) { setEditing(false); dispatch(addToast({ type: 'success', message: 'Lead updated.' })); return {}; }
          return { error: result.error };
        }} />

      <Dialog open={confirmConvert} onClose={() => setConfirmConvert(false)} dismissible={!converting}
        title={`Convert ${lead.companyName} to a client?`}
        description="This creates a client from this lead and marks the lead as Won. It can only be done once."
        footer={(
          <>
            <Button variant="ghost" onClick={() => setConfirmConvert(false)} disabled={converting}>Cancel</Button>
            <Button onClick={() => void onConvert()} loading={converting} loadingText="Converting…"
              icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}>Convert to client</Button>
          </>
        )}>
        <div className="space-y-5">
          {convertError && <Notice tone="error">{errorMessage(convertError)}</Notice>}
          <dl className="grid gap-3 rounded-xl bg-ink-50 p-4 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-ink-500">Client name</dt><dd className="font-medium text-ink-900">{lead.companyName}</dd></div>
            <div><dt className="text-xs text-ink-500">Contact email</dt><dd className="font-medium text-ink-900">{lead.contactEmail}</dd></div>
          </dl>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Legal name" value={convertForm.legalName} maxLength={160}
              onChange={e => setConvertForm(f => ({ ...f, legalName: e.target.value }))} />
            <SelectField label="Billing currency" value={convertForm.billingCurrency}
              onChange={e => setConvertForm(f => ({ ...f, billingCurrency: e.target.value as Currency }))}
              options={CURRENCIES.map(c => ({ value: c, label: c }))} />
          </div>
        </div>
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} dismissible={!deleting} size="sm"
        title={`Delete ${lead.companyName}?`} description="The lead and its notes are removed for everyone in this business. This can't be undone."
        footer={(
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={() => void onDelete()} loading={deleting} loadingText="Deleting…">Delete lead</Button>
          </>
        )} />
    </>
  );
}

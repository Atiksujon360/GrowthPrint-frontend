'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Check, Minus } from 'lucide-react';
import { useUpdateBusinessMutation, errorMessage, fieldErrors } from '../api/workspaceApi.ts';
import { useBusinessScope } from '../components/BusinessScope.tsx';
import { can as roleCan, minimumRoleFor, ROLE_DESCRIPTION, ROLE_LABEL, type WorkspaceAction } from '../model/permissions.ts';
import { CURRENCIES, TEAM_SIZE_LABEL, type Currency, type TeamSize } from '../model/types.ts';
import { workspaceRoutes } from '../../../lib/routes.ts';
import { useAppDispatch } from '../../../store/hooks.ts';
import { addToast } from '../../../store/index.ts';
import { Button, Card, Notice, SelectField, TextField } from '../../../components/ui/forms.tsx';
import { DefinitionList, PageHeader, StatusPill, TableShell, td, th } from '../../../components/ui/workspace-kit.tsx';

const PERMISSION_ROWS: Array<{ action: WorkspaceAction; label: string }> = [
  { action: 'clients.view', label: 'View clients' },
  { action: 'clients.create', label: 'Create and edit clients' },
  { action: 'leads.create', label: 'Add leads' },
  { action: 'leads.edit', label: 'Edit leads and change stages' },
  { action: 'leads.convert', label: 'Convert leads to clients' },
  { action: 'leads.delete', label: 'Delete leads' },
  { action: 'members.invite', label: 'Invite team members' },
  { action: 'members.manage', label: 'Change roles and remove members' },
  { action: 'business.edit', label: 'Edit business profile' },
  { action: 'ownership.transfer', label: 'Transfer ownership' },
];

interface ProfileForm { name: string; industry: string; teamSize: TeamSize | ''; website: string; currency: Currency; description: string }

export function SettingsScreen() {
  const { businessId, business, role, can } = useBusinessScope();
  const r = workspaceRoutes(businessId);
  const dispatch = useAppDispatch();
  const editable = can('business.edit');
  const [update, { isLoading }] = useUpdateBusinessMutation();
  const toForm = (): ProfileForm => ({
    name: business.name, industry: business.industry ?? '', teamSize: business.teamSize ?? '',
    website: business.website ?? '', currency: business.currency ?? 'USD', description: business.description ?? '',
  });
  const [form, setForm] = useState<ProfileForm>(toForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Re-sync when the business changes (switcher) or after a save elsewhere.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setForm(toForm()); setErrors({}); }, [business]);

  const dirty = JSON.stringify(form) !== JSON.stringify(toForm());

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    const found: Record<string, string> = {};
    if (form.name.trim().length < 2) found.name = 'Use at least 2 characters.';
    if (form.website && !/^https?:\/\/\S+\.\S+/.test(form.website.trim())) found.website = 'Start with https:// — for example https://example.com';
    setErrors(found);
    if (Object.keys(found).length) return;
    setFormError(null);
    const result = await update({
      businessId,
      input: {
        name: form.name.trim(), industry: form.industry.trim(), teamSize: form.teamSize || undefined,
        website: form.website.trim(), currency: form.currency, description: form.description.trim(),
      },
    });
    if ('error' in result) {
      const fe = fieldErrors(result.error);
      if (Object.keys(fe).length) setErrors(fe); else setFormError(errorMessage(result.error));
    } else {
      dispatch(addToast({ type: 'success', message: 'Business profile saved.' }));
    }
  };

  return (
    <>
      <PageHeader title="Settings" description="Business profile and what your role allows."
        breadcrumb={[{ label: business.name, href: r.home }, { label: 'Settings' }]} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Business profile" className="lg:col-span-2"
          description={editable ? undefined : `Only ${ROLE_LABEL[minimumRoleFor('business.edit')]}s and Owners can change the profile.`}>
          {editable ? (
            <form noValidate onSubmit={submit} className="space-y-5">
              {formError && <Notice tone="error">{formError}</Notice>}
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField label="Business name" required maxLength={120} value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} error={errors.name} />
                <TextField label="Industry" maxLength={120} value={form.industry}
                  onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
                <SelectField label="Team size" value={form.teamSize}
                  onChange={e => setForm(f => ({ ...f, teamSize: e.target.value as TeamSize | '' }))}
                  options={[{ value: '', label: 'Not set' }, ...(Object.keys(TEAM_SIZE_LABEL) as TeamSize[]).map(t => ({ value: t, label: TEAM_SIZE_LABEL[t] }))]} />
                <SelectField label="Default currency" value={form.currency}
                  onChange={e => setForm(f => ({ ...f, currency: e.target.value as Currency }))}
                  options={CURRENCIES.map(c => ({ value: c, label: c }))} help="Used for lead values and new clients." />
                <TextField label="Website" type="url" className="sm:col-span-2" placeholder="https://" value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))} error={errors.website} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="business-description" className="block text-sm font-medium text-ink-800">Description <span className="text-xs font-normal text-ink-400">(optional)</span></label>
                <textarea id="business-description" rows={3} maxLength={500} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="block w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" disabled={!dirty || isLoading} onClick={() => { setForm(toForm()); setErrors({}); }}>Discard</Button>
                <Button type="submit" disabled={!dirty} loading={isLoading} loadingText="Saving…">Save profile</Button>
              </div>
            </form>
          ) : (
            <DefinitionList items={[
              { label: 'Business name', value: business.name },
              { label: 'Industry', value: business.industry },
              { label: 'Team size', value: business.teamSize ? TEAM_SIZE_LABEL[business.teamSize] : null },
              { label: 'Default currency', value: business.currency },
              { label: 'Website', value: business.website },
              { label: 'Description', value: business.description },
            ]} />
          )}
        </Card>

        <Card title="Your role">
          <StatusPill tone="brand">{ROLE_LABEL[role]}</StatusPill>
          <p className="mt-3 text-sm text-ink-600">{ROLE_DESCRIPTION[role]}</p>
          <p className="mt-4 text-xs text-ink-500">Business address: <span className="font-mono">{business.slug}</span></p>
        </Card>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-xs">
        <TableShell caption="What each role can do">
          <thead>
            <tr>
              <th scope="col" className={th}>Permission</th>
              {(['MEMBER', 'MANAGER', 'ADMIN', 'OWNER'] as const).map(r2 => (
                <th key={r2} scope="col" className={`${th} text-center ${r2 === role ? 'text-brand-700' : ''}`}>
                  {ROLE_LABEL[r2]}{r2 === role && <span className="sr-only"> (your role)</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_ROWS.map(row => (
              <tr key={row.action}>
                <th scope="row" className={`${td} text-left text-sm font-normal text-ink-800`}>{row.label}</th>
                {(['MEMBER', 'MANAGER', 'ADMIN', 'OWNER'] as const).map(r2 => (
                  <td key={r2} className={`${td} text-center ${r2 === role ? 'bg-brand-50/60' : ''}`}>
                    {roleCan(r2, row.action)
                      ? <><Check className="mx-auto h-4 w-4 text-brand-600" aria-hidden="true" /><span className="sr-only">Allowed</span></>
                      : <><Minus className="mx-auto h-4 w-4 text-ink-300" aria-hidden="true" /><span className="sr-only">Not allowed</span></>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </TableShell>
      </div>
    </>
  );
}

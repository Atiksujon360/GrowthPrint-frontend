'use client';

import { useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { useCreateBusinessMutation, errorMessage, fieldErrors } from '../api/workspaceApi.ts';
import { slugify } from '../services/mockWorkspaceService.ts';
import { CURRENCIES, TEAM_SIZE_LABEL, type Currency, type TeamSize } from '../model/types.ts';
import { ROUTES, workspaceRoutes } from '../../../lib/routes.ts';
import { Button, Notice, SelectField, TextField } from '../../../components/ui/forms.tsx';
import { MockDataBanner } from '../components/WorkspaceShell.tsx';

const STEPS = ['Business', 'How you work', 'Review'] as const;
const INDUSTRIES = ['Software & IT services', 'Consulting', 'Cleaning & maintenance', 'Creative & marketing',
  'Health & wellness', 'Professional services', 'Retail & e-commerce', 'Other'];

interface Draft {
  name: string;
  slug: string;
  slugTouched: boolean;
  industry: string;
  teamSize: TeamSize;
  description: string;
  website: string;
  currency: Currency;
  timezone: string;
}

function detectTimezone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
}

export function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    name: '', slug: '', slugTouched: false, industry: INDUSTRIES[0], teamSize: 'SOLO', description: '',
    website: '', currency: 'USD', timezone: detectTimezone(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createBusiness, { isLoading, error }] = useCreateBusinessMutation();
  const submitted = useRef(false);
  const slug = draft.slugTouched ? draft.slug : (draft.name ? slugify(draft.name) : '');

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft(d => ({ ...d, [key]: value }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validateStep = (index: number): boolean => {
    const found: Record<string, string> = {};
    if (index === 0) {
      if (!draft.name.trim()) found.name = 'Enter your business name.';
      else if (draft.name.trim().length > 160) found.name = 'Use at most 160 characters.';
      if (draft.slugTouched && !/^[a-z0-9]([a-z0-9-]{0,78}[a-z0-9])?$/.test(draft.slug)) {
        found.slug = 'Use lowercase letters, numbers and hyphens (2–80 characters).';
      }
      if (draft.website && !/^https?:\/\/\S+\.\S+/.test(draft.website.trim())) found.website = 'Start with http:// or https://';
    }
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const next = (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) { setStep(step + 1); return; }
    void submit();
  };

  const submit = async () => {
    if (submitted.current) return;
    submitted.current = true;
    const result = await createBusiness({
      name: draft.name, slug: draft.slugTouched ? draft.slug : undefined, industry: draft.industry,
      teamSize: draft.teamSize, description: draft.description, website: draft.website,
      currency: draft.currency, timezone: draft.timezone,
    });
    if ('data' in result && result.data) {
      router.push(workspaceRoutes(result.data.id).home);
    } else {
      submitted.current = false;
      const fe = fieldErrors(result.error);
      if (Object.keys(fe).length) { setErrors(fe); setStep(0); }
    }
  };

  const summary = useMemo(() => [
    ['Business name', draft.name],
    ['Web address', `/${slug}`],
    ['Industry', draft.industry],
    ['Team size', TEAM_SIZE_LABEL[draft.teamSize]],
    ['Billing currency', draft.currency],
    ['Time zone', draft.timezone],
  ], [draft, slug]);

  return (
    <div className="min-h-screen bg-ink-50">
      <MockDataBanner />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link href={ROUTES.workspace.home} className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-700">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All businesses
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Set up your business</h1>
        <p className="mt-1 text-sm text-ink-500">Three short steps. You can change everything later in settings.</p>

        <ol className="mt-6 flex items-center gap-2" aria-label="Setup progress">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2" aria-current={i === step ? 'step' : undefined}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i < step ? 'bg-brand-600 text-white' : i === step ? 'bg-ink-900 text-white' : 'bg-ink-200 text-ink-600'}`}>
                {i < step ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span className={`hidden text-sm sm:inline ${i === step ? 'font-medium text-ink-900' : 'text-ink-500'}`}>{label}</span>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-ink-200" aria-hidden="true" />}
            </li>
          ))}
        </ol>

        <form noValidate onSubmit={next} className="mt-6 rounded-2xl border border-ink-200 bg-white p-5 shadow-xs sm:p-6">
          {error && !Object.keys(fieldErrors(error)).length && <Notice tone="error" className="mb-5">{errorMessage(error)}</Notice>}
          {step === 0 && (
            <div className="space-y-5">
              <TextField label="Business name" required value={draft.name} maxLength={160} autoFocus
                onChange={e => set('name', e.target.value)} error={errors.name} />
              <TextField label="Web address" value={slug} maxLength={80}
                onChange={e => setDraft(d => ({ ...d, slug: e.target.value.toLowerCase(), slugTouched: true }))}
                error={errors.slug} help="Used in links to your workspace. Lowercase letters, numbers and hyphens." />
              <TextField label="Website" type="url" value={draft.website} placeholder="https://"
                onChange={e => set('website', e.target.value)} error={errors.website} />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-5">
              <SelectField label="Industry" required value={draft.industry} onChange={e => set('industry', e.target.value)}
                options={INDUSTRIES.map(i => ({ value: i, label: i }))} />
              <fieldset>
                <legend className="mb-2 block text-sm font-medium text-ink-800">Team size</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.keys(TEAM_SIZE_LABEL) as TeamSize[]).map(size => (
                    <label key={size} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm ${
                      draft.teamSize === size ? 'border-brand-500 bg-brand-50 text-ink-900' : 'border-ink-200 text-ink-700 hover:bg-ink-50'}`}>
                      <input type="radio" name="teamSize" value={size} checked={draft.teamSize === size}
                        onChange={() => set('teamSize', size)} className="h-4 w-4 text-brand-600" />
                      {TEAM_SIZE_LABEL[size]}
                    </label>
                  ))}
                </div>
              </fieldset>
              <SelectField label="Billing currency" value={draft.currency} onChange={e => set('currency', e.target.value as Currency)}
                options={CURRENCIES.map(c => ({ value: c, label: c }))} help="Default currency for new clients." />
              <TextField label="What does your business do?" value={draft.description} maxLength={300}
                onChange={e => set('description', e.target.value)} help="One sentence for your team. Optional." />
            </div>
          )}
          {step === 2 && (
            <div>
              <dl className="divide-y divide-ink-100">
                {summary.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 py-2.5 text-sm">
                    <dt className="text-ink-500">{label}</dt>
                    <dd className="text-right font-medium text-ink-900">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
              <Notice tone="info" className="mt-5">You'll be the owner. You can invite teammates right after setup.</Notice>
            </div>
          )}
          <div className="mt-6 flex justify-between gap-2">
            <Button variant="ghost" disabled={step === 0 || isLoading} onClick={() => setStep(s => s - 1)}>Back</Button>
            <Button type="submit" loading={isLoading} loadingText="Creating…">
              {step === STEPS.length - 1 ? 'Create business' : 'Continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

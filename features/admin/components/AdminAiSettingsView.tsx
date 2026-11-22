import React, { useCallback, useEffect, useId, useState } from 'react';
import { Check } from 'lucide-react';
import { useAppDispatch } from '../../../store/hooks.ts';
import { addToast } from '../../../store/index.ts';
import { getErrorMessage } from '../../../lib/api/errors.ts';
import {
  aiApi,
  AI_STATUS_TEXT,
  type AiProvider,
  type AiProviderOption,
  type AiSettings,
  type UpdateAiSettingsInput
} from '../../../lib/api/ai.ts';
import { MODEL_HINT, nextStep, setupState } from '../../../lib/aiSetup.ts';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog.tsx';

const TONE_CLASS = {
  neutral: 'bg-gp-canvas text-gp-text-secondary border-gp-border',
  good: 'bg-gp-success-soft text-gp-success border-gp-success/30',
  warning: 'bg-gp-warning-soft text-gp-warning border-gp-warning/30',
  bad: 'bg-gp-danger-soft text-gp-danger border-gp-danger/30'
} as const;

function toForm(settings: AiSettings): UpdateAiSettingsInput {
  return {
    enabled: settings.enabled,
    provider: settings.provider,
    model: settings.model ?? '',
    baseUrl: settings.baseUrl ?? '',
    timeoutSeconds: settings.timeoutSeconds,
    maxOutputTokens: settings.maxOutputTokens,
    dailyRequestLimitPerUser: settings.dailyRequestLimitPerUser
  };
}

function StepHeading({ id, number, title, done }: { id: string; number: number; title: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden="true"
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${done ? 'bg-gp-primary text-gp-primary-foreground' : 'border border-gp-border bg-gp-canvas text-gp-text-secondary'}`}>
        {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : number}
      </span>
      <h3 id={id} className="text-base font-semibold text-gp-text">{title}</h3>
    </div>
  );
}

/**
 * Settings → AI providers (admin only). AI is optional: everything else in GrowthPrint works without it.
 * Three steps in order: set up the provider and key, test the connection, turn AI on. The key is typed here once and
 * sent straight to the backend; it is never kept in app state.
 */
export function AdminAiSettingsView() {
  const dispatch = useAppDispatch();
  const id = useId();
  const [providers, setProviders] = useState<AiProviderOption[]>([]);
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [form, setForm] = useState<UpdateAiSettingsInput | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<string[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [busy, setBusy] = useState<null | 'save' | 'removeKey' | 'test' | 'toggle' | 'models'>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const [providerList, current] = await Promise.all([aiApi.getProviders(), aiApi.getSettings()]);
      setProviders(providerList);
      setSettings(current);
      setForm(toForm(current));
    } catch (error) {
      setLoadError(getErrorMessage(error, 'We couldn’t load the AI settings.'));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Runs one action, shows its outcome, and refreshes the form from the server's answer. */
  const run = async (action: NonNullable<typeof busy>, task: () => Promise<AiSettings>, success: string) => {
    setBusy(action);
    setActionError(null);
    try {
      const updated = await task();
      setSettings(updated);
      setForm(toForm(updated));
      dispatch(addToast({ type: 'success', title: 'AI settings', message: success }));
      return true;
    } catch (error) {
      setActionError(getErrorMessage(error, 'That didn’t work. Please try again.'));
      return false;
    } finally {
      setBusy(null);
    }
  };

  if (loadError) {
    return (
      <div role="alert" className="flex items-center gap-3 rounded-gp-card border border-gp-danger/30 bg-gp-danger-soft p-4 text-sm text-gp-danger">
        <span>{loadError}</span>
        <button type="button" onClick={() => void load()} className="ml-auto rounded-gp-control bg-gp-surface px-3 py-1.5 text-xs font-semibold hover:bg-gp-canvas">
          Try again
        </button>
      </div>
    );
  }

  if (!settings || !form) {
    return <p role="status" className="text-sm text-gp-text-secondary">Loading AI settings…</p>;
  }

  const selected = providers.find(p => p.id === form.provider) ?? null;
  const state = setupState(settings, form, providers, apiKey);
  const step = nextStep(settings, state);
  const status = AI_STATUS_TEXT[settings.status];
  const inputClass = 'h-10 w-full rounded-gp-control border border-gp-border bg-gp-surface px-3 text-sm text-gp-text placeholder:text-gp-text-muted focus:border-gp-primary focus:outline-none focus:ring-2 focus:ring-gp-primary/20 disabled:bg-gp-canvas disabled:text-gp-text-muted';
  const primaryButton = 'inline-flex h-10 items-center justify-center rounded-gp-control bg-gp-primary px-4 text-sm font-semibold text-gp-primary-foreground hover:bg-gp-primary-hover disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gp-primary';
  const secondaryButton = 'inline-flex h-10 items-center justify-center rounded-gp-control border border-gp-border bg-gp-surface px-4 text-sm font-semibold text-gp-text hover:bg-gp-canvas disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gp-primary';
  const setupDone = settings.apiKeyConfigured && !settings.keyUnreadable && !state.hasUnsavedChanges && Boolean(settings.provider && settings.model);
  const testDone = setupDone && settings.status === 'CONNECTED';

  const doSave = async (confirmKeyReset: boolean) => {
    const ok = await run('save', async () => {
      // A changed connection switches AI off until it has been tested again; the server enforces this too.
      let updated = await aiApi.updateSettings({
        ...form,
        enabled: state.connectionChanged ? false : settings.enabled,
        confirmKeyReset
      });
      if (apiKey.trim()) {
        try {
          updated = await aiApi.setApiKey(apiKey.trim());
        } catch (error) {
          // The settings were saved even though the key was not: show the real state, then report the problem.
          const current = await aiApi.getSettings().catch(() => updated);
          setSettings(current);
          setForm(toForm(current));
          throw error;
        }
      }
      return updated;
    }, state.hasUnsavedKey ? 'Settings and API key saved.' : 'Your AI settings have been saved.');
    if (ok) setApiKey('');
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (state.keyWouldBeDiscarded) {
      setConfirmDiscard(true); // the saved key would be removed: ask first
      return;
    }
    void doSave(false);
  };

  const loadModels = async () => {
    setBusy('models');
    setActionError(null);
    try {
      setModels(await aiApi.listModels());
    } catch (error) {
      setActionError(getErrorMessage(error, 'We couldn’t load the model list. You can still type a model ID.'));
    } finally {
      setBusy(null);
    }
  };

  const keyPlaceholder = !form.provider ? 'Choose a provider first'
    : settings.apiKeyConfigured && !state.keyWouldBeDiscarded ? 'Paste a new key to replace the saved one'
    : 'Paste the API key';

  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-sm text-gp-text-secondary">
        Choose which AI service GrowthPrint uses for suggestions. AI is optional. Everything else keeps working when it’s off.
      </p>

      <section aria-label="Current status" className="space-y-2 rounded-gp-card border border-gp-border bg-gp-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gp-text">
            {settings.enabled ? 'AI suggestions are on' : 'AI suggestions are off'}
          </p>
          <span className={`rounded-gp-control border px-2.5 py-1 text-xs font-semibold ${TONE_CLASS[status.tone]}`} role="status">
            {status.label}
          </span>
        </div>
        {(settings.lastTestAt || settings.lastTestMessage) && (
          <p className="text-xs text-gp-text-secondary">
            {settings.lastTestAt && `Last connection test: ${new Date(settings.lastTestAt).toLocaleString()}. `}
            {settings.lastTestMessage}
          </p>
        )}
        {!settings.encryptionConfigured && (
          <p className="rounded-gp-control border border-gp-warning/30 bg-gp-warning-soft px-3 py-2 text-xs text-gp-warning">
            API keys can’t be saved yet. The server needs the AI_CREDENTIALS_ENCRYPTION_KEY setting first (a base64 value of 32 random bytes).
          </p>
        )}
        {settings.keyUnreadable && settings.encryptionConfigured && (
          <p className="rounded-gp-control border border-gp-danger/30 bg-gp-danger-soft px-3 py-2 text-xs text-gp-danger">
            The saved API key can’t be read with this server’s encryption key. It may have been changed. Enter the API key again in step 1.
          </p>
        )}
      </section>

      {/* Step 1 */}
      <form onSubmit={save} aria-labelledby={`${id}-s1`} className="space-y-4 rounded-gp-card border border-gp-border bg-gp-surface p-5">
        <StepHeading id={`${id}-s1`} number={1} title="Set up the provider" done={setupDone} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-provider-select`} className="mb-1 block text-xs font-medium text-gp-text">Provider</label>
            <select id={`${id}-provider-select`} className={inputClass} value={form.provider ?? ''}
              onChange={e => setForm({ ...form, provider: (e.target.value || null) as AiProvider | null })}>
              <option value="">Choose a provider…</option>
              {providers.map(p => <option key={p.id} value={p.id}>{p.displayName}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-model`} className="mb-1 block text-xs font-medium text-gp-text">Model ID</label>
            <input id={`${id}-model`} className={inputClass} value={form.model} list={models ? `${id}-models` : undefined}
              placeholder="Model name" autoComplete="off" spellCheck={false}
              onChange={e => setForm({ ...form, model: e.target.value })} />
            {models && (
              <datalist id={`${id}-models`}>
                {models.map(m => <option key={m} value={m} />)}
              </datalist>
            )}
            {form.provider && <p className="mt-1 text-xs text-gp-text-muted">{MODEL_HINT[form.provider]}</p>}
            {settings.apiKeyConfigured && !settings.keyUnreadable && !state.hasUnsavedChanges && selected?.supportsModelListing && (
              <button type="button" onClick={() => void loadModels()} disabled={busy !== null}
                className="mt-1 text-xs font-semibold text-gp-primary-strong hover:underline disabled:opacity-50">
                {busy === 'models' ? 'Loading models…' : 'Show models available to this key'}
              </button>
            )}
          </div>
        </div>

        {selected?.requiresBaseUrl && (
          <div>
            <label htmlFor={`${id}-base-url`} className="mb-1 block text-xs font-medium text-gp-text">Base URL</label>
            <input id={`${id}-base-url`} className={inputClass} value={form.baseUrl} placeholder="https://your-endpoint.example.com/v1"
              inputMode="url" autoComplete="off" onChange={e => setForm({ ...form, baseUrl: e.target.value })} />
            <p className="mt-1 text-xs text-gp-text-muted">Must be a public https:// address. Private and local addresses are blocked.</p>
          </div>
        )}

        <div>
          <label htmlFor={`${id}-key-input`} className="mb-1 block text-xs font-medium text-gp-text">API key</label>
          <input id={`${id}-key-input`} type="password" autoComplete="off" spellCheck={false} className={inputClass}
            value={apiKey} placeholder={keyPlaceholder}
            disabled={!form.provider || !settings.encryptionConfigured}
            onChange={e => setApiKey(e.target.value)} />
          <p className="mt-1 text-xs text-gp-text-muted">
            {settings.apiKeyConfigured && !state.keyWouldBeDiscarded
              ? `A key is saved (${settings.apiKeyMasked}). It’s stored encrypted and never shown again.`
              : 'Stored encrypted and never shown again.'}
          </p>
          {state.keyWouldBeDiscarded && (
            <p className="mt-1 text-xs text-gp-warning">
              Saving this change removes the current API key. Paste the new one here to save both at once.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor={`${id}-timeout`} className="mb-1 block text-xs font-medium text-gp-text">Timeout (seconds)</label>
            <input id={`${id}-timeout`} type="number" min={5} max={120} className={inputClass} value={form.timeoutSeconds}
              onChange={e => setForm({ ...form, timeoutSeconds: Number(e.target.value) })} />
          </div>
          <div>
            <label htmlFor={`${id}-tokens`} className="mb-1 block text-xs font-medium text-gp-text">Max output tokens</label>
            <input id={`${id}-tokens`} type="number" min={64} max={8000} className={inputClass} value={form.maxOutputTokens}
              onChange={e => setForm({ ...form, maxOutputTokens: Number(e.target.value) })} />
          </div>
          <div>
            <label htmlFor={`${id}-limit`} className="mb-1 block text-xs font-medium text-gp-text">Requests per person per day</label>
            <input id={`${id}-limit`} type="number" min={1} max={10000} className={inputClass} value={form.dailyRequestLimitPerUser}
              onChange={e => setForm({ ...form, dailyRequestLimitPerUser: Number(e.target.value) })} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gp-text-secondary">
            {state.connectionChanged && settings.enabled ? 'Saving these changes turns AI off until you test the connection again.' : ''}
          </p>
          <div className="flex gap-2">
            {settings.apiKeyConfigured && (
              <button type="button" disabled={busy !== null}
                onClick={() => void run('removeKey', () => aiApi.removeApiKey(), 'The API key was removed and AI is now off.')}
                className="inline-flex h-10 items-center rounded-gp-control border border-gp-danger/30 px-4 text-sm font-semibold text-gp-danger hover:bg-gp-danger-soft disabled:opacity-50">
                {busy === 'removeKey' ? 'Removing…' : 'Remove key'}
              </button>
            )}
            <button type="submit" disabled={busy !== null || !form.provider || !state.hasUnsavedChanges && !formLimitsChanged(settings, form)} className={primaryButton}>
              {busy === 'save' ? 'Saving…' : state.hasUnsavedKey ? 'Save settings and key' : 'Save settings'}
            </button>
          </div>
        </div>
      </form>

      {/* Step 2 */}
      <section aria-labelledby={`${id}-s2`} className="space-y-3 rounded-gp-card border border-gp-border bg-gp-surface p-5">
        <StepHeading id={`${id}-s2`} number={2} title="Test the connection" done={testDone} />
        <p className="text-xs text-gp-text-secondary">
          Sends one very small request to the provider to check the key and model. Providers may count it towards your usage.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gp-text-secondary">{!step.canTest ? step.hint : ''}</p>
          <button type="button" disabled={busy !== null || !step.canTest}
            onClick={() => void run('test', () => aiApi.testConnection(), 'Connection test finished.')}
            className={secondaryButton}>
            {busy === 'test' ? 'Testing…' : 'Test connection'}
          </button>
        </div>
      </section>

      {/* Step 3 */}
      <section aria-labelledby={`${id}-s3`} className="space-y-3 rounded-gp-card border border-gp-border bg-gp-surface p-5">
        <StepHeading id={`${id}-s3`} number={3} title="Turn on AI suggestions" done={settings.enabled} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gp-text-secondary">
            {settings.enabled
              ? 'Suggestions appear for support requests. A person reviews every one before anything changes.'
              : step.canTurnOn ? 'The connection works. You can turn AI on.' : step.hint}
          </p>
          {settings.enabled ? (
            <button type="button" disabled={busy !== null} className={secondaryButton}
              onClick={() => void run('toggle', () => aiApi.updateSettings({ ...toForm(settings), enabled: false }), 'AI suggestions are now off.')}>
              {busy === 'toggle' ? 'Turning off…' : 'Turn off'}
            </button>
          ) : (
            <button type="button" disabled={busy !== null || !step.canTurnOn} className={primaryButton}
              onClick={() => void run('toggle', () => aiApi.updateSettings({ ...toForm(settings), enabled: true }), 'AI suggestions are now on.')}>
              {busy === 'toggle' ? 'Turning on…' : 'Turn on'}
            </button>
          )}
        </div>
      </section>

      {actionError && (
        <p role="alert" className="rounded-gp-control border border-gp-danger/30 bg-gp-danger-soft px-3 py-2 text-sm text-gp-danger">{actionError}</p>
      )}

      <section className="space-y-1 rounded-gp-card border border-gp-border bg-gp-canvas p-4 text-xs text-gp-text-secondary">
        <h3 className="text-sm font-semibold text-gp-text">What gets sent to the AI provider</h3>
        <p>
          Only what a feature needs. Support suggestions send the request’s title, description, category, impact and urgency,
          never client names, internal notes, invoices or payments. Suggestions are always shown to you first; nothing is changed
          or sent to a client automatically.
        </p>
      </section>

      <ConfirmDialog
        isOpen={confirmDiscard}
        title="Remove the saved API key?"
        description="Changing the provider or endpoint removes the API key that is saved now, because a key only works with the service it came from. Paste the new key in the same step to replace it."
        confirmLabel="Remove key and save"
        variant="warning"
        isLoading={busy === 'save'}
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => { setConfirmDiscard(false); void doSave(true); }}
      />
    </div>
  );
}

/** True when only the limits (timeout, tokens, daily limit) differ from what is saved. */
function formLimitsChanged(saved: AiSettings, form: UpdateAiSettingsInput): boolean {
  return saved.timeoutSeconds !== form.timeoutSeconds
    || saved.maxOutputTokens !== form.maxOutputTokens
    || saved.dailyRequestLimitPerUser !== form.dailyRequestLimitPerUser;
}

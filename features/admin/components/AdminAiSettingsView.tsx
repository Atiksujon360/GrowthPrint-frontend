import React, { useCallback, useEffect, useId, useState } from 'react';
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

const TONE_CLASS = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  good: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  bad: 'bg-rose-50 text-rose-800 border-rose-200'
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

/**
 * Settings → AI providers (admin only). AI is optional: everything else in GrowthPrint works without it.
 * The API key is typed here once and sent straight to the backend; it is never kept in app state.
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
  const [busy, setBusy] = useState<null | 'save' | 'key' | 'removeKey' | 'test' | 'models'>(null);

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
      <div role="alert" className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-3">
        <span>{loadError}</span>
        <button type="button" onClick={() => void load()} className="ml-auto px-3 py-1.5 bg-rose-100 hover:bg-rose-200 rounded-lg text-xs font-semibold">
          Try again
        </button>
      </div>
    );
  }

  if (!settings || !form) {
    return <p role="status" className="text-sm text-slate-500">Loading AI settings…</p>;
  }

  const selected = providers.find(p => p.id === form.provider) ?? null;
  const providerChanged = form.provider !== settings.provider;
  const status = AI_STATUS_TEXT[settings.status];
  const inputClass = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-50';
  const canEnable = Boolean(settings.provider && settings.model && settings.apiKeyConfigured) && !providerChanged;

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    void run('save', () => aiApi.updateSettings(form), 'Your AI settings have been saved.');
  };

  const saveKey = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!apiKey.trim()) return;
    const ok = await run('key', () => aiApi.setApiKey(apiKey.trim()), 'The API key has been saved securely.');
    if (ok) setApiKey('');
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

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI providers</h2>
        <p className="text-sm text-slate-600 mt-1">
          Choose which AI service GrowthPrint uses for suggestions. AI is optional — everything else keeps working when it’s off.
        </p>
      </div>

      <section aria-labelledby={`${id}-status`} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id={`${id}-status`} className="text-sm font-semibold text-slate-900">Status</h3>
          <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${TONE_CLASS[status.tone]}`} role="status">
            {status.label}
          </span>
        </div>
        <p className="text-xs text-slate-600">
          {settings.enabled ? 'AI suggestions are switched on.' : 'AI suggestions are switched off.'}
          {settings.lastTestAt && ` Last connection test: ${new Date(settings.lastTestAt).toLocaleString()}.`}
          {settings.lastTestMessage && ` ${settings.lastTestMessage}`}
        </p>
        {!settings.encryptionConfigured && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            API keys can’t be saved yet: the server needs the AI_CREDENTIALS_ENCRYPTION_KEY setting first.
          </p>
        )}
      </section>

      <form onSubmit={save} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4" aria-labelledby={`${id}-provider`}>
        <h3 id={`${id}-provider`} className="text-sm font-semibold text-slate-900">Provider and model</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${id}-provider-select`} className="block text-xs font-medium text-slate-700 mb-1">Provider</label>
            <select id={`${id}-provider-select`} className={inputClass} value={form.provider ?? ''}
              onChange={e => setForm({ ...form, provider: (e.target.value || null) as AiProvider | null, enabled: false })}>
              <option value="">Choose a provider…</option>
              {providers.map(p => <option key={p.id} value={p.id}>{p.displayName}</option>)}
            </select>
            {providerChanged && settings.apiKeyConfigured && (
              <p className="mt-1 text-[11px] text-amber-800">Saving a different provider removes the current API key.</p>
            )}
          </div>
          <div>
            <label htmlFor={`${id}-model`} className="block text-xs font-medium text-slate-700 mb-1">Model ID</label>
            <input id={`${id}-model`} className={inputClass} value={form.model} list={models ? `${id}-models` : undefined}
              placeholder="e.g. the model name from your provider" autoComplete="off" spellCheck={false}
              onChange={e => setForm({ ...form, model: e.target.value })} />
            {models && (
              <datalist id={`${id}-models`}>
                {models.map(m => <option key={m} value={m} />)}
              </datalist>
            )}
            {settings.apiKeyConfigured && !providerChanged && selected?.supportsModelListing && (
              <button type="button" onClick={() => void loadModels()} disabled={busy !== null}
                className="mt-1 text-[11px] font-semibold text-blue-700 hover:underline disabled:opacity-50">
                {busy === 'models' ? 'Loading models…' : 'Show models available to this key'}
              </button>
            )}
          </div>
        </div>

        {selected?.requiresBaseUrl && (
          <div>
            <label htmlFor={`${id}-base-url`} className="block text-xs font-medium text-slate-700 mb-1">Base URL</label>
            <input id={`${id}-base-url`} className={inputClass} value={form.baseUrl} placeholder="https://your-endpoint.example.com/v1"
              inputMode="url" autoComplete="off" onChange={e => setForm({ ...form, baseUrl: e.target.value })} />
            <p className="mt-1 text-[11px] text-slate-500">Must use https:// (plain http is only allowed for localhost).</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor={`${id}-timeout`} className="block text-xs font-medium text-slate-700 mb-1">Timeout (seconds)</label>
            <input id={`${id}-timeout`} type="number" min={5} max={120} className={inputClass} value={form.timeoutSeconds}
              onChange={e => setForm({ ...form, timeoutSeconds: Number(e.target.value) })} />
          </div>
          <div>
            <label htmlFor={`${id}-tokens`} className="block text-xs font-medium text-slate-700 mb-1">Max output tokens</label>
            <input id={`${id}-tokens`} type="number" min={64} max={8000} className={inputClass} value={form.maxOutputTokens}
              onChange={e => setForm({ ...form, maxOutputTokens: Number(e.target.value) })} />
          </div>
          <div>
            <label htmlFor={`${id}-limit`} className="block text-xs font-medium text-slate-700 mb-1">Requests per person per day</label>
            <input id={`${id}-limit`} type="number" min={1} max={10000} className={inputClass} value={form.dailyRequestLimitPerUser}
              onChange={e => setForm({ ...form, dailyRequestLimitPerUser: Number(e.target.value) })} />
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-800">
          <input type="checkbox" className="mt-1" checked={form.enabled} disabled={!canEnable && !form.enabled}
            onChange={e => setForm({ ...form, enabled: e.target.checked })} />
          <span>
            Turn on AI suggestions
            {!canEnable && !form.enabled && (
              <span className="block text-[11px] text-slate-500">Save a provider, model and API key first.</span>
            )}
          </span>
        </label>

        <div className="flex justify-end">
          <button type="submit" disabled={busy !== null}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 min-h-[40px]">
            {busy === 'save' ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>

      <form onSubmit={saveKey} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3" aria-labelledby={`${id}-key`}>
        <h3 id={`${id}-key`} className="text-sm font-semibold text-slate-900">API key</h3>
        <p className="text-xs text-slate-600">
          {settings.apiKeyConfigured
            ? `A key is saved (${settings.apiKeyMasked}). It’s stored encrypted and never shown again — paste a new one to replace it.`
            : 'Paste the API key from your provider’s dashboard. It’s stored encrypted and never shown again.'}
        </p>
        <label htmlFor={`${id}-key-input`} className="sr-only">API key</label>
        <input id={`${id}-key-input`} type="password" autoComplete="off" spellCheck={false} className={inputClass}
          value={apiKey} placeholder={settings.provider ? 'Paste the API key' : 'Choose and save a provider first'}
          disabled={!settings.provider || providerChanged || !settings.encryptionConfigured}
          onChange={e => setApiKey(e.target.value)} />
        <div className="flex flex-wrap justify-end gap-2">
          {settings.apiKeyConfigured && (
            <button type="button" disabled={busy !== null}
              onClick={() => void run('removeKey', () => aiApi.removeApiKey(), 'The API key was removed and AI is now off.')}
              className="px-3 py-2 text-sm font-semibold text-rose-700 border border-rose-200 hover:bg-rose-50 rounded-lg disabled:opacity-50 min-h-[40px]">
              {busy === 'removeKey' ? 'Removing…' : 'Remove key'}
            </button>
          )}
          <button type="submit" disabled={busy !== null || !apiKey.trim()}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 min-h-[40px]">
            {busy === 'key' ? 'Saving…' : settings.apiKeyConfigured ? 'Replace key' : 'Save key'}
          </button>
        </div>
      </form>

      <section aria-labelledby={`${id}-test`} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h3 id={`${id}-test`} className="text-sm font-semibold text-slate-900">Connection test</h3>
        <p className="text-xs text-slate-600">
          Sends one very small request to the provider to check the key and model. Providers may count it towards your usage.
        </p>
        <div className="flex justify-end">
          <button type="button" disabled={busy !== null || !settings.apiKeyConfigured || providerChanged}
            onClick={() => void run('test', () => aiApi.testConnection(), 'Connection test finished.')}
            className="px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-lg disabled:opacity-50 min-h-[40px]">
            {busy === 'test' ? 'Testing…' : 'Test connection'}
          </button>
        </div>
      </section>

      {actionError && (
        <p role="alert" className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{actionError}</p>
      )}

      <section className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-900">What gets sent to the AI provider</h3>
        <p>
          Only what a feature needs. Support suggestions send the request’s title, description, category, impact and urgency —
          never client names, internal notes, invoices or payments. Suggestions are always shown to you first; nothing is changed
          or sent to a client automatically.
        </p>
      </section>
    </div>
  );
}

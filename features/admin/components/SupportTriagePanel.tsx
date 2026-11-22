import React, { useEffect, useId, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { aiApi, aiErrorCode, type SupportTriageSuggestion } from '../../../lib/api/ai.ts';
import { getErrorMessage } from '../../../lib/api/errors.ts';
import type { SupportCategory } from '../../../types/agency.ts';

const CATEGORY_LABEL: Record<SupportTriageSuggestion['category'], string> = {
  INCLUDED_SUPPORT: 'Included support',
  PAID_AD_HOC_SUPPORT: 'Paid ad-hoc support',
  NEW_PROJECT: 'New project',
  WARRANTY_OR_DEFECT_REVIEW: 'Warranty / defect review'
};

interface SupportTriagePanelProps {
  requestId: string;
  /** Fills the classification form; the admin still reviews and saves it. */
  onUseCategory: (category: SupportCategory) => void;
}

/**
 * "Suggest with AI" for one support request. Everything shown is an AI suggestion: nothing is saved or sent.
 * When AI is off or not set up, the panel says so instead of failing.
 */
export function SupportTriagePanel({ requestId, onUseCategory }: SupportTriagePanelProps) {
  const id = useId();
  const [suggestion, setSuggestion] = useState<SupportTriageSuggestion | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // A suggestion belongs to one request: clear it when the admin opens another.
  useEffect(() => {
    setSuggestion(null);
    setDraft('');
    setError(null);
    setIsUnavailable(false);
    setCopied(false);
  }, [requestId]);

  const suggest = async () => {
    setIsLoading(true);
    setError(null);
    setIsUnavailable(false);
    try {
      const result = await aiApi.suggestSupportTriage(requestId);
      setSuggestion(result);
      setDraft(result.replyDraft);
    } catch (err) {
      const code = aiErrorCode(err);
      setIsUnavailable(code === 'AI_DISABLED' || code === 'NOT_CONFIGURED' || code === 'KEY_MISSING');
      setError(getErrorMessage(err, 'We couldn’t get a suggestion right now. You can carry on without it.'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section aria-labelledby={`${id}-title`} className="pt-2 border-t border-gp-divider space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 id={`${id}-title`} className="text-xs font-bold text-gp-text">AI suggestion</h4>
        <button
          type="button"
          onClick={() => void suggest()}
          disabled={isLoading}
          className="px-2.5 py-1 text-xs font-semibold text-gp-primary-strong border border-gp-primary/30 hover:bg-gp-primary-soft rounded-md flex items-center gap-1 disabled:opacity-50 min-h-[32px]"
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          {isLoading ? 'Thinking…' : suggestion ? 'Suggest again' : 'Suggest with AI'}
        </button>
      </div>

      {error && (
        <p role="alert" className={`text-xs rounded-lg px-3 py-2 border ${isUnavailable
          ? 'text-gp-text bg-gp-canvas border-gp-border'
          : 'text-gp-danger bg-gp-danger-soft border-gp-danger/30'}`}>
          {error}
        </p>
      )}

      {suggestion && (
        <div className="rounded-xl border border-gp-primary/30 bg-gp-primary-soft/40 p-3 space-y-2 text-xs text-gp-text">
          <p className="text-xs font-semibold text-gp-primary-strong">
            AI-generated · {suggestion.provider} {suggestion.model} · review before using
          </p>
          <dl className="grid grid-cols-3 gap-2">
            <div>
              <dt className="text-xs text-gp-text-muted">Category</dt>
              <dd className="font-medium">{CATEGORY_LABEL[suggestion.category]}</dd>
            </div>
            <div>
              <dt className="text-xs text-gp-text-muted">Urgency</dt>
              <dd className="font-medium">{suggestion.urgency === 'URGENT' ? 'Urgent' : 'Normal'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gp-text-muted">Impact</dt>
              <dd className="font-medium">{suggestion.businessImpact.replace('_', ' ').toLowerCase()}</dd>
            </div>
          </dl>
          <p><span className="font-semibold">Summary: </span>{suggestion.summary}</p>
          <button
            type="button"
            onClick={() => onUseCategory(suggestion.category)}
            className="px-2.5 py-1 text-xs font-semibold text-gp-text border border-gp-border bg-gp-surface hover:bg-gp-canvas rounded-md min-h-[32px]"
          >
            Use this category
          </button>

          <div>
            <label htmlFor={`${id}-draft`} className="block text-xs font-semibold text-gp-text mb-1">
              Reply draft (AI-generated — edit before sending)
            </label>
            <textarea
              id={`${id}-draft`}
              rows={4}
              value={draft}
              onChange={e => { setDraft(e.target.value); setCopied(false); }}
              className="w-full px-3 py-2 text-xs border border-gp-border rounded-lg bg-gp-surface focus:outline-none focus:ring-2 focus:ring-gp-primary/30"
            />
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className="text-xs text-gp-text-muted" role="status">{copied ? 'Copied' : ''}</span>
              <button
                type="button"
                onClick={() => void copyDraft()}
                className="px-2.5 py-1 text-xs font-semibold text-gp-text border border-gp-border bg-gp-surface hover:bg-gp-canvas rounded-md min-h-[32px]"
              >
                Copy draft
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

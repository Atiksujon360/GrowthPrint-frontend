import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner.tsx';

export function LoadingState({ label = 'Loading data' }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-3 rounded-2xl border border-gp-border bg-gp-surface p-8 text-sm text-gp-text-secondary" role="status" aria-live="polite">
      <LoadingSpinner label={label} />
      <span>{label}</span>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'We could not load this view', message = 'Please try again. If the problem continues, contact your account owner.', onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-gp-danger/30 bg-gp-danger-soft p-6 text-center" role="alert">
      <AlertCircle className="mx-auto h-6 w-6 text-gp-danger" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-bold text-gp-text">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-gp-text-secondary">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gp-danger px-3 py-2 text-xs font-semibold text-gp-danger-foreground transition-colors hover:bg-gp-danger/90">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Optional decorative illustration from /public/illustrations (e.g. /illustrations/empty/empty-projects.webp). */
  illustration?: string;
}

export function EmptyState({ title, message, actionLabel, onAction, illustration }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gp-border bg-gp-surface px-6 py-10 text-center">
      {illustration ? (
        // eslint-disable-next-line @next/next/no-img-element -- decorative brand illustration, small WebP
        <img src={illustration} alt="" aria-hidden="true" width={160} height={160}
          className="mx-auto mb-5 h-36 w-36 object-contain" loading="lazy" decoding="async" />
      ) : (
        <Inbox className="mx-auto h-7 w-7 text-gp-text-muted" aria-hidden="true" />
      )}
      <h3 className="text-sm font-bold text-gp-text">{title}</h3>
      {message && <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-gp-text-secondary">{message}</p>}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="mt-4 rounded-lg bg-gp-primary px-3 py-2 text-xs font-semibold text-gp-primary-foreground transition-colors hover:bg-gp-primary-hover">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

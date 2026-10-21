import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner.tsx';

export function LoadingState({ label = 'Loading data' }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500" role="status" aria-live="polite">
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
    <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center" role="alert">
      <AlertCircle className="mx-auto h-6 w-6 text-rose-600" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-bold text-rose-950">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-rose-800/80">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-800">
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
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <Inbox className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-bold text-slate-900">{title}</h3>
      {message && <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">{message}</p>}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="mt-4 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

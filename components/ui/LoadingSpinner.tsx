import { LoaderCircle } from 'lucide-react';

export type LoadingSpinnerSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<LoadingSpinnerSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-8 w-8'
};

interface LoadingSpinnerProps {
  size?: LoadingSpinnerSize;
  label?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', label = 'Loading', className = '' }: LoadingSpinnerProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} role="status" aria-live="polite">
      <LoaderCircle className={`${SIZE_CLASSES[size]} animate-spin`} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageLoading({ label = 'Loading workspace' }: { label?: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-2xl border border-gp-border bg-gp-surface p-8 text-sm text-gp-text-secondary" role="status" aria-live="polite">
      <LoadingSpinner size="lg" label={label} />
      <span className="ml-3">{label}</span>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`block animate-pulse rounded-lg bg-gp-surface-secondary ${className}`} aria-hidden="true" />;
}

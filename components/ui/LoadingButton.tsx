import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner.tsx';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

export function LoadingButton({ loading = false, loadingLabel = 'Loading', disabled, children, ...props }: LoadingButtonProps) {
  return (
    <button {...props} type={props.type ?? 'button'} disabled={disabled || loading} aria-busy={loading || undefined}>
      {loading ? <><LoadingSpinner size="sm" label={loadingLabel} /><span>{loadingLabel}</span></> : children}
    </button>
  );
}

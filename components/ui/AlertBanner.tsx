import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertBannerProps {
  variant?: AlertVariant;
  title: string;
  message?: string;
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
}

const VARIANT_STYLES: Record<AlertVariant, { container: string; icon: typeof Info; iconClass: string; actionClass: string }> = {
  info: { container: 'border-blue-200 bg-blue-50 text-blue-950', icon: Info, iconClass: 'text-blue-600', actionClass: 'text-blue-700 hover:text-blue-800' },
  success: { container: 'border-emerald-200 bg-emerald-50 text-emerald-950', icon: CheckCircle2, iconClass: 'text-emerald-600', actionClass: 'text-emerald-700 hover:text-emerald-800' },
  warning: { container: 'border-amber-200 bg-amber-50 text-amber-950', icon: AlertTriangle, iconClass: 'text-amber-600', actionClass: 'text-amber-800 hover:text-amber-900' },
  error: { container: 'border-rose-200 bg-rose-50 text-rose-950', icon: AlertCircle, iconClass: 'text-rose-600', actionClass: 'text-rose-700 hover:text-rose-800' }
};

export function AlertBanner({ variant = 'info', title, message, onDismiss, action }: AlertBannerProps) {
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.icon;

  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles.container}`} role={variant === 'error' ? 'alert' : 'status'}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${styles.iconClass}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="font-bold">{title}</div>
        {message && <div className="mt-0.5 text-xs leading-5 opacity-80">{message}</div>}
      </div>
      {action && <button type="button" onClick={action.onClick} className={`shrink-0 text-xs font-bold underline hover:no-underline ${styles.actionClass}`}>{action.label}</button>}
      {onDismiss && <button type="button" onClick={onDismiss} aria-label="Dismiss alert" className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:bg-black/5 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>}
    </div>
  );
}

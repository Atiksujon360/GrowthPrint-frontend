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
  info: { container: 'border-gp-info/30 bg-gp-info-soft text-gp-text', icon: Info, iconClass: 'text-gp-info', actionClass: 'text-gp-info hover:text-gp-text' },
  success: { container: 'border-gp-success/30 bg-gp-success-soft text-gp-text', icon: CheckCircle2, iconClass: 'text-gp-success', actionClass: 'text-gp-success hover:text-gp-text' },
  warning: { container: 'border-gp-warning/30 bg-gp-warning-soft text-gp-text', icon: AlertTriangle, iconClass: 'text-gp-warning', actionClass: 'text-gp-warning hover:text-gp-text' },
  error: { container: 'border-gp-danger/30 bg-gp-danger-soft text-gp-text', icon: AlertCircle, iconClass: 'text-gp-danger', actionClass: 'text-gp-danger hover:text-gp-text' }
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
      {onDismiss && <button type="button" onClick={onDismiss} aria-label="Dismiss alert" className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:bg-gp-text/10 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>}
    </div>
  );
}

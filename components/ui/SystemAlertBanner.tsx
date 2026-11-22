import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { dismissSystemAlert } from '../../store/index.ts';
import { AlertCircle, AlertTriangle, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { useAttention } from '../../hooks/useAttention.ts';

interface SystemAlertBannerProps {
  onNavigateTab?: (tab: string) => void;
}

export function SystemAlertBanner({ onNavigateTab }: SystemAlertBannerProps) {
  const dispatch = useAppDispatch();
  const storedAlert = useAppSelector(state => state.ui.systemAlert);
  const isDismissed = useAppSelector(state => state.ui.isSystemAlertDismissed);
  const { retainerAlert } = useAttention();

  // A banner computed from real data wins; the stored one only exists in demo mode.
  const alert = retainerAlert ?? (storedAlert && !isDismissed ? storedAlert : null);
  if (!alert) return null;

  const styles = {
    info: {
      container: 'bg-gp-info-soft border-gp-info/30 text-gp-text',
      icon: <AlertCircle className="w-4 h-4 text-gp-info shrink-0" />,
      action: 'text-gp-info hover:underline'
    },
    warning: {
      container: 'bg-gp-warning-soft border-gp-warning/30 text-gp-text',
      icon: <AlertTriangle className="w-4 h-4 text-gp-warning shrink-0" />,
      action: 'text-gp-warning hover:underline'
    },
    success: {
      container: 'bg-gp-success-soft border-gp-success/30 text-gp-text',
      icon: <CheckCircle2 className="w-4 h-4 text-gp-success shrink-0" />,
      action: 'text-gp-success hover:underline'
    }
  }[alert.type || 'info'];

  const handleAction = () => {
    if (alert.actionTab && onNavigateTab) {
      onNavigateTab(alert.actionTab);
    }
  };

  return (
    <div className={`px-4 py-2.5 border-b text-xs flex items-center justify-between gap-4 transition-colors ${styles.container}`}>
      <div className="flex items-center gap-2.5 min-w-0">
        {styles.icon}
        <div className="truncate">
          <strong className="font-bold">{alert.title}: </strong>
          <span className="opacity-90">{alert.message}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {alert.actionLabel && (
          <button
            onClick={handleAction}
            className={`font-bold flex items-center gap-1 underline hover:no-underline transition-colors ${styles.action}`}
          >
            <span>{alert.actionLabel}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}

        <button
          onClick={() => dispatch(dismissSystemAlert(alert === retainerAlert ? alert.id : undefined))}
          aria-label="Dismiss banner"
          className="p-1 rounded-md hover:bg-gp-surface/20 transition-colors opacity-70 hover:opacity-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { dismissSystemAlert } from '../../store/index.ts';
import { AlertCircle, AlertTriangle, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface SystemAlertBannerProps {
  onNavigateTab?: (tab: string) => void;
}

export function SystemAlertBanner({ onNavigateTab }: SystemAlertBannerProps) {
  const dispatch = useAppDispatch();
  const alert = useAppSelector(state => state.ui.systemAlert);
  const isDismissed = useAppSelector(state => state.ui.isSystemAlertDismissed);

  if (!alert || isDismissed) return null;

  const styles = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />,
      action: 'text-blue-700 hover:text-blue-800'
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
      action: 'text-amber-800 hover:text-amber-900'
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
      action: 'text-emerald-800 hover:text-emerald-900'
    }
  }[alert.type || 'info'];

  const handleAction = () => {
    if (alert.actionTab && onNavigateTab) {
      onNavigateTab(alert.actionTab);
    }
  };

  return (
    <div className={`px-4 py-2.5 border-b text-xs flex items-center justify-between gap-4 transition-all ${styles.container}`}>
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
          onClick={() => dispatch(dismissSystemAlert())}
          aria-label="Dismiss banner"
          className="p-1 rounded-md hover:bg-black/5 transition-colors opacity-70 hover:opacity-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

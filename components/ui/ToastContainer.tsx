import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { removeToast } from '../../store/index.ts';
import type { ToastMessage } from '../../types/ui.ts';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  onNavigateTab?: (tab: string) => void;
}

export function ToastContainer({ onNavigateTab }: ToastContainerProps) {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector(state => state.ui.toasts);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none sm:max-w-md"
    >
      {toasts.map((toast) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onClose={() => dispatch(removeToast(toast.id))}
          onNavigateTab={onNavigateTab}
        />
      ))}
    </div>
  );
}

function ToastItem({ 
  toast, 
  onClose,
  onNavigateTab
}: { 
  toast: ToastMessage; 
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}) {
  useEffect(() => {
    if (!toast.durationMs || toast.durationMs <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.durationMs);

    return () => clearTimeout(timer);
  }, [toast.id, toast.durationMs, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-200/90 bg-emerald-50/90 text-emerald-950',
    error: 'border-rose-200/90 bg-rose-50/90 text-rose-950',
    warning: 'border-amber-200/90 bg-amber-50/90 text-amber-950',
    info: 'border-blue-200/90 bg-blue-50/90 text-blue-950'
  };

  const handleActionClick = () => {
    if (toast.action?.onClickTab && onNavigateTab) {
      onNavigateTab(toast.action.onClickTab);
    }
    onClose();
  };

  return (
    <div
      className={`pointer-events-auto rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all duration-200 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 ${
        borders[toast.type]
      }`}
      role="status"
    >
      <div className="mt-0.5">{icons[toast.type]}</div>

      <div className="flex-1 min-w-0 pr-1">
        {toast.title && (
          <h4 className="text-xs font-bold leading-tight tracking-tight">
            {toast.title}
          </h4>
        )}
        <p className="text-xs leading-relaxed opacity-90 mt-0.5 break-words">
          {toast.message}
        </p>

        {toast.action && (
          <button
            onClick={handleActionClick}
            className="mt-2 text-xs font-bold underline hover:no-underline flex items-center gap-1 transition-opacity hover:opacity-80"
          >
            <span>{toast.action.label}</span>
          </button>
        )}
      </div>

      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-black/5 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

import React, { useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'warning';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variantStyles = {
    primary: {
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50'
    },
    danger: {
      button: 'bg-rose-600 hover:bg-rose-700 text-white',
      icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
      iconBg: 'bg-rose-50'
    },
    warning: {
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50'
    }
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-md w-full border border-slate-200/90 shadow-2xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
      >
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-xl ${variantStyles.iconBg} shrink-0`}>
            {variantStyles.icon}
          </div>

          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-sm font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            <p id="confirm-dialog-desc" className="text-xs text-slate-500 leading-relaxed mt-1">
              {description}
            </p>
          </div>

          <button
            onClick={onCancel}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md -mt-1 -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 ${variantStyles.button} ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

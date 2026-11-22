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
      button: 'bg-gp-primary hover:bg-gp-primary-hover text-gp-primary-foreground',
      icon: <CheckCircle2 className="w-5 h-5 text-gp-primary-strong" />,
      iconBg: 'bg-gp-primary-soft'
    },
    danger: {
      button: 'bg-gp-danger hover:bg-gp-danger/90 text-gp-danger-foreground',
      icon: <AlertCircle className="w-5 h-5 text-gp-danger" />,
      iconBg: 'bg-gp-danger-soft'
    },
    warning: {
      button: 'bg-gp-warning hover:bg-gp-warning/90 text-gp-warning-foreground',
      icon: <AlertTriangle className="w-5 h-5 text-gp-warning" />,
      iconBg: 'bg-gp-warning-soft'
    }
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gp-text/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-gp-surface rounded-lg max-w-md w-full border border-gp-border shadow-gp-pop overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
      >
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-lg ${variantStyles.iconBg} shrink-0`}>
            {variantStyles.icon}
          </div>

          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-sm font-bold text-gp-text tracking-tight">
              {title}
            </h3>
            <p id="confirm-dialog-desc" className="text-xs text-gp-text-secondary leading-relaxed mt-1">
              {description}
            </p>
          </div>

          <button
            onClick={onCancel}
            aria-label="Close"
            className="text-gp-text-muted hover:text-gp-text p-1 rounded-md -mt-1 -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gp-divider">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-gp-text hover:text-gp-text-secondary bg-gp-surface hover:bg-gp-surface-secondary border border-gp-border rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${variantStyles.button} ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

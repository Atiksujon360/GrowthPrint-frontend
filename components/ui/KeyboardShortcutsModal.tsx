import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { setShortcutsModalOpen } from '../../store/index.ts';
import { Command, Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  onNavigateTab?: (tab: string) => void;
  onOpenQuickCreate?: () => void;
}

export function KeyboardShortcutsModal({ onNavigateTab, onOpenQuickCreate }: KeyboardShortcutsModalProps) {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.ui.isShortcutsModalOpen);

  // Global listener for '?' key to open shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        dispatch(setShortcutsModalOpen(true));
      } else if (e.key === 'Escape' && isOpen) {
        dispatch(setShortcutsModalOpen(false));
      } else if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.metaKey && !isOpen) {
        if (onOpenQuickCreate) {
          e.preventDefault();
          onOpenQuickCreate();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dispatch, onOpenQuickCreate]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      group: 'Universal Commands',
      items: [
        { keys: ['⌘', 'K'], label: 'Open Command Palette' },
        { keys: ['C'], label: 'Quick Create (Lead, Project, Invoice)' },
        { keys: ['?'], label: 'Show Keyboard Shortcuts' },
        { keys: ['Esc'], label: 'Close Active Modal / Dropdown' }
      ]
    },
    {
      group: 'Workspace Navigation',
      items: [
        { keys: ['G', 'D'], label: 'Go to Command Center' },
        { keys: ['G', 'L'], label: 'Go to Prospects & CRM' },
        { keys: ['G', 'O'], label: 'Go to Outreach Studio' },
        { keys: ['G', 'R'], label: 'Go to Support & Tickets' },
        { keys: ['G', 'P'], label: 'Go to Client Projects' },
        { keys: ['G', 'I'], label: 'Go to Invoices & Ledger' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gp-text/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-gp-surface rounded-lg max-w-lg w-full border border-gp-border shadow-gp-pop overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gp-divider">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gp-primary-soft text-gp-primary-strong flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 id="shortcuts-modal-title" className="text-sm font-bold text-gp-text tracking-tight">
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-gp-text-secondary">
                Speed through your agency operations with hotkeys.
              </p>
            </div>
          </div>

          <button
            onClick={() => dispatch(setShortcutsModalOpen(false))}
            aria-label="Close shortcuts modal"
            className="text-gp-text-muted hover:text-gp-text p-1.5 rounded-lg hover:bg-gp-surface-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {shortcutGroups.map((group) => (
            <div key={group.group} className="space-y-2">
              <h4 className="text-xs font-bold text-gp-text-muted">
                {group.group}
              </h4>
              <div className="bg-gp-surface-secondary/60 rounded-lg p-2.5 border border-gp-border divide-y divide-gp-divider">
                {group.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-1 text-xs">
                    <span className="text-gp-text font-medium">{item.label}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 bg-gp-surface border border-gp-border rounded shadow-2xs font-mono text-xs font-semibold text-gp-text"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-gp-divider flex items-center justify-between text-xs text-gp-text-muted">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-gp-surface-secondary rounded border border-gp-border font-mono font-bold text-gp-text">?</kbd> anytime to open this sheet</span>
          <button
            onClick={() => dispatch(setShortcutsModalOpen(false))}
            className="px-3 py-1 bg-gp-primary hover:bg-gp-primary-hover text-gp-primary-foreground rounded-lg text-xs font-semibold"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

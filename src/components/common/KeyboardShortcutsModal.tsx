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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full border border-slate-200/90 shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 id="shortcuts-modal-title" className="text-sm font-bold text-slate-900 tracking-tight">
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-slate-500">
                Speed through your agency operations with hotkeys.
              </p>
            </div>
          </div>

          <button
            onClick={() => dispatch(setShortcutsModalOpen(false))}
            aria-label="Close shortcuts modal"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {shortcutGroups.map((group) => (
            <div key={group.group} className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {group.group}
              </h4>
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70 divide-y divide-slate-200/50">
                {group.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-1 text-xs">
                    <span className="text-slate-700 font-medium">{item.label}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono text-[11px] font-semibold text-slate-800"
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

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 font-mono font-bold text-slate-700">?</kbd> anytime to open this sheet</span>
          <button
            onClick={() => dispatch(setShortcutsModalOpen(false))}
            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { 
  Search, 
  X, 
  Sparkles, 
  FolderKanban, 
  TicketCheck, 
  CreditCard, 
  Users, 
  Workflow, 
  History, 
  ArrowRight,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import type { AdminTab } from '../admin/AdminLayout.tsx';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: AdminTab) => void;
  onOpenQuickCreate: () => void;
}

export function CommandPalette({ isOpen, onClose, onSelectTab, onOpenQuickCreate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const leads = useAppSelector(state => state.agency.leads);
  const projects = useAppSelector(state => state.agency.projects);
  const invoices = useAppSelector(state => state.agency.invoices);
  const requests = useAppSelector(state => state.agency.requests);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Navigation shortcuts
  const navigationItems: { label: string; tab: AdminTab; icon: any; category: string }[] = [
    { label: 'Executive Command Center', tab: 'DASHBOARD', icon: Sparkles, category: 'Navigation' },
    { label: 'Lead Acquisition & Pipeline', tab: 'LEADS', icon: Sparkles, category: 'Growth' },
    { label: 'Outreach Approval Gate', tab: 'OUTREACH', icon: TicketCheck, category: 'Growth' },
    { label: 'Support Queue & Classification', tab: 'REQUESTS', icon: TicketCheck, category: 'Delivery' },
    { label: 'Active Projects & Sprints', tab: 'PROJECTS', icon: FolderKanban, category: 'Delivery' },
    { label: 'Client Directory & Retainers', tab: 'CLIENTS', icon: Users, category: 'Clients' },
    { label: 'Invoices & Revenue', tab: 'INVOICES', icon: CreditCard, category: 'Finance' },
    { label: 'Workflow Engine (n8n Ready)', tab: 'AUTOMATION', icon: Workflow, category: 'Automation' },
    { label: 'System Audit Trail Log', tab: 'ACTIVITY', icon: History, category: 'Management' }
  ];

  const filteredNav = navigationItems.filter(item => 
    !q || item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
  );

  const filteredLeads = leads.filter(l => 
    !q || l.companyName.toLowerCase().includes(q) || l.contactName.toLowerCase().includes(q)
  ).slice(0, 3);

  const filteredProjects = projects.filter(p => 
    !q || p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q)
  ).slice(0, 3);

  const filteredInvoices = invoices.filter(i => 
    !q || i.invoiceNumber.toLowerCase().includes(q) || i.clientName.toLowerCase().includes(q)
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[550px]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, prospect, project, or invoice..."
            className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 border border-slate-300 rounded text-slate-500">
            ESC
          </kbd>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Actions */}
          <div>
            <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Quick Actions
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenQuickCreate();
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-semibold flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-blue-600" />
                <span>Quick-Create (Lead, Ticket, Invoice)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {/* Navigation */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Workspace Destinations
              </div>
              <div className="space-y-0.5">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => {
                        onSelectTab(item.tab);
                        onClose();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-800 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Leads */}
          {filteredLeads.length > 0 && (
            <div>
              <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Leads & CRM
              </div>
              <div className="space-y-0.5">
                {filteredLeads.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      onSelectTab('LEADS');
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-800 flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{l.companyName}</span>
                      <span className="text-slate-400 ml-2">({l.contactName})</span>
                    </div>
                    <span className="text-[11px] font-mono text-blue-600">{l.qualificationScore}/100</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Projects
              </div>
              <div className="space-y-0.5">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectTab('PROJECTS');
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-800 flex items-center justify-between group"
                  >
                    <span className="font-medium text-slate-900 truncate mr-2">{p.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{p.progressPercent}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {filteredInvoices.length > 0 && (
            <div>
              <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Invoices
              </div>
              <div className="space-y-0.5">
                {filteredInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => {
                      onSelectTab('INVOICES');
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-800 flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                      <span className="text-slate-500 ml-2">{inv.clientName}</span>
                    </div>
                    <span className="font-bold text-slate-800 tabular-nums">${inv.totalAmount.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search CRM, pipeline, tickets, or type a command</span>
          <span>Tip: Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
}

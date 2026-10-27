import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { setActiveView, switchRole } from '../../../store/index.ts';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  TicketCheck, 
  Sparkles, 
  Send, 
  CreditCard, 
  Workflow, 
  History, 
  LogOut,
  Shield,
  Search,
  PlusCircle,
  Bell,
  ChevronDown,
  Calendar,
  CheckCircle2,
  Menu,
  X,
  Keyboard
} from 'lucide-react';
import { CommandPalette } from '../../../components/ui/CommandPalette.tsx';
import { QuickCreateModal } from './QuickCreateModal.tsx';
import { NotificationDropdown } from '../../../components/ui/NotificationDropdown.tsx';
import { LiveSyncIndicator } from '../../../components/ui/LiveSyncIndicator.tsx';
import { SystemAlertBanner } from '../../../components/ui/SystemAlertBanner.tsx';
import { KeyboardShortcutsModal } from '../../../components/ui/KeyboardShortcutsModal.tsx';
import { setShortcutsModalOpen } from '../../../store/index.ts';

export type AdminTab = 
  | 'DASHBOARD' 
  | 'LEADS' 
  | 'OUTREACH' 
  | 'REQUESTS' 
  | 'PROJECTS' 
  | 'CLIENTS' 
  | 'INVOICES' 
  | 'AUTOMATION' 
  | 'ACTIVITY';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: React.ReactNode;
}

export function AdminLayout({ currentTab, onTabChange, children }: AdminLayoutProps) {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(state => state.auth);
  const requests = useAppSelector(state => state.agency.requests);
  const outreach = useAppSelector(state => state.agency.outreachDrafts);
  const leads = useAppSelector(state => state.agency.leads);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingClassification = requests.filter(r => r.status === 'NEW' || r.status === 'NEEDS_CLASSIFICATION').length;
  const pendingOutreachApprovals = outreach.filter(d => d.status === 'AWAITING_HUMAN_APPROVAL').length;
  const readyOutreachLeads = leads.filter(l => l.pipelineStage === 'READY_FOR_OUTREACH').length;

  const totalNotifications = pendingClassification + pendingOutreachApprovals;

  // Grouped Navigation structure according to Master Prompt Section 5
  const navGroups = [
    {
      group: 'Overview',
      items: [
        { id: 'DASHBOARD' as AdminTab, label: 'Executive Command Center', icon: LayoutDashboard }
      ]
    },
    {
      group: 'Growth & CRM',
      items: [
        { 
          id: 'LEADS' as AdminTab, 
          label: 'Lead Acquisition & CRM', 
          icon: Sparkles,
          badge: readyOutreachLeads > 0 ? `${readyOutreachLeads} ready` : undefined
        },
        { 
          id: 'OUTREACH' as AdminTab, 
          label: 'Outreach Approval Gate', 
          icon: Send,
          badge: pendingOutreachApprovals > 0 ? `${pendingOutreachApprovals} review` : undefined
        }
      ]
    },
    {
      group: 'Clients & Accounts',
      items: [
        { id: 'CLIENTS' as AdminTab, label: 'Client Directory & Retainers', icon: Users }
      ]
    },
    {
      group: 'Delivery & Support',
      items: [
        { id: 'PROJECTS' as AdminTab, label: 'Active Projects & Sprints', icon: FolderKanban },
        { 
          id: 'REQUESTS' as AdminTab, 
          label: 'Support Queue & SLA', 
          icon: TicketCheck,
          badge: pendingClassification > 0 ? `${pendingClassification} new` : undefined
        }
      ]
    },
    {
      group: 'Finance',
      items: [
        { id: 'INVOICES' as AdminTab, label: 'Invoices & Revenue', icon: CreditCard }
      ]
    },
    {
      group: 'Automation & System',
      items: [
        { id: 'AUTOMATION' as AdminTab, label: 'Workflow Engine (n8n)', icon: Workflow },
        { id: 'ACTIVITY' as AdminTab, label: 'System Audit Trail', icon: History }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFD] flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-slate-800">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.span
                className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center text-white font-bold text-xs"
                whileHover={{ rotate: 10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                GP
              </motion.span>
              <span className="font-bold text-white tracking-tight text-base">
                GrowthPrint Admin
              </span>
            </motion.div>
            <div className="mt-3 px-2 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Founder Operating System</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3" /> Privileged
              </span>
            </div>
          </div>

          {/* Grouped Navigation Links */}
          <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-190px)]">
            {navGroups.map((grp, groupIdx) => (
              <motion.div
                key={grp.group}
                className="space-y-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: groupIdx * 0.05 }}
              >
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {grp.group}
                </div>
                {grp.items.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: groupIdx * 0.05 + idx * 0.03 }}
                      whileHover={{ x: 3 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        </motion.div>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <motion.span
                          className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Reporting Zone</span>
            <span className="font-mono text-slate-300">Asia/Kuala_Lumpur</span>
          </div>
          <motion.button
            onClick={() => {
              dispatch(switchRole('GUEST'));
              dispatch(setActiveView('PUBLIC'));
            }}
            className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
            whileHover={{ x: 3 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch to Agency Public View</span>
          </motion.button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Top Executive Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30">
          {/* Left: Mobile trigger & Search trigger */}
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Global Search Command Bar */}
            <motion.button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center justify-between w-full max-w-md px-3 py-1.5 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/90 rounded-xl text-xs text-slate-500 transition-colors group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                <span className="truncate">Search leads, projects, invoices, or type command...</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded shadow-2xs text-slate-400 shrink-0">
                ⌘K
              </kbd>
            </motion.button>
          </div>

          {/* Right: Sync Indicator, Quick Action, Alerts, Shortcuts, Profile */}
          <div className="flex items-center gap-2.5">
            <LiveSyncIndicator />

            <motion.button
              onClick={() => setIsQuickCreateOpen(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Record</span>
            </motion.button>

            {/* Live Notification Center Dropdown */}
            <NotificationDropdown onNavigateTab={(tab) => onTabChange(tab as AdminTab)} />

            {/* Keyboard Shortcuts Trigger */}
            <motion.button
              onClick={() => dispatch(setShortcutsModalOpen(true))}
              title="Keyboard Shortcuts (?)"
              aria-label="Keyboard Shortcuts"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors hidden sm:flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Keyboard className="w-4 h-4" />
            </motion.button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <motion.div
              className="flex items-center gap-2 pl-1"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                AV
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">Alex Vance</div>
                <div className="text-[10px] text-slate-400 leading-tight">Founder & Engineer</div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* System Alert Banner */}
        <SystemAlertBanner onNavigateTab={(tab) => onTabChange(tab as AdminTab)} />

        {/* Mobile drawer if toggled */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden bg-slate-900 text-slate-300 p-4 border-b border-slate-800 space-y-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {navGroups.flatMap(g => g.items).map((item, idx) => (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs ${
                    currentTab === item.id ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ x: 3 }}
                >
                  <span>{item.label}</span>
                  {item.badge && <span className="text-[10px] bg-amber-400 text-slate-950 px-1 rounded-full font-bold">{item.badge}</span>}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={onTabChange}
        onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
      />

      {/* Quick Create Modal */}
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        onNavigateTab={(tab) => onTabChange(tab as AdminTab)}
        onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
      />
    </div>
  );
}

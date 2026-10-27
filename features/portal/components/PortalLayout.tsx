import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks.ts';
import { setActiveView, switchRole } from '../../../store/index.ts';
import { 
  LayoutDashboard, 
  FolderKanban, 
  TicketCheck, 
  FileText, 
  CreditCard, 
  MessageSquare, 
  ShieldCheck, 
  LogOut, 
  PlusCircle, 
  User,
  ExternalLink
} from 'lucide-react';
import { NotificationDropdown } from '../../../components/ui/NotificationDropdown.tsx';
import { LiveSyncIndicator } from '../../../components/ui/LiveSyncIndicator.tsx';

export type PortalTab = 'DASHBOARD' | 'PROJECTS' | 'REQUESTS' | 'PROPOSALS' | 'INVOICES' | 'MESSAGES';

interface PortalLayoutProps {
  currentTab: PortalTab;
  onTabChange: (tab: PortalTab) => void;
  onOpenNewRequest: () => void;
  children: React.ReactNode;
}

export function PortalLayout({ currentTab, onTabChange, onOpenNewRequest, children }: PortalLayoutProps) {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(state => state.auth);
  const requests = useAppSelector(state => state.agency.requests);
  const invoices = useAppSelector(state => state.agency.invoices);

  // Client-scoped pending badges
  const pendingApprovals = requests.filter(
    r => r.clientId === currentUser.clientId && r.status === 'AWAITING_CLIENT_APPROVAL'
  ).length;

  const unpaidInvoices = invoices.filter(
    i => i.clientId === currentUser.clientId && i.status === 'ISSUED'
  ).length;

  const navItems = [
    { id: 'DASHBOARD' as PortalTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'PROJECTS' as PortalTab, label: 'Projects & Milestones', icon: FolderKanban },
    { 
      id: 'REQUESTS' as PortalTab, 
      label: 'Support & Requests', 
      icon: TicketCheck,
      badge: pendingApprovals > 0 ? `${pendingApprovals} action` : undefined 
    },
    { id: 'PROPOSALS' as PortalTab, label: 'Proposals', icon: FileText },
    { 
      id: 'INVOICES' as PortalTab, 
      label: 'Billing & Invoices', 
      icon: CreditCard,
      badge: unpaidInvoices > 0 ? `${unpaidInvoices} due` : undefined 
    },
    { id: 'MESSAGES' as PortalTab, label: 'Communications', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFD] flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between">
        <div>
          {/* Brand & Client context */}
          <div className="p-5 border-b border-slate-200">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.span
                className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xs"
                whileHover={{ rotate: 10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                GP
              </motion.span>
              <span className="font-bold text-slate-900 tracking-tight text-base">
                GrowthPrint
              </span>
            </motion.div>
            <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Client Organization
              </div>
              <div className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                {currentUser.clientName || 'Client Portal'}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {currentUser.name}
              </div>
            </div>
          </div>

          {/* New Request Button */}
          <div className="p-4">
            <motion.button
              onClick={onOpenNewRequest}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center justify-center gap-2 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Request</span>
            </motion.button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 3 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="flex items-center gap-2.5">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    </motion.div>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <motion.span
                      className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
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
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>SLA: Standard 4h</span>
            <span className="text-emerald-600 font-medium">Systems Healthy</span>
          </div>
          <motion.button
            onClick={() => {
              dispatch(switchRole('GUEST'));
              dispatch(setActiveView('PUBLIC'));
            }}
            className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2"
            whileHover={{ x: 3 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Return to Agency Site</span>
          </motion.button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Top bar inside portal */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-800">
              {currentUser.clientName}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">
              Account Manager: GrowthPrint Technical Director
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LiveSyncIndicator />
            <NotificationDropdown onNavigateTab={(tab) => onTabChange(tab as PortalTab)} />
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <span className="text-xs text-slate-500 hidden sm:inline">
              Retainer: <strong>Pro Growth</strong> (15h/mo)
            </span>
            <motion.div
              className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              SC
            </motion.div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

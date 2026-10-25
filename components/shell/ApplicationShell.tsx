'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.ts';
import { setActiveView, switchRole, validateSession } from '../../store/index.ts';
import type { ServiceCategory } from '../../types/agency.ts';
import { WorkspaceLoginScreen } from '../../features/auth/components/WorkspaceLoginScreen.tsx';

// Common Components
import { RoleSwitcherBar } from '../ui/RoleSwitcherBar.tsx';
import { ToastContainer } from '../ui/ToastContainer.tsx';

// Public Marketing Components
import {
  PublicHeader,
  HeroSection,
  ServicesSection,
  HowWeWorkSection,
  CaseStudiesSection,
  TrustSection,
  FAQSection,
  PublicFooter,
  QuoteInquiryModal
} from '../../features/public/index.ts';

// Client Portal Components
import {
  PortalLayout,
  PortalDashboard,
  PortalProjectsView,
  PortalRequestsView,
  PortalProposalsView,
  PortalInvoicesView,
  PortalMessagesView,
  type PortalTab
} from '../../features/portal/index.ts';

// Admin Workspace Components
import {
  AdminLayout,
  AdminDashboard,
  AdminLeadsView,
  AdminOutreachStudio,
  AdminRequestsQueue,
  AdminProjectsView,
  AdminClientsView,
  AdminInvoicesView,
  AdminAutomationView,
  AdminActivityView,
  type AdminTab
} from '../../features/admin/index.ts';

const ADMIN_TABS: readonly AdminTab[] = [
  'DASHBOARD',
  'LEADS',
  'OUTREACH',
  'REQUESTS',
  'PROJECTS',
  'CLIENTS',
  'INVOICES',
  'AUTOMATION',
  'ACTIVITY'
];

function isAdminTab(tab: string): tab is AdminTab {
  return ADMIN_TABS.includes(tab as AdminTab);
}

function MainApp() {
  const dispatch = useAppDispatch();
  const { activeView, isAuthenticated, isSessionValidating } = useAppSelector(state => state.auth);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [workspaceLoginRole, setWorkspaceLoginRole] = useState<'ADMIN' | 'CLIENT' | null>(null);

  // Validate session on mount to restore auth state from stored token
  useEffect(() => {
    const initializeSession = async () => {
      await dispatch(validateSession());
      setHasInitialized(true);
    };
    initializeSession();
  }, [dispatch]);

  useEffect(() => {
    if (activeView === 'PUBLIC') {
      setWorkspaceLoginRole(null);
      return;
    }

    setWorkspaceLoginRole(currentRole => currentRole ?? (activeView === 'ADMIN' ? 'ADMIN' : 'CLIENT'));
  }, [activeView]);

  // Public View Modal States
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceCategory | undefined>(undefined);

  // Client Portal States
  const [portalTab, setPortalTab] = useState<PortalTab>('DASHBOARD');
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

  // Admin Workspace States
  const [adminTab, setAdminTab] = useState<AdminTab>('DASHBOARD');
  const [preselectedLeadId, setPreselectedLeadId] = useState<string | undefined>(undefined);

  const handleOpenQuote = (service?: ServiceCategory) => {
    setSelectedService(service);
    setIsQuoteOpen(true);
  };

  const handleOpenOutreachFromLead = (leadId: string) => {
    setPreselectedLeadId(leadId);
    setAdminTab('OUTREACH');
  };

  const handleBackToPublic = () => {
    dispatch(switchRole('GUEST'));
    dispatch(setActiveView('PUBLIC'));
  };

  // Show loading state during initial session validation in real API mode
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';
  if (!hasInitialized && !isMockMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFD]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFD] text-[#182230]">
      {/* Universal Top Switcher Bar allowing instant testing between Agency Public, Client Portal, and Admin Workspace */}
      {!workspaceLoginRole && <RoleSwitcherBar />}

      {/* Global Toast Notifications Stack */}
      {!workspaceLoginRole && <ToastContainer onNavigateTab={(tab) => {
        if (isAdminTab(tab)) setAdminTab(tab);
      }} />}

      {workspaceLoginRole ? (
        <WorkspaceLoginScreen
          role={workspaceLoginRole}
          onSignIn={() => setWorkspaceLoginRole(null)}
          onBackToPublic={handleBackToPublic}
        />
      ) : (
        <>

      {/* 1. Public Agency Experience */}
      {activeView === 'PUBLIC' && (
        <div className="flex-1 flex flex-col">
          <PublicHeader onOpenQuote={() => handleOpenQuote()} />
          <main className="flex-1">
            <HeroSection onOpenQuote={() => handleOpenQuote()} />
            <ServicesSection onSelectService={(s) => handleOpenQuote(s)} />
            <HowWeWorkSection />
            <CaseStudiesSection />
            <TrustSection onOpenQuote={() => handleOpenQuote()} />
            <FAQSection />
          </main>
          <PublicFooter onOpenQuote={() => handleOpenQuote()} />

          <QuoteInquiryModal
            isOpen={isQuoteOpen}
            onClose={() => setIsQuoteOpen(false)}
            defaultService={selectedService}
          />
        </div>
      )}

      {/* 2. Authenticated Client Portal Experience */}
      {activeView === 'PORTAL' && (
        <PortalLayout
          currentTab={portalTab}
          onTabChange={setPortalTab}
          onOpenNewRequest={() => setIsNewRequestModalOpen(true)}
        >
          {portalTab === 'DASHBOARD' && (
            <PortalDashboard
              onNavigateTab={setPortalTab}
              onOpenNewRequest={() => setIsNewRequestModalOpen(true)}
            />
          )}

          {portalTab === 'PROJECTS' && <PortalProjectsView />}

          {portalTab === 'REQUESTS' && (
            <PortalRequestsView
              isModalOpen={isNewRequestModalOpen}
              onOpenModal={() => setIsNewRequestModalOpen(true)}
              onCloseModal={() => setIsNewRequestModalOpen(false)}
            />
          )}

          {portalTab === 'PROPOSALS' && <PortalProposalsView />}

          {portalTab === 'INVOICES' && <PortalInvoicesView />}

          {portalTab === 'MESSAGES' && <PortalMessagesView />}
        </PortalLayout>
      )}

      {/* 3. Private Founder Admin Workspace */}
      {activeView === 'ADMIN' && (
        <AdminLayout
          currentTab={adminTab}
          onTabChange={setAdminTab}
        >
          {adminTab === 'DASHBOARD' && (
            <AdminDashboard onNavigateTab={setAdminTab} />
          )}

          {adminTab === 'LEADS' && (
            <AdminLeadsView onOpenOutreach={handleOpenOutreachFromLead} />
          )}

          {adminTab === 'OUTREACH' && (
            <AdminOutreachStudio preselectedLeadId={preselectedLeadId} />
          )}

          {adminTab === 'REQUESTS' && <AdminRequestsQueue />}

          {adminTab === 'PROJECTS' && <AdminProjectsView />}

          {adminTab === 'CLIENTS' && <AdminClientsView />}

          {adminTab === 'INVOICES' && <AdminInvoicesView />}

          {adminTab === 'AUTOMATION' && <AdminAutomationView />}

          {adminTab === 'ACTIVITY' && <AdminActivityView />}
        </AdminLayout>
      )}
        </>
      )}
    </div>
  );
}

export function ApplicationShell() {
  return <MainApp />;
}

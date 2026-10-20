import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/index.ts';
import { useAppDispatch, useAppSelector } from './store/hooks.ts';
import { setActiveView, switchRole } from './store/index.ts';
import type { ServiceCategory } from './types/index.ts';

// Common Components
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar.tsx';
import { ToastContainer } from './components/common/ToastContainer.tsx';

// Public Marketing Components
import { PublicHeader } from './components/public/PublicHeader.tsx';
import { HeroSection } from './components/public/HeroSection.tsx';
import { ServicesSection } from './components/public/ServicesSection.tsx';
import { HowWeWorkSection } from './components/public/HowWeWorkSection.tsx';
import { CaseStudiesSection } from './components/public/CaseStudiesSection.tsx';
import { TrustSection } from './components/public/TrustSection.tsx';
import { PublicFooter } from './components/public/PublicFooter.tsx';
import { QuoteInquiryModal } from './components/public/QuoteInquiryModal.tsx';

// Client Portal Components
import { PortalLayout, type PortalTab } from './components/portal/PortalLayout.tsx';
import { PortalDashboard } from './components/portal/PortalDashboard.tsx';
import { PortalProjectsView } from './components/portal/PortalProjectsView.tsx';
import { PortalRequestsView } from './components/portal/PortalRequestsView.tsx';
import { PortalProposalsView } from './components/portal/PortalProposalsView.tsx';
import { PortalInvoicesView } from './components/portal/PortalInvoicesView.tsx';
import { PortalMessagesView } from './components/portal/PortalMessagesView.tsx';

// Admin Workspace Components
import { AdminLayout, type AdminTab } from './components/admin/AdminLayout.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AdminLeadsView } from './components/admin/AdminLeadsView.tsx';
import { AdminOutreachStudio } from './components/admin/AdminOutreachStudio.tsx';
import { AdminRequestsQueue } from './components/admin/AdminRequestsQueue.tsx';
import { AdminProjectsView } from './components/admin/AdminProjectsView.tsx';
import { AdminClientsView } from './components/admin/AdminClientsView.tsx';
import { AdminInvoicesView } from './components/admin/AdminInvoicesView.tsx';
import { AdminAutomationView } from './components/admin/AdminAutomationView.tsx';
import { AdminActivityView } from './components/admin/AdminActivityView.tsx';

function MainApp() {
  const dispatch = useAppDispatch();
  const { activeView, currentUser } = useAppSelector(state => state.auth);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFD] text-[#182230]">
      {/* Universal Top Switcher Bar allowing instant testing between Agency Public, Client Portal, and Admin Workspace */}
      <RoleSwitcherBar />

      {/* Global Toast Notifications Stack */}
      <ToastContainer onNavigateTab={(tab) => setAdminTab(tab as any)} />

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
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <MainApp />
    </Provider>
  );
}

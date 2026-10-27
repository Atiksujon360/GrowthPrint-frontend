'use client';

import { useState } from 'react';
import { useAppSelector } from '../../store/hooks.ts';
import type { ServiceCategory } from '../../types/agency.ts';

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

// Common Components
import { RoleSwitcherBar } from '../../components/ui/RoleSwitcherBar.tsx';
import { ToastContainer } from '../../components/ui/ToastContainer.tsx';

export default function HomePage() {
  // Public View Modal States
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceCategory | undefined>(undefined);

  const handleOpenQuote = (service?: ServiceCategory) => {
    setSelectedService(service);
    setIsQuoteOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFD] text-[#182230] overflow-x-hidden">
      {/* Universal Top Switcher Bar allowing instant testing between Agency Public, Client Portal, and Admin Workspace */}
      <RoleSwitcherBar />

      {/* Global Toast Notifications Stack */}
      <ToastContainer onNavigateTab={(tab: string) => {
        // Toast navigation is handled by toast component
      }} />

      {/* Public Agency Experience */}
      <div className="flex-1 flex flex-col">
        <PublicHeader onOpenQuote={() => handleOpenQuote()} />
        <main className="flex-1">
          <HeroSection onOpenQuote={() => handleOpenQuote()} />
          <ServicesSection onSelectService={(s: ServiceCategory) => handleOpenQuote(s)} />
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
    </div>
  );
}

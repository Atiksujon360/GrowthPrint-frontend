import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../../store/hooks.ts';
import { useRouter } from 'next/navigation';
import { setActiveView, switchRole } from '../../../store/index.ts';
import { scrollToSection } from '../../../lib/scroll.ts';
import { ArrowRight, Menu, X, ShieldCheck } from 'lucide-react';

export function PublicHeader({ onOpenQuote }: { onOpenQuote: () => void }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (mobileMenuOpen && menuRef.current) {
      const focusableElements = menuRef.current.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      firstElement?.focus();

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      menuRef.current.addEventListener('keydown', handleTab);
      return () => menuRef.current?.removeEventListener('keydown', handleTab);
    }
  }, [mobileMenuOpen]);

  const handleSectionClick = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault();
    setMobileMenuOpen(false);
    scrollToSection(sectionId);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm'
          : 'bg-white/80 backdrop-blur-md border-b border-slate-200/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2 hover:scale-105 transition-all"
        >
          <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
            GP
          </span>
          <span>GrowthPrint</span>
        </a>

        {/* Zone 2: Navigation Links (Single-line clean text) */}
        <nav className="hidden md:flex items-center gap-7 text-base font-medium text-slate-600">
          {['Services', 'Process', 'Case Studies', 'Why GrowthPrint', 'FAQ'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              onClick={(event) => handleSectionClick(event, item.toLowerCase().replace(' ', '-'))}
              className="hover:text-slate-900 hover:-translate-y-0.5 transition-all whitespace-nowrap shrink-0"
            >
              {item}
            </a>
          ))}
          <button
            onClick={() => {
              if (isMockMode) {
                dispatch(switchRole('CLIENT'));
                dispatch(setActiveView('PORTAL'));
              } else {
                router.push('/portal/login');
              }
            }}
            className="hover:text-blue-600 hover:translate-x-0.5 transition-all whitespace-nowrap shrink-0 flex items-center gap-1 font-medium"
          >
            <span>Client Portal</span>
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenQuote}
            className="px-4 py-2.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs hover:shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span>Tell us what you need</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-3 text-slate-600 hover:text-slate-900 min-w-[44px] min-h-[44px] active:scale-95 transition-transform"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? (
              <div key="close">
                  <X className="w-6 h-6" />
                </div>
              ) : (
                <div key="menu">
                  <Menu className="w-6 h-6" />
                </div>
              )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {['Services', 'Process', 'Case Studies', 'FAQ', 'Why GrowthPrint'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                onClick={(event) => handleSectionClick(event, item.toLowerCase().replace(' ', '-'))}
                className="block py-3 px-2 text-base font-medium text-slate-700 hover:text-blue-600 min-h-[44px] flex items-center hover:translate-x-1 transition-transform"
              >
                {item}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (isMockMode) {
                  dispatch(switchRole('CLIENT'));
                  dispatch(setActiveView('PORTAL'));
                } else {
                  router.push('/portal/login');
                }
              }}
              className="w-full text-left py-3 px-2 text-base font-medium text-blue-600 min-h-[44px] flex items-center hover:translate-x-1 transition-transform"
            >
              Client Portal Sign In
            </button>
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuote();
                }}
                className="w-full py-3.5 px-4 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-xs min-h-[44px] hover:scale-102 active:scale-95 transition-transform"
              >
                Tell us what you need
              </button>
            </div>
          </div>
        )}
      </header>
  );
}

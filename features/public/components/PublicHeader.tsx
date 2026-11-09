import React, { useState, useEffect, useRef } from 'react';
import { isMockModeEnv } from '../../../lib/api/client.ts';
import { useAppDispatch } from '../../../store/hooks.ts';
import { useRouter } from 'next/navigation';
import { setActiveView, switchRole } from '../../../store/index.ts';
import { scrollToSection } from '../../../lib/scroll.ts';
import { Menu, X } from 'lucide-react';
import { GrowthPrintMark } from './GrowthPrintMark.tsx';

/** Section anchors on the home page. Ids match the sections (the old "Case Studies"/"Why" links pointed nowhere). */
export const PUBLIC_SECTIONS = [
  { id: 'services', label: 'Services' },
  { id: 'work', label: 'Work' },
  { id: 'process', label: 'Process' },
  { id: 'why-growthprint', label: 'Why GrowthPrint' },
  { id: 'faq', label: 'FAQ' },
] as const;

export function PublicHeader({ onOpenQuote }: { onOpenQuote: () => void }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  // Same opt-in rule as the API client: demo shortcuts only when NEXT_PUBLIC_USE_MOCK_API === 'true'.
  const isMockMode = isMockModeEnv();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Escape closes the mobile menu and returns focus to its button.
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    if (mobileMenuOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Focus trap for the mobile menu.
  useEffect(() => {
    const menu = menuRef.current;
    if (!mobileMenuOpen || !menu) return;
    const focusable = menu.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    menu.addEventListener('keydown', handleTab);
    return () => menu.removeEventListener('keydown', handleTab);
  }, [mobileMenuOpen]);

  const handleSectionClick = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault();
    setMobileMenuOpen(false);
    scrollToSection(sectionId);
  };

  const openClientPortal = () => {
    if (isMockMode) {
      dispatch(switchRole('CLIENT'));
      dispatch(setActiveView('PORTAL'));
    } else {
      router.push('/client-hub/login');
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md transition-[border-color] duration-200 ${
        isScrolled ? 'border-ink-200' : 'border-transparent'
      }`}
    >
      <div className="gp-frame flex h-16 items-center justify-between gap-6 [--gp-guide:transparent]">
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex shrink-0 items-center gap-2.5 rounded-md text-ink-950"
          aria-label="GrowthPrint, back to top"
        >
          <GrowthPrintMark className="h-7 w-7" />
          <span className="gp-display text-[1.15rem] font-semibold">GrowthPrint</span>
        </a>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {PUBLIC_SECTIONS.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(event) => handleSectionClick(event, s.id)}
              className="rounded-md px-3 py-2 text-[0.94rem] font-medium text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-950"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            onClick={openClientPortal}
            className="rounded-md px-3 py-2 text-[0.94rem] font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-950"
          >
            Client Portal
          </button>
          <button
            onClick={onOpenQuote}
            className="inline-flex min-h-10 items-center rounded-full bg-navy-950 px-4 text-[0.94rem] font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Tell us what you need
          </button>
        </div>

        <button
          ref={menuButtonRef}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="-mr-2 flex min-h-11 min-w-11 items-center justify-center rounded-md text-ink-700 hover:text-ink-950 lg:hidden"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="border-t border-ink-100 bg-white lg:hidden"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="gp-frame space-y-1 py-4 [--gp-guide:transparent]">
            {PUBLIC_SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(event) => handleSectionClick(event, s.id)}
                className="flex min-h-12 items-center border-b border-ink-100 text-lg font-medium text-ink-900"
              >
                {s.label}
              </a>
            ))}
            <button
              onClick={() => { setMobileMenuOpen(false); openClientPortal(); }}
              className="flex min-h-12 w-full items-center text-left text-lg font-medium text-brand-700"
            >
              Client Portal Sign In
            </button>
            <div className="pt-3">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenQuote(); }}
                className="min-h-12 w-full rounded-full bg-navy-950 px-4 text-base font-semibold text-white"
              >
                Tell us what you need
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

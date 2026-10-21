import React, { useState } from 'react';
import { useAppDispatch } from '../../../store/hooks.ts';
import { setActiveView, switchRole } from '../../../store/index.ts';
import { ArrowRight, Menu, X, ShieldCheck } from 'lucide-react';

export function PublicHeader({ onOpenQuote }: { onOpenQuote: () => void }) {
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
            GP
          </span>
          <span>GrowthPrint</span>
        </a>

        {/* Zone 2: Navigation Links (Single-line clean text) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a href="#services" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Services
          </a>
          <a href="#process" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Process
          </a>
          <a href="#work" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Case Studies
          </a>
          <a href="#trust" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Why GrowthPrint
          </a>
          <button 
            onClick={() => {
              dispatch(switchRole('CLIENT'));
              dispatch(setActiveView('PORTAL'));
            }}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 font-medium"
          >
            Client Portal
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenQuote}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs hover:shadow-sm transition-all whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span>Let&apos;s Discuss Your Project</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3">
          <a 
            href="#services" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
          >
            Services
          </a>
          <a 
            href="#process" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
          >
            Process
          </a>
          <a 
            href="#work" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
          >
            Case Studies
          </a>
          <a 
            href="#trust" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
          >
            Why GrowthPrint
          </a>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              dispatch(switchRole('CLIENT'));
              dispatch(setActiveView('PORTAL'));
            }}
            className="w-full text-left py-2 text-base font-medium text-blue-600"
          >
            Client Portal Sign In
          </button>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuote();
              }}
              className="w-full py-2.5 px-4 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-xs"
            >
              Discuss Your Project
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

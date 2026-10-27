import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault();
    setMobileMenuOpen(false);
    scrollToSection(sectionId);
  };

  return (
    <motion.header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm'
          : 'bg-white/80 backdrop-blur-md border-b border-slate-200/50'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <motion.a
          href="/"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <motion.span
            className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm"
            whileHover={{ rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            GP
          </motion.span>
          <span>GrowthPrint</span>
        </motion.a>

        {/* Zone 2: Navigation Links (Single-line clean text) */}
        <nav className="hidden md:flex items-center gap-7 text-base font-medium text-slate-600">
          {['Services', 'Process', 'Case Studies', 'Why GrowthPrint', 'FAQ'].map((item, index) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              onClick={(event) => handleSectionClick(event, item.toLowerCase().replace(' ', '-'))}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              {item}
            </motion.a>
          ))}
          <motion.button
            onClick={() => {
              if (isMockMode) {
                dispatch(switchRole('CLIENT'));
                dispatch(setActiveView('PORTAL'));
              } else {
                router.push('/portal/login');
              }
            }}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 font-medium"
            whileHover={{ x: 3 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <span>Client Portal</span>
          </motion.button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <motion.button
            onClick={onOpenQuote}
            className="px-4 py-2.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs hover:shadow-md transition-all whitespace-nowrap shrink-0 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Tell us what you need</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900"
            aria-label="Toggle Navigation Menu"
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
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {['Services', 'Process', 'Case Studies', 'FAQ', 'Why GrowthPrint'].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                onClick={(event) => handleSectionClick(event, item.toLowerCase().replace(' ', '-'))}
                className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                whileHover={{ x: 5 }}
              >
                {item}
              </motion.a>
            ))}
            <motion.button
              onClick={() => {
                setMobileMenuOpen(false);
                if (isMockMode) {
                  dispatch(switchRole('CLIENT'));
                  dispatch(setActiveView('PORTAL'));
                } else {
                  router.push('/portal/login');
                }
              }}
              className="w-full text-left py-2 text-base font-medium text-blue-600"
              whileHover={{ x: 5 }}
            >
              Client Portal Sign In
            </motion.button>
            <div className="pt-2">
              <motion.button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuote();
                }}
                className="w-full py-2.5 px-4 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-xs"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Tell us what you need
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, ShieldCheck, Terminal, Layers, ArrowUpRight } from 'lucide-react';
import { useAppDispatch } from '../../../store/hooks.ts';
import { useRouter } from 'next/navigation';
import { setActiveView, switchRole } from '../../../store/index.ts';
import heroImage from '../../../assets/images/hero_agency_workspace_1792450306060.jpg';
import { scrollToSection } from '../../../lib/scroll.ts';

export function HeroSection({ onOpenQuote }: { onOpenQuote: () => void }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

  return (
    <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-50 -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value proposition and primary CTA */}
          <motion.div
            className="lg:col-span-7 space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.div
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 tracking-wider uppercase"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span>Clear thinking</span>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span>Careful engineering</span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Good software should make work feel easier.
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              GrowthPrint helps growing teams fix the systems that slow them down, then build the next version with care.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="pt-2 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.button
                onClick={onOpenQuote}
                className="px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm hover:shadow-lg transition-all flex items-center gap-2.5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Tell us what&apos;s getting in the way</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.a
                href="#services"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection('services');
                }}
                className="px-6 py-3.5 text-base font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>See how we can help</span>
              </motion.a>

              <motion.button
                onClick={() => {
                  if (isMockMode) {
                    dispatch(switchRole('CLIENT'));
                    dispatch(setActiveView('PORTAL'));
                  } else {
                    router.push('/portal/login');
                  }
                }}
                className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1.5 ml-2"
                whileHover={{ x: 5 }}
              >
                <span>Already working with us? Sign in</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </motion.button>
            </motion.div>

            {/* Trust bullet strip */}
            <motion.div
              className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-6 text-sm text-slate-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.div
                className="flex items-center gap-1.5"
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Clear scope before work starts</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-1.5"
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct access to the person doing the work</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-1.5"
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Support after launch when you need it</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Column: Hero Graphic / Studio Visual */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-lg bg-white glass-card">
              {!imageError ? (
                <motion.img
                  src={heroImage.src}
                  alt="A team reviewing practical software solutions together"
                  className="w-full h-[380px] lg:h-[440px] object-cover object-center"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              ) : (
                <div className="w-full h-[380px] lg:h-[440px] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-8 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between">
                  <span className="text-sm font-mono uppercase tracking-widest text-blue-400">GrowthPrint Studio</span>
                    <Terminal className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold">A calmer way to improve your digital work</h3>
                    <p className="text-base text-slate-300">Software, automation, and thoughtful ongoing support.</p>
                  </div>
                  <div className="text-sm font-mono text-slate-400">TypeScript · React · Next.js · Node.js</div>
                </div>
              )}

              {/* Glassmorphism overlay label */}
              <motion.div
                className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-lg border border-slate-200/80 shadow-sm flex items-center justify-between"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900">GrowthPrint IT Services</div>
                  <div className="text-[11px] text-slate-500">Custom Software · Maintenance · Automation</div>
                </div>
                <span className="text-sm font-medium text-blue-600">Built to be useful</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* 4-Column Metric Strip below the split */}
        <motion.div
          className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[
            { value: '14+', label: 'Systems shipped' },
            { value: '35%', label: 'Less process friction' },
            { value: '100%', label: 'Work reviewed personally' },
            { value: '99.9%', label: 'Reliable automated workflows' }
          ].map((metric, index) => (
            <motion.div
              key={index}
              className="space-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-slate-900 tabular-nums">{metric.value}</div>
              <div className="text-sm font-medium text-slate-500">{metric.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

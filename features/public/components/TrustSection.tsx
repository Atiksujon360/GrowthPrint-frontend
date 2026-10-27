import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, FileCheck, DollarSign, UserCheck, Clock, Headphones } from 'lucide-react';

export function TrustSection({ onOpenQuote }: { onOpenQuote: () => void }) {
  const pillars = [
    {
      icon: UserCheck,
      title: 'You work with the person doing the work',
      description: 'Your project is planned, reviewed, and engineered under the direct supervision of a senior technology leader—no handoffs to junior offshore account reps.'
    },
    {
      icon: FileCheck,
      title: 'A clear plan before we start',
      description: 'We agree on the important pieces, the milestones, and what done means so you always know what is being built.'
    },
    {
      icon: DollarSign,
      title: 'Straightforward estimates',
      description: 'You get clear pricing and a clear explanation of the work. If a request falls outside the plan, we talk about it before it becomes a surprise.'
    },
    {
      icon: ShieldCheck,
      title: 'Careful with your data and your code',
      description: 'We use sensible security practices, strong typing, validation, and careful API design because reliable software is built on good habits.'
    },
    {
      icon: Clock,
      title: 'Help after launch',
      description: 'Every custom software delivery includes 30 days for fixing defects and smoothing out performance issues at no extra cost.'
    },
    {
      icon: Headphones,
      title: 'A place to keep everything together',
      description: 'Your private portal keeps milestones, estimates, approvals, requests, and invoices in one place.'
    }
  ];

  return (
    <section id="trust" className="py-20 bg-white border-t border-slate-200 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-slate-50/30 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            What working with us feels like
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Thoughtful work, clear communication, and no unnecessary drama.
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            We work best with teams that want a dependable technical partner who listens, explains the trade-offs, and follows through.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-lg transition-all glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <motion.div
                  className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <motion.h3
                  className="mt-4 text-lg font-bold text-slate-900"
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {p.title}
                </motion.h3>
                <p className="mt-2 text-base text-slate-600 leading-relaxed">
                  {p.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Conversion Banner */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 rounded-2xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-xl overflow-hidden relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated background effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundSize: '200% 200%',
            }}
          />

          <div className="space-y-2 max-w-xl relative z-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Have something that needs fixing or building?
            </h3>
            <p className="text-sm sm:text-base text-slate-300">
              Tell us what is happening today and where you want to get to. We will reply within 1 business day with a useful next step.
            </p>
          </div>
          <motion.button
            onClick={onOpenQuote}
            className="px-6 py-3.5 rounded-xl font-semibold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-all whitespace-nowrap shrink-0 relative z-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start a conversation
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

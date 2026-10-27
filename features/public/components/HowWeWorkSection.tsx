import React from 'react';
import { motion } from 'motion/react';
import { Search, Compass, Cpu, RefreshCw } from 'lucide-react';

export function HowWeWorkSection() {
  const steps = [
    {
      step: '01',
      title: 'Listen',
      tagline: 'Start with the problem, not the tool',
      description: 'We learn how the work happens today, where it gets stuck, and what a better day would look like before recommending a technical solution.',
      icon: Search
    },
    {
      step: '02',
      title: 'Make a plan',
      tagline: 'A clear scope and a sensible path forward',
      description: 'We agree on what matters first, what it will take, and how we will show progress. You know what is included before the work begins.',
      icon: Compass
    },
    {
      step: '03',
      title: 'Do the work',
      tagline: 'Small steps, regular updates, solid foundations',
      description: 'We build in visible increments, test as we go, and share working previews so you can give useful feedback while there is still time to use it.',
      icon: Cpu
    },
    {
      step: '04',
      title: 'Stay involved',
      tagline: 'Support after launch, when it is useful',
      description: 'After launch, we help fix the rough edges, keep things healthy, and make the next improvement when your business is ready for it.',
      icon: RefreshCw
    }
  ];

  return (
    <section id="process" className="py-20 bg-white border-t border-slate-200 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-blue-50/30 z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            How the work comes together
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            A straightforward way to get good work done.
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            The process is simple: understand the need, agree on the plan, build it together, and stay available when it is live.
          </p>
        </motion.div>

        {/* 4-Stage Horizontal Timeline (desktop) / Stepper (mobile) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Animated line across desktop */}
          <motion.div
            className="hidden md:block absolute top-7 left-10 right-10 h-0.5 bg-slate-200 -z-0"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
          />

          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={idx}
                className="relative z-10 flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
              >
                <div className="flex items-center gap-3 md:flex-col md:items-start">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-white border-2 border-blue-600 shadow-xs flex items-center justify-center text-blue-600"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  <span className="text-sm font-mono font-bold text-blue-600 md:mt-4">
                    Step {s.step}
                  </span>
                </div>

                <motion.h3
                  className="mt-3 text-lg font-bold text-slate-900"
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {s.title}
                </motion.h3>
                <div className="text-sm font-medium text-slate-500 mb-2">
                  {s.tagline}
                </div>
                <p className="text-base text-slate-600 leading-relaxed">
                  {s.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

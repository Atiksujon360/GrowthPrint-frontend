import React from 'react';
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
    <section id="process" className="py-20 bg-white border-t border-slate-200 relative overflow-hidden overflow-x-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            How the work comes together
          </div>
          <h2 className="mt-2 text-[clamp(1.875rem,4vw,2.25rem)] font-bold text-slate-900 tracking-tight">
            A straightforward way to get good work done.
          </h2>
          <p className="mt-4 text-[clamp(1rem,1.5vw,1.125rem)] text-slate-600 leading-relaxed">
            The process is simple: understand the need, agree on the plan, build it together, and stay available when it is live.
          </p>
        </div>

        {/* 4-Stage Horizontal Timeline (desktop) / Stepper (mobile) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Line across desktop */}
          <div className="hidden md:block absolute top-7 left-10 right-10 h-0.5 bg-slate-200 z-0" />

          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="relative z-10 flex flex-col">
                <div className="flex items-center gap-3 md:flex-col md:items-start">
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-blue-600 shadow-xs flex items-center justify-center text-blue-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-mono font-bold text-blue-600 md:mt-4">
                    Step {s.step}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  {s.title}
                </h3>
                <div className="text-sm font-medium text-slate-500 mb-2">
                  {s.tagline}
                </div>
                <p className="text-base text-slate-600 leading-relaxed">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

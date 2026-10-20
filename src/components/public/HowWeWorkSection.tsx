import React from 'react';
import { Search, Compass, Cpu, RefreshCw } from 'lucide-react';

export function HowWeWorkSection() {
  const steps = [
    {
      step: '01',
      title: 'Discover',
      tagline: 'Understand the business problem first',
      description: 'We audit your existing technical stack, talk through operational bottlenecks, and identify exactly where custom code or automation delivers genuine value.',
      icon: Search
    },
    {
      step: '02',
      title: 'Plan',
      tagline: 'Fixed scope, transparent costs, milestones',
      description: 'We define explicit deliverables, dependencies, exclusions, and payment milestones. You get an unambiguous specification before any work begins.',
      icon: Compass
    },
    {
      step: '03',
      title: 'Build',
      tagline: 'Production-grade engineering & updates',
      description: 'We build cleanly with modern TypeScript, automated tests, and regular staging previews. You see progress on a live development sandbox.',
      icon: Cpu
    },
    {
      step: '04',
      title: 'Improve',
      tagline: 'Ongoing maintenance & evolution',
      description: 'Post-launch 30-day warranty followed by structured monthly support retainers. As your business grows, your platform scales reliably.',
      icon: RefreshCw
    }
  ];

  return (
    <section id="process" className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Delivery Methodology
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            How We Work Together
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            A disciplined four-phase delivery framework that ensures total clarity on timelines, technical deliverables, and commercial commitments.
          </p>
        </div>

        {/* 4-Stage Horizontal Timeline (desktop) / Stepper (mobile) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Subtle line across desktop */}
          <div className="hidden md:block absolute top-7 left-10 right-10 h-0.5 bg-slate-200 -z-0" />

          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="relative z-10 flex flex-col">
                <div className="flex items-center gap-3 md:flex-col md:items-start">
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-blue-600 shadow-xs flex items-center justify-center text-blue-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-600 md:mt-4">
                    Stage {s.step}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  {s.title}
                </h3>
                <div className="text-xs font-medium text-slate-500 mb-2">
                  {s.tagline}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
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

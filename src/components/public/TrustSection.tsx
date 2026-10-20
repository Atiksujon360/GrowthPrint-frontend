import React from 'react';
import { ShieldCheck, FileCheck, DollarSign, UserCheck, Clock, Headphones } from 'lucide-react';

export function TrustSection({ onOpenQuote }: { onOpenQuote: () => void }) {
  const pillars = [
    {
      icon: UserCheck,
      title: 'Direct Founder Oversight',
      description: 'Your project is planned, reviewed, and engineered under the direct supervision of a senior technology leader—no handoffs to junior offshore account reps.'
    },
    {
      icon: FileCheck,
      title: 'Defined Scope & Deliverables',
      description: 'Every project begins with an explicit blueprint, milestone breakdown, and documented acceptance criteria so you never wonder what is being built.'
    },
    {
      icon: DollarSign,
      title: 'Transparent Estimates & Billing',
      description: 'Clear pricing with no surprise bills. We classify requests into included maintenance, warranty reviews, or fixed ad-hoc estimates before billing.'
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise Security & Code Quality',
      description: 'Strict TypeScript typing, environment secret segregation, automated validation schemas, and defensive API architectures.'
    },
    {
      icon: Clock,
      title: '30-Day Post-Launch Warranty',
      description: 'Every custom software delivery includes a 30-day comprehensive defect warranty covering bug corrections and performance tuning at zero added cost.'
    },
    {
      icon: Headphones,
      title: 'Dedicated Client Portal',
      description: 'Track milestones, review estimates, approve proposals, submit urgent tickets, and download reconciled invoices in your private dashboard.'
    }
  ];

  return (
    <section id="trust" className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Why GrowthPrint
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Built On Professional Standards & Engineering Discipline
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            We partner with businesses that need reliable, high-touch technology delivery without the bloat, delays, and miscommunication of traditional agencies.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div 
                key={idx} 
                className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Conversion Banner */}
        <div className="mt-16 bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 rounded-2xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Have a Project in Mind?
            </h3>
            <p className="text-sm sm:text-base text-slate-300">
              Tell us what you are trying to build, maintain, or automate. We will respond within 1 business day with concrete next steps.
            </p>
          </div>
          <button
            onClick={onOpenQuote}
            className="px-6 py-3.5 rounded-xl font-semibold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-all whitespace-nowrap shrink-0"
          >
            Start a Project Conversation
          </button>
        </div>
      </div>
    </section>
  );
}

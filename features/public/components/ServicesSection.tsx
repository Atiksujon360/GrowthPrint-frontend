import React from 'react';
import { 
  Code2, 
  Wrench, 
  LineChart, 
  Workflow, 
  Cpu, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import type { ServiceCategory } from '../../../types/agency.ts';

interface ServicesSectionProps {
  onSelectService: (service: ServiceCategory) => void;
}

export function ServicesSection({ onSelectService }: { onSelectService: (service: ServiceCategory) => void }) {
  const services = [
    {
      id: 'SOFTWARE_DEV' as ServiceCategory,
      number: '01',
      title: 'Software built around your work',
      icon: Code2,
      description: 'We build the portals, internal tools, and integrations your team needs to do good work without fighting the software.',
      deliverables: [
        'Client and customer portals',
        'Custom web applications',
        'Reliable API integrations',
        'Careful upgrades to older systems'
      ],
      ctaText: 'Talk through a software idea'
    },
    {
      id: 'WEBSITE_MAINTENANCE' as ServiceCategory,
      number: '02',
      title: 'A steady hand for your website',
      icon: Wrench,
      description: 'Keep important websites and applications secure, dependable, and moving forward when your team needs an extra pair of hands.',
      deliverables: [
        'Bug fixes and urgent repairs',
        'Security and dependency updates',
        'Performance and database tuning',
        'Ongoing support when it helps'
      ],
      ctaText: 'Improve my website'
    },
    {
      id: 'TECHNICAL_SEO' as ServiceCategory,
      number: '03',
      title: 'Make your website easier to find',
      icon: LineChart,
      description: 'We remove the technical issues that make a website slow, difficult to understand, or easy for search engines to miss.',
      deliverables: [
        'Core Web Vitals improvements',
        'Rendering and page-speed reviews',
        'Structured data setup',
        'Crawl and indexing fixes'
      ],
      ctaText: 'Request an SEO review'
    },
    {
      id: 'BUSINESS_AUTOMATION' as ServiceCategory,
      number: '04',
      title: 'Less repetitive work',
      icon: Workflow,
      description: 'We connect the tools your team already uses so routine work happens reliably in the background.',
      deliverables: [
        'API and webhook connections',
        'Reliable workflow automation',
        'Lead and customer hand-offs',
        'Reports and useful alerts'
      ],
      ctaText: 'Explore automation'
    },
    {
      id: 'AI_INTEGRATION' as ServiceCategory,
      number: '05',
      title: 'Useful AI, used carefully',
      icon: Cpu,
      description: 'When it genuinely helps, we add AI to the right part of a workflow—with clear checks, useful boundaries, and a person still in control.',
      deliverables: [
        'Document extraction and review',
        'Internal knowledge assistants',
        'Lead research and qualification',
        'Human review where it matters'
      ],
      ctaText: 'Discuss an AI use case'
    }
  ];

  return (
    <section id="services" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            What we can help with
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
            Practical help for the work behind your business.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            We don’t sell buzzwords or abstract concepts. We build, maintain, and automate practical software systems that help businesses operate with higher efficiency.
          </p>
        </div>

        {/* Services Bento / Asymmetric Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isFeatured = index === 0;

            return (
              <div
                key={service.id}
                className={`bg-white rounded-2xl p-7 border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between ${
                  isFeatured ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white to-blue-50/30' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-400">
                      {service.number}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900 tracking-tight">
                    {service.title}
                  </h3>

                  <p className="mt-2 text-base text-slate-600 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Deliverables list */}
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      What you can expect
                    </div>
                    <ul className={`grid gap-2 text-sm text-slate-700 ${isFeatured ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                      {service.deliverables.map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => onSelectService(service.id)}
                    className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 group"
                  >
                    <span>{service.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

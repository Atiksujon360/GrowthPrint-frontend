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
import type { ServiceCategory } from '../../types/index.ts';

interface ServicesSectionProps {
  onSelectService: (service: ServiceCategory) => void;
}

export function ServicesSection({ onSelectService }: { onSelectService: (service: ServiceCategory) => void }) {
  const services = [
    {
      id: 'SOFTWARE_DEV' as ServiceCategory,
      number: '01',
      title: 'Custom Software Development',
      icon: Code2,
      description: 'Modern web applications, customer portals, internal business platforms, and robust API integrations designed for stability.',
      deliverables: [
        'Client & Customer Portals',
        'Custom Web Applications (Next.js / React)',
        'RESTful & GraphQL API Gateways',
        'Modernization of Legacy Codebases'
      ],
      ctaText: 'Discuss a Software Project'
    },
    {
      id: 'WEBSITE_MAINTENANCE' as ServiceCategory,
      number: '02',
      title: 'Website & Application Support',
      icon: Wrench,
      description: 'Keep your revenue-critical digital products dependable, secure, patched, and ready to evolve without internal engineering overhead.',
      deliverables: [
        'Rapid Bug Resolution & Hotfixes',
        'Runtime & Dependency Patching',
        'Performance & Database Tuning',
        'Scheduled Retainer Support SLA'
      ],
      ctaText: 'Improve My Website'
    },
    {
      id: 'TECHNICAL_SEO' as ServiceCategory,
      number: '03',
      title: 'SEO & Technical Optimization',
      icon: LineChart,
      description: 'Strengthen technical foundations so search engines can crawl, index, and surface your digital presence cleanly and quickly.',
      deliverables: [
        'Core Web Vitals Optimization (LCP/INP)',
        'Server-Side Rendering & Hydration Audits',
        'Schema.org Structured Data Implementation',
        'Technical Crawlability & Indexing Health'
      ],
      ctaText: 'Request an SEO Review'
    },
    {
      id: 'BUSINESS_AUTOMATION' as ServiceCategory,
      number: '04',
      title: 'Business Process Automation',
      icon: Workflow,
      description: 'Eliminate repetitive manual tasks and synchronize the SaaS platforms, databases, and operational tools your team uses daily.',
      deliverables: [
        'API & Webhook Integration Pipelines',
        'n8n & Workflow Orchestration',
        'Lead & Customer Hand-off Workflows',
        'Automated Reporting & Slack/Email Alerts'
      ],
      ctaText: 'Explore Automation'
    },
    {
      id: 'AI_INTEGRATION' as ServiceCategory,
      number: '05',
      title: 'AI Integration & Practical Technology',
      icon: Cpu,
      description: 'Implement targeted, practical AI capabilities that streamline real business workflows, document processing, and customer experiences.',
      deliverables: [
        'Document Extraction & Parsing Pipelines',
        'Internal Knowledge & Operational Assistants',
        'Automated Lead Research & Qualification',
        'Safe Human-in-the-Loop AI Gates'
      ],
      ctaText: 'Discuss an AI Opportunity'
    }
  ];

  return (
    <section id="services" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Core Capabilities
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
            Delivering Business Outcomes Through Reliable Engineering.
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

                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Deliverables list */}
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Key Deliverables
                    </div>
                    <ul className={`grid gap-2 text-xs text-slate-700 ${isFeatured ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
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
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 group"
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

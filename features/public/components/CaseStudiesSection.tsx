import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, TrendingUp, Layers, Clock } from 'lucide-react';
import platformImage from '../../../assets/images/case_custom_platform_1792450307968.jpg';
import automationImage from '../../../assets/images/case_process_automation_1792450307750.jpg';

export function CaseStudiesSection() {
  const [platformImgError, setPlatformImgError] = useState(false);
  const [automationImgError, setAutomationImgError] = useState(false);

  const cases = [
    {
      client: 'Meridian Retail Group',
      industry: 'Omni-Channel Retail & Logistics',
      title: 'Real-Time Order Dispatch & B2B Inventory Portal',
      problem: 'Manual spreadsheet reconciliations between 4 regional warehouses led to shipping delays, inventory stockouts, and high customer support overhead during sales spikes.',
      solution: 'Custom Next.js web application integrating ERP inventory databases with automated carrier dispatch webhooks and a client-facing order tracking portal.',
      results: [
        '+42% faster order fulfillment from warehouse to carrier',
        'Eliminated 18 weekly hours of manual spreadsheet data entry',
        'Near-zero inventory desynchronization across 12,000 SKUs'
      ],
      techStack: ['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis'],
      image: platformImage.src,
      error: platformImgError,
      setError: setPlatformImgError
    },
    {
      client: 'Nexus Logistics Systems',
      industry: 'Freight & Fleet Management',
      title: 'Automated Carrier EDI & Webhook Ingestion Engine',
      problem: 'Carrier status updates arrived via disjointed legacy EDI flat files and email attachments, resulting in 45-minute dock delays for arriving drivers.',
      solution: 'Event-driven automation pipeline that parses bill-of-lading documents, dynamically assigns dock queue slots, and sends instant driver dispatch notifications.',
      results: [
        '35% reduction in truck dock turnaround latency',
        'Automatic retry queues with zero dropped carrier webhooks',
        'Full operational visibility across Midwest distribution hubs'
      ],
      techStack: ['TypeScript', 'Express', 'Event Queue', 'EDI 214/204', 'PostgreSQL'],
      image: automationImage.src,
      error: automationImgError,
      setError: setAutomationImgError
    }
  ];

  return (
    <section id="work" className="py-20 bg-slate-50 border-t border-slate-200 relative overflow-hidden overflow-x-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-50 via-white to-blue-50 -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              A few problems we have helped solve
            </div>
            <h2 className="mt-2 text-[clamp(1.875rem,4vw,2.25rem)] font-bold text-slate-900 tracking-tight">
              Work that made a real difference.
            </h2>
            <p className="mt-4 text-[clamp(1rem,1.5vw,1.125rem)] text-slate-600 leading-relaxed">
              These are examples of the kinds of messy, important problems we like to make simpler.
            </p>
          </div>
          <div className="text-sm text-slate-500 font-medium pb-2">
            Selected client work
          </div>
        </div>

        {/* Case Cards */}
        <div className="mt-12 space-y-12">
          {cases.map((c, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-shadow grid grid-cols-1 lg:grid-cols-12"
            >
              {/* Image side */}
              <div className="lg:col-span-5 relative bg-slate-100 min-h-65 lg:min-h-full overflow-hidden">
                {!c.error ? (
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                    onError={() => c.setError(true)}
                  />
                ) : (
                  <div className="w-full h-full min-h-65 flex items-center justify-center bg-slate-900 text-white p-8">
                    <div className="text-center space-y-2">
                      <Layers className="w-8 h-8 text-blue-400 mx-auto" />
                      <div className="text-sm font-semibold">{c.client}</div>
                      <div className="text-xs text-slate-400">{c.industry}</div>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-md text-xs font-semibold text-slate-900 shadow-xs border border-slate-200">
                  {c.industry}
                </div>
              </div>

              {/* Content side */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {c.client}
                  </div>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
                    {c.title}
                  </h3>

                  <div className="mt-4 space-y-3 text-base text-slate-600">
                    <div>
                      <strong className="text-slate-900 font-medium">What was getting in the way: </strong>
                      {c.problem}
                    </div>
                    <div>
                      <strong className="text-slate-900 font-medium">What we changed: </strong>
                      {c.solution}
                    </div>
                  </div>

                  {/* Quantified outcomes */}
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      What improved
                    </div>
                    <ul className="space-y-1.5 text-sm text-slate-800">
                      {c.results.map((r, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-medium">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tech tags */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-400 mr-1">Stack:</span>
                  {c.techStack.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

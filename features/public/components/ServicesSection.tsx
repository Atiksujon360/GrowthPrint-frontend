import React, { useId, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ServiceCategory } from '../../../types/agency.ts';

/**
 * Services as an index: five practice areas (each maps to the inquiry form's service category) with the specific
 * services listed under each. Desktop: a tab list beside a detail panel. Mobile: every area stacked and readable.
 * All panels are in the DOM for search engines; inactive ones use `hidden` on desktop only.
 */
const SERVICES: Array<{
  id: ServiceCategory; title: string; summary: string; includes: string[]; cta: string;
}> = [
  {
    id: 'SOFTWARE_DEV',
    title: 'Custom software and web applications',
    summary: 'Portals, internal tools and SaaS products built around how your team actually works, with a backend and API that can grow with you.',
    includes: ['Custom software development', 'Website and web application development', 'Backend development', 'API integration', 'SaaS development and integration'],
    cta: 'Discuss a software project',
  },
  {
    id: 'WEBSITE_MAINTENANCE',
    title: 'Modernization, maintenance and support',
    summary: 'A steady pair of hands for the systems you already rely on: careful upgrades, fixes, and keeping things fast, secure and current.',
    includes: ['Website and application modernization', 'Application maintenance and support', 'Bug fixes and performance optimization', 'Security and dependency updates'],
    cta: 'Get help with an existing system',
  },
  {
    id: 'TECHNICAL_SEO',
    title: 'Performance and technical SEO',
    summary: 'Remove the technical issues that make a site slow, hard to crawl or easy for search engines to misunderstand.',
    includes: ['Core Web Vitals improvements', 'Rendering and page-speed reviews', 'Structured data', 'Crawl and indexing fixes'],
    cta: 'Request a performance review',
  },
  {
    id: 'BUSINESS_AUTOMATION',
    title: 'Business automation',
    summary: 'Connect the tools you already use so routine work runs reliably in the background, with failures visible and retried.',
    includes: ['Workflow automation', 'API and webhook connections', 'Lead and customer hand-offs', 'Reports and alerts'],
    cta: 'Explore automation',
  },
  {
    id: 'AI_INTEGRATION',
    title: 'AI integration, used carefully',
    summary: 'AI added to the part of a workflow where it genuinely helps, with clear boundaries and a person approving what matters.',
    includes: ['AI implementation', 'Document extraction and review', 'Internal knowledge assistants', 'Technical consulting and architecture'],
    cta: 'Discuss an AI use case',
  },
];

export function ServicesSection({ onSelectService }: { onSelectService: (service: ServiceCategory) => void }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + SERVICES.length) % SERVICES.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="services" aria-labelledby="services-title" className="border-b border-ink-200 bg-white">
      <div className="gp-frame py-20 md:py-28">
        <div className="max-w-3xl">
          <h2 id="services-title" className="gp-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.08] text-ink-950 text-balance">
            Engineering for the systems your business runs on.{' '}
            <span className="gp-headline-muted">From a first version to the tenth year of maintenance.</span>
          </h2>
        </div>

        {/* Desktop: tabs + panel */}
        <div className="mt-14 hidden gap-10 lg:grid lg:grid-cols-12">
          <div role="tablist" aria-label="Services" aria-orientation="vertical" className="lg:col-span-5">
            {SERVICES.map((s, i) => (
              <button
                key={s.id}
                ref={el => { tabRefs.current[i] = el; }}
                role="tab"
                id={`${baseId}-tab-${i}`}
                aria-selected={active === i}
                aria-controls={`${baseId}-panel-${i}`}
                tabIndex={active === i ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={e => onKeyDown(e, i)}
                className={`group relative flex w-full items-center justify-between border-t border-ink-200 py-5 pl-5 text-left transition-colors last:border-b ${
                  active === i ? 'text-ink-950' : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                <span aria-hidden="true" className={`absolute left-0 top-0 h-full w-[3px] origin-top bg-brand-500 transition-transform duration-300 ${active === i ? 'scale-y-100' : 'scale-y-0'}`} />
                <span className="gp-display text-[1.35rem] font-semibold leading-snug">{s.title}</span>
                <ArrowRight className={`h-5 w-5 shrink-0 transition-all ${active === i ? 'translate-x-0 opacity-100 text-brand-600' : '-translate-x-2 opacity-0'}`} aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="lg:col-span-7">
            {SERVICES.map((s, i) => (
              <div key={s.id} role="tabpanel" id={`${baseId}-panel-${i}`} aria-labelledby={`${baseId}-tab-${i}`}
                hidden={active !== i} className="h-full rounded-2xl bg-ink-50 p-10 ring-1 ring-ink-200">
                <p className="max-w-xl text-xl leading-relaxed text-ink-800">{s.summary}</p>
                <ServiceIncludes items={s.includes} />
                <button onClick={() => onSelectService(s.id)}
                  className="mt-10 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy-950 px-6 font-semibold text-white transition-colors hover:bg-brand-700">
                  {s.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile and tablet: stacked */}
        <div className="mt-12 divide-y divide-ink-200 border-y border-ink-200 lg:hidden">
          {SERVICES.map(s => (
            <article key={s.id} className="py-8">
              <h3 className="gp-display text-2xl font-semibold text-ink-950">{s.title}</h3>
              <p className="mt-3 text-lg leading-relaxed text-ink-700">{s.summary}</p>
              <ServiceIncludes items={s.includes} />
              <button onClick={() => onSelectService(s.id)}
                className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700">
                {s.cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceIncludes({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2" aria-label="Includes">
      {items.map(item => (
        <li key={item} className="flex gap-3 text-[0.98rem] text-ink-800">
          <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
          {item}
        </li>
      ))}
    </ul>
  );
}

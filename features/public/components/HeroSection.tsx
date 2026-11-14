import React from 'react';
import { isMockModeEnv } from '../../../lib/api/client.ts';
import { ArrowRight, ArrowUpRight, Check, Code2, RefreshCw, Workflow, Sparkles } from 'lucide-react';
import { useAppDispatch } from '../../../store/hooks.ts';
import { useRouter } from 'next/navigation';
import { setActiveView, switchRole } from '../../../store/index.ts';
import { scrollToSection } from '../../../lib/scroll.ts';

/** The technologies GrowthPrint builds with (text, not customer logos: no clients are implied). */
const STACK = ['Next.js', 'React', 'TypeScript', 'Node.js', 'Java / Spring Boot', 'PostgreSQL', 'REST & webhooks'];

/** True statements only (see TrustSection and FAQ): no invented customers, ratings or numbers. */
const TRUST = ['Written scope before work starts', '30-day defect warranty', 'Reply within one business day'];

const PRACTICES = [
  { icon: Code2, title: 'Web and software', text: 'Portals, SaaS products and APIs' },
  { icon: RefreshCw, title: 'Modernization', text: 'Upgrades, maintenance and fixes' },
  { icon: Workflow, title: 'Automation', text: 'Workflows and integrations' },
  { icon: Sparkles, title: 'AI integration', text: 'With a person approving what matters' },
];

const STEPS = [
  { title: 'Discovery', text: 'How the work happens today' },
  { title: 'Plan and design', text: 'Scope, milestones and screens' },
  { title: 'Build and deliver', text: 'Tested increments you can try' },
  { title: 'Support', text: 'Fixes and the next improvements' },
];

/**
 * Homepage hero (reference C composition, agency positioning): centred announcement pill, two-line headline,
 * supporting copy, primary and secondary CTA, trust ticks, then a showcase of what we build and how a project runs.
 */
export function HeroSection({ onOpenQuote }: { onOpenQuote: () => void }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  // Same opt-in rule as the API client: demo shortcuts only when NEXT_PUBLIC_USE_MOCK_API === 'true'.
  const isMockMode = isMockModeEnv();

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden border-b border-ink-200 bg-white">
      {/* Depth, decorative only: a soft teal glow and a dot grid that fades out towards the edges. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(60% 55% at 50% 0%, rgb(22 160 131 / 0.14) 0%, rgb(22 160 131 / 0.04) 45%, transparent 75%)',
        }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage: 'radial-gradient(rgb(12 130 108 / 0.16) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(70% 60% at 50% 20%, black 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(70% 60% at 50% 20%, black 0%, transparent 75%)',
        }} />
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 text-center md:px-8 md:pt-24">
        <p className="inline-flex items-center rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-100">
          Digital engineering and IT services
        </p>
        <h1 id="hero-title" className="mx-auto mt-6 max-w-4xl text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[1.06] tracking-tight text-ink-950">
          Build smarter. Modernize faster.
          <span className="block text-brand-700">Grow further.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-[clamp(1.05rem,1.6vw,1.2rem)] leading-relaxed text-ink-600">
          We help businesses build powerful digital experiences, modernize their technology and automate operations
          through thoughtful engineering.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={onOpenQuote}
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand-700 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-800"
          >
            Discuss your project <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <a
            href="#work"
            onClick={(event) => { event.preventDefault(); scrollToSection('work'); }}
            className="inline-flex min-h-12 items-center rounded-lg border border-ink-200 bg-white px-6 text-base font-semibold text-ink-900 transition-colors hover:border-ink-400"
          >
            Explore our work
          </a>
        </div>

        <ul className="mt-7 flex flex-col items-center justify-center gap-x-8 gap-y-2 text-[0.95rem] text-ink-700 sm:flex-row" aria-label="What you can count on">
          {TRUST.map(t => (
            <li key={t} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-white" aria-hidden="true">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {t}
            </li>
          ))}
        </ul>

        <button
          onClick={() => {
            if (isMockMode) {
              dispatch(switchRole('CLIENT'));
              dispatch(setActiveView('PORTAL'));
            } else {
              router.push('/client-hub/login');
            }
          }}
          className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-ink-600 underline-offset-4 hover:text-brand-700 hover:underline"
        >
          Already working with us? Sign in to your client portal
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Showcase: what we build and how a project runs (not the internal dashboard). */}
        {/* One framed "stage" holding both cards, lifted off the page. */}
        <div className="mx-auto mt-14 max-w-5xl rounded-2xl bg-gradient-to-b from-brand-50 to-white p-2 text-left shadow-[0_24px_60px_-28px_rgb(6_40_36/0.35)] ring-1 ring-brand-100 sm:p-3">
          <div className="grid gap-2 sm:gap-3 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-xl bg-white p-6 ring-1 ring-ink-200/80">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-base font-semibold text-ink-950">What we build and support</h2>
                <span className="hidden text-xs font-medium text-brand-700 sm:inline">One accountable team</span>
              </div>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {PRACTICES.map(({ icon: Icon, title, text }) => (
                  <li key={title}
                    className="group flex gap-3 rounded-lg border border-ink-200 bg-white p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-colors group-hover:bg-brand-700 group-hover:text-white" aria-hidden="true">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink-950">{title}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-ink-500">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-white p-6 ring-1 ring-ink-200/80">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-base font-semibold text-ink-950">How a project runs</h2>
                <span className="hidden text-xs font-medium text-brand-700 sm:inline">Visible at every step</span>
              </div>
              <ol className="relative mt-5 space-y-5">
                {/* Connecting line behind the step markers: these steps really are a sequence. */}
                <span aria-hidden="true" className="absolute bottom-3 left-[13px] top-3 w-px bg-gradient-to-b from-brand-300 to-brand-100" />
                {STEPS.map((s, i) => (
                  <li key={s.title} className="relative flex gap-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white ${
                      i === 0 ? 'bg-brand-700 text-white' : 'bg-brand-50 text-brand-700'}`} aria-hidden="true">{i + 1}</span>
                    <span>
                      <span className="block text-sm font-semibold text-ink-950">{s.title}</span>
                      <span className="block text-sm text-ink-500">{s.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-200">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-6 md:flex-row md:justify-center md:gap-10 md:px-8">
          <p className="shrink-0 text-sm font-medium text-ink-500">What we build with</p>
          <ul className="flex flex-wrap justify-center gap-x-7 gap-y-2" aria-label="Technologies">
            {STACK.map(t => <li key={t} className="text-[0.95rem] font-semibold text-ink-800">{t}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { isMockModeEnv } from '../../../lib/api/client.ts';
import { ArrowUpRight } from 'lucide-react';
import { useAppDispatch } from '../../../store/hooks.ts';
import { useRouter } from 'next/navigation';
import { setActiveView, switchRole } from '../../../store/index.ts';
import { scrollToSection } from '../../../lib/scroll.ts';
import { BlueprintDrawing } from './BlueprintDrawing.tsx';

/** The technologies GrowthPrint builds with (text, not customer logos: no clients are implied). */
const STACK = ['Next.js', 'React', 'TypeScript', 'Node.js', 'Java / Spring Boot', 'PostgreSQL', 'REST & webhooks'];

export function HeroSection({ onOpenQuote }: { onOpenQuote: () => void }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  // Same opt-in rule as the API client: demo shortcuts only when NEXT_PUBLIC_USE_MOCK_API === 'true'.
  const isMockMode = isMockModeEnv();

  return (
    <section aria-labelledby="hero-title" className="border-b border-ink-200">
      <div className="gp-frame">
        <div className="grid items-center gap-12 pb-14 pt-14 md:pt-20 lg:grid-cols-12 lg:gap-10 lg:pb-20">
          <div className="lg:col-span-6">
            <p className="text-[0.95rem] font-medium text-brand-700">Digital engineering and IT services</p>
            <h1 id="hero-title" className="gp-display mt-5 text-[clamp(2.4rem,5.2vw,4.1rem)] font-semibold leading-[1.03] text-ink-950">
              <span className="block">Build smarter.</span>
              <span className="block">Modernize faster.</span>
              <span className="block">Grow further.</span>
            </h1>
            <p className="mt-6 max-w-[34rem] text-[clamp(1.1rem,1.6vw,1.3rem)] leading-relaxed text-ink-600">
              We help businesses build powerful digital experiences, modernize their technology and automate
              operations through thoughtful engineering.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenQuote}
                className="inline-flex min-h-12 items-center rounded-full bg-brand-600 px-6 text-base font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Discuss your project
              </button>
              <a
                href="#work"
                onClick={(event) => { event.preventDefault(); scrollToSection('work'); }}
                className="inline-flex min-h-12 items-center rounded-full border border-ink-300 px-6 text-base font-semibold text-ink-900 transition-colors hover:border-ink-900"
              >
                Explore our work
              </a>
            </div>
            <button
              onClick={() => {
                if (isMockMode) {
                  dispatch(switchRole('CLIENT'));
                  dispatch(setActiveView('PORTAL'));
                } else {
                  router.push('/client-hub/login');
                }
              }}
              className="mt-5 block min-h-11 py-2 text-left text-[0.95rem] font-medium text-ink-600 underline-offset-4 hover:text-brand-700 hover:underline"
            >
              Already working with us? Sign in to your client portal
              <ArrowUpRight className="ml-1 inline h-4 w-4 align-[-0.15em]" aria-hidden="true" />
            </button>
          </div>

          <div className="lg:col-span-6">
            <BlueprintDrawing />
          </div>
        </div>
      </div>

      <div className="border-t border-ink-200">
        <div className="gp-frame">
          <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:gap-10">
            <p className="shrink-0 text-sm font-medium text-ink-500">What we build with</p>
            <ul className="flex flex-wrap gap-x-7 gap-y-2" aria-label="Technologies">
              {STACK.map(t => <li key={t} className="text-[0.95rem] font-semibold text-ink-800">{t}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

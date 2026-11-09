import React from 'react';
import { isMockModeEnv } from '../../../lib/api/client.ts';
import { useAppDispatch } from '../../../store/hooks.ts';
import { useRouter } from 'next/navigation';
import { setActiveView, switchRole } from '../../../store/index.ts';
import { ArrowUpRight } from 'lucide-react';
import { scrollToSection } from '../../../lib/scroll.ts';
import { GrowthPrintMark } from './GrowthPrintMark.tsx';

function handleFooterSectionClick(event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) {
  event.preventDefault();
  scrollToSection(sectionId);
}

const linkClass = 'inline-flex min-h-10 items-center text-[0.95rem] text-white/70 transition-colors hover:text-white';

export function PublicFooter({ onOpenQuote }: { onOpenQuote: () => void }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  // Same opt-in rule as the API client: demo shortcuts only when NEXT_PUBLIC_USE_MOCK_API === 'true'.
  const isMockMode = isMockModeEnv();

  return (
    <footer className="gp-on-dark bg-navy-950 text-white">
      <div className="gp-frame pt-20">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-16 md:flex-row md:items-end">
          <p className="gp-display max-w-2xl text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-[1.05] text-balance">
            Tell us what is getting in the way.{' '}
            <span className="gp-headline-muted">We will reply with a useful next step.</span>
          </p>
          <button onClick={onOpenQuote}
            className="inline-flex min-h-12 shrink-0 items-center rounded-full bg-brand-500 px-6 font-semibold text-navy-950 transition-colors hover:bg-brand-400">
            Tell us what you need
          </button>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <GrowthPrintMark className="h-7 w-7" tone="light" />
              <span className="gp-display text-lg font-semibold">GrowthPrint</span>
            </div>
            <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-white/60">
              Digital engineering and IT services: we build, modernize, maintain and automate the systems growing businesses rely on.
            </p>
            <address className="mt-6 space-y-1 text-[0.95rem] not-italic text-white/70">
              <a className="block hover:text-white" href="mailto:contact@growthprint.agency">contact@growthprint.agency</a>
              <span className="block">San Francisco, CA. Working with teams anywhere.</span>
            </address>
          </div>

          <nav aria-label="Services" className="lg:col-span-3">
            <h2 className="text-sm font-semibold text-white">Services</h2>
            <ul className="mt-3">
              {['Custom software', 'Modernization and support', 'Performance and SEO', 'Business automation', 'AI integration'].map(s => (
                <li key={s}><a href="#services" onClick={(event) => handleFooterSectionClick(event, 'services')} className={linkClass}>{s}</a></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company" className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-white">Company</h2>
            <ul className="mt-3">
              <li><a href="#work" onClick={(event) => handleFooterSectionClick(event, 'work')} className={linkClass}>Work</a></li>
              <li><a href="#process" onClick={(event) => handleFooterSectionClick(event, 'process')} className={linkClass}>How we work</a></li>
              <li><a href="#why-growthprint" onClick={(event) => handleFooterSectionClick(event, 'why-growthprint')} className={linkClass}>Why GrowthPrint</a></li>
              <li><a href="#faq" onClick={(event) => handleFooterSectionClick(event, 'faq')} className={linkClass}>Common questions</a></li>
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-white">Client access</h2>
            <ul className="mt-3">
              <li>
                <button
                  onClick={() => {
                    if (isMockMode) {
                      dispatch(switchRole('CLIENT'));
                      dispatch(setActiveView('PORTAL'));
                    } else {
                      router.push('/client-hub/login');
                    }
                  }}
                  className={`${linkClass} gap-1 text-mint-300`}
                >
                  Open the client portal
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
              {/* The internal studio is never linked from the public site (its path is not advertised);
                  only the demo build keeps a shortcut to the mock workspace. */}
              {isMockMode && (
                <li>
                  <button
                    onClick={() => {
                      dispatch(switchRole('ADMIN'));
                      dispatch(setActiveView('ADMIN'));
                    }}
                    className={`${linkClass} gap-1`}
                  >
                    Open the demo team workspace
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-8 text-sm text-white/50">
          &copy; 2026 GrowthPrint Technology Partners LLC. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { MarketingNav } from '../../../components/marketing/navbar/MarketingNav.tsx';
import { MarketingFooter } from '../../../components/marketing/footer/MarketingFooter.tsx';

export const metadata: Metadata = {
  title: 'Insights | GrowthPrint',
  description: 'Practical writing on websites, custom software, automation and integration from the GrowthPrint team.',
  alternates: { canonical: '/insights' },
};

/** Insights. No articles are published yet, so the page says so plainly instead of showing placeholder posts. */
export default function InsightsPage() {
  return (
    <div className="gp-marketing flex min-h-screen flex-col overflow-x-clip">
      <MarketingNav />
      <main id="main" className="relative isolate flex flex-1 items-center">
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 -z-10 h-[600px] w-[700px] rounded-full bg-mk-purple/20 blur-[150px]" />
        <div className="mx-auto w-full max-w-[1440px] px-5 pb-24 pt-40 sm:px-8 lg:px-14">
          <h1 className="max-w-3xl text-[clamp(2.4rem,5vw,4.4rem)] font-medium leading-[1.06] tracking-[-0.02em]">
            Insights are <em className="font-light italic">on the way.</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-mk-muted">
            We&rsquo;re writing our first articles on modernizing websites, automating everyday work and connecting business
            systems. Until then, the quickest way to get an answer is to ask us directly.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a href="/#start" className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-mk-purple to-mk-blue px-8 font-medium text-white hover:brightness-110">
              Start a Project <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden="true" />
            </a>
            <a href="/#faq" className="inline-flex h-14 items-center justify-center rounded-xl border border-[#b3a6ff]/60 px-8 font-medium text-white hover:bg-white/[0.04]">
              Read the FAQ
            </a>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

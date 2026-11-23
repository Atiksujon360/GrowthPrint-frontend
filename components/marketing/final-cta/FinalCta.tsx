import { ArrowUpRight } from 'lucide-react';

/** Closing call to action: converging light lines, centred statement, one action. */
export function FinalCta() {
  const lines = Array.from({ length: 7 }, (_, i) => i);
  return (
    <section aria-labelledby="final-title" className="mk-dark relative isolate overflow-hidden border-t border-mk-line bg-mk-bg">
      <svg aria-hidden="true" className="mk-draw pointer-events-none absolute inset-0 -z-10 h-full w-full" viewBox="0 0 1600 640" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mk-line-l" x1="0" x2="1"><stop offset="0" style={{ stopColor: 'var(--mk-purple)', stopOpacity: 0.6 }} /><stop offset="1" style={{ stopColor: 'var(--mk-purple)', stopOpacity: 0 }} /></linearGradient>
          <linearGradient id="mk-line-r" x1="1" x2="0"><stop offset="0" style={{ stopColor: 'var(--mk-blue)', stopOpacity: 0.5 }} /><stop offset="1" style={{ stopColor: 'var(--mk-blue)', stopOpacity: 0 }} /></linearGradient>
        </defs>
        {lines.map(i => <path key={`l${i}`} pathLength={1} d={`M0 ${60 + i * 85} Q 520 ${300 + (i - 3) * 22} 760 320`} fill="none" stroke="url(#mk-line-l)" strokeWidth="1" />)}
        {lines.map(i => <path key={`r${i}`} pathLength={1} d={`M1600 ${60 + i * 85} Q 1080 ${300 + (i - 3) * 22} 840 320`} fill="none" stroke="url(#mk-line-r)" strokeWidth="1" />)}
      </svg>
      <div className="mk-reveal mx-auto max-w-3xl px-5 py-32 text-center sm:px-8 lg:py-44">
        <img src="/images/growthprint-sculpture-720.webp" width={720} height={720} decoding="async"
          alt=""
          className="mx-auto mb-10 h-44 w-44 object-contain sm:h-56 sm:w-56" />
        <h2 id="final-title" className="font-medium leading-[1.08] tracking-[-0.02em] text-[clamp(2rem,4.4vw,3.75rem)]">
          Your next stage of growth starts with <em className="font-light italic">better technology.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-xl font-light leading-[1.65] text-[clamp(1rem,1.1vw,1.125rem)] text-mk-muted">
          Tell us what you&rsquo;re trying to achieve. Let&rsquo;s explore how GrowthPrint can help.
        </p>
        <a href="#start"
          className="mt-10 inline-flex h-14 items-center gap-2 rounded-xl bg-mk-purple px-8 text-base font-medium text-mk-accent-fg transition-[filter,transform] duration-150 hover:brightness-105 active:scale-[0.98]">
          Start Your Project <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

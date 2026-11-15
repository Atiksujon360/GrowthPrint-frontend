import { ArrowUpRight } from 'lucide-react';

/** Closing call to action: converging light lines, centred statement, one action. */
export function FinalCta() {
  const lines = Array.from({ length: 7 }, (_, i) => i);
  return (
    <section aria-labelledby="final-title" className="relative isolate overflow-hidden border-t border-mk-line">
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full" viewBox="0 0 1600 640" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mk-line-l" x1="0" x2="1"><stop offset="0" stopColor="#9B5CFF" stopOpacity="0.55" /><stop offset="1" stopColor="#9B5CFF" stopOpacity="0" /></linearGradient>
          <linearGradient id="mk-line-r" x1="1" x2="0"><stop offset="0" stopColor="#5ED6FF" stopOpacity="0.45" /><stop offset="1" stopColor="#5ED6FF" stopOpacity="0" /></linearGradient>
        </defs>
        {lines.map(i => <path key={`l${i}`} d={`M0 ${60 + i * 85} Q 520 ${300 + (i - 3) * 22} 760 320`} fill="none" stroke="url(#mk-line-l)" strokeWidth="1" />)}
        {lines.map(i => <path key={`r${i}`} d={`M1600 ${60 + i * 85} Q 1080 ${300 + (i - 3) * 22} 840 320`} fill="none" stroke="url(#mk-line-r)" strokeWidth="1" />)}
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-mk-purple/25 blur-[130px]" />
      <div className="mx-auto max-w-3xl px-5 py-32 text-center sm:px-8 lg:py-44">
        <h2 id="final-title" className="text-[clamp(2.1rem,4.6vw,4rem)] font-medium leading-[1.08] tracking-[-0.02em]">
          Your next stage of growth starts with <em className="font-light italic">better technology.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg font-light leading-relaxed text-mk-muted">
          Tell us what you&rsquo;re trying to achieve. Let&rsquo;s explore how GrowthPrint can help.
        </p>
        <a href="#start"
          className="mt-10 inline-flex h-14 items-center gap-2 rounded-xl bg-gradient-to-r from-mk-purple to-mk-blue px-8 text-base font-medium text-white shadow-[0_18px_40px_-16px_rgb(116_38_201/0.9)] transition-[filter] hover:brightness-110">
          Start Your Project <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

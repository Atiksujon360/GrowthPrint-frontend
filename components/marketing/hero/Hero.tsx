import { ArrowUpRight, Play } from 'lucide-react';

/**
 * Editorial hero. Left: eyebrow, oversized Sora headline with an orange accent phrase, supporting copy and two
 * calls to action. Right: the real GrowthPrint Studio dashboard in a browser frame — the product itself is the
 * visual. Fully theme-aware via the mk-* palette.
 */
export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="mk-dark relative isolate overflow-hidden bg-mk-bg pt-28 lg:pt-36">
      {/* atmosphere: one soft coral pool low left, plum depth from the section background */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-52 bottom-0 -z-10 h-[480px] w-[620px] rounded-full bg-mk-purple/10 blur-[140px]" />
      {/* horizon grid fade */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-t from-mk-purple/[0.07] to-transparent" />

      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 pb-20 sm:px-8 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-14 lg:pb-28">
        <div className="relative z-10 max-w-[660px]">
          <p className="mk-rise text-[13px] font-medium text-mk-purple">
            Software engineering &amp; intelligent automation
          </p>

          <h1 id="hero-title" className="mk-rise mt-8 font-semibold leading-[1.02] tracking-[-0.03em] text-[clamp(2.625rem,5.5vw,5.75rem)]" style={{ animationDelay: '0.08s' }}>
            Build <em className="font-light italic">Smarter.</em>
            <br />
            Scale Without
            <br />
            <em className="font-light italic text-mk-purple">Limits.</em>
          </h1>

          <p className="mk-rise mt-8 max-w-[36rem] font-light leading-[1.65] text-[clamp(1rem,1.15vw,1.1875rem)] text-mk-muted" style={{ animationDelay: '0.16s' }}>
            GrowthPrint is a software engineering and intelligent automation partner. We design, build and support the
            websites, applications, workflows and integrations that move your business forward.
          </p>

          <div className="mk-rise mt-11 flex flex-col gap-4 sm:flex-row sm:items-center" style={{ animationDelay: '0.24s' }}>
            <a href="#start"
              className="inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-mk-purple px-8 text-base font-medium text-mk-accent-fg transition-[filter,transform] duration-150 hover:brightness-105 active:scale-[0.98]">
              Start a Project <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden="true" />
            </a>
            <a href="#meet"
              className="inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-mk-line px-8 text-base font-medium text-mk-text transition-colors duration-150 hover:border-mk-purple/60 hover:bg-mk-soft active:scale-[0.98]">
              <Play className="h-4 w-4 fill-mk-purple text-mk-purple" aria-hidden="true" /> Watch What We Do
            </a>
          </div>

          <ul className="mk-rise mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-mk-line pt-7" style={{ animationDelay: '0.32s' }}>
            {[
              ['Websites & apps', 'Modern, responsive experiences.'],
              ['Custom software', 'Built around how you work.'],
              ['Automation & AI', 'Repetitive work, handled.'],
            ].map(([t, d]) => (
              <li key={t}>
                <p className="text-base font-medium text-mk-text">{t}</p>
                <p className="mt-0.5 text-[13px] text-mk-dim">{d}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mk-rise relative mx-auto w-full max-w-[640px] lg:max-w-none" style={{ animationDelay: '0.18s' }}>
          {/* the product itself is the visual: the real Studio dashboard in a browser frame */}
          <figure className="relative">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-mk-surface shadow-[0_50px_110px_-40px_rgb(0_0_0/0.7)] ring-1 ring-white/5">
              <div aria-hidden="true" className="flex items-center gap-2 border-b border-mk-line bg-mk-soft/60 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-mk-line" />
                <span className="h-2.5 w-2.5 rounded-full bg-mk-line" />
                <span className="h-2.5 w-2.5 rounded-full bg-mk-line" />
                <span className="ml-3 hidden rounded-md bg-mk-bg px-3 py-1 text-[12px] text-mk-muted sm:block">studio.growthprint.agency/ops</span>
              </div>
              <img src="/images/work/growthprint-studio-dashboard.webp" width={1440} height={1000} decoding="async"
                alt="GrowthPrint Studio dashboard with project, lead, client and invoice summaries and charts"
                className="block w-full" />
            </div>
          </figure>
          {/* caption card */}
          <div className="mk-rise absolute -bottom-4 left-4 hidden items-center gap-3 rounded-xl border border-mk-line bg-mk-surface/90 px-5 py-4 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.5)] backdrop-blur-md sm:flex" style={{ animationDelay: '0.55s' }}>
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-mk-purple" />
            <div>
              <p className="text-[13px] font-medium text-mk-text">GrowthPrint Studio</p>
              <p className="text-[12px] text-mk-dim">The operations platform we run our own agency on</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

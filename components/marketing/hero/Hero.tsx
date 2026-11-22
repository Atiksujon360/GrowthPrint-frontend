import { ArrowUpRight, Play } from 'lucide-react';
import { HeroVisual } from './HeroVisual.tsx';

/**
 * Editorial hero. Left: eyebrow, oversized Sora headline with an orange accent phrase, supporting copy and two
 * calls to action. Right: the original GrowthPrint system artwork (HeroVisual) floating over an ambient glow,
 * with a small "live system" caption card. Fully theme-aware via the mk-* palette.
 */
export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="mk-dark relative isolate overflow-hidden bg-mk-bg pt-28 lg:pt-36">
      {/* atmosphere: cinematic orange key light upper right, coral pool lower left, plum depth */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-52 -z-10 h-[860px] w-[860px] rounded-full bg-[#FF572E]/25 blur-[160px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-60 bottom-0 -z-10 h-[560px] w-[680px] rounded-full bg-[#FF7845]/15 blur-[150px]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/3 top-1/3 -z-10 h-[500px] w-[700px] rounded-full bg-[#6E2A12]/30 blur-[170px]" />
      {/* horizon grid fade */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-t from-[#FF572E]/[0.07] to-transparent" />

      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 pb-20 sm:px-8 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-14 lg:pb-28">
        <div className="mk-rise relative z-10 max-w-[660px]">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-mk-purple/40 bg-mk-purple/[0.08] px-4 py-2 text-[13px] font-medium tracking-[0.08em] text-mk-purple">
            <span aria-hidden="true" className="text-mk-purple">✦</span>
            SOFTWARE ENGINEERING &amp; INTELLIGENT AUTOMATION
          </p>

          <h1 id="hero-title" className="mt-8 font-semibold leading-[1.02] tracking-[-0.03em] text-[clamp(2.625rem,5.5vw,5.75rem)]">
            Build <em className="font-light italic">Smarter.</em>
            <br />
            Scale Without
            <br />
            <span className="bg-gradient-to-r from-mk-purple to-mk-blue bg-clip-text text-transparent">Limits.</span>
          </h1>

          <p className="mt-8 max-w-[36rem] font-light leading-[1.65] text-[clamp(1rem,1.15vw,1.1875rem)] text-mk-muted">
            GrowthPrint is a software engineering and intelligent automation partner. We design, build and support the
            websites, applications, workflows and integrations that move your business forward.
          </p>

          <div className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a href="#start"
              className="inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-mk-purple to-mk-blue px-8 text-base font-medium text-mk-accent-fg shadow-[0_18px_40px_-16px_rgb(249_115_22/0.55)] transition-[filter] hover:brightness-105">
              Start a Project <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden="true" />
            </a>
            <a href="#meet"
              className="inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-mk-line px-8 text-base font-medium text-mk-text transition-colors hover:border-mk-purple/60 hover:bg-mk-soft">
              <Play className="h-4 w-4 fill-mk-purple text-mk-purple" aria-hidden="true" /> Watch What We Do
            </a>
          </div>

          <ul className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-mk-line pt-7">
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

        <div className="relative mx-auto w-full max-w-[620px] lg:max-w-none">
          {/* ambient glow behind the artwork */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0 scale-90 rounded-full bg-[radial-gradient(closest-side,rgba(255,87,46,0.35),rgba(255,120,69,0.12)_55%,transparent)] blur-2xl" />
          <HeroVisual />
          {/* floating caption card */}
          <div className="mk-rise absolute -bottom-2 left-2 hidden items-center gap-3 rounded-xl border border-mk-line bg-mk-surface/90 px-5 py-4 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.5)] backdrop-blur-md sm:flex" style={{ animationDelay: '0.35s' }}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mk-purple opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mk-purple" />
            </span>
            <div>
              <p className="text-[13px] font-medium text-mk-text">GrowthPrint Studio</p>
              <p className="text-[12px] text-mk-dim">Live operations platform · demo data</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

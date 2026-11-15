import { ArrowUpRight, Play } from 'lucide-react';

/**
 * Two-column hero. Left: badge, headline, supporting copy, two calls to action.
 * Right: the original GrowthPrint sculpture (rendered offline by scripts/marketing-media, transparent WebP),
 * floating slowly in front of soft translucent columns. The image loads with high priority because it is the LCP element.
 */
export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate overflow-hidden pt-28 lg:pt-32">
      {/* atmosphere: one deep violet light from the upper right, one dim blue pool lower left */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[820px] w-[820px] rounded-full bg-mk-purple/25 blur-[150px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-60 bottom-0 -z-10 h-[520px] w-[620px] rounded-full bg-mk-blue/20 blur-[140px]" />

      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 pb-20 sm:px-8 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-[1.02fr_1fr] lg:gap-6 lg:px-14 lg:pb-24">
        <div className="mk-rise relative z-10 max-w-[640px]">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-mk-violet/45 bg-mk-violet/[0.07] px-4 py-2 text-[12.5px] font-medium tracking-[0.06em] text-[#e6dcff]">
            <span aria-hidden="true" className="text-mk-violet">✦</span>
            SOFTWARE ENGINEERING &amp; BUSINESS AUTOMATION
          </p>

          <h1 id="hero-title" className="mt-7 text-[clamp(2.9rem,6.4vw,5.6rem)] font-semibold leading-[1.04] tracking-[-0.025em]">
            Build <em className="font-light italic">Smarter.</em>
            <br />
            Scale Without
            <br />
            <em className="font-light italic">Limits.</em>
          </h1>

          <p className="mt-8 max-w-[34rem] text-[clamp(1rem,1.25vw,1.15rem)] font-light leading-relaxed text-mk-muted">
            GrowthPrint brings software engineering and intelligent automation together. Build better digital experiences,
            streamline operations and grow your business with confidence.
          </p>

          <div className="mt-11 flex flex-col gap-4 sm:flex-row">
            <a href="#start"
              className="inline-flex h-14 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-mk-purple to-mk-blue px-8 text-base lg:px-6 xl:px-8 font-medium text-white shadow-[0_18px_40px_-16px_rgb(116_38_201/0.9)] transition-[filter] hover:brightness-110">
              Start a Project <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden="true" />
            </a>
            <a href="#meet"
              className="inline-flex h-14 items-center justify-center gap-3 whitespace-nowrap rounded-xl border border-[#b3a6ff]/60 px-8 text-base lg:px-6 xl:px-8 font-medium text-white transition-colors hover:border-white hover:bg-white/[0.04]">
              <Play className="h-4 w-4 fill-white" aria-hidden="true" /> Watch What We Do
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[640px] lg:max-w-none">
          {/* translucent columns behind the sculpture, as in the reference composition */}
          <div aria-hidden="true" className="absolute inset-x-[2%] top-[4%] bottom-[18%] -z-0 flex items-start justify-between gap-4 opacity-70">
            {[0, 16, 0, 10, 0].map((offset, i) => (
              <span key={i} className="block h-full flex-1 rounded-[22px] bg-gradient-to-b from-white/[0.045] to-transparent"
                style={{ marginTop: `${offset}%` }} />
            ))}
          </div>
          <img
            src="/images/growthprint-sculpture.webp"
            srcSet="/images/growthprint-sculpture-720.webp 720w, /images/growthprint-sculpture.webp 1200w"
            sizes="(min-width: 1024px) 46vw, 92vw"
            width={1200}
            height={1200}
            fetchPriority="high"
            alt="An abstract sculpture of two intertwined metallic strands in violet, blue and cyan, with a small floating sphere"
            className="mk-float relative z-10 mx-auto w-full max-w-[680px] drop-shadow-[0_40px_80px_rgb(56_38_183/0.45)]"
          />
        </div>
      </div>
    </section>
  );
}

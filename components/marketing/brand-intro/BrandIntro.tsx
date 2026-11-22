import { HIGHLIGHTS } from '../content.ts';
import { ExplainerVideo } from '../explainer-video/ExplainerVideo.tsx';

/** About: the positioning statement, then the explainer film with its four highlights. */
export function BrandIntro() {
  return (
    <>
      <section id="about" aria-labelledby="about-title" className="mk-cream relative border-t border-mk-line bg-mk-bg">
        <div className="pointer-events-none absolute -right-32 top-10 -z-10 h-80 w-80 rounded-full bg-mk-purple/10 blur-[120px]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-14 lg:py-32">
          <h2 id="about-title" className="mk-reveal font-medium leading-[1.1] tracking-[-0.02em] text-[clamp(1.875rem,3.6vw,3.125rem)]">
            Engineering better ways to work and grow.
          </h2>
          <div className="mk-reveal space-y-6 font-light leading-[1.65] text-[clamp(1rem,1.1vw,1.125rem)] text-mk-muted lg:pt-3">
            <p>
              GrowthPrint is a technology partner for businesses that want their software to keep up with them. We build and
              modernize websites and applications, connect the systems you already rely on, and automate the work that keeps
              your team busy instead of productive.
            </p>
            <p>
              We don&rsquo;t sell technology for its own sake. Every project starts with the business problem, and every
              recommendation comes with the reasoning and the trade-offs, in plain language.
            </p>
          </div>
        </div>
      </section>

      <section id="meet" aria-labelledby="meet-title" className="mk-dark relative scroll-mt-24 overflow-hidden border-t border-mk-line bg-mk-bg">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-40 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[#FF572E]/15 blur-[160px]" />
        <div className="mx-auto max-w-[1240px] px-5 pb-24 sm:px-8 lg:px-14 lg:pb-32">
          <div className="mk-reveal mx-auto max-w-3xl text-center mb-12">
            <p className="text-[13px] font-medium tracking-[0.14em] text-mk-violet">MEET GROWTHPRINT</p>
            <h2 id="meet-title" className="mt-5 font-medium leading-[1.08] tracking-[-0.02em] text-[clamp(1.875rem,3.8vw,3.375rem)]">
              Technology should make business <em className="font-light italic">easier.</em>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="mk-reveal">
              <p className="font-light leading-[1.65] text-[clamp(1rem,1.1vw,1.125rem)] text-mk-muted">
                From building modern digital experiences to automating everyday operations, GrowthPrint helps businesses turn
                technology challenges into practical solutions.
              </p>
              <ul className="mt-8 space-y-4">
                {HIGHLIGHTS.map((h, i) => (
                  <li key={h.title} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mk-purple/20 text-mk-violet text-sm font-medium" aria-hidden="true">{i + 1}</span>
                    <div>
                      <p className="font-medium text-[clamp(1rem,1.1vw,1.125rem)]">{h.title}</p>
                      <p className="mt-1 font-light leading-[1.65] text-[15px] text-mk-muted">{h.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mk-reveal w-full"><ExplainerVideo /></div>
          </div>
        </div>
      </section>
    </>
  );
}

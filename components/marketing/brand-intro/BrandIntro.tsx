import { HIGHLIGHTS } from '../content.ts';
import { ExplainerVideo } from '../explainer-video/ExplainerVideo.tsx';

/** About: the positioning statement, then the explainer film with its four highlights. */
export function BrandIntro() {
  return (
    <>
      <section id="about" aria-labelledby="about-title" className="relative border-t border-mk-line">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-14 lg:py-32">
          <h2 id="about-title" className="text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[1.1] tracking-[-0.02em]">
            Engineering better ways to work and grow.
          </h2>
          <div className="space-y-6 text-lg font-light leading-relaxed text-mk-muted lg:pt-3">
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

      <section id="meet" aria-labelledby="meet-title" className="relative scroll-mt-24 overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-40 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-mk-purple/15 blur-[160px]" />
        <div className="mx-auto max-w-[1240px] px-5 pb-24 sm:px-8 lg:px-14 lg:pb-32">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-sm font-medium tracking-[0.18em] text-mk-violet">MEET GROWTHPRINT</p>
            <h2 id="meet-title" className="mt-5 text-[clamp(2rem,4.2vw,3.6rem)] font-medium leading-[1.08] tracking-[-0.02em]">
              Technology should make business <em className="font-light italic">easier.</em>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-lg font-light leading-relaxed text-mk-muted">
                From building modern digital experiences to automating everyday operations, GrowthPrint helps businesses turn
                technology challenges into practical solutions.
              </p>
              <ul className="mt-8 space-y-4">
                {HIGHLIGHTS.map((h, i) => (
                  <li key={h.title} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mk-purple/20 text-mk-violet text-sm font-medium" aria-hidden="true">{i + 1}</span>
                    <div>
                      <p className="text-lg font-medium">{h.title}</p>
                      <p className="mt-1 text-[15px] font-light leading-relaxed text-mk-muted">{h.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full"><ExplainerVideo /></div>
          </div>
        </div>
      </section>
    </>
  );
}

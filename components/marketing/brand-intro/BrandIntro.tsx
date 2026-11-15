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
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium tracking-[0.18em] text-mk-violet">MEET GROWTHPRINT</p>
            <h2 id="meet-title" className="mt-5 text-[clamp(2rem,4.2vw,3.6rem)] font-medium leading-[1.08] tracking-[-0.02em]">
              Technology should make business <em className="font-light italic">easier.</em>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-mk-muted">
              From building modern digital experiences to automating everyday operations, GrowthPrint helps businesses turn
              technology challenges into practical solutions.
            </p>
          </div>

          <div className="mt-14 lg:mt-16"><ExplainerVideo /></div>

          <ul className="mt-12 grid grid-cols-2 border-t border-mk-line lg:grid-cols-4">
            {HIGHLIGHTS.map((h, i) => (
              <li key={h.title} className={`py-7 pr-6 ${i % 2 === 1 ? 'pl-6 border-l border-mk-line' : ''} ${i >= 2 ? 'border-t border-mk-line lg:border-t-0' : ''} ${i === 2 ? 'lg:pl-6 lg:border-l' : ''}`}>
                <p className="text-xl font-medium">{h.title}</p>
                <p className="mt-2 text-[15px] font-light leading-relaxed text-mk-muted">{h.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

import { PRINCIPLES } from '../content.ts';

/** Why GrowthPrint: a sticky statement on the left, the principles as a ruled list on the right. */
export function WhyGrowthPrint() {
  return (
    <section aria-labelledby="why-title" className="border-t border-mk-line">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24 lg:px-14 lg:py-32">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h2 id="why-title" className="text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[1.1] tracking-[-0.02em]">
            Why businesses work with <em className="font-light italic">GrowthPrint.</em>
          </h2>
          <p className="mt-6 max-w-md text-lg font-light leading-relaxed text-mk-muted">
            Good engineering is only useful if it solves the problem you have. These are the commitments behind every project.
          </p>
        </div>
        <dl className="divide-y divide-mk-line border-y border-mk-line">
          {PRINCIPLES.map(p => (
            <div key={p.title} className="grid gap-2 py-7 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-10">
              <dt className="text-lg font-medium">{p.title}</dt>
              <dd className="font-light leading-relaxed text-mk-muted">{p.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

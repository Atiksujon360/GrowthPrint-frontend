import { PRINCIPLES } from '../content.ts';

/** Why GrowthPrint: a sticky statement on the left, the principles as a ruled list on the right. */
export function WhyGrowthPrint() {
  return (
    <section aria-labelledby="why-title" className="mk-cream border-t border-mk-line bg-mk-soft">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24 lg:px-14 lg:py-32">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h2 id="why-title" className="font-medium leading-[1.1] tracking-[-0.02em] text-[clamp(1.875rem,3.6vw,3.125rem)]">
            Why businesses work with <em className="font-light italic">GrowthPrint.</em>
          </h2>
          <p className="mt-6 max-w-md font-light leading-[1.65] text-[clamp(1rem,1.1vw,1.125rem)] text-mk-muted">
            Good engineering is only useful if it solves the problem you have. These are the commitments behind every project.
          </p>
        </div>
        <dl className="divide-y divide-mk-line border-y border-mk-line">
          {PRINCIPLES.map(p => (
            <div key={p.title} className="grid gap-2 py-7 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-10">
              <dt className="font-medium text-[clamp(1rem,1.1vw,1.125rem)]">{p.title}</dt>
              <dd className="font-light leading-[1.65] text-mk-muted">{p.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

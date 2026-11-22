import { Plus } from 'lucide-react';
import { FAQS } from '../content.ts';

/** FAQ with native disclosure elements: works without JavaScript and is keyboard accessible by default. */
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="mk-cream scroll-mt-24 border-t border-mk-line bg-mk-bg">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 lg:px-14 lg:py-32">
        <h2 id="faq-title" className="mk-reveal font-medium leading-[1.1] tracking-[-0.02em] text-[clamp(1.875rem,3.6vw,3.125rem)]">
          Questions, <em className="font-light italic">answered.</em>
        </h2>
        <div className="divide-y divide-mk-line border-y border-mk-line">
          {FAQS.map(item => (
            <details key={item.q} className="mk-reveal group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-medium text-[clamp(1rem,1.1vw,1.125rem)] transition-colors duration-150 hover:text-mk-violet [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus aria-hidden="true" className="h-5 w-5 shrink-0 text-mk-violet transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="max-w-3xl pb-7 font-light leading-[1.65] text-mk-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

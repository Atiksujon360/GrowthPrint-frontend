import { PROBLEMS } from '../content.ts';

/**
 * Business problems a visitor recognises, each paired with what GrowthPrint does about it. Set as a two-column
 * ledger on an inverted "paper" band, which breaks the dark page like a printed spread.
 */
export function Problems() {
  return (
    <section id="problems" aria-labelledby="problems-title" className="mk-invert mk-quiet scroll-mt-16">
      <div className="mk-container">
        <div className="mk-grid gap-y-6">
          <h2 id="problems-title" className="mk-h2 col-span-4 sm:col-span-6 lg:col-span-6">Does this sound familiar?</h2>
          <p className="mk-body col-span-4 sm:col-span-6 lg:col-span-4 lg:col-start-9 lg:pt-2">
            Most of the work we do starts with one of these. None of them needs a bigger system; each needs the right fix.
          </p>
        </div>

        <div className="mt-14 lg:mt-20">
          <div aria-hidden="true" className="mk-grid hidden border-b border-mk-line-strong pb-4 sm:grid">
            <p className="mk-label col-span-4 lg:col-span-5">The situation</p>
            <p className="mk-label col-span-4 lg:col-span-6 lg:col-start-7">What we do about it</p>
          </div>
          <ul>
            {PROBLEMS.map(item => (
              <li key={item.problem} className="mk-grid mk-reveal gap-y-2 border-b border-mk-line py-7 lg:py-8">
                <p className="col-span-4 text-[1.0625rem] font-medium leading-snug text-mk-text sm:col-span-4 lg:col-span-5 lg:text-[1.1875rem]">
                  {item.problem}
                </p>
                <p className="mk-body col-span-4 sm:col-span-4 lg:col-span-5 lg:col-start-7">
                  <span className="sr-only">What we do: </span>{item.answer}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

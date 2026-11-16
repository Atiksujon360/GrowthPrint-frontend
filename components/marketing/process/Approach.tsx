'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { PROCESS } from '../content.ts';

/**
 * Technology approach and delivery, merged: one statement and one six-step timeline.
 * From md up the steps are tabs (arrow keys, Home and End move between them, following the WAI-ARIA tabs pattern) and
 * the selected step's detail sits below the line. On small screens all steps are shown as a plain vertical list.
 */
export function Approach() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = (i: number) => {
    const next = (i + PROCESS.length) % PROCESS.length;
    setSelected(next);
    tabs.current[next]?.focus();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const moves: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: PROCESS.length - 1 };
    if (e.key in moves) { e.preventDefault(); focusTab(moves[e.key]); }
  };
  const step = PROCESS[selected];

  return (
    <section id="approach" aria-labelledby="approach-title" className="mk-quiet scroll-mt-16 bg-mk-surface">
      <span id="process" className="block" aria-hidden="true" />
      <div className="mk-container">
        <div className="mk-grid gap-y-8">
          <h2 id="approach-title" className="mk-statement col-span-4 sm:col-span-8 lg:col-span-7">
            We choose technology based on business outcomes, not trends.
          </h2>
          <p className="mk-body col-span-4 sm:col-span-6 lg:col-span-4 lg:col-start-9 lg:self-end">
            Every engagement follows the same six steps. You approve the plan before work starts and see working software
            every few weeks.
          </p>
        </div>

        {/* md and up: interactive timeline */}
        <div className="mt-20 hidden md:block">
          <div role="tablist" aria-label="Delivery steps" className="relative grid grid-cols-6">
            <span aria-hidden="true" className="absolute left-0 right-0 top-[7px] h-px bg-mk-line-strong" />
            <span aria-hidden="true" className="absolute left-0 top-[7px] h-px bg-mk-accent transition-[width] duration-300"
              style={{ width: `${(selected / (PROCESS.length - 1)) * (100 - 100 / PROCESS.length)}%` }} />
            {PROCESS.map((s, i) => {
              const isSelected = i === selected;
              return (
                <button key={s.title} ref={el => { tabs.current[i] = el; }} type="button" role="tab" id={`step-tab-${i}`}
                  aria-selected={isSelected} aria-controls="step-panel" tabIndex={isSelected ? 0 : -1}
                  onClick={() => setSelected(i)} onKeyDown={e => onKeyDown(e, i)}
                  className="group relative pr-4 text-left">
                  <span aria-hidden="true"
                    className={`relative z-10 block h-[15px] w-[15px] rounded-full border transition-colors duration-200 ${i <= selected ? 'border-mk-accent bg-mk-accent' : 'border-mk-line-strong bg-mk-surface group-hover:border-mk-text'}`} />
                  <span className="mk-index mt-6 block">{String(i + 1).padStart(2, '0')}</span>
                  <span className={`mt-1.5 block text-[1.125rem] font-semibold tracking-[-0.01em] transition-colors duration-150 ${isSelected ? 'text-mk-text' : 'text-mk-muted group-hover:text-mk-text'}`}>
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
          <div id="step-panel" role="tabpanel" aria-labelledby={`step-tab-${selected}`} className="mk-grid mt-12 border-t border-mk-line pt-10">
            <p className="col-span-8 text-[1.375rem] font-medium leading-snug tracking-[-0.015em] text-mk-text lg:col-span-6">{step.text}</p>
            <div className="col-span-8 mt-6 lg:col-span-4 lg:col-start-9 lg:mt-0">
              <p className="mk-small">What you get</p>
              <p className="mt-1.5 text-[1rem] font-medium text-mk-text">{step.output}</p>
            </div>
          </div>
        </div>

        {/* small screens: a vertical list */}
        <ol className="mt-12 md:hidden">
          {PROCESS.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[2.5rem_1fr] border-t border-mk-line py-6">
              <span className="mk-index pt-0.5">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="mk-h3">{s.title}</h3>
                <p className="mk-body mt-2">{s.text}</p>
                <p className="mk-small mt-3">You get: <span className="text-mk-text">{s.output}</span></p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

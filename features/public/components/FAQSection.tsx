import React, { useId, useState } from 'react';
import { Plus } from 'lucide-react';

const questions = [
  {
    question: 'What kind of work can GrowthPrint help with?',
    answer: 'Custom web applications, client portals, website improvements and modernization, integrations, workflow automation, and carefully chosen AI features. If you are not sure what the right starting point is, we can help you work that out.'
  },
  {
    question: 'What happens after I send an inquiry?',
    answer: 'We read the details, reply within one business day, and suggest a sensible next step. That might be a short call, a technical review, or a written estimate—depending on what will be most useful.'
  },
  {
    question: 'Do you work with existing applications?',
    answer: 'Yes. We regularly improve and support applications that are already in use. We start by understanding the current system and its risks before recommending changes.'
  },
  {
    question: 'How do you keep projects on track?',
    answer: 'We agree on a clear first scope, share progress in small increments, and keep decisions visible. You see working previews and know what is happening before the next step begins.'
  },
  {
    question: 'Can you stay involved after launch?',
    answer: 'Yes. Every custom software delivery includes a 30-day defect warranty, and ongoing support is available when you need help maintaining or improving the system.'
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <section id="faq" aria-labelledby="faq-title" className="border-b border-ink-200 bg-ink-50">
      <div className="gp-frame py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <h2 id="faq-title" className="gp-display text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.08] text-ink-950 lg:col-span-4">
            Practical answers before we start.
          </h2>
          <div className="border-b border-ink-200 lg:col-span-8">
            {questions.map((item, index) => {
              const open = openIndex === index;
              return (
                <div key={item.question} className="border-t border-ink-200">
                  <h3>
                    <button
                      id={`${baseId}-q-${index}`}
                      onClick={() => setOpenIndex(open ? null : index)}
                      aria-expanded={open}
                      aria-controls={`${baseId}-a-${index}`}
                      className="flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left text-lg font-semibold text-ink-950"
                    >
                      <span>{item.question}</span>
                      <Plus aria-hidden="true"
                        className={`h-5 w-5 shrink-0 text-brand-600 transition-transform duration-200 ${open ? 'rotate-45' : ''}`} />
                    </button>
                  </h3>
                  {/* grid-rows animates height without measuring; content stays out of the tab order when closed */}
                  <div id={`${baseId}-a-${index}`} role="region" aria-labelledby={`${baseId}-q-${index}`}
                    className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                    hidden={!open}>
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pb-6 text-[1.02rem] leading-relaxed text-ink-600">{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

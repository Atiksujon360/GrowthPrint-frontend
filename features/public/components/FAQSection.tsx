import React from 'react';

const questions = [
  {
    question: 'What kind of work can GrowthPrint help with?',
    answer: 'We help with custom web applications, client portals, website improvements, integrations, workflow automation, and carefully chosen AI features. If you are not sure what the right starting point is, we can help you work that out.'
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
  return (
    <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Good to know
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            A few practical answers before we start.
          </h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            Here is what clients usually want to know before starting a conversation.
          </p>
        </div>

        <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
          {questions.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold text-slate-900 marker:hidden">
                <span>{item.question}</span>
                <span aria-hidden="true" className="text-2xl font-normal text-blue-600 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-3xl pr-10 text-base leading-relaxed text-slate-600">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

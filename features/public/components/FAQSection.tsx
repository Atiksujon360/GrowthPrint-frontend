import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-blue-50/30 -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Good to know
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            A few practical answers before we start.
          </h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            Here is what clients usually want to know before starting a conversation.
          </p>
        </motion.div>

        <motion.div
          className="mt-10 divide-y divide-slate-200 border-y border-slate-200"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {questions.map((item, index) => (
            <motion.div
              key={item.question}
              className="py-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <motion.button
                onClick={() => toggleQuestion(index)}
                className="w-full flex cursor-pointer items-center justify-between gap-6 text-lg font-semibold text-slate-900 text-left"
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <span>{item.question}</span>
                <motion.span
                  className="text-2xl font-normal text-blue-600"
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  +
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.p
                    className="mt-3 max-w-3xl pr-10 text-base leading-relaxed text-slate-600"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    {item.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

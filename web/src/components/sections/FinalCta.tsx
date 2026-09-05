'use client'

import { motion } from 'motion/react'

const WORDS = ['Stop', 'trusting', 'one', 'answer.']

/**
 * Final CTA. Crescendo close with a word-by-word blur reveal statement and
 * the two action buttons, Verify a claim and Read the method.
 * @returns the final CTA section
 */
export default function FinalCta() {
  const scrollTo = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative z-10 min-h-[100dvh] snap-start flex flex-col items-center justify-center text-center px-4 py-24">
      <h2 className="font-display text-4xl md:text-6xl lg:text-[5rem] font-bold text-[var(--text-primary)] leading-[0.95] tracking-[-2px] max-w-4xl">
        {WORDS.map((word, index) => (
          <motion.span
            key={word + index}
            initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
            whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.09 }}
            className="inline-block mr-[0.28em]"
          >
            {word}
          </motion.span>
        ))}
      </h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.9 }}
        className="mt-6 max-w-md font-body text-base text-[var(--text-secondary)] leading-relaxed"
      >
        Paste your first claim and watch three live miners weigh in.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 1.05 }}
        className="mt-9 flex items-center justify-center gap-4 flex-wrap"
      >
        <button
          type="button"
          onClick={() => scrollTo('tool')}
          className="bg-[var(--accent)] text-white px-7 py-3.5 rounded-full font-body text-sm font-medium hover:bg-[var(--accent-hover)] hover:shadow-[0_0_30px_rgba(37,99,235,0.25)] transition-all duration-200"
        >
          Verify a claim
        </button>
        <button
          type="button"
          onClick={() => scrollTo('method')}
          className="border border-[var(--border-default)] text-[var(--text-primary)] px-7 py-3.5 rounded-full font-body text-sm hover:border-[var(--accent)] transition-colors duration-200"
        >
          Read the method
        </button>
      </motion.div>
    </section>
  )
}

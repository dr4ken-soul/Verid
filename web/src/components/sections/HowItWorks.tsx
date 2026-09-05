'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

const CARDS: { name: string; tag: string; body: string; icon: ReactNode }[] = [
  {
    name: 'DeSearch',
    tag: 'Web grounding · LIVE',
    body: 'Grounded web search. Checks the claim against live sources and returns what the open web actually says.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    name: 'OpenAI',
    tag: 'Reasoning verdict · LIVE',
    body: 'Reasoning verdict. Weighs the claim, the sources and the media and returns a true, false or uncertain call with reasoning.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82A5 5 0 0 1 17 19H7a5 5 0 0 1-.64-9.18A5 5 0 0 1 12 3z" />
      </svg>
    ),
  },
  {
    name: 'Bitmind',
    tag: 'Media authenticity · LIVE',
    body: 'Media authenticity. When you attach an image or video it tells you whether the asset is real, manipulated or recycled.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
]

/**
 * How it works. Three miner cards plus the consensus note, staggered
 * blur-in entrances that replay on scroll back into view.
 * @returns the how it works section
 */
export default function HowItWorks() {
  return (
    <section
      id="method"
      className="relative z-10 min-h-[100dvh] snap-start flex flex-col justify-center px-4 md:px-8 py-24"
    >
      <div className="text-center mb-12">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--accent)] mb-3"
        >
          What runs under the hood
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
          whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.35 }}
          className="font-display text-3xl md:text-5xl font-bold text-[var(--text-primary)] tracking-[-1px]"
        >
          Three independent miners. One verdict.
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto w-full">
        {CARDS.map((card, index) => (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
            whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + index * 0.12 }}
            className="liquid-glass p-6 min-h-[260px] flex flex-col"
          >
            <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-glow)] flex items-center justify-center text-[var(--accent)]">
              {card.icon}
            </div>
            <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mt-4">
              {card.name}
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-wide text-[var(--text-muted)] mt-1">
              {card.tag}
            </p>
            <p className="font-body text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
              {card.body}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.6 }}
        className="mt-10 max-w-2xl mx-auto font-body text-sm text-[var(--text-secondary)] text-center"
      >
        Verid fans the claim to all three in parallel, then ranks the signal by how they agree.
        The heatmap shows the split, not just the average.
      </motion.p>
    </section>
  )
}

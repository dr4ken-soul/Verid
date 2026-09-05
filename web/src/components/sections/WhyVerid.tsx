'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

const BADGES: { label: string; value: string; icon: ReactNode }[] = [
  {
    label: 'Network',
    value: 'Telegraph',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
      </svg>
    ),
  },
  {
    label: 'Chain',
    value: 'Base',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M7 12h10" />
      </svg>
    ),
  },
  {
    label: 'Miners',
    value: 'Live, per request',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    label: 'Settlement',
    value: 'x402 micropayments',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
]

/**
 * Why Verid. Split layout with the trust argument on the left and the badge
 * stack on the right, no logos anywhere per the brand rule.
 * @returns the why section
 */
export default function WhyVerid() {
  return (
    <section className="relative z-10 min-h-[100dvh] snap-start flex flex-col justify-center px-4 md:px-8 py-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center w-full">
        <motion.div
          initial={{ opacity: 0, x: -24, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--accent)] mb-4">
            Why it matters
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-[var(--text-primary)] tracking-[-1px] leading-tight">
            One miner can be wrong. Three rarely agree by accident.
          </h2>
          <p className="font-body text-base text-[var(--text-secondary)] mt-5 leading-relaxed max-w-lg">
            Verid sits on top of Telegraph&apos;s live miner network and pays per real request.
            You see the disagreement, not a single black-box answer, and every call is a real
            signal on the network.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {BADGES.map((badge) => (
            <div
              key={badge.label}
              className="liquid-glass !rounded-[var(--radius-md)] p-5 bg-white/60"
            >
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--accent-glow)] flex items-center justify-center text-[var(--accent)]">
                {badge.icon}
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] mt-3">
                {badge.label}
              </p>
              <p className="font-body text-sm text-[var(--text-primary)] mt-1">{badge.value}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

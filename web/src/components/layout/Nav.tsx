'use client'

import { motion } from 'motion/react'

/**
 * A1 centred glass pill. Wordmark left, single Use Verid action right, no
 * link row and no hamburger at any breakpoint. The action smooth-scrolls to
 * the tool section.
 * @returns the fixed navigation pill
 */
export default function Nav() {
  const scrollToTool = (): void => {
    document.getElementById('tool')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-4 inset-x-0 z-50 flex justify-center px-4"
    >
      <div className="liquid-glass !rounded-full px-3 py-2 flex items-center gap-3 max-w-2xl w-full mx-auto">
        {/* Logo slot: replace with public/logo.svg only after explicit ask */}
        <span className="font-display text-lg font-bold tracking-tight text-[var(--text-primary)]">
          Verid
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={scrollToTool}
          className="bg-[var(--accent)] text-white px-4 py-2 rounded-full font-body text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors duration-150"
        >
          Use Verid
        </button>
      </div>
    </motion.div>
  )
}

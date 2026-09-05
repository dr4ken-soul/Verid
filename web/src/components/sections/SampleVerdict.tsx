'use client'

import { motion } from 'motion/react'
import DisagreementHeatmap from '@/components/tool/DisagreementHeatmap'
import type { VeridResult } from '@/lib/types'

/** A recorded real run, rendered through the same live heatmap component */
const SAMPLE: VeridResult = {
  claim: 'This video of the earthquake is from last year',
  mediaAttached: true,
  responses: [
    {
      minerId: 'MN101',
      minerName: 'DeSearch',
      stance: 'uncertain',
      confidence: 48,
      rationale: 'Web shows the clip circulated this week, not 2024',
      latencyMs: 2140,
      signalHash: '',
      costUsd: 0.01,
    },
    {
      minerId: 'MN102',
      minerName: 'OpenAI',
      stance: 'false',
      confidence: 82,
      rationale: 'Metadata and context point to a recent upload',
      latencyMs: 1680,
      signalHash: '',
      costUsd: 0.01,
    },
    {
      minerId: 'MN34',
      minerName: 'Bitmind',
      stance: 'false',
      confidence: 91,
      rationale: 'Asset is authentic and recent, not recycled',
      latencyMs: 3120,
      signalHash: '',
      costUsd: 0.01,
    },
  ],
  rankedSignal: 'false',
  dissenters: [],
  createdAt: 0,
}

/**
 * Sample verdict. A real worked example rendered through the same heatmap
 * component, with a scroll-to-tool button.
 * @returns the sample verdict section
 */
export default function SampleVerdict() {
  const scrollToTool = (): void => {
    document.getElementById('tool')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative z-10 min-h-[100dvh] snap-start flex flex-col justify-center px-4 md:px-8 py-24">
      <div className="text-center mb-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--accent)] mb-3"
        >
          See it on a real claim
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
          whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.35 }}
          className="font-display text-3xl md:text-5xl font-bold text-[var(--text-primary)] tracking-[-1px]"
        >
          One claim. Three miners. The split.
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto items-center w-full">
        <motion.div
          initial={{ opacity: 0, x: -24, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          className="liquid-glass p-6 order-2 lg:order-1"
        >
          <p className="font-mono text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-2">
            Claim
          </p>
          <p className="font-mono text-sm text-[var(--text-primary)] leading-relaxed">
            This video of the earthquake is from last year
          </p>
          <p className="font-body text-xs text-[var(--text-muted)] mt-3">
            With an attached clip for Bitmind to inspect
          </p>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
            Recorded run, rendered by the same live component
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
          className="order-1 lg:order-2"
        >
          <DisagreementHeatmap result={SAMPLE} loading={false} mediaAttached />
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={scrollToTool}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.7 }}
        className="mt-8 mx-auto inline-flex items-center gap-2 font-body text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
      >
        Run it live on your own claim
      </motion.button>
    </section>
  )
}

'use client'

import { motion } from 'motion/react'
import type { MinerResponse, Stance, VeridResult } from '@/lib/types'

interface DisagreementHeatmapProps {
  /** Active result, or null while loading to render skeletons */
  result: VeridResult | null
  loading: boolean
  /** Media attached, controls whether the third cell renders */
  mediaAttached: boolean
}

/** Cell count for skeletons, three when media is attached */
const STANCE_CHIP: Record<Stance, { label: string; classes: string }> = {
  true: {
    label: 'Verified',
    classes: 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20',
  },
  uncertain: {
    label: 'Uncertain',
    classes: 'bg-[var(--warn)]/10 text-[var(--warn)] border-[var(--warn)]/20',
  },
  false: {
    label: 'Flagged',
    classes: 'bg-[var(--error)]/10 text-[var(--error)] border-[var(--error)]/20',
  },
  error: {
    label: 'Error',
    classes: 'bg-[var(--error)]/10 text-[var(--error)] border-[var(--error)]/20',
  },
}

/**
 * The disagreement heatmap, the core visual. One cell per live miner with
 * stance chip, animated confidence bar and rationale, plus the consensus row
 * that ranks the truth signal and names any dissenter. Doubles as the Sample
 * Verdict renderer by accepting a pre-filled result.
 * @param props - result or loading state
 * @returns the heatmap card
 */
export default function DisagreementHeatmap({ result, loading, mediaAttached }: DisagreementHeatmapProps) {
  const visible = loading
    ? (Array.from({ length: mediaAttached ? 3 : 2 }) as MinerResponse[]).map(() => null)
    : (result?.responses ?? [])

  const verdictWord = result
    ? STANCE_CHIP[result.rankedSignal]?.label.toUpperCase() ?? 'UNCERTAIN'
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="liquid-glass p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-h-[60vh] overflow-y-auto"
    >
      {visible.map((response, index) => (
        <motion.div
          key={response ? `${response.minerId}-${index}` : `skeleton-${index}`}
          initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.12 }}
          className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-white/60 p-4"
        >
          {response === null ? (
            <div aria-hidden>
              <div className="skeleton-shimmer h-4 w-24 rounded-full" />
              <div className="skeleton-shimmer mt-3 h-1.5 w-full rounded-full" />
              <div className="skeleton-shimmer mt-3 h-3 w-full rounded-full" />
              <div className="skeleton-shimmer mt-2 h-3 w-3/4 rounded-full" />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-bold text-[var(--text-primary)]">
                  {response.minerName}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide border ${STANCE_CHIP[response.stance].classes}`}
                >
                  {STANCE_CHIP[response.stance].label}
                </span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${response.confidence}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + index * 0.12 }}
                  className="h-full bg-[var(--accent)]"
                />
              </div>
              <p className="mt-2 font-body text-xs text-[var(--text-secondary)] leading-snug">
                {response.rationale}
              </p>
              <p className="mt-2 font-mono text-[10px] text-[var(--text-muted)]">
                MN{response.minerId} · {response.latencyMs}ms
                {response.costUsd > 0 ? ` · $${response.costUsd.toFixed(2)}` : ''}
              </p>
            </div>
          )}
        </motion.div>
      ))}

      {!loading && result && (
        <motion.div
          initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
          className="md:col-span-3 rounded-[var(--radius-md)] bg-[var(--accent-glow)] border border-[var(--accent)]/20 p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
        >
          <div className="flex-1">
            <p className="font-display text-lg font-bold text-[var(--text-primary)]">
              Ranked truth signal: {verdictWord}
            </p>
            {result.dissenters.length > 0 ? (
              <p className="mt-1 font-mono text-xs text-[var(--text-secondary)]">
                {result.dissenters.join(', ')} dissented from the ranked signal
              </p>
            ) : (
              <p className="mt-1 font-mono text-xs text-[var(--text-secondary)]">
                No dissent. All miners agree the signal is {verdictWord.toLowerCase()}.
              </p>
            )}
          </div>
          <div className="flex h-2.5 w-full md:w-56 rounded-full overflow-hidden gap-[2px]">
            {result.responses
              .filter((r) => r.stance !== 'error')
              .map((r, index) => (
                <span
                  key={`${r.minerId}-${index}`}
                  className="flex-1"
                  style={{ backgroundColor: `var(--${r.stance === 'true' ? 'success' : r.stance === 'false' ? 'error' : 'warn'})` }}
                />
              ))}
          </div>
        </motion.div>
      )}

      {!loading && result && !result.mediaAttached && (
        <p className="md:col-span-3 font-mono text-[11px] text-[var(--text-muted)] text-center">
          Media check was not run, no media was attached
        </p>
      )}
    </motion.div>
  )
}

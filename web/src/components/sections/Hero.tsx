'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import ClaimInput from '@/components/tool/ClaimInput'
import DisagreementHeatmap from '@/components/tool/DisagreementHeatmap'
import type { VeridResult } from '@/lib/types'

/**
 * Hero and tool. Centred composition with the eyebrow, headline and subhead,
 * the input module and the live disagreement heatmap directly below.
 * Submitting a claim fans out to the server route, which calls three live
 * Telegraph miners in parallel through x402.
 * @returns the hero section with the live tool
 */
export default function Hero() {
  const [result, setResult] = useState<VeridResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [mediaAttached, setMediaAttached] = useState(false)
  const [error, setError] = useState('')

  /**
   * Posts the claim to the server fan-out and stores the result.
   * @param claim - the claim text
   * @param media - optional media data URL
   */
  const handleVerify = async (claim: string, media?: string): Promise<void> => {
    setLoading(true)
    setError('')
    setResult(null)
    setMediaAttached(Boolean(media))
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ claim, media }),
      })
      const data = (await response.json()) as VeridResult & { error?: string }
      if (!response.ok || data.error) {
        setError(data.error || 'The fan-out failed, try again')
      } else {
        setResult(data)
      }
    } catch {
      setError('The fan-out failed, try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="tool"
      className="relative z-10 min-h-[100dvh] snap-start flex flex-col items-center justify-center px-4 md:px-8 py-24 text-center"
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        className="font-mono text-[11px] md:text-xs uppercase tracking-[0.25em] text-[var(--accent)] mb-5"
      >
        Cross-miner truth verification
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, filter: 'blur(10px)', y: 24 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.35 }}
        className="font-display text-4xl md:text-6xl lg:text-[4.5rem] font-bold text-[var(--text-primary)] leading-[0.95] tracking-[-2px] max-w-3xl"
      >
        Paste a claim. Get the verdict.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.55 }}
        className="mt-5 max-w-xl font-body text-base md:text-lg text-[var(--text-secondary)] leading-relaxed"
      >
        Verid asks three live Telegraph miners at once, then shows you the truth signal and
        exactly where they disagreed.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        className="w-full flex flex-col items-center"
      >
        <ClaimInput onSubmit={handleVerify} loading={loading} />
      </motion.div>

      <div className="mt-6 w-full max-w-3xl relative z-20">
        {result || loading ? (
          <DisagreementHeatmap result={result} loading={loading} mediaAttached={mediaAttached} />
        ) : error ? (
          <p className="font-mono text-xs text-[var(--error)]">{error}</p>
        ) : (
          <p className="font-mono text-xs text-[var(--text-muted)]">
            Three miners respond in parallel. The heatmap fills in live.
          </p>
        )}
      </div>
    </section>
  )
}

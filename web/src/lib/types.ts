/**
 * Verid data model shared between the API route and the client components.
 */

export type Stance = 'true' | 'uncertain' | 'false' | 'error'

export interface MinerResponse {
  /** Telegraph numeric miner id, e.g. '34' */
  minerId: string
  /** Display name, e.g. 'DeSearch' */
  minerName: string
  stance: Stance
  /** 0 to 100 */
  confidence: number
  /** One or two lines from the real miner response */
  rationale: string
  latencyMs: number
  /** Signal hash for verification lookups, empty when unsettled */
  signalHash: string
  /** End-to-end cost of this call in USD */
  costUsd: number
}

export interface VeridResult {
  claim: string
  mediaAttached: boolean
  /** Two cells on text-only claims, three when media is attached */
  responses: MinerResponse[]
  /** Majority verdict across non-error cells */
  rankedSignal: Stance
  /** Miner names that diverged from the ranked signal */
  dissenters: string[]
  createdAt: number
}

export interface VerifyRequest {
  claim: string
  /** Data URL or remote URL of the attached media, when present */
  media?: string
}

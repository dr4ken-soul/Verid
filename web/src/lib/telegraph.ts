/**
 * Telegraph miner client. Resolves the three role miners from the live node
 * catalogue at request time (ids are not stable, the docs say to take them
 * from discovery), fans a claim out to all of them through the x402 payment
 * flow and maps each raw answer onto the shared MinerResponse shape.
 *
 * Roles, resolved by slug with env overrides:
 *   web grounding    DeSearch (falls back to Tavily on the live node)
 *   reasoning verdict  LiteLLM chat miner
 *   media authenticity Bitmind SN34, only when media is attached
 */

import { callMiner, hasPaymentKey } from './x402'
import type { MinerResponse, Stance, VeridResult } from './types'

/** Telegraph Engine base, testnet node per the docs */
const TELEGRAPH_BASE = (
  process.env.TELEGRAPH_API_BASE || 'https://devnode.telegraphprotocol.com'
).replace(/\/$/, '')

/** Slug keywords per role, first match wins, env override takes precedence */
const ROLE_KEYWORDS = {
  web: ['desearch', 'tavily', 'web-search'],
  reasoning: ['openai', 'litellm', 'groq'],
  media: ['bitmind', 'deepfake'],
} as const

interface MinerEntry {
  id: string
  slug: string
  name: string
  activation_status?: string
  endpoints: { path: string; method: string }[]
}

interface AskBody extends Record<string, unknown> {
  method: string
  endpoint: string
  payload: Record<string, unknown>
}

/** Structured answer format every text miner is asked for */
const ANSWER_FORMAT =
  'Answer in exactly this format: VERDICT: true|false|uncertain, CONFIDENCE: 0-100, RATIONALE: one or two sentences.'

/** Cache of the resolved role miners, refreshed when the catalogue changes */
let minerCache: { web: MinerEntry; reasoning: MinerEntry; media: MinerEntry } | null = null
let minerCacheAt = 0
const CACHE_TTL_MS = 10 * 60 * 1000

/**
 * Reads the miner id for a role from the environment when set.
 * @param role - one of web, reasoning, media
 * @returns a miner id string or undefined
 */
function envMinerId(role: keyof typeof ROLE_KEYWORDS): string | undefined {
  if (role === 'web') return process.env.TELEGRAPH_MINER_ID_WEB
  if (role === 'reasoning') return process.env.TELEGRAPH_MINER_ID_REASONING
  return process.env.TELEGRAPH_MINER_ID_MEDIA
}

/**
 * Resolves the three role miners from the live node catalogue. Matched by
 * slug keyword so rotating miner ids never break the fan-out.
 * @returns one miner entry per role
 */
async function resolveMiners(): Promise<{
  web: MinerEntry
  reasoning: MinerEntry
  media: MinerEntry
}> {
  if (minerCache && Date.now() - minerCacheAt < CACHE_TTL_MS) return minerCache
  const res = await fetch(`${TELEGRAPH_BASE}/api/miners`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`miner discovery failed with status ${res.status}`)
  const catalogue = (await res.json()) as MinerEntry[]

  const pick = (role: keyof typeof ROLE_KEYWORDS): MinerEntry => {
    const override = envMinerId(role)
    if (override) {
      const found = catalogue.find((m) => m.id === override)
      if (found) return found
    }
    for (const keyword of ROLE_KEYWORDS[role]) {
      const found = catalogue.find(
        (m) =>
          m.activation_status !== 'inactive' &&
          (m.slug.toLowerCase().includes(keyword) || m.name.toLowerCase().includes(keyword)),
      )
      if (found) return found
    }
    throw new Error(`no live miner found for role ${role}`)
  }

  minerCache = { web: pick('web'), reasoning: pick('reasoning'), media: pick('media') }
  minerCacheAt = Date.now()
  return minerCache
}

/**
 * Builds the direct ask body for a resolved miner and role.
 * @param role - the miner role
 * @param entry - the resolved miner entry from the catalogue
 * @param claim - the user claim
 * @param media - attached media, base64 or a public URL
 * @returns the ask payload for POST /engine/v1/ask/{minerId}
 */
function buildAsk(
  role: keyof typeof ROLE_KEYWORDS,
  entry: MinerEntry,
  claim: string,
  media?: string,
): AskBody {
  if (role === 'web') {
    return {
      method: 'POST',
      endpoint: '/search',
      payload: {
        query: `${ANSWER_FORMAT} Claim to check against the live web: "${claim}"`,
        include_answer: true,
        max_results: 5,
        search_depth: 'basic',
      },
    }
  }
  if (role === 'reasoning') {
    return {
      method: 'POST',
      endpoint: '/chat',
      payload: {
        model: 'nova-2-lite',
        messages: [
          {
            role: 'user',
            content: `${ANSWER_FORMAT} Claim: "${claim}"${
              media ? ' The user also attached media for inspection.' : ''
            } Judge whether the claim is true, false or uncertain and justify it briefly.`,
          },
        ],
        temperature: 0.2,
        max_tokens: 400,
      },
    }
  }
  const isVideo = Boolean(media && /\.(mp4|webm|mov)/i.test(media))
  return {
    method: 'POST',
    endpoint: isVideo ? '/detect-video' : '/detect-image',
    payload: media
      ? media.startsWith('http')
        ? { url: media, image: media }
        : media.startsWith('data:')
          ? { image: media }
          : { image: `data:image/png;base64,${media}` }
      : { image: '' },
  }
}

/**
 * Pulls a plain string out of an unknown miner result.
 * @param result - raw result object from the engine
 * @param keys - preferred keys in order
 * @returns the first string found or empty
 */
function extractText(result: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = result[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  const choices = result.choices
  if (Array.isArray(choices) && choices.length > 0) {
    const first = choices[0] as { message?: { content?: unknown } }
    const content = first?.message?.content
    if (typeof content === 'string' && content.trim()) return content.trim()
  }
  const answer = result.answer
  if (typeof answer === 'string') return answer.trim()
  return ''
}

/**
 * Parses stance and confidence out of a miner's free text answer.
 * @param text - the miner text
 * @returns stance and a 0 to 100 confidence
 */
function parseStance(text: string): { stance: Stance; confidence: number } {
  const lower = text.toLowerCase()
  let stance: Stance = 'uncertain'
  if (/\bverdict\b[^a-z]{0,12}(false|fake|incorrect|not true)/.test(lower) || /\bfalse\b/.test(lower)) {
    stance = 'false'
  } else if (/\bverdict\b[^a-z]{0,12}(true|accurate|correct)/.test(lower) || /\btrue\b/.test(lower)) {
    stance = 'true'
  }
  const confMatch = lower.match(/confidence[^0-9]{0,8}(\d{1,3})/)
  const confidence = confMatch ? Math.min(100, parseInt(confMatch[1], 10)) : 55
  return { stance, confidence }
}

/**
 * Maps a raw engine response onto a MinerResponse cell.
 * @param role - the miner role
 * @param entry - the resolved miner entry
 * @param body - the engine response body
 * @param latencyMs - end to end call latency
 * @returns a heatmap cell
 */
function mapResponse(
  role: keyof typeof ROLE_KEYWORDS,
  entry: MinerEntry,
  body: unknown,
  latencyMs: number,
): MinerResponse {
  const names = { web: 'DeSearch', reasoning: 'OpenAI', media: 'Bitmind' } as const
  const fallback = (stance: Stance, rationale: string, confidence = 55): MinerResponse => ({
    minerId: entry.id,
    minerName: names[role],
    stance,
    confidence,
    rationale,
    latencyMs,
    signalHash: '',
    costUsd: 0,
  })

  if (!body || typeof body !== 'object') return fallback('error', 'Miner unreachable')
  const envelope = body as Record<string, unknown>
  if (typeof envelope.error === 'string') {
    return fallback('error', `Miner unreachable: ${envelope.error}`)
  }

  const result = (envelope.result && typeof envelope.result === 'object' ? envelope.result : envelope) as Record<string, unknown>
  const costUsd = typeof envelope.cost_usd === 'number' ? envelope.cost_usd : 0
  const signalHash = typeof envelope.signal_hash === 'string' ? envelope.signal_hash : ''

  if (role === 'media') {
    const isAi = result.isAI === true || result.is_ai === true || result.deepfake === true
    const confidence = typeof result.confidence === 'number' ? Math.round(result.confidence * 100) : 80
    const label = extractText(result, ['label', 'reason', 'summary'])
    return {
      minerId: entry.id,
      minerName: names[role],
      stance: isAi ? 'false' : 'true',
      confidence,
      rationale: isAi
        ? `Attached media flagged as AI-generated or manipulated. ${label}`.trim()
        : `Attached media appears authentic, no manipulation detected. ${label}`.trim(),
      latencyMs,
      signalHash,
      costUsd,
    }
  }

  const text = extractText(result, ['answer', 'output', 'reason', 'reasoning', 'summary', 'label'])
  if (!text) return fallback('error', 'Miner returned no readable answer')
  const { stance, confidence } = parseStance(text)
  const rationale = text.length > 220 ? `${text.slice(0, 217)}...` : text
  return {
    minerId: entry.id,
    minerName: names[role],
    stance,
    confidence,
    rationale,
    latencyMs,
    signalHash,
    costUsd,
  }
}

/**
 * Fans one claim out to the three live miners in parallel and ranks the signal.
 * An unreachable miner becomes an honest error cell, never a fake verdict.
 * Bitmind only runs when media is attached.
 * @param claim - the claim text
 * @param media - optional attached media as base64 or a public URL
 * @returns the complete VeridResult
 */
export async function verifyClaim(claim: string, media?: string): Promise<VeridResult> {
  const miners = await resolveMiners()

  const runRole = async (role: keyof typeof ROLE_KEYWORDS): Promise<MinerResponse> => {
    const started = Date.now()
    const entry = miners[role]
    if (role === 'media' && !media) {
      return {
        minerId: entry.id,
        minerName: 'Bitmind',
        stance: 'uncertain',
        confidence: 0,
        rationale: 'Media check not run, no media attached',
        latencyMs: 0,
        signalHash: '',
        costUsd: 0,
      }
    }
    try {
      if (!hasPaymentKey()) {
        throw new Error('payment wallet not configured on the server')
      }
      const ask = buildAsk(role, entry, claim, media)
      const { body } = await callMiner(`${TELEGRAPH_BASE}/engine/v1/ask/${entry.id}`, ask)
      return mapResponse(role, entry, body, Date.now() - started)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error'
      return {
        minerId: entry.id,
        minerName: role === 'media' ? 'Bitmind' : role === 'web' ? 'DeSearch' : 'OpenAI',
        stance: 'error',
        confidence: 0,
        rationale: `Miner unreachable: ${message}`,
        latencyMs: Date.now() - started,
        signalHash: '',
        costUsd: 0,
      }
    }
  }

  const [web, reasoning, mediaCell] = await Promise.all([
    runRole('web'),
    runRole('reasoning'),
    runRole('media'),
  ])

  const responses = media ? [web, reasoning, mediaCell] : [web, reasoning]
  const active = responses.filter((r) => r.stance !== 'error' && !(r.stance === 'uncertain' && r.confidence === 0 && !media))
  const counted = active.filter((r) => r.stance !== 'uncertain' || r.confidence > 0)

  let rankedSignal: Stance = 'uncertain'
  const votes = counted.map((r) => r.stance)
  const trueVotes = votes.filter((s) => s === 'true').length
  const falseVotes = votes.filter((s) => s === 'false').length
  if (trueVotes > 0 && trueVotes >= falseVotes) rankedSignal = 'true'
  else if (falseVotes > 0 && falseVotes > trueVotes) rankedSignal = 'false'

  const dissenters = counted
    .filter((r) => rankedSignal !== 'uncertain' && r.stance !== rankedSignal)
    .map((r) => r.minerName)

  return {
    claim,
    mediaAttached: Boolean(media),
    responses,
    rankedSignal,
    dissenters,
    createdAt: Date.now(),
  }
}

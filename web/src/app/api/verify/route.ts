/**
 * Server API route for the verify fan-out. Keeps the x402 signer, the wallet
 * key and all miner traffic on the server, the browser only ever sees the
 * finished VeridResult.
 */

import { NextResponse } from 'next/server'
import { verifyClaim } from '@/lib/telegraph'
import type { VerifyRequest } from '@/lib/types'

export const maxDuration = 120

/**
 * Verifies a claim against three live Telegraph miners.
 * @param request - POST body with claim and optional media
 * @returns a VeridResult JSON or an error status
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: VerifyRequest
  try {
    body = (await request.json()) as VerifyRequest
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const claim = typeof body.claim === 'string' ? body.claim.trim() : ''
  if (!claim) {
    return NextResponse.json({ error: 'claim is required' }, { status: 400 })
  }

  const media = typeof body.media === 'string' && body.media ? body.media : undefined

  try {
    const result = await verifyClaim(claim, media)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'miner fan-out failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}

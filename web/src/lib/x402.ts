/**
 * Server side x402 payment client for Telegraph miner calls.
 * Follows the documented flow at docs.telegraphprotocol.com/docs/using/x402-inference:
 * probe the endpoint, read the 402 challenge, sign an EIP-3009 USDC transfer
 * authorisation on Base Sepolia, retry with the payment proof header.
 * The official @x402 packages own the signing, this module only wires them up.
 *
 * WALLET_PRIVATE_KEY is read here and here only. It must never reach the
 * browser bundle, this module is imported exclusively from server code.
 */

import { wrapFetchWithPayment, x402Client } from '@x402/fetch'
import { ExactEvmScheme } from '@x402/evm'
import { privateKeyToAccount } from 'viem/accounts'

/** CAIP-2 identifier for Base Sepolia, the network Telegraph settles on */
const BASE_SEPOLIA = 'eip155:84532'

export interface MinerCallResult {
  status: number
  /** Parsed JSON body of the settled 200 response */
  body: unknown
  /** Settlement receipt from the PAYMENT-RESPONSE header, empty when absent */
  receipt: string
}

/** Cached payment enabled fetch, built once per server process */
let paidFetch: ((input: string, init?: RequestInit) => Promise<Response>) | null = null

/**
 * Returns true when a payer key is configured on the server.
 * @returns whether x402 payments can be signed
 */
export function hasPaymentKey(): boolean {
  return Boolean(process.env.WALLET_PRIVATE_KEY)
}

/**
 * Builds the payment enabled fetch, signing with the configured wallet.
 * @returns a fetch that answers 402 challenges automatically
 */
function getPaidFetch(): (input: string, init?: RequestInit) => Promise<Response> {
  if (paidFetch) return paidFetch
  const key = process.env.WALLET_PRIVATE_KEY
  if (!key) {
    throw new Error('payment wallet not configured')
  }
  const account = privateKeyToAccount(key as `0x${string}`)
  const client = new x402Client().register(BASE_SEPOLIA, new ExactEvmScheme(account))
  paidFetch = wrapFetchWithPayment(fetch, client) as (
    input: string,
    init?: RequestInit,
  ) => Promise<Response>
  return paidFetch
}

/**
 * Sends a request to a Telegraph miner through the x402 flow. The wrapped
 * fetch probes without payment, signs the quoted testnet USDC amount on Base
 * Sepolia when a 402 challenge arrives, retries with the proof, and returns
 * the verified answer with its settlement receipt.
 * @param url - the full miner ask URL on the Telegraph node
 * @param body - the miner request payload (method, endpoint, payload)
 * @returns the settled status, body and receipt
 */
export async function callMiner(
  url: string,
  body: Record<string, unknown>,
): Promise<MinerCallResult> {
  const fetcher = getPaidFetch()
  const response = await fetcher(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (response.status === 402) {
    throw new Error('payment was not accepted by the node')
  }
  const text = await response.text()
  let parsed: unknown = null
  try {
    parsed = text ? JSON.parse(text) : null
  } catch {
    parsed = { raw: text }
  }
  return {
    status: response.status,
    body: parsed,
    receipt: response.headers.get('payment-response') ?? '',
  }
}

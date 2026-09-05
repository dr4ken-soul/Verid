# Verid — Build Guide

## Before You Write a Single Line of Code

Read APP_BLUEPRINT.md and FRONTEND_SPEC.md in full. Every data structure, miner call pattern and Telegraph flow is in APP_BLUEPRINT.md. Every class, animation value, z-index and piece of copy for the page is in FRONTEND_SPEC.md. This guide sequences the build, it does not repeat content that already exists at full fidelity elsewhere. Where a step says "as specified in X", go and read that section before writing the file, do not guess. CLAUDE.md, once written, becomes the persistent context file for future sessions and sits alongside this guide.

---

## Prerequisites

```bash
node --version    # 18 or higher
npm --version     # 9 or higher
git --version     # any recent version
```

A Base Sepolia wallet with testnet USDC for x402 payments during the demo. The Telegraph team confirmed the network is Base Sepolia, so no real funds are spent and the build can be fully off-chain.

Clone nothing, Verid is frontend-only, there is no Hardhat starter to copy.

---

## Repository Setup

```bash
mkdir verid && cd verid
git init
mkdir -p web/src/{app,components/{three,layout,sections,tool},lib,styles}
```

Root `.env` (copied into web as needed, never committed):

```text
NEXT_PUBLIC_TELEGRAPH_API_BASE=
NEXT_PUBLIC_TELEGRAPH_FACILITATOR=
NEXT_PUBLIC_USE_TESTNET=true
NEXT_PUBLIC_RPC_URL=
WALLET_PRIVATE_KEY=
GROQ_API_KEY=
```

---

## Phase 1 — Frontend Setup

```bash
cd web
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir=false
npm install motion
npm install @telegraph/x402-client        # or the documented x402 signer, confirm at build
npm install groq-sdk                      # optional, only if synthesis is enabled
```

Translate the colour system and font imports from FRONTEND_SPEC.md Section 1.1 and 1.2 into `tailwind.config.ts` and `src/styles/globals.css` exactly as written. This is the one part of the spec that gets copied in full because it is foundational wiring. Add the global scrollbar-hide rules and the scroll-snap container from FRONTEND_SPEC.md Section 1.6.

---

## Phase 2 — Telegraph Integration

### Step 2.1: x402 payment signer

Create `src/lib/x402.ts`. Use the PayAi x402 facilitator on Base Sepolia as documented at docs.telegraphprotocol.com/docs/using/x402-inference. Implement the probe, sign, retry flow: send the miner request with no payment, read the 402 envelope, sign an EIP-3009 testnet USDC transfer on Base Sepolia for the quoted amount using `WALLET_PRIVATE_KEY` (loaded server-side only), retry with the payment proof header, return the 200 body.

```typescript
/**
 * Sends a request to a Telegraph miner through the x402 flow.
 * Probes without payment, signs the quoted USDC amount on Base, retries
 * with the payment proof, and returns the verified answer.
 * @param base - the Signal API base URL
 * @param body - the miner request payload (miner id, query, optional media)
 * @param signPayment - signs the 402 envelope and returns the proof header
 * @returns the verified miner answer and the settlement receipt
 */
export async function callMiner(
  base: string,
  body: Record<string, unknown>,
  signPayment: (req: unknown) => Promise<string>,
): Promise<{ answer: unknown; receipt: string }> {
  const probe = await fetch(`${base}/signal`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (probe.status !== 402) throw new Error(`unexpected status ${probe.status}`)
  const envelope = await probe.json()
  const proof = await signPayment(envelope)
  const res = await fetch(`${base}/signal`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-payment': proof },
    body: JSON.stringify(body),
  })
  return { answer: await res.json(), receipt: res.headers.get('x-payment-tx') ?? '' }
}
```

### Step 2.2: Miner client

Create `src/lib/telegraph.ts` wrapping `callMiner` for the three miners. Fan a claim out to DeSearch, OpenAI, and Bitmind when media is attached. Map each raw answer to a `MinerResponse` (stance, confidence, rationale). Run the three calls with `Promise.all`. If a call throws, return a cell with stance `'error'` and the message "Miner unreachable", do not substitute a fake verdict.

Confirm the exact Signal API base, miner IDs (MN101, MN102, MN34) and facilitator at build time from docs.telegraphprotocol.com and docs.telegraphprotocol.com/docs/using/x402-inference. Do not hardcode from memory.

---

## Phase 3 — Landing Sections

One component file per section in `src/components/sections/`, implemented exactly as specified in the matching numbered section of FRONTEND_SPEC.md:

- `Hero.tsx` — Section 3, the tool: claim input plus the live disagreement heatmap
- `HowItWorks.tsx` — Section 4, three miner cards plus consensus note
- `SampleVerdict.tsx` — Section 5, a real worked example using the same heatmap
- `WhyVerid.tsx` — Section 6, badge stack, no logos
- `FinalCta.tsx` — Section 7, crescendo close
- `Footer.tsx` — Section 8

Tool components in `src/components/tool/`:
- `ClaimInput.tsx` — textarea, optional media drop, Verify button, skeleton loading state
- `DisagreementHeatmap.tsx` — three miner cells plus the consensus row, the core visual

Assemble them in `src/app/page.tsx` in the order given in FRONTEND_SPEC.md: nav then hero through footer. Mount `VeridField` once in `layout.tsx`, not per page.

---

## Phase 4 — Quality Audit

Run through this list before recording the demo video.

**Integration audit:**
- Submitting a claim fires three concurrent live Telegraph calls
- Each cell shows a real stance, confidence and rationale
- An unreachable miner shows an honest error state, never a fake verdict
- Bitmind is skipped on text-only claims and runs when media is attached
- No mainnet USDC spent unless explicitly intended, demo uses testnet or the hackathon allowance

**Frontend audit (in addition to the FRONTEND_SPEC.md self-check):**
- No mock data anywhere, every number and stance is a real miner read
- Logo and favicon are still plain comment slots if no asset was supplied
- A1 nav pill renders centred, wordmark left, Use Verid right, no hamburger
- Scroll-snap sections animate in on view and replay on scroll back
- Mobile viewport: hero stacks, heatmap leads, no horizontal overflow

**Final checklist, matching APP_BLUEPRINT.md's Hackathon Deliverables Checklist:**
- Public GitHub repository with a complete README
- Deployed to a public HTTPS URL
- Demo video recorded, trimmed under 90 seconds
- X post published tagging @Telegraphprotoc with demo video and live app link
- Progress updates posted on X during the build

---

## Phase 5 — Demo and Submission

Record a screen capture under 90 seconds: open Verid, paste a real claim, show the three live miner calls resolving into the heatmap, point at the consensus row and any dissenter, then scroll the Sample and Why Verid sections. Publish the X post tagging @Telegraphprotoc with the video and the live link. Submit before 7 September 2026, 23:59 UTC.

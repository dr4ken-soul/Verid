# Verid — App Blueprint

## Product Summary

Verid is a cross-miner truth verification tool built on Telegraph. A user pastes a claim, optionally attaches an image or video, and Verid fans the claim to three live Telegraph miners in parallel: DeSearch for web grounding, OpenAI for a reasoning verdict, and Bitmind for media authenticity. It returns one ranked truth signal plus a disagreement heatmap that shows exactly which miner dissented and why. Built for the Telegraph Hackathon Season I, Application Track.

This is a Category B off-chain Web3 tool. It queries live Telegraph miners through the Signal API or Terminal Developer API. It does not deploy contracts and does not require the user to connect a wallet to use it. Telegraph runs the miners, Verid only orchestrates the calls and renders the result. The Telegraph team confirmed the build can be fully off-chain on Base Sepolia with no real USDC, which matches this design.

---

## Market Context

**Who this is for:**

1. Researchers, journalists and analysts who need to check a claim against more than one source before trusting it
2. Builders and agents who consume machine intelligence and want a verified, dispute-aware answer rather than one black-box model
3. Hackathon judges and the Telegraph community evaluating whether a real application can drive live miner demand through the network

**What they currently use:** a single LLM chat window, a search engine, or one fact-checking site. None of these show the disagreement between independent sources, and none settle as real requests on a miner network.

**Why they switch:** one model can be confidently wrong. Verid makes the split visible, shows three independent miners at once, and every call is a real paid request on Telegraph, which is exactly what the Application Track rewards.

---

## MVP Feature Set

### Feature 1: Parallel Miner Fan-Out

**User story:** As a user I want to submit one claim and have it checked by three live miners at once, so I see independent verdicts instead of a single answer.

**How it works:** The claim text (and optional media) is sent as three parallel requests through `lib/telegraph.ts`, one per miner: DeSearch (MN101), OpenAI (MN102), and Bitmind (MN34) when media is attached. Each call uses the x402 flow, no API key, payment signed in USDC on Base. Each response maps to a cell: stance (true, uncertain, false), confidence 0 to 100, and a one or two line rationale.

**Acceptance criteria:** Submitting a claim triggers three concurrent live Telegraph calls. The heatmap shows three populated cells with real stances and rationales. If a miner is unreachable the cell shows an honest error state, never a fake verdict.

**Complexity:** Medium

---

### Feature 2: Disagreement Heatmap and Ranked Signal

**User story:** As a user I want to see where the miners disagreed, so I can judge the claim myself instead of trusting an average.

**How it works:** The three miner cells render side by side with stance colour, a confidence bar, and the rationale. A consensus row below ranks the truth signal by majority and names any dissenter. The visual gap between cells is the disagreement.

**Acceptance criteria:** After three responses land, the consensus row shows a ranked verdict word and a dissent callout when any miner diverged. The bars animate from zero to their confidence value.

**Complexity:** Medium

---

### Feature 3: Media Authenticity Path

**User story:** As a user I want to attach an image or video, so Bitmind can tell me whether the asset is real, manipulated or recycled.

**How it works:** When media is attached, Bitmind (MN34) is included in the fan-out and returns a media verdict. When no media is attached, Bitmind is skipped and the heatmap shows two active miners plus a quiet note that media check was not run.

**Acceptance criteria:** Attaching a clip and submitting produces a Bitmind cell with a media stance. Submitting text only produces two cells and no Bitmind call.

**Complexity:** Low

---

### Feature 4: Live Sample and Shareable Verdict

**User story:** As a user I want to see a real worked example, so I trust the tool before pasting my own claim.

**How it works:** The Sample Verdict section pre-fills a real claim with a real three-miner response using the same heatmap component. A button scrolls to the live tool. Verdicts are URL-encodable so a result can be shared.

**Acceptance criteria:** The sample renders a complete heatmap with a clear consensus row. The scroll-to-tool button works. No mock data is used in the sample, it is a recorded real run or a live call behind the scenes.

**Complexity:** Low

**What makes this the one that matters for judging:** the disagreement is the product. A single verified answer is table stakes, showing three live miners disagreeing and naming the dissenter is what makes Verid win the Application Track, because it drives real multi-miner demand and is genuinely useful in real life.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend framework | Next.js 14 App Router, TypeScript | SSR for the marketing page, simple client tool, matches every reference build |
| Styling | Tailwind CSS | Utility-first, matches FRONTEND_SPEC.md exactly |
| Animation | motion/react | Correct import path for v11 plus, blur-in entrances |
| Miner calls | Telegraph Signal API or Terminal Developer API | The hackathon requirement, the entire data layer |
| Payments | x402 via PayAi facilitator (USDC on Base Sepolia testnet) | Telegraph's native pay-per-request, no API key, no signup, no real funds in the demo |
| Optional synthesis | Groq | Only for the one-line ranked signal sentence, skippable |
| Hosting | Vercel | Standard for Next.js, matches every prior project |

No smart contracts. No wallet connection required to use the tool. No backend database, miner responses are rendered client-side and can be cached in memory per session.

---

## Data Structures

```typescript
type Stance = 'true' | 'uncertain' | 'false' | 'error'

interface MinerResponse {
  minerId: string          // e.g. 'MN101'
  minerName: string        // e.g. 'DeSearch'
  stance: Stance
  confidence: number       // 0 to 100
  rationale: string        // one or two lines from the real response
  latencyMs: number
}

interface VeridResult {
  claim: string
  mediaAttached: boolean
  responses: MinerResponse[]   // 2 or 3 depending on media
  rankedSignal: Stance         // majority verdict
  dissenters: string[]         // miner names that diverged
  createdAt: number
}
```

---

## API Architecture

Every miner call follows the x402 pattern. Telegraph is the seller, your client is the buyer.

```text
Request a miner:
  POST {TELEGRAPH_API_BASE}/signal
  body: { miner: 'MN101', query: '<claim>', media?: '<dataUrl>' }

On no payment the API returns:
  HTTP 402 Payment Required
  body: { accepts: [ { scheme, network: 'base', asset: 'USDC',
                       amount, payTo, resource } ] }

Client signs an EIP-3009 USDC transfer on Base for the quoted amount,
retries with the payment proof in the request header, receives:
  HTTP 200 with the verified miner answer and a settlement receipt header
```

| Endpoint | Caller | Description |
|---|---|---|
| `POST /signal` (DeSearch) | Verid client | Grounded web search verdict for the claim |
| `POST /signal` (OpenAI) | Verid client | Reasoning verdict with rationale |
| `POST /signal` (Bitmind) | Verid client | Media authenticity, only when media attached |
| `GET /signal/:id` | Verid client | Optional receipt lookup for a settled call |

Auth is payment, not a key. If Telegraph offers an x-api-key dev flow for the hackathon, it bypasses x402 per request and is used instead. Resolve the exact base URL, miner IDs and facilitator at build time from docs.telegraphprotocol.com and docs.telegraphprotocol.com/docs/using/x402-inference, do not hardcode from memory.

---

## User Flow and Screens

1. Landing loads with the centred tool hero and the VeridField canvas behind it
2. User pastes a claim, optionally attaches media, presses Verify claim
3. Three miner calls fire in parallel through x402, each cell shows a skeleton shimmer while pending
4. Cells fill with real stances, the consensus row ranks the signal and names any dissenter
5. User scrolls through How it works, a live Sample, Why Verid, and the final CTA
6. Every miner call is a real settled request on Telegraph

Empty state: before first submit the heatmap shows a quiet placeholder line. Loading state: skeleton shimmer, never a spinner. Error state: a miner cell shows "Miner unreachable" with a retry affordance, the verdict is not faked.

---

## Environment Variables

```text
NEXT_PUBLIC_TELEGRAPH_API_BASE=      # Signal API base, resolve from docs.telegraphprotocol.com
NEXT_PUBLIC_TELEGRAPH_FACILITATOR=   # PayAi x402 facilitator
NEXT_PUBLIC_USE_TESTNET=true          # true for hackathon demo on Base Sepolia
NEXT_PUBLIC_RPC_URL=                 # Base or Base Sepolia RPC for x402 signing
WALLET_PRIVATE_KEY=                   # payer wallet for x402 USDC, never in frontend
GROQ_API_KEY=                        # optional, only for one-line synthesis
```

`WALLET_PRIVATE_KEY` is a server-side or build-time secret used only to sign x402 payments, it never reaches the browser bundle.

---

## App Routes

- `/` — the FRONTEND_SPEC.md landing page and live tool, public, no wallet required

Verid is a single-page tool, there is no separate app interior and no wallet gate.

---

## What Is Not Being Built in MVP

- Smart contracts or on-chain settlement logic, Telegraph handles payments through x402
- Wallet connection for end users, the tool is open to anyone
- A persistence layer or account system, verdicts are session-scoped
- Multi-claim history dashboard, out of scope for the hackathon window
- Mainnet USDC spend, demo runs on testnet unless told otherwise
- Groq synthesis, optional and off by default

---

## Hackathon Deliverables Checklist

- Public GitHub repository, complete viewable code, README with install and usage
- Functional frontend end to end with no mock data, every miner cell is a real Telegraph call
- Deployed on a public HTTPS URL
- Demo video, under 90 seconds, showing a real claim through to the heatmap
- X post tagging @Telegraphprotoc with the demo video and the live app link
- Progress updates posted on X during the build

---

## Hackathon Build Priority

Judged on users and activity, usage and adoption, creativity and usefulness, must use Telegraph miners, and engagement on posts. Priority order:

1. `lib/telegraph.ts` and `lib/x402.ts` working, three live miner calls returning real stances
2. Disagreement heatmap rendering real responses with the consensus row
3. Landing page live per FRONTEND_SPEC.md
4. Sample Verdict section with a real worked example
5. Deployed to a public URL
6. Demo video recorded and X post published tagging @Telegraphprotoc

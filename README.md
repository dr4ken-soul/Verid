# Verid

Paste a claim. Get the verdict.

Verid is a cross-miner truth verification tool built on Telegraph. One claim fans out to three live Telegraph miners in parallel: web grounding, a reasoning verdict and media authenticity when media is attached. The result is one ranked truth signal plus a disagreement heatmap that shows which miner dissented and why.

Built for the Telegraph Hackathon Season I, Application Track. Category B, fully off-chain. No contracts are deployed and no wallet connection is required from the end user. Every miner call is a real paid request on the Telegraph network through x402, settled in testnet USDC on Base Sepolia. No mock data anywhere, an unreachable miner shows an honest error state.

## How it works

1. A claim goes to `POST /api/verify`
2. The server resolves the three role miners from the live node catalogue at `GET /api/miners`, miner ids are not stable so they are never hardcoded
3. Three direct asks fire in parallel to `POST /engine/v1/ask/{minerId}` through the x402 flow: the request probes, receives a 402 challenge, signs the quoted USDC amount with EIP-3009 on Base Sepolia and retries with the payment proof
4. Each raw answer maps to a heatmap cell: stance, confidence, rationale, latency, cost and signal hash
5. The consensus row ranks the signal by majority and names any dissenter

Miner roles, resolved live from the catalogue with env overrides available:

| Role | Miners | Purpose |
|---|---|---|
| Web grounding | DeSearch, Tavily | What the open web says |
| Reasoning | LiteLLM chat miners | True, false or uncertain with reasoning |
| Media | Bitmind SN34 | Image or video authenticity, only when media is attached |

## Stack

- Next.js 14 App Router, TypeScript, Tailwind CSS
- motion/react for blur-in entrance animations
- Telegraph Engine, x402 payments via the official `@x402/fetch` and `@x402/evm` packages
- viem for the payment signer
- Light glassmorphism design system, scroll-snap sections, no images or video assets

## Getting started

Requirements: Node 20 or newer, npm 9 or newer.

```bash
cd web
npm install
cp .env.example .env.local
```

Fill `WALLET_PRIVATE_KEY` with a test wallet private key and fund it with Base Sepolia USDC, contract `0x036CbD53842c5426634e7929541eC2318f3dCF7e`. The key never reaches the browser bundle, it stays in the server route.

```bash
npm run dev
```

Open http://localhost:3000, paste a claim, optionally attach an image or video, press Verify claim.

## Production build

```bash
npm run build
npm start
```

Deploys to Vercel with the same environment variables.

## API

`POST /api/verify` with `{ "claim": "...", "media": "dataURL or https URL" }` returns:

```json
{
  "claim": "...",
  "mediaAttached": true,
  "responses": [
    {
      "minerId": "34",
      "minerName": "Bitmind",
      "stance": "false",
      "confidence": 91,
      "rationale": "Asset is authentic and recent, not recycled",
      "latencyMs": 3120,
      "signalHash": "0x...",
      "costUsd": 0.01
    }
  ],
  "rankedSignal": "false",
  "dissenters": [],
  "createdAt": 1730000000000
}
```

Every settled call records a Telegraph signal, look it up at `GET {TELEGRAPH_API_BASE}/engine/v1/signal/{signal_hash}`.

## Project structure

```text
web/src/
├── app/
│   ├── page.tsx              landing page, nav plus six sections
│   ├── layout.tsx            providers, VeridField mount, noise overlay
│   └── api/verify/route.ts   server fan-out, keeps the wallet key server side
├── components/
│   ├── three/VeridField.tsx  coded dot field and drifting blooms
│   ├── layout/Nav.tsx        centred glass pill
│   ├── sections/             Hero, HowItWorks, SampleVerdict, WhyVerid, FinalCta, Footer
│   └── tool/
│       ├── ClaimInput.tsx    claim textarea, media drop, verify button
│       └── DisagreementHeatmap.tsx  the core visual, shared with the sample
├── lib/
│   ├── telegraph.ts          miner discovery, fan-out, answer mapping
│   ├── x402.ts               x402 payment signer wrapper
│   └── types.ts              shared data model
└── styles/globals.css        design system tokens, liquid glass, shimmer
```

## Notes

- Payment is the authentication, no API key and no signup, the demo spends only testnet USDC
- You only pay for answers, a failed miner call takes no payment
- The heatmap never shows a seeded verdict, an unreachable miner renders an honest error cell

---

Built for the Telegraph Hackathon Season I, Application Track.

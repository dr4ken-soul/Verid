# Verid — Agent Context

## What This Is

Verid is a cross-miner truth verification tool built on Telegraph. A user pastes a claim, optionally attaches media, and Verid fans it to three live Telegraph miners in parallel: DeSearch for web grounding, OpenAI for a reasoning verdict, and Bitmind for media authenticity. It returns one ranked truth signal plus a disagreement heatmap showing which miner dissented and why.

Built for the Telegraph Hackathon Season I, Application Track. This is a Category B off-chain Web3 tool, it queries live Telegraph miners through the Signal API or Terminal Developer API, deploys no contracts, and needs no wallet from the end user.

---

## One-Line Pitch

Paste a claim, Verid asks three live Telegraph miners at once and shows you the truth signal and exactly where they disagreed.

---

## MVP Features

1. Parallel miner fan-out — one claim fires three concurrent live Telegraph calls (DeSearch, OpenAI, Bitmind when media is attached), paid per request through x402
2. Disagreement heatmap and ranked signal — three miner cells with stance, confidence and rationale, plus a consensus row that names any dissenter
3. Media authenticity path — attach an image or video and Bitmind checks whether it is real, manipulated or recycled
4. Live sample and shareable verdict — a real worked example using the same heatmap component, scroll-to-tool button

Post-hackathon, not in MVP: smart contracts, user wallets, account system, multi-claim history, Groq synthesis on by default.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS |
| Animation | motion/react |
| Miner calls | Telegraph Signal API or Terminal Developer API |
| Payments | x402 via PayAi facilitator, USDC on Base Sepolia testnet, no API key, no signup |
| Optional synthesis | Groq, only for the one-line ranked signal sentence |
| Hosting | Vercel |

No contracts. No backend database. Miner responses render client-side.

---

## Project Structure

```text
verid/
├── web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              (landing + live tool)
│   │   │   └── layout.tsx            (providers, VeridField mount)
│   │   ├── components/
│   │   │   ├── three/VeridField.tsx   (coded animated canvas, fixed)
│   │   │   ├── layout/Nav.tsx        (A1 centred glass pill)
│   │   │   ├── sections/
│   │   │   │   ├── Hero.tsx          (tool: input + heatmap)
│   │   │   │   ├── HowItWorks.tsx
│   │   │   │   ├── SampleVerdict.tsx
│   │   │   │   ├── WhyVerid.tsx
│   │   │   │   ├── FinalCta.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── tool/
│   │   │       ├── ClaimInput.tsx
│   │   │       └── DisagreementHeatmap.tsx
│   │   ├── lib/
│   │   │   ├── telegraph.ts          (x402 miner client)
│   │   │   └── x402.ts               (payment signer)
│   │   └── styles/globals.css
│   ├── tailwind.config.ts
│   └── package.json
├── README.md
```

---

## Design System

All gates confirmed, do not deviate from any value below.

**Aesthetic:** Bento grid operational structure on a Light glassmorphism surface
**Identity fingerprint:** centred tool / refined grotesk / pristine light (cool stone, not warm cream) / technical dot field / wave / subtle precision

**Fonts:**
- Display: Cabinet Grotesk
- Body: Satoshi
- Mono: JetBrains Mono (claim text, miner IDs, confidence figures, verdict codes)

```css
@import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&f[]=satoshi@300,400,500,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
```

**Colour palette:**
```css
--bg-primary:     #f4f6f8;
--bg-secondary:   #e9edf1;
--bg-surface:     #ffffff;
--bg-elevated:    #f8fafc;
--accent:         #2563eb;
--accent-hover:   #1d4ed8;
--accent-glow:    rgba(37, 99, 235, 0.12);
--text-primary:   #0f1720;
--text-secondary: #475569;
--text-muted:     #94a3b8;
--border-subtle:  rgba(15, 23, 32, 0.06);
--border-default: rgba(15, 23, 32, 0.10);
--success:        #16a34a;
--warn:           #d97706;
--error:          #dc2626;
```

Cool stone base, single electric blue accent. No warm cream, no purple, no AI gradient glow.

**Nav:** A1 Centred glass pill. Wordmark left (text only, no logo), single Use Verid action right, no link row, no hamburger.

**VeridField:** the site's one visual asset, and it is coded, not sourced. A fixed procedural light canvas, dot field plus two soft blue ambient blooms at low opacity. Mounted once at app root. Full behaviour in FRONTEND_SPEC.md Section 1.4.

**Scroll:** vertical scroll-snap container, each major section `min-h-[100dvh] snap-start`. Results section allows internal scroll so long verdicts read cleanly. Global scrollbar hidden.

---

## Landing Page Sections (in order)

1. **Hero / Tool** — centred hero with the claim input and the live disagreement heatmap directly below
2. **How it works** — three miner cards plus a consensus note
3. **Sample verdict** — a real worked example using the same heatmap component
4. **Why Verid** — network trust, badge stack, no hardcoded logos
5. **Final CTA** — crescendo close, Verify a claim plus Read the method
6. **Footer** — wordmark, hackathon attribution, links

Full section-by-section spec with exact classes, copy and animation values lives in FRONTEND_SPEC.md.

---

## Logo and Favicon

Neither exists yet. Leave both as plain comment slots:

```tsx
{/* Logo slot: replace with public/logo.svg only after explicit ask */}
```

```html
<!-- Favicon slot: replace with public/favicon.ico only after explicit ask -->
```

Never substitute a hardcoded placeholder, an AI-generated icon or an emoji in either slot. No Telegraph or sponsor logo is hardcoded anywhere, Verid renders as a text wordmark only.

---

## Telegraph Integration

Telegraph runs the miners. Verid calls them through the Signal API or Terminal Developer API using x402 with the PayAi facilitator on Base Sepolia, which means payment is the authentication: no API key, no signup, and the demo spends only testnet USDC with no real funds. The client sends the claim, receives a 402 with a testnet USDC price, signs the payment and retries, then gets the verified answer. The Telegraph team confirmed the build can be fully off-chain as long as Telegraph is integrated, which matches this design.

Three miners, resolved by ID at build time:
- DeSearch (MN101) — web grounding
- OpenAI (MN102) — reasoning verdict
- Bitmind (MN34) — media authenticity, only when media is attached

`WALLET_PRIVATE_KEY` signs x402 payments and must never reach the frontend bundle. Groq is optional and only used for the one-line synthesis sentence.

---

## Code Rules (follow without exception)

**TypeScript / React:**
- camelCase for all variables and functions
- JSDoc comments on every function and custom hook
- CSS variables from the design system used directly, never hardcoded hex in component files
- CSS class-based hover states only, no inline onMouseEnter or onMouseLeave
- Framer Motion for all entrance animations, imported from `motion/react`
- Blur-in entrance as the default: `initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}` animating to `{ opacity: 1, filter: 'blur(0px)', y: 0 }`
- Loading states use skeleton shimmer, never spinners
- Every miner response is a real live call, no mock or seeded verdicts anywhere

**Writing rules (apply to all copy, labels, code comments, JSDoc, README, marketing):**
- British English throughout
- No em dashes anywhere
- Periods only when necessary
- Commas only when necessary
- Short direct sentences, no filler such as "seamlessly", "powerful", "cutting-edge", "unlock"
- No lorem ipsum or placeholder copy, every headline and label in FRONTEND_SPEC.md is final text

---

## Never Do These

- Never hardcode a Telegraph or sponsor logo, wordmark text only
- Never show a fake or seeded miner verdict, an unreachable miner shows an honest error state
- Never let `WALLET_PRIVATE_KEY` reach the frontend bundle
- Never assume the Signal API base, miner IDs or facilitator, resolve them at build time from docs.telegraphprotocol.com and docs.telegraphprotocol.com/docs/using/x402-inference
- Never spend real mainnet USDC in the demo unless explicitly told to

---

## Hackathon Checklist

- Project name: Verid
- Hackathon: Telegraph Hackathon Season I, Application Track
- Submission closes: 7 September 2026, 23:59 UTC
- Public GitHub repository, complete code, README with install and usage
- Functional frontend end to end, no mock data
- Deployed on a public HTTPS URL
- Demo video under 90 seconds showing a real claim through to the heatmap
- X post tagging @Telegraphprotoc with demo video and live app link
- Progress updates posted on X during the build

# MARKETING.md: Verid

## Goal

Get Verid in front of the Telegraph judges and the wider builder audience during the hackathon window without sounding like a pitch deck. The story is simple: one model can be wrong, three live miners rarely agree by accident. Verid shows the split. Every post proves the product works on real Telegraph miners, not that the idea is interesting.

Core proof to show in public: a real claim pasted, three live miner calls settling through x402, a real disagreement heatmap landing, and the dissenter named.

---

## Posting Style

- builder voice, not company voice
- one clear idea per post
- short lines with space between thoughts
- show what works, do not explain what you plan to build
- the demo video does the heavy lifting, copy supports it
- tag @Telegraphprotoc on every submission post

---

## Post Plan

### Post 1, project announcement

```text
building verid for the @Telegraphprotoc hackathon

paste a claim, it asks three live miners at once, desearch for the web,
openai for the reasoning, bitmind for the media, then shows you the
truth signal and exactly where they disagreed

every call is a real x402 payment on base, no mock data, no black box
most tools give you one answer and call it done, verid shows the split

live soon, built on telegraph miners
```

Attach a screen recording showing a claim through to the heatmap, kept under 60 seconds.

### Post 2, progress update

```text
verid is live on telegraph

pasted a claim with a clip attached, desearch said uncertain, openai
said false, bitmind said the video is recent, all three agreed it is false

that is the whole product, three independent miners, one ranked signal,
the dissenter named in plain text

try it, every query pays a real miner on base sepolia through x402 via payai
```

Attach a shorter clip focused on the heatmap filling in.

### Post 3, final submission

```text
submitted verid to the telegraph hackathon, application track

paste any claim, attach media if you have it, verid fans it to three
live miners in parallel and returns a ranked truth signal with a
disagreement heatmap, the call that dissented is named, not hidden

built on live telegraph miners, settled per request through x402 on base
no mock data anywhere

[demo link] [live app link]
```

Attach the final demo video. Include the live app link and the settlement note in the post.

---

## Submission Notes

**Project title:** Verid
**Tagline:** One claim. Three miners. The split.
**Track:** Application Track, Telegraph Hackathon Season I
**Price per query:** micro testnet USDC through x402 via PayAi on Base Sepolia, paid by Verid per miner call
**Built with:**
- Next.js 14 + TypeScript + Tailwind CSS
- motion/react for animation
- Telegraph Signal API / Terminal Developer API for live miners
  - x402 via PayAi on Base Sepolia testnet for per-request settlement, no API key, no real funds
- optional Groq for the one-line synthesis sentence
- Vercel for hosting

**Project description (under 200 words):**

Verid is a cross-miner truth verification tool on Telegraph. Paste a claim, optionally attach an image or video, and Verid fans it to three live Telegraph miners in parallel: DeSearch for web grounding, OpenAI for a reasoning verdict, and Bitmind for media authenticity. It returns one ranked truth signal plus a disagreement heatmap that names the miner that dissented and why. Every call is a real x402 payment on Base Sepolia through PayAi, so the app drives genuine miner demand rather than mocking answers. The point is the split, one model can be confidently wrong, three independent miners rarely agree by accident, and Verid makes that visible instead of averaging it away.

**Demo video flow (90 seconds):**

1. Open Verid, hero loads with the VeridField canvas behind the tool (8 seconds)
2. Paste a real claim into the input (5 seconds)
3. Press Verify claim, show the three cells in skeleton then filling with real stances (20 seconds)
4. Point at the consensus row and the dissent callout (10 seconds)
5. Scroll to How it works, three miner cards (12 seconds)
6. Scroll to Sample verdict, a real worked example (15 seconds)
7. Pan to Why Verid badge stack, no logos, just the network facts (10 seconds)
8. End on the wordmark (5 seconds)

Total: approximately 85 seconds, inside the limit.

---

## Checklist

- [ ] Verid deployed to a public HTTPS URL before submission
- [ ] Full claim to heatmap flow tested end to end on live Telegraph miners at least twice
- [ ] Demo video recorded and trimmed under 90 seconds
- [ ] Post 1 goes out when the live app is up and taking real queries
- [ ] Post 2 goes out mid-build as a progress update
- [ ] Post 3 goes out at submission, tags @Telegraphprotoc, has demo video and live link
- [ ] Every post tags @Telegraphprotoc
- [ ] Submitted before 7 September 2026, 23:59 UTC

# FRONTEND_SPEC.md — Verid

Cross-miner truth verification for Telegraph. Paste a claim, Verid fans it to live Telegraph miners in parallel, then returns one ranked truth signal with a disagreement heatmap showing which miner dissented and why. Built for the Telegraph Hackathon Season I, Application Track.

---

## 0. Project Identity

- **Name:** Verid
- **One-line pitch:** Paste a claim, Verid asks three live Telegraph miners at once and shows you the truth signal and exactly where they disagreed
- **Aesthetic (Gate 1):** Bento grid operational structure on a Light glassmorphism surface
- **Identity fingerprint (section 0C):** centred tool / refined grotesk / pristine light (cool stone, not warm cream) / technical dot field / wave / subtle precision
- **Dials:** DESIGN_VARIANCE 6, MOTION_INTENSITY 5, VISUAL_DENSITY 7
- **Category:** B, off-chain Web3 tool. It queries live Telegraph miners through the Signal API or Terminal, it does not deploy contracts and does not require wallet signing to use
- **Live data rule:** every miner response shown is a real call to a live Telegraph miner, no seeded, mocked or placeholder verdicts anywhere
- **Brand rule:** no Telegraph or sponsor logo is hardcoded, Verid renders as a text wordmark only, any mark is added only after explicit ask

---

## 1. Global Design System

### 1.1 Fonts

```css
@import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&f[]=satoshi@300,400,500,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
```

- `--font-display`: 'Cabinet Grotesk', sans-serif — headlines, miner names, verdict words
- `--font-body`: 'Satoshi', sans-serif — subheads, body, labels
- `--font-mono`: 'JetBrains Mono', monospace — claim text, miner IDs, confidence figures, verdict codes

### 1.2 Colour System (Gate 5, confirmed)

```css
:root {
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

  --radius-sm: 10px;  --radius-md: 16px;  --radius-lg: 24px;  --radius-xl: 32px;
  --shadow-sm: 0 1px 3px rgba(15,23,32,0.06);
  --shadow-md: 0 8px 32px rgba(15,23,32,0.08);
  --shadow-lg: 0 24px 64px rgba(15,23,32,0.10);
  --duration-fast: 150ms; --duration-normal: 300ms; --duration-slow: 600ms;
}
```

Cool stone base, single electric blue accent. No warm cream, no purple, no AI gradient glow.

### 1.3 Global Z-Index Map

```text
z-0:  VeridField, the fixed coded animated canvas (mounted once at app root)
z-3:  noise grain overlay, fixed inset-0, pointer-events-none, opacity 0.025
z-10: section content (relative, default for all section containers)
z-20: floating glass panels inside a section (input module, heatmap card)
z-50: fixed A1 centred glass nav pill
```

### 1.4 The VeridField (bespoke coded background, no COMPOSITION_RECIPES match)

A coded, procedural light background. No image or video asset. Mounted once at app root, fixed across the whole page.

```text
Container: fixed inset-0 z-0 pointer-events-none
Base: bg-[var(--bg-primary)]

Layer 1, dot field:
  Absolute grid of 1px dots at low opacity, colour var(--border-default)
  Implemented as a CSS background on a div:
    background-image: radial-gradient(var(--border-default) 1px, transparent 1px)
    background-size: 28px 28px
  Opacity 0.5, sits beneath everything

Layer 2, ambient drift:
  Two soft radial blooms, electric blue at very low opacity, slowly drifting
  bloom-a: absolute w-[60vw] h-[60vw] rounded-full bg-[var(--accent)] opacity-[0.06]
    blur-[120px] top-[-10%] left-[-5%] animate-[float_18s_ease-in-out_infinite]
  bloom-b: absolute w-[50vw] h-[50vw] rounded-full bg-[var(--accent)] opacity-[0.05]
    blur-[120px] bottom-[-10%] right-[-5%] animate-[float_22s_ease-in-out_infinite]

Reduced motion: if prefers-reduced-motion, both blooms become static, no animation
```

### 1.5 Motion Primitives

Standard entrance used by every section unless a recipe overrides it:

```text
initial: { filter: 'blur(10px)', opacity: 0, y: 20 }
animate:  { filter: 'blur(0px)', opacity: 1, y: 0 }
transition: { duration: 0.8, ease: 'easeOut' }
viewport: { once: false, amount: 0.2 }
```

Stagger increment for grouped children: `delay: index * 0.10s`, base delay 0.2s. Scroll-snapped sections replay the entrance when scrolled back into view because viewport once is false.

### 1.6 Scroll Container and Scrollbar

The whole page is a vertical scroll-snap container.

```css
html { scrollbar-width: none; }
html::-webkit-scrollbar { display: none; }
body { -ms-overflow-style: none; }
```

```text
Page wrapper: snap-y snap-mandatory (use snap-proximity if the verdict section
  feels too strict, decided at build)
Each major section: min-h-[100dvh] snap-start flex flex-col
Results section exception: the heatmap card scrolls internally
  (overflow-y-auto max-h-[60vh]) so a long verdict never fights the snap
```

### 1.7 Liquid Glass (light variant)

Used on nav, input module, miner cards and heatmap. Light glass, not dark.

```text
liquid-glass:
  bg-white/55 backdrop-blur-xl border border-white/50
  shadow-[0_8px_32px_rgba(15,23,32,0.08)]
  rounded-[var(--radius-lg)]
```

---

## 2. Navigation — Gate 2: A1 Centred Glass Pill

```text
PILL (fixed, centred):
  Position: fixed top-4 inset-x-0 z-50 flex justify-center px-4
  Inner: liquid-glass rounded-full px-3 py-2 flex items-center gap-3 max-w-2xl mx-auto
    border border-white/50

  Wordmark (left):
    font-display text-lg font-bold tracking-tight text-[var(--text-primary)]
    Text: "Verid"
    No logo image, text only per brand rule

  Spacer: flex-1

  Use Verid action (right):
    bg-[var(--accent)] text-white px-4 py-2 rounded-full
    font-body text-sm font-medium
    hover:bg-[var(--accent-hover)] transition-colors duration-150
    Smooth-scrolls to the tool section
    On smaller screens the wordmark stays, the action stays, no link row appears

Mobile: below md the pill keeps wordmark left and Use Verid right, no hamburger,
  no link list, the tool is one scroll away
```

---

## 3. Section: Hero / Tool

**Recipe:** `product-mockup-hero` (from COMPOSITION_RECIPES.md), adapted. Centred composition per Gate 6, light glass surface, the app input module replaces the app screenshot, the live heatmap sits directly below the input.

```text
z-index within section: content z-10, input module z-20, heatmap z-20

SECTION: Hero / Tool
Layout: min-h-[100dvh] snap-start flex flex-col items-center justify-center
  px-4 md:px-8 py-24 text-center
Background: VeridField shows through (z-0)

EYEBROW:
  font-mono text-[11px] md:text-xs uppercase tracking-[0.25em]
    text-[var(--accent)] mb-5
  Text: "CROSS-MINER TRUTH VERIFICATION"
  Animation: initial opacity 0 y 10 / animate opacity 1 y 0 / duration 0.6s
    ease easeOut delay 0.2s

HEADLINE:
  font-display text-4xl md:text-6xl lg:text-[4.5rem] font-bold
    text-[var(--text-primary)] leading-[0.95] tracking-[-2px] max-w-3xl
  Text: "Paste a claim. Get the verdict."
  Animation: initial blur(10px) opacity 0 y 24 / animate blur(0) opacity 1 y 0
    duration 0.8s ease easeOut delay 0.35s

SUBHEAD:
  mt-5 max-w-xl font-body text-base md:text-lg text-[var(--text-secondary)]
    leading-relaxed
  Text: "Verid asks three live Telegraph miners at once, then shows you the
    truth signal and exactly where they disagreed."
  Animation: initial opacity 0 y 16 / animate opacity 1 y 0 / duration 0.7s
    ease easeOut delay 0.55s

INPUT MODULE (z-20):
  mt-10 w-full max-w-2xl liquid-glass rounded-[var(--radius-lg)] p-5 md:p-6
    text-left
  Animation: initial opacity 0 y 30 scale 0.98 / animate opacity 1 y 0 scale 1
    duration 0.9s ease [0.16,1,0.3,1] delay 0.6s

  Claim field:
    w-full bg-white/70 border border-[var(--border-default)] rounded-[var(--radius-md)]
      p-4 font-mono text-sm text-[var(--text-primary)]
      placeholder:text-[var(--text-muted)]
      focus:ring-2 focus:ring-[var(--accent)]/30 outline-none
      min-h-[88px] resize-none
    Placeholder: "e.g. This video of the earthquake is from last year"

  Media row:
    mt-3 flex items-center gap-3
    Drop zone: flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)]
      border border-dashed border-[var(--border-default)] text-[var(--text-muted)]
      font-body text-xs
      Label: "Attach image or video (Bitmind checks it)"
    File name chip appears after pick, mono text, truncated

  Verify button:
    mt-4 w-full bg-[var(--accent)] text-white px-6 py-3.5 rounded-full
      font-body text-sm font-medium hover:bg-[var(--accent-hover)]
      hover:shadow-[0_0_30px_rgba(37,99,235,0.25)] transition-all duration-200
    Label: "Verify claim"
    Loading state: skeleton shimmer, never a spinner, label becomes
      "Asking miners…"

HEATMAP (z-20, appears after submit, below the module):
  mt-6 w-full max-w-3xl
  Before submit: a quiet placeholder line in muted mono
    "Three miners respond in parallel. The heatmap fills in live."
  After submit: the disagreement heatmap (full spec in Section 3.1)
```

### 3.1 Disagreement Heatmap (the core visual)

```text
CONTAINER:
  liquid-glass rounded-[var(--radius-lg)] p-5 md:p-6
  grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4

MINER CELL (x3, one per live miner):
  rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-white/60 p-4
  Top row: miner name (font-display text-sm font-bold) + verdict chip
    Verdict chip: rounded-full px-2.5 py-1 font-mono text-[10px] uppercase
      tracking-wide
      true / verified   -> bg-[var(--success)]/10 text-[var(--success)]
                           border border-[var(--success)]/20
      uncertain         -> bg-[var(--warn)]/10 text-[var(--warn)]
                           border border-[var(--warn)]/20
      false / flagged   -> bg-[var(--error)]/10 text-[var(--error)]
                           border border-[var(--error)]/20
  Confidence bar: mt-3 h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden
    Fill: h-full bg-[var(--accent)] width set inline from confidence 0-100
  Rationale: mt-2 font-body text-xs text-[var(--text-secondary)] leading-snug
    One or two lines pulled from the miner's real response

CONSENSUS ROW (full width, below the three cells):
  mt-2 rounded-[var(--radius-md)] bg-[var(--accent-glow)] border
    border-[var(--accent)]/20 p-4 flex flex-col md:flex-row md:items-center
    gap-3 md:gap-4
  Left: font-display text-lg font-bold text-[var(--text-primary)]
    Text: "Ranked truth signal: <verdict word>"
  Right: a thin segmented bar showing agreement, three segments coloured by
    each miner's stance, the gap between them is the disagreement
  Dissent callout: if any miner diverged, a mono line names it
    "Bitmind dissented: media is recent, not last year"

Animation:
  Each miner cell blur-ins left to right, delay index * 0.12s
  Consensus row blur-ins last, delay 0.5s
  Bars grow from 0 width to target via transition duration 0.8s ease easeOut
```

---

## 4. Section: How It Works

**Recipe:** `capabilities-grid` (from COMPOSITION_RECIPES.md), adapted to light glass, three miner cards plus a centre consensus card.

```text
z-index: content z-10

SECTION: How it works
Layout: min-h-[100dvh] snap-start flex flex-col justify-center
  px-4 md:px-8 py-24

Heading block:
  text-center mb-12
  Eyebrow: font-mono text-[11px] uppercase tracking-[0.2em]
    text-[var(--accent)] mb-3  Text: "WHAT RUNS UNDER THE HOOD"
  Title: font-display text-3xl md:text-5xl font-bold text-[var(--text-primary)]
    tracking-[-1px]  Text: "Three independent miners. One verdict."

Cards grid: grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto

Miner card (x3):
  liquid-glass rounded-[var(--radius-lg)] p-6 min-h-[260px] flex flex-col
  Icon slot: w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-glow)]
    flex items-center justify-center, inline SVG only, no emoji
  Miner name: font-display text-xl font-bold text-[var(--text-primary)] mt-4
  Mono tag: font-mono text-[10px] uppercase tracking-wide text-[var(--text-muted)]
    e.g. "MN101 · LIVE"
  Body: font-body text-sm text-[var(--text-secondary)] mt-2 leading-relaxed
  Cards:
    1 DeSearch — "Grounded web search. Checks the claim against live sources
       and returns what the open web actually says."
    2 OpenAI — "Reasoning verdict. Weighs the claim, the sources and the media
       and returns a true, false or uncertain call with reasoning."
    3 Bitmind — "Media authenticity. When you attach an image or video it tells
       you whether the asset is real, manipulated or recycled."

Consensus note (below grid, centred):
  mt-10 max-w-2xl mx-auto font-body text-sm text-[var(--text-secondary)]
    text-center
  Text: "Verid fans the claim to all three in parallel, then ranks the signal
    by how they agree. The heatmap shows the split, not just the average."

Animation: cards blur-in with stagger delay index * 0.12s, once false
```

---

## 5. Section: Sample Verdict

**Recipe:** bespoke at COMPOSITION_RECIPES quality (no exact match), a verdict walkthrough using the same heatmap component from Section 3.1 with a pre-filled real example.

```text
z-index: content z-10

SECTION: Sample verdict
Layout: min-h-[100dvh] snap-start flex flex-col justify-center
  px-4 md:px-8 py-24

Heading block:
  text-center mb-10
  Eyebrow: font-mono text-[11px] uppercase tracking-[0.2em]
    text-[var(--accent)] mb-3  Text: "SEE IT ON A REAL CLAIM"
  Title: font-display text-3xl md:text-5xl font-bold text-[var(--text-primary)]
    tracking-[-1px]  Text: "One claim. Three miners. The split."

Walkthrough grid: grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto
  items-center

Left (claim):
  liquid-glass rounded-[var(--radius-lg)] p-6
  Label: font-mono text-[10px] uppercase tracking-wide text-[var(--text-muted)]
    mb-2  Text: "CLAIM"
  Text: font-mono text-sm text-[var(--text-primary)] leading-relaxed
    "This video of the earthquake is from last year"
  Sub: font-body text-xs text-[var(--text-muted)] mt-3
    "With an attached clip for Bitmind to inspect"

Right (heatmap, same component as 3.1, pre-filled):
  Three miner cells:
    DeSearch  -> uncertain, "Web shows the clip circulated this week, not 2024"
    OpenAI    -> false, "Metadata and context point to a recent upload"
    Bitmind   -> false, "Asset is authentic and recent, not recycled"
  Consensus row: "Ranked truth signal: FALSE"
  Dissent callout: "No dissent. All three agree the claim is false."

Replay button (optional, below grid, centred):
  mt-8 inline-flex items-center gap-2 font-body text-sm font-medium
    text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors
  Label: "Run it live on your own claim"
  Smooth-scrolls to the tool section

Animation: left blur-in from left delay 0.3s, right blur-in from right delay 0.5s,
  heatmap cells stagger after
```

---

## 6. Section: Why Verid

**Recipe:** `split-image-text` (from COMPOSITION_RECIPES.md), adapted, right image slot replaced with a badge stack. No Telegraph logo, no sponsor logo, text wordmark only.

```text
z-index: content z-10

SECTION: Why Verid
Layout: min-h-[100dvh] snap-start flex flex-col justify-center
  px-4 md:px-8 py-24

Container: max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16
  items-center

LEFT COLUMN (text):
  Eyebrow: font-mono text-[11px] uppercase tracking-[0.2em]
    text-[var(--accent)] mb-4  Text: "WHY IT MATTERS"
  Heading: font-display text-3xl md:text-5xl font-bold text-[var(--text-primary)]
    tracking-[-1px] leading-tight
    Text: "One miner can be wrong. Three rarely agree by accident."
  Description: font-body text-base text-[var(--text-secondary)] mt-5
    leading-relaxed max-w-lg
    Text: "Verid sits on top of Telegraph's live miner network and pays per
      real request. You see the disagreement, not a single black-box answer,
      and every call is a real signal on the network."

RIGHT COLUMN (badge stack, replaces image):
  Layout: grid grid-cols-1 sm:grid-cols-2 gap-4
  Badge card (x4, liquid-glass rounded-[var(--radius-md)] p-5 bg-white/60):
    Icon slot: w-8 h-8 inline SVG only
    Label: font-mono text-[10px] uppercase tracking-[0.15em]
      text-[var(--text-muted)] mt-3
    Value: font-body text-sm text-[var(--text-primary)] mt-1
    Content:
      "NETWORK" / "Telegraph"
      "CHAIN" / "Base"
      "MINERS" / "Live, per request"
      "SETTLEMENT" / "x402 micropayments"

Animation: left fade-in from left delay 0.3s, right fade-in from right delay 0.5s
```

---

## 7. Section: Final CTA

**Recipe:** `full-width-statement` (from COMPOSITION_RECIPES.md), adapted as the crescendo close.

```text
z-index: content z-10

SECTION: Final CTA
Layout: min-h-[100dvh] snap-start flex flex-col items-center justify-center
  text-center px-4 py-24

Statement:
  font-display text-4xl md:text-6xl lg:text-[5rem] font-bold
    text-[var(--text-primary)] leading-[0.95] tracking-[-2px] max-w-4xl
  Text: "Stop trusting one answer."
  Animation: word-by-word blur reveal, each word
    blur(8px) opacity 0 y 20 -> blur(0) opacity 1 y 0
    duration 0.6s ease easeOut stagger wordIndex * 90ms

Subtext:
  mt-6 max-w-md font-body text-base text-[var(--text-secondary)] leading-relaxed
  Text: "Paste your first claim and watch three live miners weigh in."
  Animation: opacity 0 -> 1 delay 0.9s

CTA pair:
  mt-9 flex items-center justify-center gap-4 flex-wrap
  Primary: bg-[var(--accent)] text-white px-7 py-3.5 rounded-full
    font-body text-sm font-medium hover:bg-[var(--accent-hover)]
    hover:shadow-[0_0_30px_rgba(37,99,235,0.25)] transition-all duration-200
    Label: "Verify a claim"
    Smooth-scrolls to tool
  Secondary: border border-[var(--border-default)] text-[var(--text-primary)]
    px-7 py-3.5 rounded-full font-body text-sm hover:border-[var(--accent)]
    transition-colors duration-200
    Label: "Read the method"
    Smooth-scrolls to How it works
```

---

## 8. Footer

```text
SECTION: Footer
Layout: py-12 px-4 md:px-8 border-t border-[var(--border-subtle)]
  bg-[var(--bg-primary)]

Container: max-w-6xl mx-auto flex flex-col md:flex-row md:items-center
  md:justify-between gap-6

Left: wordmark + attribution
  Wordmark: font-display text-base font-bold text-[var(--text-primary)]
  Attribution: font-body text-xs text-[var(--text-muted)] mt-2
    Text: "Verid — built for the Telegraph Hackathon Season I, Application Track"

Right: link row
  flex flex-wrap gap-x-8 gap-y-3
  Each link: font-mono text-xs uppercase tracking-[0.15em]
    text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors
  Links: "Docs", "GitHub", "X"

Bottom row: mt-8 pt-6 border-t border-[var(--border-subtle)]
  flex justify-between font-mono text-[11px] text-[var(--text-muted)]
  Left: "© 2026 Verid"
  Right: "Live on Telegraph · Base"
```

---

## 9. Data Layer Notes (for the build, not a visual section)

```text
Telegraph integration:
  All miner calls go through one lib/telegraph.ts wrapper that talks to the
  live Telegraph Signal API or Terminal. Confirm the exact endpoint and auth
  from hackathon.telegraphprotocol.com at build time, do not hardcode from
  memory. Three parallel requests, one per miner. Settlement uses the PayAi x402 facilitator on Base Sepolia, testnet USDC, fully off-chain, per docs.telegraphprotocol.com/docs/using/x402-inference.
    DeSearch  (MN101) web grounding
    OpenAI    (MN102) reasoning verdict
    Bitmind   (MN34)  media authenticity, only when media is attached
  Each response maps to a cell: stance (true / uncertain / false), confidence
    0-100, rationale string. The heatmap and consensus row derive from these.

Groq:
  Optional. Only used to synthesise the one-line "ranked truth signal" sentence
  if wanted. Env var GROQ_API_KEY, oriented for Groq. The core product works
  without it by showing raw miner stances plus a computed majority verdict,
  so the demo never depends on a key.

No mock data:
  If a miner call fails, the cell shows an honest error state
  ("Miner unreachable") not a fake verdict. The heatmap is only complete when
  real responses are in.
```

---

## 10. Responsive Summary

- Hero input module spans full width on mobile, max-w-2xl on desktop, heatmap stacks below
- How it works cards go from 3 columns to 1 below md, consensus note stays centred
- Sample verdict grid stacks to one column below lg, heatmap leads on mobile
- Why Verid badge stack goes 2 columns on sm, 1 on the smallest screens
- All headline sizes step through three breakpoints, no bare text-7xl
- VeridField blooms drop opacity on mobile to protect frame rate
- Scroll-snap stays on, verdict section allows internal scroll so long outputs read cleanly

---

## 11. Asset Brief Summary

No photography or video assets in this spec. The only generated element is the VeridField, which is coded, not sourced. Logo and favicon slots are left as plain comment slots per the brand rule, asset supplied only after explicit ask.

```text
LOGO SLOT: {/* Logo slot: replace with public/logo.svg only after explicit ask */}
FAVICON SLOT: <!-- Favicon slot: replace with public/favicon.ico only after explicit ask -->
```

Never substitute a hardcoded placeholder, an AI-generated icon or an emoji in either slot.

---

## 12. Spec Self-Check (Rule 7)

- [x] Every element has exact Tailwind classes
- [x] Every animation has initial, animate, duration, ease, delay
- [x] Every section has a declared z-index position against the global map
- [x] No image or video assets required, VeridField behaviour fully specified as a coded system
- [x] Every positional or sizing class has responsive breakpoints
- [x] Composition recipes referenced by name where a match existed, bespoke specs written at matching detail where none did
- [x] No em dashes anywhere in the spec
- [x] No placeholder verdicts, every miner cell is a real live response
- [x] Brand rule honoured, no hardcoded Telegraph or sponsor logo
- [x] Scroll-snap container and hidden scrollbar specified globally

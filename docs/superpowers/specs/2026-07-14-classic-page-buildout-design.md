# Classic page build-out — design

**Date:** 2026-07-14
**Scope:** `/classic` only. The arcade pages (`/`, `/demo`, `/play`, `/mcp`) are untouched.
**Goal:** Extend `/classic` from its current 2 sections (`ClassicHero`, `ClassicChampionFor`) to a
complete landing that carries the same content as the arcade tour, rendered in the classic
Swiss/Helvetica design system. Content is sourced verbatim from the reference build at
`https://admirable-flan-dcc9a8.netlify.app/` (its `.mode--classic` markup).

## Context

`/classic` is the "for normal people" mode: same message as the pixel-art arcade site, plain
Helvetica styling. It renders inside `ScaleCanvas width={1440} mode="zoom"` (fixed 1440-px design
canvas scaled to the viewport; fluid single-column below 1024 px). Today it ships only
`ClassicHero` + `ClassicChampionFor`, and `ClassicMenu` points at cross-page anchors because the
sections don't exist locally yet.

The two existing sections are **pixel-faithful Figma ports** (absolute design-px coordinates). The
new sections have **no Figma source**, so they are built on the classic **design tokens + an 8-px
grid** as normal flow/grid layout — not absolute coordinates. They must still read as one visual
family with the ported sections.

### Design system (already defined; do not re-invent)

- **Canvas:** 1440-px block width per section; content column 1200 px (120-px side margins); 12-col
  grid, 24-px gutters. Fluid single-column below 1024 px.
- **Type:** `--c-font` (Helvetica Neue system stack). Headings uppercase, weight 400, line-height
  0.942, `.cap-trim`. Body 16 px / 1.2. Sizes via `--k-text-*` clamps (`2xl` = 40→64,
  `xl` = 28→40). Display numerals use large sizes at **weight 400** (the Swiss signature).
- **Color:** yellow `--c-yellow #fff600`, blue `--c-blue #0052da`, green `--c-green #00da95`,
  ink `--c-ink #070707`, panel `--k-classic-panel #222`, white/black, dark chip `rgba(0,0,0,.6)`.
- **Shape:** cards `border-radius:12px`; pills `border-radius:99px`; CTA = black pill, 48-px tall,
  white text, hover → `#222`.
- **Spacing:** 8-px scale `--k-1…--k-15`. Section vertical rhythm: ~120 px (`--k-15`) top on major
  sections, ~96 px (`--k-12`) on minor.
- **Motion baseline:** native `position:sticky` composition; hover = color→blue + a small blue
  arrow marker sliding in. Restrained, editorial.

## Editorial rules (apply to every new section)

1. **Kicker + headline:** every section opens with a small uppercase eyebrow (12 px, letter-spacing
   ~0.08em, often accent-colored) then a big weight-400 uppercase headline. This repeated element is
   what makes the page read as one system.
2. **One accent per section**, rotated across the page so yellow / blue / green each get hero
   moments.
3. **Hairlines over shadows:** 1-px rules/borders structure list-like sections; filled cards are
   reserved for Tracks, Arenas, Prize. No drop shadows.
4. **Numbers big, weight 400:** stats, step indices, prize values.
5. **Unified people treatment:** floor photos, jury, organizers share one photo grade (duotone) so
   the human sections feel authored, not stock.

## Architecture

- New sections live in `src/sections/Classic<Name>/` as `Classic<Name>.jsx` + `.css`, mirroring the
  existing `ClassicHero` / `ClassicChampionFor` convention (co-located CSS, `'use client'` only when
  a section needs hooks).
- They mount in `src/app/classic/ClassicApp.jsx` inside the existing `<main>` / `ScaleCanvas`, in
  content order (below).
- Each section is a `<section id="c-…">` so the nav can anchor to it.
- CSS stays scoped under `.classic` (already the page root) — no new globals; reuse `--k-*` / `--c-*`
  tokens only, no new hardcoded hex except where a token is genuinely missing (add to the classic
  token block in that case, don't inline).

### Section order (in `ClassicApp`)

1. `ClassicHero` *(exists)*
2. `ClassicBattle` — "The battle" (stats)
3. `ClassicHow` — "How it works" (3 steps)
4. `ClassicTracks` — "Hackathon tracks" (2 cards)
5. `ClassicArenas` — "Battle arenas" (4 case cards)
6. `ClassicChampionFor` *(exists)* — "The prize" (champion) + "Who it's for"
7. `ClassicFloor` — "From the floor" (photo grid)
8. `ClassicWhy` — "Why join" (6 reasons)
9. `ClassicMission` — "Mission" statement
10. `ClassicJury` — "Judges" carousel
11. `ClassicOrganizers` — "Organizers" rows
12. `ClassicFaq` — "FAQ" accordion
13. `ClassicFinalCta` — "Join the battle" band
14. `ClassicFooter` — footer

> Note: `ClassicChampionFor` already covers "Champion gets / The prize" **and** "Who it's for", so
> those two content blocks from the dump are NOT rebuilt. The "Powered by leading platforms" sponsor
> logos attach to the hero/battle seam (see `ClassicBattle`).

## Shared motion infrastructure

A small, dependency-light layer reused by every section. All of it degrades under the existing
global `@media (prefers-reduced-motion: reduce)` block in `src/styles/index.css`, plus per-effect
JS guards.

- **`useReveal` hook** (`src/components/classic-motion/useReveal.js`): one shared
  `IntersectionObserver` (module-level singleton) that adds `.is-visible` to observed elements once,
  then unobserves. Elements set `--i` (index) inline; CSS staggers via
  `transition-delay: calc(var(--i) * 70ms)`. Base CSS lives in `classic.css`:
  `.reveal{opacity:0;transform:translateY(32px);transition:opacity .6s,transform .6s} .reveal.is-visible{opacity:1;transform:none}`.
- **`useCountUp` helper**: on first intersection, a `requestAnimationFrame` loop eases 0→N (~1.2 s,
  ease-out), formatting thousands/`$`/`+`/`st` suffixes. Guards on
  `matchMedia('(prefers-reduced-motion: reduce)')` → render final value immediately.
- **Line-mask heading**: markup helper wrapping each heading line in
  `<span class="mask"><span class="line">…</span></span>`; `.mask{overflow:hidden}`,
  `.line{transform:translateY(100%)}` → `.is-visible .line{transform:none}`. Reduced motion:
  lines rest at `translateY(0)`.
- **Magnetic pill**: `mousemove` handler on the Final CTA pill only; cursor offset × ~0.2, capped at
  ±8 px; `mouseleave` resets. Disabled under reduced motion.
- **Motion One (`motion` package, ~5 kb)** — the one approved dependency. Used **only** for
  scroll-linked scale/dim on the sticky card stacks (How it works / Battle arenas): `scroll()` maps
  card progress [0→1] to `scale 1→0.96` + slight opacity. Disabled entirely under reduced motion
  (cards stay scale 1 / opacity 1). Everything else is CSS + vanilla.

Reduced-motion catch-all already exists globally; new sections add nothing that violates it, and the
two JS effects (count-up, magnetic, Motion One scroll) each branch on the media query.

## Section specifications

Content strings below are the source of truth (from the `.mode--classic` dump). Copy is English and
verbatim; the registration/Apply CTAs stay intentionally dead (per project note
`cta-buttons-intentionally-dead`).

### 2. ClassicBattle — "The battle"  ·  accent: blue  ·  `id="c-battle"`

- Kicker "THE BATTLE" + headline "Who can use AI without limits?".
- Lede paragraph (5 cols): the two-sentence battle copy.
- **4 stat numerals** in a row (hairline dividers, baseline-aligned), number `clamp(72px,…,96px)`
  weight 400, small uppercase label beneath:
  - `1st` — International hackathon
  - `300+` — Participants
  - `$100M+` — Budget under management *(blue — the single colored figure)*
  - `30` — Finalists in Barcelona
- **Sponsor strip** ("Powered by leading platforms"): Plurio / Meta / Google / TikTok logos in a
  muted row, either at the top of this section or the hero seam.
- Motion: line-mask heading; **count-up** on all four numerals.

### 3. ClassicHow — "How it works"  ·  accent: yellow→blue→green walk  ·  `id="c-how"`

- Kicker "HOW IT WORKS" + headline "Registration. Qualifying round. Final." + one-line intro.
- **3 equal columns**, full-height 1-px rules between; oversized index (`01/02/03`, 48–64 px):
  - 01 Qualifying round — "45 minutes online. A real case to solve under pressure, with the AI stack
    of your choice." (index yellow)
  - 02 Evaluation — "A panel of judges + AI assesses every solution. The client gets the final
    word." (index blue)
  - 03 The final — "2 hours in Barcelona at Harbour.Space University — in person. A closed
    networking event and a private closing party follow." (index green)
- Motion: staggered reveal; optional Motion One sticky-stack scale if the steps are tall enough —
  otherwise a plain 3-col row (decide during build; default to the plain row for restraint).

### 4. ClassicTracks — "Hackathon tracks"  ·  accent: black + blue  ·  `id="c-tracks"`

- Kicker "HACKATHON TRACKS" + headline "Choose your fighting style." + intro line.
- **2 tall poster cards** (~4:5), color-blocked opposites: Card A solid black / white type, Card B
  solid blue / white type. Kicker "TRACK 01/02", big title, paragraph, bottom-anchored `→`.
  - Track 01 AI-Creatives — "Special: holographic banner maker. AI-automated generation of creative
    packs, and banner-pack verification via an AI-agent auditor."
  - Track 02 AI-Performance — "Special: zero-waste media split. Strategy, analytics, paid-media
    buying and media-split management."
- Motion: staggered reveal; `→` slides on hover.

### 5. ClassicArenas — "Battle arenas"  ·  accent: 4-color coded  ·  `id="c-arenas"`

- Kicker "BATTLE ARENAS" + headline "Case tracks." + intro ("real client briefs … win and the
  client pays the prize").
- **4-col card row**, white with 1-px border, **4-px accent top-border** rotating green/blue/
  yellow/black; number tag `A1–A4`, title, one-line mission:
  - 01 Healthcare (green) — "Complex funnel. Long cycle. High LTV. Mission: cut CAC and speed up
    first-purchase conversion."
  - 02 B2B SaaS (blue) — "Long sales cycles. Many stakeholders. Mission: turn PQLs into pipeline
    with AI-driven demand gen."
  - 03 E-commerce (yellow) — "High volume. Thin margins. ROAS pressure. Mission: scale creative and
    squeeze CAC with AI."
  - 04 Enterprise (black) — "Six-figure deals. Long procurement. Mission: run AI-powered ABM that
    lands target accounts."
- Motion: staggered reveal; hover inverts card to black / white.

### 7. ClassicFloor — "From the floor"  ·  accent: blue-on-hover  ·  `id="c-floor"`

- Kicker "FROM THE FLOOR" + headline "Inside the arena." + intro line.
- **Asymmetric bento of 6 photos** (one 2×2 hero + five 1×1), unified **duotone** grade, 12-px
  radius, captions below each (small, one line, accent on hover). Photos = the 6 extracted floor
  jpgs. Captions from the dump: "On the clock — Qualifying round", "On stage — Opening talk",
  "The room — Harbour.Space", "All eyes in — Jury & peers", "Closing words — Barcelona final",
  "Heads down — Solving the brief".
- Motion: diagonal-stagger reveal (`--i` = grid index); contained hover zoom (`img scale 1.04`
  inside `overflow:hidden` frame).

### 8. ClassicWhy — "Why join"  ·  accent: blue  ·  `id="c-why"`

- Kicker "WHY JOIN" + headline "Why join the hackathon?" + intro.
- **2-col × 3-row numbered list**, hairline dividers, big `01–06` (single accent, all blue):
  Challenge / Community / Networking / Opportunity / Portfolio case / Prize vault — each with its
  one-line body from the dump.
- Motion: staggered reveal.

### 9. ClassicMission — "Mission"  ·  accent: blue verbs  ·  `id="c-mission"`

- Small kicker "MISSION" + a **single large centered statement** (~40–56 px, weight 400, tight
  leading), 2–3 key words in blue: the mission paragraph from the dump. Generous whitespace; no
  card/border/button. Optionally invert to a black band with white type for a dramatic pause.
- Motion: line-mask reveal.

### 10. ClassicJury — "Judges"  ·  accent: black/blue  ·  `id="c-judges"`

- Kicker "THE JURY" + headline "Judges." + intro ("… final word is up to the client. Full roster
  revealed before the main tour.").
- **Horizontal scroll-snap rail** of portrait cards (~300 px, 4:5, duotone, rounded). Judges 1–3 are
  **placeholders** ("Judge placeholder / Position · Company / Short description … — placeholder")
  with a neutral duotone silhouette. Card 5 = **secret judge**: flat black tile with a `?` glyph and
  "SECRET JUDGE — REVEALED SOON". Minimal nav (thin progress bar or small ←/→ pills, no dots).
- Motion: native scroll-snap; active-card emphasis (blue label / subtle scale) via observer.

### 11. ClassicOrganizers — "Organizers"  ·  accent: blue role labels  ·  `id="c-organizers"`

- Kicker "THE TEAM" + headline "Organizers." + intro.
- **Stacked editorial rows** (one person per row): portrait left (~160 px, rounded, duotone
  placeholder — no real photos in the export), name uppercase ~24 px + role (blue) + 2–3-line bio
  right. Full-width hairline dividers. The 5 real people:
  - Vladislav Fedoseev — Managing Partner, Allformance — "Founder of AI-Formance; performance
    marketing and AdTech operator."
  - Roman Kumar Vyas — Serial IT entrepreneur — "Marketing expert; founder / co-founder of Refocus,
    Qlean and Qmarketing."
  - Alexander Solovyov — IT entrepreneur & growth operator — "Ex Co-founder of Qmarketing Academy &
    Refocus; performance, EdTech and AI-in-sales expert."
  - Maria Kulikovskaia — AI HealthTech Product & Digital Transformation Strategist — "10+ years in
    tech, MedTech and AI-enabled products."
  - Anna Sholina — VC partner & serial entrepreneur — "SOULS agency founder; exited founder of
    EMERGE Global Tech Conference."
- Motion: staggered reveal.

### 12. ClassicFaq — "FAQ"  ·  accent: green active  ·  `id="c-faq"`

- Left sticky "FAQ" heading (+ a "Still have questions?" pill), right an **accordion** of 7 rows,
  1-px rules top/bottom, question left + `+`→`×` toggle right, one open at a time, answer in gray
  body. Active row turns green. The 7 Q&As verbatim from the dump.
- Motion: `grid-template-rows:0fr→1fr` height animation; toggle rotation.

### 13. ClassicFinalCta — "Join the battle"  ·  accent: yellow  ·  `id="cta"`

- **Full-bleed yellow band**, black type: headline "Join the battle." + support ("Apply for the
  first round … the best AI marketers on the planet.") + a **black 99-px pill** ("Registration →",
  dead link). One **marquee ribbon** of the event name above the band (single tasteful motion use).
- Motion: CSS marquee (freezes under reduced motion); **magnetic pill**.

### 14. ClassicFooter  ·  accent: green link-hover  ·  `id="c-footer"`

- **Multi-column** dark footer: brand/wordmark + one-line tagline column, plus grouped small
  uppercase links (Event / Tracks / Legal). Bottom hairline row: "© 2026 AI Marketing Kombat · July
  2026 · Barcelona" left; "Legal information · Code of conduct · Privacy" right. Small, letter-
  spaced; green link-hover.

## Navigation change

`src/components/ClassicMenu/ClassicMenu.jsx`: repoint links from cross-page (`/#format`, `/#faq`) to
**local anchors** now that the sections exist:

- "How it works" → `#c-how`
- add "Arenas" → `#c-arenas` (or keep the two-link menu; final link set decided in the plan)
- "FAQs" → `#c-faq`
- "Apply" button → `#cta` (scrolls to the Final CTA; still a dead registration link there)

Keep the existing scale-mirroring behavior and the card styling unchanged.

## Assets

Extracted from the Netlify export and imported to `public/assets/classic/`:

- **floor/** (6 jpgs): `hackathon.jpg`, `speaker-stage.jpg`, `room.jpg`, `audience.jpg`,
  `speaker.jpg`, `hackathon-2.jpg` (renamed from the md5 dump).
- **sponsors/** (4): `plurio.webp`, `meta.svg`, `google.svg`, `tiktok.svg`.
- **jury/**, **organizers/**: no real photos exist in the source → neutral duotone placeholder
  portraits (a shared SVG silhouette tile), plus the secret-judge `?` tile rendered in CSS.

Duotone grade is applied in CSS (`filter`/blend), not baked into the files, so the same source jpg
can be reused and the grade tuned centrally.

## Out of scope

- Arcade pages (`/`, `/demo`, `/play`, `/mcp`) — unchanged.
- Real jury/organizer photography, real sponsor deals, live registration destination.
- Figma-faithful pixel porting for the new sections (no Figma source exists).
- `ClassicHero` and `ClassicChampionFor` internals — reused as-is.

## Verification

- `npm run build` passes; `npm run lint` and stylelint clean.
- `/classic` renders all 14 sections top-to-bottom at 1440, 1024, and 375 px with no horizontal
  overflow; existing hero and champion/who sections unchanged.
- Nav anchors scroll to the correct local sections; "Apply" reaches the Final CTA.
- `prefers-reduced-motion: reduce` disables count-up, magnetic, marquee, Motion One scroll, and
  reveal transforms (final states shown instantly).
- Arcade pages spot-checked for zero regression.

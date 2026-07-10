# /demo — Landing Continuation Design

**Date:** 2026-07-10
**Status:** Approved (scope + approach) — pending spec review
**Source of truth for content:** https://admirable-flan-dcc9a8.netlify.app/ (the original site being redesigned). All copy is taken **verbatim** from that site. No invented content.

## Goal

Continue the pixel-art redesign landing. The current landing (`/`) ports only the first three
original sections (Hero → Champion "Champion Gets" → Fighters "Select Your Fighter / Who It's For").
Build a new `/demo` route that carries the **remaining** original sections in the same visual
language, spacing system, and effect shell as the existing sections.

## Non-goals

- No new copy, claims, names, or numbers beyond what the original site states.
- No redesign of the existing three sections.
- No backend / forms / real registration wiring (CTAs are visual, matching current sections).
- The "Classic" variant of the original (already covered by `/classic`) is out of scope.

## Route & shell

New Next.js App Router route: `src/app/demo/page.jsx` (`'use client'`), static-export compatible
(matches `next.config.mjs` `output: 'export'`). It reuses the **exact** shell from `src/app/page.jsx`:

```
<div className="app">
  <JuiceProvider><HitSparks><PixelCursor enabled>
    <ScaleCanvas width={1440}>
      … sections …
    </ScaleCanvas>
  </PixelCursor></HitSparks></JuiceProvider>
  <ModeSwitcher active="ai" />
</div>
```

`ScaleCanvas` stacks sections in a flex column at a fixed 1440px design width, scales to viewport on
desktop, and reflows fluidly below 1024px via each section's own media queries. This is the
established mechanism — new sections follow it exactly.

## Section authoring pattern (unchanged from existing)

Each section is one folder under `src/sections/<Name>/` with `<Name>.jsx` + `<Name>.css`:

- Root: `position: relative; width: 1440px;` fixed `height`, section-local absolute positioning.
- Uses global tokens only: `--k-*` palette, 8px spacing scale (`--k-1`…`--k-8`), fonts
  `--k-font` (Press Start 2P), `--k-font-accent` (Platform), `--k-font-mono` (GT Pressura Mono).
- Chrome (panels, pills, tickers, borders, difficulty stars, CRT) is **CSS-authored** so it is
  pixel-consistent with the current sections and fully editable.
- Content imagery (portraits, card icons, illustration panels, sponsor tiles) is **generated
  pixel art** dropped into `public/assets/demo/…` and rendered as `<img class="pixelated">`.
- Reused chrome patterns from existing sections: `.hero__pill` tag pills, `.champion__ticker`
  marquee, `CRTOverlay scoped`, arcade panel borders.
- Each section has a `<section aria-label>` and images have alt text (existing accessibility bar).

## Sections (in original order, verbatim copy)

A **marquee strip** ("★ FIGHT! · AI MARKETING KOMBAT · ROUND 1 — QUALIFICATION OPEN · JULY 2026 ·
FINAL IN BARCELONA · FATALITY ON YOUR CAC · FLAWLESS VICTORY · FINISH HIM ★") sits at the top of
`/demo`, matching the original placement between the roster and the stats.

1. **Stats** — four cells: `1st` International hackathon · `300+` Participants · `30` Finalists in
   Barcelona · `$100M+` Budget under management.
2. **Why Join** — heading "WHY JOIN THE HACKATHON?" + lede ("Find out your real level of mastering
   AI tools for marketing alongside your peers. Decide who is №1 marketer on the planet — and №1 AI
   Creator."). Six numbered cards, each with an icon + tag:
   - 01 ⚔ CHALLENGE — "Compare yourself with other market leaders in real-world conditions." · POWER
   - 02 ⌬ COMMUNITY — "Get into a closed, professional community of senior practitioners." · UNITY
   - 03 ⟁ NETWORKING — "Networking with the jury, sponsors, and market colleagues." · REACH
   - 04 ✦ OPPORTUNITY — "The best solutions on GitHub. Offers from sponsoring companies." · LUCK
   - 05 ◈ PORTFOLIO CASE — "A real AI marketing case study — with numbers — in your portfolio." · PROOF
   - 06 ♛ PRIZE VAULT — "Annual subscriptions to AI services and individual sessions with experts." · LOOT
3. **Tracks** — "ROUND 03 — CHOOSE YOUR FIGHTING STYLE — HACKATHON TRACKS". Two track cards:
   - 01 AI-CREATIVES — SPECIAL: HOLOGRAPHIC BANNER MAKER. Bullets: "↘ AI-automated generation of
     creative packs", "↗ Banner-pack verification via an AI-agent auditor". Tags: SPEED, CREATIVITY,
     SCALE. Footer: FIGHT!
   - 02 AI-PERFORMANCE — SPECIAL: ZERO-WASTE MEDIA SPLIT. Bullets: "↘ Strategy", "↘ Analytics",
     "↗ Buying Paid Media", "↗ Media Split Management". Tags: STRATEGY, ANALYTICS, ROAS.
4. **Battle Arenas** — "ROUND 04 — SELECT YOUR ARENA — BATTLE ARENAS". Intro: "Example case
   directions — real client briefs across industries. Win and the client pays the prize." Four case
   tracks:
   - CASE TRACK · 01 HEALTHCARE — "Complex funnel. Long cycle. High LTV. Mission: cut CAC and speed
     up first-purchase conversion." CYCLE LONG · LTV HIGH · DIFFICULTY ★★★★
   - CASE TRACK · 02 B2B SAAS — "Long sales cycles. Many stakeholders. Mission: turn PQLs into
     pipeline with AI-driven demand gen." MOTION PLG · ACV HIGH · DIFFICULTY ★★★
   - CASE TRACK · 03 E-COMMERCE — "High volume. Thin margins. ROAS pressure. Mission: scale creative
     and squeeze CAC with AI." VOLUME HIGH · MARGIN THIN · DIFFICULTY ★★★
   - CASE TRACK · 04 ENTERPRISE — "Six-figure deals. Long procurement. Mission: run AI-powered ABM
     that lands target accounts." DEAL 6-FIG · CYCLE LONG · DIFFICULTY ★★★★
5. **Stages** — "ROUND 05 — THREE STAGES TO COMPETE — HACKATHON STAGES". Intro: "After
   qualification, participants are ranked according to their level of expertise." Three stages:
   - 01 ROUND 1 · SOLO · OPEN QUALIFICATION — "Self-applied participants only. Individual solutions
     for standardised cases. Those who fail receive an observer subscription with full hackathon
     access." ▶ REGISTRATION →
   - 02 ROUND 2 · INVITE · LIVE MAIN TOUR — "Invited participants start here. Anonymised real-life
     case studies from startups and enterprise clients. Use of AI is mandatory, not recommended."
     ▶ REGISTRATION →
   - 03 FINAL ROUND · OFFLINE · BARCELONA FINAL — "Individual case solutions and jury presentation.
     The jury evaluates — but the final word belongs to the client." ★ FINISH HIM ★
6. **Judges** — "BOSS ROSTER — MEET THE MASTERS — THE JUDGES". Sub: "The jury evaluates the case
   solutions — but the final word is up to the client." Cards:
   - BOSS · 01 JUDGE PLACEHOLDER — "Position, company — placeholder"
   - BOSS · 02 JUDGE PLACEHOLDER — "Position, company — placeholder"
   - BOSS · 03 JUDGE PLACEHOLDER — "Position, company — placeholder"
   - ? SECRET BOSS ??? — UNLOCK SOON — "Identity revealed before the main tour"
7. **Organizers** — "THE CREW — GAME MASTERS — THE ORGANIZERS". Sub: "The operators who built the
   arena." Five real crew members (initials + name + bio, verbatim):
   - VF · 01 VLADISLAV FEDOSEEV — "Managing Partner at Allformance, Founder of AI-Formance;
     performance marketing and AdTech operator."
   - RV · 02 ROMAN KUMAR VYAS — "Serial IT entrepreneur, marketing expert, founder / co-founder of
     Refocus, Qlean and Qmarketing."
   - AS · 03 ALEXANDER SOLOVYOV — "IT entrepreneur and growth operator; ex Co-founder of Qmarketing
     Academy, Co-founder of Refocus; performance, EdTech and AI-in-sales expert."
   - MK · 04 MARIA KULIKOVSKAIA — "AI HealthTech Product & Digital Transformation Strategist; 10+
     years in tech, MedTech and AI-enabled products."
   - AS · 05 ANNA SHOLINA — "VC partner & serial entrepreneur; SOULS agency founder; exited founder
     of EMERGE Global Tech Conference."
8. **FAQ** — "MENU — FIGHTER'S MANUAL — FREQUENTLY ASKED QUESTIONS". Eight expandable Q&A
   (verbatim from original; each expands to show its answer, arcade "↓↘→" combo hint on the toggle):
   - "What do I actually win?"
   - "Who actually competes?"
   - "Do I need to be a developer?"
   - "Can I use any AI tools and models?"
   - "Solo or with a team?"
   - "Do I get sponsor credits and tool access?"
   - "What happens if I don't make the final?"
   - "Can I do the Barcelona final remotely?"
   (Answers are the full verbatim text captured from the original.)
9. **Sponsors** — "SPONSORS — THIS FIGHT IS BROUGHT TO YOU BY — OUR PARTNERS". Placeholder partner
   tiles (the original shows placeholders).
10. **Final CTA** — "★ FINISH HIM ★ JOIN THE BATTLE — Compare your skills, put yourself on the map,
    and find out who is the best marketer on the planet. One battle. One leaderboard." ▶ REGISTRATION.
    "▮ PRESS ANY KEY TO CONTINUE ▮".
11. **Footer** — "★ GAME OVER ★ AI MARKETING KOMBAT · JULY 2026 · BARCELONA · © 2026 AI Marketing
    Kombat. All rights reserved. · Legal information · Code of conduct · Privacy".

## Generated pixel art

Produced via the project's existing AI-sprite → game-asset pipeline (see `game-assets/`,
`docs/`), output to `public/assets/demo/`:

- Why-Join: six pixel-art card icons (challenge/community/networking/opportunity/portfolio/prize).
- Tracks: two illustration panels (AI-Creatives, AI-Performance).
- Battle Arenas: four industry illustration tiles (healthcare, b2b-saas, e-commerce, enterprise).
- Judges: three "boss" silhouette portraits + one "secret boss" mystery tile.
- Organizers: five crew portrait sprites (stylized, initials-based — placeholders, not likenesses).
- Sponsors: placeholder partner tiles.

All chrome remains CSS. If art generation is unavailable for a slot, a CSS placeholder tile stands
in (labeled), so structure never blocks on art.

## Build order

1. **Structure pass** — `/demo` route + all 11 sections in code, fully styled with CSS placeholders
   for imagery and all verbatim copy. Verify layout desktop + mobile via the running app.
2. **Art pass** — generate the pixel art, drop into `public/assets/demo/`, swap placeholders.
3. **Verify** — build (`npm run build`) succeeds with static export; visual check of `/demo`.

## Testing / verification

- `npm run build` completes (static export, no route errors).
- `/demo` renders all sections in order; ScaleCanvas scales on desktop and reflows < 1024px.
- No horizontal overflow on mobile; tap targets adequate (responsive-layout bar).
- Spot-check every string against the original site — zero invented content.

## Risks

- **Scope size:** 11 sections + a sprite set is large; the two-pass build order lets layout be
  reviewed before art is generated.
- **No Figma source:** later sections are authored in the established visual language rather than
  pixel-matched to a Figma node (the first three were). Accepted by the user.
- **Art consistency:** generated sprites must match the existing hand-designed sprites' palette and
  fidelity; the art pass reviews them against existing `/assets` before committing.

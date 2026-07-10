# /demo Landing Continuation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new `/demo` route carrying the remaining original-site sections (stats → footer) in the established pixel-art shell.

**Architecture:** Next.js App Router route reusing the exact `/` shell (JuiceProvider → HitSparks → PixelCursor → ScaleCanvas 1440 → sections → ModeSwitcher). Each section is a `src/sections/<Name>/<Name>.{jsx,css}` pair, fixed 1440px width, section-local absolute/flow layout, global `--k-*` tokens only, CSS-authored chrome, generated pixel art for imagery.

**Tech Stack:** Next 14 (static export), React 18, plain CSS. No new deps.

## Global Constraints

- All copy **verbatim** from https://admirable-flan-dcc9a8.netlify.app/ — zero invented content.
- Fixed design width **1440px**; sections stack in `ScaleCanvas` flex column; reflow < 1024px via each section's own media queries.
- Tokens only: palette `--k-bg/--k-bg-2/--k-ink/--k-red/--k-yellow/--k-cyan/--k-magenta/--k-green/--k-shadow`, spacing `--k-1..--k-8` (8px grid), fonts `--k-font` (Press Start 2P) / `--k-font-accent` (Platform) / `--k-font-mono` (GT Pressura Mono).
- Images: `class="pixelated"`, alt text; every `<section>` has `aria-label`.
- Reuse existing chrome idioms: `.hero__pill` pills, `.champion__ticker` marquee, `CRTOverlay scoped`.
- Verification gate per task: `npm run build` succeeds (static export) + visual render check.
- Generated art → `public/assets/demo/`. CSS placeholder tile if art missing (never block structure).

---

### Task 1: Route scaffold + Marquee + Stats

**Files:**
- Create: `src/app/demo/page.jsx`, `src/sections/Marquee/Marquee.{jsx,css}`, `src/sections/Stats/Stats.{jsx,css}`

**Interfaces:**
- Produces: `<Marquee />`, `<Stats />` default exports; `/demo` route rendering the demo shell.

- [ ] Create `src/app/demo/page.jsx` — copy `/` shell, render `<Marquee /><Stats />` inside `ScaleCanvas width={1440}`, `ModeSwitcher active="ai"`.
- [ ] Build `Marquee` — looping ticker of "★ FIGHT! · AI MARKETING KOMBAT · ROUND 1 — QUALIFICATION OPEN · JULY 2026 · FINAL IN BARCELONA · FATALITY ON YOUR CAC · FLAWLESS VICTORY · FINISH HIM ★" (reuse `.champion__ticker` animation pattern).
- [ ] Build `Stats` — 4 cells: `1st`/International hackathon, `300+`/Participants, `30`/Finalists in Barcelona, `$100M+`/Budget under management.
- [ ] `npm run build` → PASS; render `/demo`, confirm marquee scrolls + stats row.
- [ ] Commit.

### Task 2: Why Join

**Files:** Create `src/sections/WhyJoin/WhyJoin.{jsx,css}`; add to `page.jsx`.

- [ ] `WHY JOIN THE HACKATHON?` heading + lede; 6 numbered cards (01–06 Challenge/Community/Networking/Opportunity/Portfolio/Prize Vault) each with glyph icon slot + copy + tag (POWER/UNITY/REACH/LUCK/PROOF/LOOT). Copy verbatim per spec §Why Join.
- [ ] `npm run build` PASS; visual check; Commit.

### Task 3: Tracks

**Files:** Create `src/sections/Tracks/Tracks.{jsx,css}`; add to `page.jsx`.

- [ ] `ROUND 03 — CHOOSE YOUR FIGHTING STYLE — HACKATHON TRACKS`; 2 track cards (AI-Creatives, AI-Performance) with SPECIAL line, bullet lists (arrow prefixes verbatim), tag pills, FIGHT! footer. Copy verbatim per spec §Tracks.
- [ ] `npm run build` PASS; visual check; Commit.

### Task 4: Battle Arenas

**Files:** Create `src/sections/Arenas/Arenas.{jsx,css}`; add to `page.jsx`.

- [ ] `ROUND 04 — SELECT YOUR ARENA — BATTLE ARENAS` + intro; 4 case-track cards (Healthcare/B2B SaaS/E-commerce/Enterprise) with mission copy, two stat tags each, DIFFICULTY star rating. Copy + star counts verbatim per spec §Battle Arenas.
- [ ] `npm run build` PASS; visual check; Commit.

### Task 5: Stages

**Files:** Create `src/sections/Stages/Stages.{jsx,css}`; add to `page.jsx`.

- [ ] `ROUND 05 — THREE STAGES TO COMPETE — HACKATHON STAGES` + intro; 3 stage cards (Round 1 Solo / Round 2 Invite / Final Barcelona) with meta line + body + CTA (▶ REGISTRATION → / ★ FINISH HIM ★). Copy verbatim per spec §Stages.
- [ ] `npm run build` PASS; visual check; Commit.

### Task 6: Judges

**Files:** Create `src/sections/Judges/Judges.{jsx,css}`; add to `page.jsx`.

- [ ] `BOSS ROSTER — MEET THE MASTERS — THE JUDGES` + sub; 3 placeholder boss cards + 1 secret-boss card (portrait slot, BOSS · 0N, name, position line). Copy verbatim per spec §Judges.
- [ ] `npm run build` PASS; visual check; Commit.

### Task 7: Organizers

**Files:** Create `src/sections/Organizers/Organizers.{jsx,css}`; add to `page.jsx`.

- [ ] `THE CREW — GAME MASTERS — THE ORGANIZERS` + sub; 5 crew cards (initials badge + CREW · 0N + name + bio). Names/bios verbatim per spec §Organizers.
- [ ] `npm run build` PASS; visual check; Commit.

### Task 8: FAQ

**Files:** Create `src/sections/Faq/Faq.{jsx,css}`; add to `page.jsx`.

- [ ] `MENU — FIGHTER'S MANUAL — FREQUENTLY ASKED QUESTIONS`; 8 expandable items (`<details>`/state toggle) with `↓↘→` combo hint; questions + full verbatim answers per spec §FAQ (answers captured from original).
- [ ] `npm run build` PASS; expand/collapse works; Commit.

### Task 9: Sponsors + Final CTA + Footer

**Files:** Create `src/sections/Sponsors/Sponsors.{jsx,css}`, `src/sections/FinalCta/FinalCta.{jsx,css}`, `src/sections/Footer/Footer.{jsx,css}`; add to `page.jsx`.

- [ ] `Sponsors` — `SPONSORS — THIS FIGHT IS BROUGHT TO YOU BY — OUR PARTNERS`, placeholder partner tiles.
- [ ] `FinalCta` — `★ FINISH HIM ★ JOIN THE BATTLE` + copy + ▶ REGISTRATION + `▮ PRESS ANY KEY TO CONTINUE ▮`.
- [ ] `Footer` — `★ GAME OVER ★ AI MARKETING KOMBAT · JULY 2026 · BARCELONA · © 2026 … · Legal information · Code of conduct · Privacy`.
- [ ] `npm run build` PASS; full-page render check; Commit.

### Task 10: Responsive + verbatim audit

- [ ] Render `/demo` < 1024px: no horizontal overflow, sections reflow, tap targets ok. Fix section media queries as needed.
- [ ] Diff every visible string on `/demo` against the original site text — correct any drift.
- [ ] `npm run build` PASS; Commit.

### Task 11: Art pass

**Files:** Create art under `public/assets/demo/`; swap placeholders in the relevant sections.

- [ ] Generate pixel-art (Why-Join icons ×6, Track panels ×2, Arena tiles ×4, Judge portraits ×3 + secret, Crew portraits ×5, sponsor tiles) via the AI-sprite→asset pipeline; match existing `/assets` palette/fidelity.
- [ ] Swap CSS placeholders for `<img class="pixelated">`; keep CSS fallback for any missing slot.
- [ ] `npm run build` PASS; final visual check `/demo`; Commit.

## Self-Review

- **Spec coverage:** marquee(T1), stats(T1), why-join(T2), tracks(T3), arenas(T4), stages(T5), judges(T6), organizers(T7), faq(T8), sponsors/final/footer(T9), responsive+audit(T10), art(T11) — all spec sections mapped.
- **Placeholders:** none; each task names exact files and verbatim-copy source (spec §). Answer text pulled from original at build time of each task.
- **Consistency:** every section is a default-exported component added to `src/app/demo/page.jsx` in order; all use `--k-*` tokens + existing chrome idioms.

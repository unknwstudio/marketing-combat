# Registration (demo) — design

**Date:** 2026-07-14
**Status:** Approved (design gate)
**Scope:** Add a demo-mode registration to the marketing site. No real backend — client-side only.

## Goal

Give the currently-dead "registration" CTAs a real destination: a simple account
sign-up, presented as a **modal** that adopts the visual theme of whichever site
version it was opened from. Demo mode — nothing leaves the browser.

## Context / constraints

- Next.js 14 App Router site with **two visual versions**:
  - `/` — "AI/demo" arcade theme: dark, neon, mono font (`--k-font-mono`),
    classes `.d-btn` / `.dcard`, tokens `--k-*`, lowercase, CRT overlay.
  - `/classic` — classic theme: light, Helvetica, black pill `.c-cta__pill`,
    tokens `--c-*` (aliases of global `--k-classic-*`), sentence-case, marquee.
- The registration surface must look like **the page it was opened from** (same
  CSS context) — this is why it is a modal mounted inside each version, not a
  standalone themed route.
- EU / GDPR context (final is in Barcelona): unbundled consent, explicit T&C
  accept, privacy links at point of collection, data minimization.
- **No hardcoding**: shared component + config module; theme via existing design
  tokens and classes, never one-off hex or duplicated copy at call sites.
- Keep it **as simple as possible** — standard account sign-up, not a wizard,
  not a selective application.

## Non-goals (YAGNI)

- No real auth, no network, no password storage, no email sending.
- No standalone `/register` route (the modal fully covers the "same CSS"
  requirement). The shared form component is written so a page could render it
  later if a shareable link is ever wanted — but that page is out of scope now.
- No multi-step wizard, no country/phone/portfolio fields, no password confirm.
- No cookie-consent banner (separate concern).

## Architecture

Single shared implementation, skinned per site version.

### `src/lib/register.js` — single source of truth (no hardcode)

Pure module. Exports:

- **`FIELDS`** — spec for each input: `{ id, type, label, autoComplete,
  required, validate }`. Fields: `name` (text), `email` (email), `password`
  (password, min 8).
- **`CONSENTS`** — `terms` (required, links to Terms + Privacy),
  `marketing` (optional, unticked, separate).
- **`COPY`** — headline, sub, submit label, success screen text, demo notice.
  Theme-neutral strings; casing is handled by CSS (`text-transform`), so the
  same copy renders lowercase on AI and sentence-case on classic.
- **Event bus** mirroring the existing `openGameTakeover()` pattern in
  `lib/game.js`:
  - `REGISTER_OPEN` CustomEvent name.
  - `openRegister()` — fire-and-forget dispatch; the only listener is the
    mounted `RegisterModal`.
- **`STORAGE_KEY`** + `saveRegistrationDemo({ name, email, marketing })` —
  writes `{ name, email, marketing, ts }` to `localStorage`. **Password is
  never persisted.** `ts` is passed in by the caller (module stays pure; no
  `Date.now()` at import).

### `src/components/RegisterModal/RegisterModal.jsx` — `'use client'`

- Props: `variant: 'ai' | 'classic'`.
- Accessible dialog: `role="dialog"`, `aria-modal="true"`, labelled by the
  headline id; focus trap; `Esc` and backdrop-click close; body scroll-lock
  while open; focus returns to the trigger on close.
- Listens for `REGISTER_OPEN`; opens with its own `variant`.
- Renders the shared form. Root element carries `reg reg--${variant}`.
- Reduced-motion: no enter/exit animation; instant show/hide.

### Form behaviour (inside RegisterModal)

- Fields driven by `FIELDS` from the config module (mapped, not hand-written).
- Inline validation on blur + submit; errors wired via `aria-describedby`;
  first invalid field receives focus on failed submit.
- Password field has a show/hide toggle (`aria-pressed`), `autocomplete
  ="new-password"`.
- Consents: `terms` required (submit blocked until checked), `marketing`
  optional and **unticked by default**, rendered as a separate checkbox.
- On valid submit: `saveRegistrationDemo(...)`, then the form is replaced
  in-place by an arcade **success state** ("PLAYER 1 — READY" on AI, sentence
  equivalent on classic) + a "DEMO MODE — nothing leaves your browser" notice.
- No network calls anywhere.

### `src/components/RegisterModal/RegisterModal.css`

- `.reg` — shared structural layout (dialog box, field stack, spacing via `--k-*`
  spacing tokens).
- `.reg--ai` — dark/neon skin: `--k-bg`/`--k-panel` surfaces, `--k-cyan` focus,
  reuses `.d-btn` for submit, `--k-focus-ring` for focus outlines, mono font.
- `.reg--classic` — light skin: white surface, `--k-classic-*` tokens, black
  pill submit echoing `.c-cta__pill`, Helvetica.
- Inputs: a new in-theme input treatment (dark panel + 2px frame + cyan focus on
  AI; light + bordered on classic). Visible `<label>`s (not placeholder-only).
- Each variant block uses only tokens guaranteed loaded when that variant
  renders: AI uses global `--k-*`; classic uses the **global** `--k-classic-*`
  aliases (not the route-scoped `--c-*`, which aren't loaded on `/`).

### Mounting

- `<RegisterModal variant="ai" />` in `src/app/page.jsx`, placed with the other
  fixed overlays **outside** `ScaleCanvas`/`JuiceProvider` (like `CRTOverlay`),
  so `position: fixed` pins to the viewport.
- `<RegisterModal variant="classic" />` in `src/sections/.../ClassicApp.jsx`
  (the `/classic` root), likewise outside any transformed wrapper.

### CTA wiring — call `openRegister()`

Replace the dead buttons' no-op with `openRegister()`, preserving their existing
attributes (`data-burst`, `data-sfx`, `data-magnetic`, magnetic pull):

- `src/sections/FinalCta/FinalCta.jsx` — the `>>> registration <<<` button.
- `src/sections/ClassicFinalCta/ClassicFinalCta.jsx` — the black `Registration →`
  pill.
- `src/sections/Hero/Hero.jsx` — the `>>> registration <<<` badge.
- Audit `Champion.jsx` and `McpPrompt.jsx` for any other registration CTA and
  wire them the same way.

### Legal stubs

- `src/app/legal/privacy/page.jsx` and `src/app/legal/terms/page.jsx` — minimal
  placeholder pages so the consent links are not dead.
- Consent links open with `target="_blank" rel="noopener"` so form state is
  preserved and the theme change happens in a separate tab.

## Data collected (GDPR — minimization)

| Field | Required | Purpose | Persisted (demo) |
|-------|----------|---------|------------------|
| Fighter name | yes | account display name | yes |
| Email | yes | account identity / contact | yes |
| Password | yes (min 8) | account credential | **no** |
| Accept Terms + Privacy | yes | lawful basis to process the account | as boolean |
| Marketing updates | no (unticked) | separate marketing consent (ePrivacy) | as boolean |

## Accessibility

- Real `<label>` per field; `aria-describedby` for hints + errors.
- Dialog focus trap, `Esc`, backdrop close, focus return, scroll-lock.
- Visible focus ring (`--k-focus-ring`); keyboard-complete; `prefers-reduced
  -motion` disables modal animation.

## Testing / verification

- `npm run build`, `npm run lint`, `npm run lint:css`, `npm run typecheck` all clean.
- Manual (Playwright): open modal from a CTA on `/` → AI skin; from `/classic`
  → classic skin. Validation blocks empty/invalid; T&C gate; success screen;
  `localStorage` written without password; Esc/backdrop/focus-return work.

---

## Amendment — 2026-07-14: event registration, not account sign-up

Product correction after implementation: this modal **registers a marketer for
the tournament**, it is not an account sign-up. Changes from the body above:

- **No password field** and no show/hide toggle. Fields are now **Fighter name +
  Email** only, plus the two consents (Terms required, marketing optional).
- Copy reframed: title "Register for the battle", submit "Register", success
  "You're on the roster…".
- The demo `localStorage` record was already password-free, so the store is
  unchanged (`{ name, email, marketing, ts }`).
- Everything else stands: modal, two themed skins (per site version), delegated
  `[data-register]` wiring, GDPR-unbundled consent, legal stubs, a11y.

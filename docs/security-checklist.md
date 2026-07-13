# Security checklist — 2026-07-12 audit pass

Scope covered this pass. Not exhaustive — a starting point for the next review.

## Headers / CSP (`vercel.json`)

- [x] `Content-Security-Policy` present, `default-src 'self'` — no third-party origins allowed.
- [x] `script-src` allows `'unsafe-inline'` + `'wasm-unsafe-eval'` only (no remote script hosts) — needed for the inline JSON-LD `<script>` and the WASM-backed 3D/game effects.
- [x] `style-src 'unsafe-inline'` — plain CSS + inline styles, no CSS-in-JS runtime.
- [x] `frame-ancestors 'none'` + `X-Frame-Options: DENY` — site cannot be framed.
- [x] `object-src 'none'`, `base-uri 'self'`.
- [ ] Re-verify header values against the live Vercel deploy (not just `vercel.json`) after any hosting config change.

## JSON-LD trust boundary (`src/app/layout.jsx`)

- [x] `eventJsonLd` is a static literal today — no user input flows into it.
- [x] `dangerouslySetInnerHTML` output is escaped (`<` → `<`) as belt-and-braces against a future dynamic field prematurely closing the `<script>` tag.
- [ ] If `eventJsonLd` ever gains a dynamic/user-sourced field, re-audit this escaping is still sufficient (it only guards `<`, not full JS-string escaping).

## Client storage (localStorage / sessionStorage)

Known call sites as of this pass:

- [ ] `src/sections/Leaderboard/Leaderboard.jsx`
- [ ] `src/game/fight/createFight.js`
- [ ] `src/components/VsSplash/VsSplash.jsx`
- [ ] `src/components/GameChrome/GameChrome.jsx`
- [ ] `src/effects/audio/arcadeAudio.js`

For each: confirm no PII/secrets stored, values are only used to gate local UI state (seen-splash flags, mute prefs, game progress), and reads are defensively parsed (storage can be edited by the user or unavailable in private-browsing).

## Supply-chain hygiene

- [x] `npm audit --omit=dev` run this pass: 2 findings.
  - Next.js 14.x advisories (DoS/cache-poisoning/SSRF/XSS, all tied to Server Components, Middleware, the Image Optimizer, or WebSocket upgrades) — package.json range `^14.2.15`, resolved `14.2.35`. **Low-risk here today**: this app is a fully static export (`output: 'export'` in `next.config.mjs`, no server runtime, no middleware, no API routes, `images.unoptimized: true`), so the vulnerable request-handling code paths aren't in play.
  - `postcss <8.5.10` (moderate, XSS via unescaped `</style>` in stringify output) — transitive build-time dependency, not shipped to the browser.
  - Both advisories' only listed fix is `next@16` (breaking) — not something to force this pass.
- [ ] **Re-check on any Next.js upgrade or if `output: 'export'` is ever dropped** — a switch to SSR/hybrid rendering reopens the Server Components/Middleware CVE classes.
- [ ] Re-run `npm audit` whenever a dependency is added/bumped, not just at audit time.

## `/mcp` prompt page content

- [x] The full-site prompt string (`src/sections/McpPrompt/McpPrompt.jsx`) is a static literal — no secrets, internal URLs, or credentials embedded.
- [ ] Re-check this file whenever the prompt text is updated — it's copy/pasted verbatim into third-party AI agents.

## Secrets / API-key grep

- [x] Grepped the repo for common secret shapes (API keys, tokens, private keys, `.env` values) — no real secrets found; only matches were flavor-text hits (Judges' "secret boss" copy, a code comment mentioning design "tokens").
- [ ] Re-run before each release: `grep -rniE "api[_-]?key|secret|token|BEGIN (RSA|PRIVATE) KEY" src/ --include="*.js" --include="*.jsx"`.

## No new external origins

- [x] CSP is `'self'`-only for scripts/styles/fonts/connect — confirmed no new external script tags, `<link>` fonts, analytics snippets, or third-party embeds were added this pass.
- [ ] Any future addition (analytics, a chat widget, a font CDN, etc.) needs a matching CSP directive update in `vercel.json` — treat a CSP violation in prod console as a signal something was added without the header being updated.

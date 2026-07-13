# Footer victory flash — design

## Context

`/demo` ends with the `Footer` component. As of commit `ac7897e` ("quiet footer
finale"), Footer already replaced an earlier red "★ GAME OVER ★" line with a
two-beat design: a "full tour cleared" kicker + a scroll-triggered, letter-by-
letter "YOU SURVIVED" headline, followed by a quiet legal block (brand line,
copyright, legal links).

Verified live (real browser, scrolled — not a static full-page capture, which
misses scroll-triggered reveals): the current payoff renders correctly, but
reads as flat. It's colored text with a slam-in transition; nothing shakes,
bursts, or plays a sound, so it doesn't land as a "moment" the way the site's
existing arcade call-outs do elsewhere on the page.

## Problem

1. The end-of-tour payoff needs real impact — the thing that says "yes, you
   scrolled the whole 16 000px page" should feel like an event, not a color
   change.
2. The footer below it should stay deliberately modest — no competing loud
   elements.

## Existing infrastructure (why this is a small change)

The site already has every primitive needed for a proper "moment", all used
elsewhere for arcade call-outs ("FIGHT!", "STAGE 03/04/05", "FINISH HIM"):

- **`Announcer`** (`src/components/Announcer/Announcer.jsx`) — a sitewide,
  already-mounted component that watches for any `[data-announce="TEXT"]`
  element scrolling into view (`IntersectionObserver`, threshold 0.55, fires
  once per element) and, when one appears:
  - shows a full-viewport, chromatic-split, slammed-in pixel title
    (`Announcer.css`), auto-hiding after ~1.3s
  - calls `useJuice().shake(7)`
  - plays an optional sound via `data-sound="clip"` → `playSfx(clip)`
  - already handles `prefers-reduced-motion` (fade instead of slam)
- **`useSparks().burst(x, y, opts)`** (`src/effects/particles/HitSparks.jsx`)
  — a full-viewport pixel-shard particle canvas already used for click
  effects (`[data-burst]` on buttons). Not currently wired into `Announcer`.
- **`win.mp3`** — present in `/public/game/audio`, currently unused anywhere
  in the codebase.

## Design

### 1. The flash

Tag the `<footer>` element itself with:

```jsx
<footer
  className="dsec footer"
  aria-label="Footer"
  data-announce="YOU SURVIVED"
  data-sound="win"
  data-announce-burst
>
```

`Announcer` already fires on any `[data-announce]` element scrolling into
view — no new observer needed. `Footer` needs no JS of its own anymore.

### 2. Extend `Announcer` to support a burst

Add a small, optional enhancement: when the observed element also carries
`data-announce-burst`, `Announcer` additionally calls
`sparks.burst(window.innerWidth / 2, window.innerHeight / 2, { count: 40, power: 2.2 })`
via `useSparks()`, at the same moment as the shake/sound/slam. Other
`data-announce` call-outs ("FIGHT!", "STAGE 0X", "FINISH HIM") don't set
`data-announce-burst`, so their behavior is unchanged — this is additive and
opt-in per call-out.

`useSparks()` and `HitSparks`'s reduced-motion guard (`burst()` no-ops under
`prefers-reduced-motion`) are reused as-is.

### 3. Simplify `Footer`

Delete the entire "beat 1: payoff" implementation:

- `Footer.jsx`: the `useRef`/`useState`/`IntersectionObserver` reveal logic,
  the `PAYOFF` constant, the per-letter `<span>` mapping, the `footer__kicker`
  /`footer__payoff`/`footer__survived` markup.
- `Footer.css`: the `.footer__payoff`, `.footer__kicker`, `.footer__survived`,
  `.footer__letter`, `@keyframes footer-letter-slam` rules and their
  reduced-motion / mobile overrides.

What remains is exactly today's "beat 2: quiet" block — brand line,
copyright, legal links — now the *only* thing in the footer. No code changes
needed there; it already reads as calm/modest per the original "quiet footer
finale" pass.

### Copy decision

Flash text is **"YOU SURVIVED"** (not "YOU WIN") — keeps the callback to the
hero's "will you survive?" question. Sound is `win.mp3` regardless (a victory
sting reads fine under either phrase).

## Sequence on scroll

1. User scrolls past `FinalCta`'s own "FINISH HIM" → "GAME OVER" countdown →
   registration ritual.
2. User continues scrolling into `Footer`.
3. `Footer` (55% visible) triggers `Announcer`: full-viewport "YOU SURVIVED"
   slam + screen shake + `win.mp3` + a center-screen pixel-shard burst.
4. Flash fades after ~1.3s.
5. What's left on screen: the quiet brand/copyright/legal block. Nothing else.

This is a single payoff moment (the flash), not two redundant ones (no
permanent duplicate headline text remains in the footer afterward).

## Out of scope

- No new visual language — this reuses `Announcer`'s existing chromatic-slam
  look and `HitSparks`' existing particle system verbatim.
- No changes to `FinalCta`'s own "FINISH HIM"/"GAME OVER" ritual.
- No changes to the fixed `ModeSwitcher` (AI MODE/Classic/MCP) pill — it's a
  global nav element that visually sits near the footer but isn't part of it.

## Testing

- Real-browser scroll test (not static full-page capture) confirming the
  flash, shake, sound-attempt (gesture-gated, so assert `playSfx` call not
  audible output), and burst all fire once when `Footer` crosses the 55%
  threshold.
- `prefers-reduced-motion: reduce` — flash still shows (fade variant per
  existing `Announcer` CSS), burst is skipped (`HitSparks` guard), shake
  behavior unchanged from existing `Announcer` usage elsewhere.
- Confirm `Announcer`'s existing call-outs ("FIGHT!", "STAGE 0X", "FINISH
  HIM") are unaffected (no burst fires for them, since they don't set
  `data-announce-burst`).
- Visual check that the footer, post-flash, shows only the quiet block with
  no leftover payoff text/space.

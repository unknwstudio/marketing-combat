# Hero arcade + YOU WIN! finale — design

**Date:** 2026-07-13
**Branch:** audit-remediation-2026-07-13 (or a fresh feature branch)
**Scope:** `/demo` (the full landing). `/` and `/classic` untouched.

## Goal

Two changes to the `/demo` landing, framed as an arcade **bookend**:

1. **Move the game entry into the hero.** A PLAY control in the hero boots the
   game as a **fullscreen in-page takeover** (no route change). The hero art +
   CRT stay exactly as they are.
2. **Turn the closing block into a victory beat.** Relocate the existing 3D
   arcade cabinet to the last block before the footer as a **YOU WIN!** trophy,
   and retheme that block from "GAME OVER → continue?" to a triumphant close
   that still carries the registration CTA.

## Decisions (locked with the user)

- **автомат = arcade cabinet**, and we **reuse the existing `Cabinet3D`** — same
  3D machine, different CRT screen. No new model.
- **Hero PLAY → fullscreen takeover on the page** (overlay), not an inline
  boxed game and not a navigation to `/play`. Hero art stays behind it.
- **Hero PLAY visual treatment:** drawn INTO the CRT texture + a warped
  transparent hit-area (the same mechanism the registration badge already
  uses), so on desktop it reads as "PRESS START" glowing on the curved screen.
  On mobile / no-WebGL / reduced-motion it is the plain visible DOM button.
- **The mid-page cabinet is relocated**, not duplicated: one cabinet on the
  page, moved to the finale, dive-to-launch act dropped.
- **The closing block is rethemed to victory** (not a new standalone block, not
  a defeat+victory mix). Registration CTA stays as the reward.
- **No hardcoding** (explicit user rule): colors from CSS tokens, copy strings
  centralized, reuse existing texture/CRT/fallback/warp patterns.

## Non-goals (YAGNI)

- No new 3D model, no new game, no changes to the fight engine.
- No inline "playable hero CRT" (explicitly rejected as too cramped/fragile).
- No changes to `/`, `/classic`, `/mcp`.
- `/play` route is **kept** as the canonical direct-link page — not removed.

---

## Architecture

Three units + one shared action. Each is understandable and testable on its own.

### Unit A — Hero PLAY control (`Hero` + `HeroDisplay3D`)

**What it does:** adds a single PLAY affordance to the hero that opens the game
takeover, without removing any existing hero visual.

**How it works:**

- `Hero.jsx` gains one real DOM control — a `<button>` (not an `<a href="/play">`,
  because the target is an in-page overlay, not a navigation). Styled from the
  existing `d-btn` button tokens; label + arrow glyph pulled from the shared
  copy constants (Unit D). Positioned centered under the wordmark. It is fully
  visible and clickable on the flat hero (mobile / no-WebGL / reduced-motion).
- On desktop the CRT canvas (`HeroDisplay3D`) covers the hero and is
  `pointer-events:none`, so the DOM button would be hidden beneath it. We mirror
  the **existing badge mechanism**:
  - `buildHeroTexture()` is extended to **draw the PLAY prompt** into the CRT
    canvas texture (so it appears on the curved screen), including the
    pre-baked normal/hover(focus) pair the badge already maintains.
  - A `warpBadgeToScreen()`-equivalent slides the PLAY button's transparent
    hit-area under the barrel-warped pixels, re-derived on resize (zoom-safe).
  - Hover/focus of the real button swaps the texture uniform (no per-hover
    redraw), same as the badge. Keyboard focus shows through the CRT (WCAG
    2.4.7 — the opaque canvas otherwise hides the DOM focus ring).
- Activation (click / Enter / Space) calls `openGameTakeover()` (Unit D).

**Depends on:** the shared open-action (Unit D), existing `buildHeroTexture` /
`warpBadgeToScreen` infrastructure.

**States:** flat (button visible, plain) · desktop-CRT (button drawn on screen +
warped hit-area) · hover/focus (inverted texture) · reduced-motion / no-WebGL
(flat button).

### Unit B — Fullscreen game takeover (`GameTakeover`, new)

**What it does:** hosts the real game as a viewport-fixed overlay on `/demo`,
opened on demand and dismissible, without a route change.

**How it works:**

- New client component mounted **once** on `/demo`, **outside** `ScaleCanvas`
  (viewport-fixed, like `ModeSwitcher` / `VsSplash`), so it is unaffected by the
  page zoom.
- Renders the **existing** islands unchanged — `FightGame`, `MobileControls`,
  `GameChrome`, and the rotate-phone hint (the same set `/play` renders) — so
  there is **no game duplication**. Mounted only while open (Phaser is destroyed
  on unmount by `FightGame`'s own cleanup → no WebGL leak).
- **Open:** listens for the shared open event (Unit D). Entry ceremony reuses
  the `VsSplash` flash as a pre-roll, then mounts the game.
- **Close:** a ✕ button and the Esc key. On close: unmount game, restore page
  scroll, restore focus to the trigger element.
- **While open:** lock body scroll; focus-trap inside the overlay; `role`/label
  so it's announced as a dialog. Focus moves onto the overlay's first control on
  open (WCAG 2.4.11), restored on close.

**Depends on:** existing game islands, `VsSplash` (pre-roll), shared open-action.

**States:** closed (not mounted) · pre-roll (VS flash) · playing · closing.

### Unit C — YOU WIN! trophy cabinet (finale) (`Cabinet3D` reuse + `FinalCta` retheme)

**What it does:** relocates the one 3D cabinet to the closing block as a static
victory trophy and reframes the closing block around it.

**How it works:**

- **Remove** `<ArcadeCabinet/>` from `/demo` (the mid-page "play the game"
  section retires; its file may be deleted since play now lives in the hero).
- **`Cabinet3D`** is reused with two changes, both behind its existing prop
  surface so no other caller changes:
  - The CRT texture builder gains a **YOU WIN!** variant (same `SCREEN_FRAG`
    shader, same power-on brighten, same `.webp` fallback for no-WebGL). Colors
    read from tokens. Which text it shows is a prop/variant, not a fork of the
    component.
  - The finale mounts it **without the scroll act** (no `armed` / `pinned` /
    `actProgressRef`): every act formula already collapses to today's static
    behavior when the act ref stays 0, so this is the component's existing
    un-armed path — a gentle dolly, pointer parallax, no sticky hold.
  - Clicking the cabinet screen/START opens the **takeover** (play again) via
    the shared action, instead of `window.location.href = '/play'`.
- **`FinalCta`** is rethemed GAME OVER → victory:
  - The trophy cabinet is the section centerpiece.
  - "YOU WIN!" replaces the "GAME OVER" slam; the countdown/scramble ceremony
    is re-skinned to a win beat (kept, including the reduced-motion immediate
    resolved state, so the accessibility/parity story is unchanged).
  - The **registration CTA + facts line stay** (the conversion moment must not
    be lost). `id="register"` fragment target preserved (the hero badge links
    to it).

**Depends on:** `Cabinet3D`, its `.webp` fallback + `.glb` model (unchanged),
shared open-action.

**States:** desktop-WebGL (live 3D trophy, YOU WIN CRT) · no-WebGL (`.webp`
fallback) · reduced-motion (static, resolved victory state, no beeps/shake).

### Unit D — Shared open-action + copy constants (new, tiny)

**What it does:** one way to open the game, one home for the new strings.

**How it works:**

- `openGameTakeover()` — dispatches a `window` CustomEvent (matches the existing
  `MK.*` window-event idiom in `game/fight/events`). Called by Unit A (hero
  PLAY) and Unit C (finale cabinet). `GameTakeover` (Unit B) is the sole
  listener.
- A small constants module holds the new copy: PLAY label + glyph, "PRESS
  START", "YOU WIN!". No inline string literals scattered across components.

**Depends on:** nothing (leaf module).

---

## Data flow

```
Hero PLAY (Unit A) ─┐
                    ├─ openGameTakeover() ─► window event ─► GameTakeover (Unit B)
Finale cabinet (C) ─┘                                          │ VS pre-roll
                                                               │ mount FightGame + chrome
                                                               ▼
                                                        Esc / ✕ ─► unmount, restore scroll+focus

Hero badge ── #register ──► FinalCta (registration CTA, unchanged target)
```

## Error handling & fallbacks

- **No WebGL / crash:** Unit A → flat DOM PLAY button (Hero renders it either
  way; `Error3DBoundary` already guards the hero CRT). Unit C → `Cabinet3D`'s
  existing `.webp` fallback, wrapped in `Error3DBoundary`.
- **Reduced motion:** hero PLAY is a plain button; takeover skips the VS
  pre-roll; finale shows the resolved victory state with no beeps/shake/scramble.
- **Game fails to load:** `FightGame` already has a `failed` state; surface it
  inside the overlay with a close affordance so the user isn't trapped.
- **Off-screen:** finale cabinet keeps the `IntersectionObserver` frameloop
  pause. Takeover mounts the game only while open.

## Testing

- **Manual (primary, via the `run`/`verify` skills + Playwright MCP):**
  1. Desktop: hero shows PLAY on the CRT; click → VS flash → game overlay;
     Esc/✕ returns to hero with scroll + focus restored; hero art intact.
  2. Keyboard-only: Tab reaches PLAY (visible focus through CRT), Enter opens,
     Esc closes, focus returns.
  3. Mobile viewport: flat hero PLAY visible/tappable; overlay + MobileControls
     + rotate hint work.
  4. Finale: YOU WIN! cabinet renders (3D on desktop, `.webp` fallback when
     WebGL off); registration CTA present and `#register` still anchors from the
     hero badge; reduced-motion shows the static victory state.
  5. No duplicate cabinet mid-page; no dead scroll runway where `ArcadeCabinet`
     used to be.
- **Gates:** `npm run build`, lint, typecheck, and stylelint token gate must
  pass (no new hardcoded hex/px — the token gate enforces this).

## Rollout / reversibility

- Land on a feature branch; the four edited components + two new files are the
  whole surface. `ArcadeCabinet` retirement is the only removal — its
  `Cabinet3D` dependency lives on in the finale, so nothing 3D is lost.
- `/play` stays intact, so the game is always reachable directly even if the
  takeover is disabled.

## Open questions

- None blocking. Exact victory-ceremony choreography for the rethemed `FinalCta`
  (how the countdown re-skins to a win beat) is a polish detail to settle during
  implementation, not an architectural fork.

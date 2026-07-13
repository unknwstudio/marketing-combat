# Hero arcade + YOU WIN! finale — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On `/demo`, move the game entry into the hero as a fullscreen in-page takeover (hero art + CRT preserved), and relocate the existing 3D cabinet to the closing block as a YOU WIN! victory trophy.

**Architecture:** A shared `openGameTakeover()` window-event action fans in from the hero PLAY control and the finale cabinet to one mounted `GameTakeover` overlay that hosts the existing Phaser game islands. The existing `VsSplash` interceptor gains a branch: on `/demo` (overlay mounted) it opens the overlay instead of navigating to `/play`. The one 3D cabinet is reused — its CRT texture gains a YOU WIN variant and its click opens the takeover; it moves from the retired mid-page `ArcadeCabinet` into a rethemed `FinalCta`.

**Tech Stack:** Next 14 (static export) · React 18 · @react-three/fiber + drei + three · Phaser 3 · GSAP · plain CSS with a `--k-*` design-token system.

## Global Constraints

- **No new dependencies.** Use only what `package.json` already lists.
- **No hardcoded values.** Colors come from `--k-*` CSS custom properties (defined in `src/styles/index.css`); the `lint:css` stylelint gate rejects raw hex/px in CSS. New user-facing copy strings live once in `src/lib/game.js` (`GAME_COPY`), imported everywhere — never inline-duplicated.
- **Every 3D piece keeps its three fallbacks:** a no-WebGL `<img>`/flat fallback, a `prefers-reduced-motion` path, and an off-screen `IntersectionObserver` frameloop pause. Do not regress any of these.
- **`/` and `/classic` stay visually identical.** `Hero.jsx` is shared with `/`; any hero addition is gated behind a prop that only `HeroStage` (`/demo`) sets.
- **Static-export safe:** nothing touches `window`/`document` at module top level or during SSR; client-only `three`/`phaser` stay behind `next/dynamic({ ssr:false })` or in-effect dynamic `import()`, matching existing files.
- **Gate for every task** (the project has no unit-test runner): `npm run build && npm run lint && npm run lint:css` must all pass, plus the task's observable check. (NOTE: `npm run typecheck` is a broken no-op in this repo — it runs `tsc --noEmit` but the project is JS-with-`jsconfig.json` and ships no `tsconfig.json`, so tsc has no inputs and just prints help. Do NOT add a `tsconfig.json` to "fix" it — Next.js would then treat this JS project as TypeScript. The three checks above are the real gate.)

---

## File structure

**New**
- `src/lib/game.js` — leaf module: `TAKEOVER_OPEN` event name, `openGameTakeover()`, `takeoverAvailable()`/`setTakeoverAvailable()`, and `GAME_COPY` (all new copy strings).
- `src/components/GameTakeover/GameTakeover.jsx` + `GameTakeover.css` — the fullscreen in-page overlay hosting the game.

**Modified**
- `src/styles/index.css` — add `--z-takeover` token.
- `src/components/GameChrome/GameChrome.jsx` — optional `onExit` prop.
- `src/components/VsSplash/VsSplash.jsx` — open the takeover when available, else navigate (unchanged elsewhere).
- `src/sections/Hero/Hero.jsx` + `Hero.css` — prop-gated PLAY anchor.
- `src/components/HeroDisplay3D/HeroDisplay3D.jsx` — draw PLAY on the CRT + warp its hit-area + focus/hover swap.
- `src/components/Cabinet3D/Cabinet3D.jsx` — `screenVariant` prop (YOU WIN texture) + configurable play action.
- `src/sections/FinalCta/FinalCta.jsx` + `FinalCta.css` — mount the trophy cabinet + retheme GAME OVER → victory.
- `src/app/demo/page.jsx` — drop `<ArcadeCabinet/>`, mount `<GameTakeover/>`, pass `withPlay` via `HeroStage` (see Task 5).

**Deleted (retired)**
- `src/sections/ArcadeCabinet/ArcadeCabinet.jsx` + `ArcadeCabinet.css` (mid-page play section; play now lives in the hero).

---

### Task 1: Shared takeover action + copy constants + z-index token

**Files:**
- Create: `src/lib/game.js`
- Modify: `src/styles/index.css` (the `--z-*` ledger, currently lines ~190–211)

**Interfaces:**
- Produces:
  - `TAKEOVER_OPEN: string` — the CustomEvent name.
  - `openGameTakeover(): void` — dispatches `TAKEOVER_OPEN` on `window` (SSR-guarded no-op).
  - `takeoverAvailable(): boolean` / `setTakeoverAvailable(v: boolean): void` — reads/writes `window.__AMK_TAKEOVER__`.
  - `GAME_COPY: { playLabel, playGlyph, pressStart, youWin }` (all strings).

- [ ] **Step 1: Create the leaf module**

Create `src/lib/game.js`:

```js
// Site-level game-entry contract, shared by the hero PLAY control, the finale
// cabinet, the VS splash interceptor, and the takeover overlay. Pure module —
// window access is guarded and only happens at call time, so it is safe under
// the static-export/SSR pass. (Distinct from src/game/fight/events.js, which is
// the React-chrome <-> Phaser-engine contract.)

// CustomEvent that opens the in-page game takeover.
export const TAKEOVER_OPEN = 'amk:takeover-open'

// Single source of truth for the new user-facing copy — imported everywhere so
// the hero, the cabinet CRT and the overlay can never drift (and so nothing is
// hardcoded at a call site).
export const GAME_COPY = {
  playLabel: 'PLAY',
  playGlyph: '▶',
  pressStart: 'PRESS START',
  youWin: 'YOU WIN!',
}

// The overlay sets this true while mounted (only on /demo). VsSplash reads it to
// decide: open the in-page overlay (/demo) vs hard-navigate to /play (/, no
// overlay mounted). A window flag — not React context — because the reader is a
// document-level delegated listener outside the React tree.
export function takeoverAvailable() {
  return typeof window !== 'undefined' && window.__AMK_TAKEOVER__ === true
}

export function setTakeoverAvailable(v) {
  if (typeof window !== 'undefined') window.__AMK_TAKEOVER__ = !!v
}

// Fire-and-forget open request. The sole listener is GameTakeover.
export function openGameTakeover() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(TAKEOVER_OPEN))
}
```

- [ ] **Step 2: Add the z-index token**

In `src/styles/index.css`, add one line to the `--z-*` ledger (just below `--z-crt: 9000;`), so the overlay sits above the page CRT and VS splash but below the pixel cursor / skip-link:

```css
  --z-takeover: 9200; /* fullscreen in-page game overlay (over CRT + splash) */
```

- [ ] **Step 3: Gate**

Run: `npm run build && npm run lint && npm run lint:css`
Expected: all pass (new module is unreferenced yet — this only proves it compiles and the token is valid CSS).

- [ ] **Step 4: Commit**

```bash
git add src/lib/game.js src/styles/index.css
git commit -m "feat(game): shared takeover action + copy constants + z token"
```

---

### Task 2: `GameChrome` gains an optional `onExit` (backward-compatible)

**Files:**
- Modify: `src/components/GameChrome/GameChrome.jsx:102-103` (the `exitToSite`/`requestExit` pair) and the component signature (line ~55)

**Interfaces:**
- Consumes: nothing new.
- Produces: `GameChrome` accepts `{ onExit?: () => void }`. When `onExit` is provided, the ✕ corner button and the LEAVE/EXIT menu items call it instead of `window.location.href = '/'`. When omitted (today's `/play` usage), behavior is unchanged.

- [ ] **Step 1: Thread the prop**

Change the signature from `export default function GameChrome() {` to:

```js
export default function GameChrome({ onExit } = {}) {
```

Change `exitToSite` (currently `const exitToSite = () => { window.location.href = '/'; };`) to:

```js
  // /play passes no onExit → hard-nav to the site home, as before. The /demo
  // takeover passes onExit → close the overlay in place (no navigation).
  const exitToSite = () => { if (onExit) onExit(); else window.location.href = '/'; };
```

(`requestExit`, the ✕ button, the pause-menu `EXIT TO SITE`, and the confirm-exit `LEAVE`/`EXIT` all already route through `exitToSite` — no other edits.)

- [ ] **Step 2: Gate**

Run: `npm run build && npm run lint && npm run lint:css`
Expected: all pass.

- [ ] **Step 3: Verify `/play` unchanged (observable)**

Run `npm run dev`, then with Playwright MCP: navigate to `http://localhost:3000/play`, click the ✕ exit (corner button, `aria-label="Exit to site"`), and confirm the URL becomes `/`. This proves the no-`onExit` path is untouched.

- [ ] **Step 4: Commit**

```bash
git add src/components/GameChrome/GameChrome.jsx
git commit -m "feat(game): optional onExit prop on GameChrome (default = navigate)"
```

---

### Task 3: `GameTakeover` overlay + mount on `/demo`

**Files:**
- Create: `src/components/GameTakeover/GameTakeover.jsx`, `src/components/GameTakeover/GameTakeover.css`
- Modify: `src/app/demo/page.jsx` (add the import + mount it beside the other fixed overlays, outside `ScaleCanvas`)

**Interfaces:**
- Consumes: `TAKEOVER_OPEN`, `setTakeoverAvailable` (Task 1); existing `FightGame`, `MobileControls`, `GameChrome` (with `onExit`, Task 2).
- Produces: a self-contained overlay; no exports consumed by later tasks.

- [ ] **Step 1: Create the overlay component**

Create `src/components/GameTakeover/GameTakeover.jsx`:

```jsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import FightGame from '@/components/FightGame/FightGame'
import MobileControls from '@/components/MobileControls/MobileControls'
import GameChrome from '@/components/GameChrome/GameChrome'
import { TAKEOVER_OPEN, setTakeoverAvailable } from '@/lib/game'
import './GameTakeover.css'

/**
 * GameTakeover — the game as a fullscreen IN-PAGE overlay on /demo (no route
 * change). Mounted once, viewport-fixed, OUTSIDE ScaleCanvas. It hosts the very
 * same islands /play renders (FightGame + MobileControls + GameChrome + the
 * rotate hint), so there is no game duplication; Phaser is created on mount and
 * destroyed on unmount by FightGame's own cleanup. Opening is requested via the
 * shared openGameTakeover() event; closing is GameChrome's own ✕/EXIT, rewired
 * through onExit to close in place. While it's mounted it advertises itself so
 * VsSplash opens it (see Task 4) instead of navigating.
 */
export default function GameTakeover() {
  const [open, setOpen] = useState(false)
  const openerRef = useRef(null) // focus is returned here on close

  // advertise availability for the whole mounted lifetime (not just while open)
  useEffect(() => {
    setTakeoverAvailable(true)
    return () => setTakeoverAvailable(false)
  }, [])

  useEffect(() => {
    const onOpen = () => {
      openerRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      setOpen(true)
    }
    window.addEventListener(TAKEOVER_OPEN, onOpen)
    return () => window.removeEventListener(TAKEOVER_OPEN, onOpen)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  // lock page scroll + restore focus to the opener when the overlay closes
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
      const opener = openerRef.current
      if (opener && opener.isConnected) opener.focus({ preventScroll: true })
    }
  }, [open])

  if (!open) return null

  return (
    <div className="game-takeover" role="dialog" aria-modal="true" aria-label="AI Marketing Kombat">
      <FightGame />
      <MobileControls />
      {/* onExit closes in place instead of navigating away from /demo */}
      <GameChrome onExit={close} />
      <div className="rotate-hint" aria-hidden="true">
        <div className="rot-phone" />
        <div className="rot-big">ROTATE YOUR<br />PHONE</div>
        <div className="rot-sm">the arena needs landscape</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create the overlay CSS**

Create `src/components/GameTakeover/GameTakeover.css`. Reuse the `/play` stage look (fixed, centered, `--k-stage` backdrop) at the takeover z-layer. The inner `.fight-canvas`, `.mc-root`, and `.rotate-hint` rules already ship globally (play.css / MobileControls / GameChrome), so only the shell is new:

```css
.game-takeover {
  position: fixed;
  inset: 0;
  z-index: var(--z-takeover);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--k-stage);
  overflow: hidden;
}
```

- [ ] **Step 3: Mount it on `/demo`**

In `src/app/demo/page.jsx`, add the import next to the other fixed-overlay imports:

```jsx
import GameTakeover from '@/components/GameTakeover/GameTakeover'
```

and mount it among the fixed overlays that live OUTSIDE `JuiceProvider`/`ScaleCanvas` (near `<VsSplash />`, before `<ModeSwitcher active="ai" />`):

```jsx
      <GameTakeover />
```

- [ ] **Step 4: Gate**

Run: `npm run build && npm run lint && npm run lint:css`
Expected: all pass.

- [ ] **Step 5: Verify open/close (observable)**

`npm run dev`, Playwright MCP → navigate `http://localhost:3000/demo`. In the page console run `window.dispatchEvent(new CustomEvent('amk:takeover-open'))`. Expected: the game overlay appears over the page; the ✕ exit closes it back to `/demo` (URL never changes); page scroll is restored after close. Also confirm `window.__AMK_TAKEOVER__ === true`.

- [ ] **Step 6: Commit**

```bash
git add src/components/GameTakeover/ src/app/demo/page.jsx
git commit -m "feat(demo): fullscreen in-page GameTakeover overlay"
```

---

### Task 4: `VsSplash` opens the takeover when available

**Files:**
- Modify: `src/components/VsSplash/VsSplash.jsx` (the early-return path ~line 88-92 and the post-flash navigation ~line 98-124)

**Interfaces:**
- Consumes: `takeoverAvailable`, `openGameTakeover` (Task 1); the mounted overlay (Task 3).
- Produces: no new exports. Effect: any `a[href="/play"]` activation on `/demo` now flashes VS then opens the overlay; on `/` it still hard-navigates to `/play`.

- [ ] **Step 1: Import the shared helpers**

Add to the imports at the top of `VsSplash.jsx`:

```js
import { takeoverAvailable, openGameTakeover } from '@/lib/game'
```

- [ ] **Step 2: Handle the reduced-motion / already-seen fast path**

Replace the existing block:

```js
      // repeat visit this session, or reduced-motion: native nav, zero delay
      if (seen() || prefersReducedMotion()) {
        markSeen()
        return
      }
```

with:

```js
      // repeat visit this session, or reduced-motion: skip the flash. On /demo
      // open the overlay in place; elsewhere fall through to native /play nav.
      if (seen() || prefersReducedMotion()) {
        markSeen()
        if (takeoverAvailable()) {
          e.preventDefault()
          openGameTakeover()
        }
        return
      }
```

- [ ] **Step 3: Handle the post-flash path**

Inside the `setTimeout` callback, replace the `pageswap` opt-out + `window.location.href = a.href` tail so the overlay case never navigates:

```js
      timerRef.current = window.setTimeout(() => {
        setLive(false)
        liveRef.current = false
        if (takeoverAvailable()) {
          // /demo: the flash was the ceremony; open the game in place.
          openGameTakeover()
          return
        }
        // /: no overlay mounted — hard-nav to /play, opting out of the
        // @view-transition dissolve exactly as before.
        window.addEventListener(
          'pageswap',
          (ev) => {
            const vt = ev.viewTransition
            if (!vt) return
            vt.ready?.catch?.(() => {})
            vt.finished?.catch?.(() => {})
            vt.updateCallbackDone?.catch?.(() => {})
            vt.skipTransition()
          },
          { once: true }
        )
        window.location.href = a.href
      }, SPLASH_MS)
```

(The overlay branch clears `live` so the black VS card is torn down as the game mounts on top; the navigation branch leaves the card up through the page swap, as today.)

- [ ] **Step 4: Gate**

Run: `npm run build && npm run lint && npm run lint:css`
Expected: all pass.

- [ ] **Step 5: Verify both surfaces (observable)**

`npm run dev`, Playwright MCP:
1. `http://localhost:3000/demo` → click the floating **PLAY** link (`a[href="/play"]`, bottom-right). Expected: VS flash (~500ms) then the game overlay opens; URL stays `/demo`; ✕ closes it.
2. `http://localhost:3000/` → click the floating **PLAY** link. Expected: VS flash then navigation to `/play` (URL changes). This proves `/` is unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/components/VsSplash/VsSplash.jsx
git commit -m "feat(demo): VsSplash opens the in-page takeover when available"
```

---

### Task 5: Hero PLAY affordance (DOM anchor, prop-gated) + flat/mobile styling

**Files:**
- Modify: `src/sections/Hero/Hero.jsx` (signature + one new anchor), `src/sections/Hero/Hero.css` (new `.hero__play` rules), `src/components/HeroDisplay3D/HeroStage.jsx:41` (pass `withPlay`)

**Interfaces:**
- Consumes: `GAME_COPY` (Task 1); the VsSplash interception (Task 4) handles the click.
- Produces: `Hero` accepts `{ withPlay?: boolean }` (default `false`). When true it renders `a.hero__play` (`href="/play"`). `HeroStage` passes `withPlay`; `/`'s bare `<Hero/>` does not, so `/` is unchanged. The element carries class `hero__play` — Task 6 (HeroDisplay3D) queries `.herostage__flat .hero__play`.

- [ ] **Step 1: Gate the prop + render the anchor**

In `src/sections/Hero/Hero.jsx`, change `export default function Hero() {` to:

```jsx
import { GAME_COPY } from '@/lib/game'
// ...
export default function Hero({ withPlay = false }) {
```

Add the anchor just before the closing `<CRTOverlay .../>` (so it sits centered below the wordmark; positioned by CSS). It is a real link — no-JS visitors still reach `/play`; on `/demo` VsSplash intercepts it into the overlay:

```jsx
      {withPlay && (
        <a
          className="hero__play"
          href="/play"
          data-sfx="confirm"
          data-burst
          aria-label="Play AI Marketing Kombat"
        >
          <span aria-hidden="true">{GAME_COPY.playGlyph} </span>
          {GAME_COPY.playLabel}
        </a>
      )}
```

- [ ] **Step 2: Pass `withPlay` from `HeroStage` only**

In `src/components/HeroDisplay3D/HeroStage.jsx`, change `<Hero />` (inside `.herostage__flat`) to:

```jsx
        <Hero withPlay />
```

- [ ] **Step 3: Style `.hero__play` (tokens only)**

In `src/sections/Hero/Hero.css`, add (desktop base — centered below the logo, inside the 1440×804 stage; match the coordinates Task 6 draws to):

```css
.hero__play {
  position: absolute;
  left: 50%;
  top: 680px;
  transform: translateX(-50%);
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: var(--k-2);
  padding: var(--k-2) var(--k-5);
  font-family: var(--k-font-mono);
  font-size: var(--k-text-lg);
  letter-spacing: 0.08em;
  color: var(--k-black);
  background: var(--k-gold);
  border: 1px solid var(--k-white);
  text-decoration: none;
}
.hero__play:hover {
  background: var(--k-white);
}
.hero__play:focus-visible {
  outline: 3px solid var(--k-focus-ring);
  outline-offset: 2px;
}
```

Add a mobile rule inside the existing `@media` block that restyles the hero for small screens (near the other `.hero__*` mobile overrides, ~line 215+) so PLAY sits in normal flow under the wordmark, e.g.:

```css
  .hero__play {
    position: static;
    transform: none;
    margin: var(--k-4) auto 0;
  }
```

- [ ] **Step 4: Gate**

Run: `npm run build && npm run lint && npm run lint:css`
Expected: all pass. (If stylelint flags a raw value, swap it for the nearest `--k-*` token.)

- [ ] **Step 5: Verify flat + mobile (observable)**

`npm run dev`, Playwright MCP:
1. Resize to a phone viewport (e.g. 390×844) → `http://localhost:3000/demo`: the PLAY button is visible under the wordmark and tappable; tapping opens the overlay.
2. `http://localhost:3000/` at the same size: **no** PLAY button in the hero (prop-gated) — `/` unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/sections/Hero/Hero.jsx src/sections/Hero/Hero.css src/components/HeroDisplay3D/HeroStage.jsx
git commit -m "feat(hero): prop-gated PLAY affordance (flat + mobile)"
```

---

### Task 6: Draw PLAY on the CRT + warp its hit-area (desktop enhancement)

**Files:**
- Modify: `src/components/HeroDisplay3D/HeroDisplay3D.jsx` — `buildHeroTexture()` (draw PLAY), the `warpBadgeToScreen` reuse, and the `CRTPlane` build effect (track a second interactive element)

**Interfaces:**
- Consumes: `GAME_COPY` (Task 1); the `.hero__play` anchor rendered by Task 5.
- Produces: on desktop `/demo` the PLAY prompt is painted onto the curved CRT and a transparent, barrel-warped hit-area is slid under it; hover/keyboard-focus of the real anchor lights the drawn button (WCAG 2.4.7 focus visibility through the opaque canvas). No new exports.

This mirrors the existing badge mechanism exactly, generalized from one interactive element (badge) to two (badge + PLAY). The texture builder gains a small draw block; the build effect pre-bakes a third texture and tracks the PLAY element's hover/focus.

- [ ] **Step 1: Import copy + add a PLAY draw block to `buildHeroTexture`**

Add near the top of the file:

```js
import { GAME_COPY } from '@/lib/game'
```

Change the signature `async function buildHeroTexture(bgImg, logoImg, hover = false)` to a target-aware form:

```js
// `active` names which interactive element is lit: 'badge' | 'play' | null.
// Each pre-baked texture shows exactly one lit element (or none), matching the
// DOM :hover/:focus-visible of the real <a> the canvas covers.
async function buildHeroTexture(bgImg, logoImg, active = null) {
```

Replace the badge's `const hover = ...`-dependent fills to key off `active === 'badge'`:

```js
  x.fillStyle = active === 'badge' ? '#fff' : '#000'
  // ... (strokeRect unchanged) ...
  x.fillStyle = active === 'badge' ? '#000' : '#fff'
```

Then, after the wordmark `drawImage(...)` block, add the PLAY button draw (centered on `HERO_W/2`, baseline aligned to the DOM `top:680px` from Task 5). Inverts when lit, mirroring the badge:

```js
  // PLAY prompt — centered under the wordmark; its DOM hit-area (an <a>) is
  // warped to sit under these pixels (see warpElToScreen in CRTPlane).
  const playText = `${GAME_COPY.playGlyph} ${GAME_COPY.playLabel}`
  x.font = `28px ${MONO}`
  const pTextW = x.measureText(playText).width
  const pPadX = 22
  const pw = pTextW + pPadX * 2
  const ph = 52
  const px0 = (HERO_W - pw) / 2
  const py0 = 680
  x.fillStyle = active === 'play' ? '#fff' : '#ffd23f' // rest = --k-gold value
  x.fillRect(px0, py0, pw, ph)
  x.strokeStyle = '#fff'
  x.lineWidth = 1
  x.strokeRect(px0 + 0.5, py0 + 0.5, pw - 1, ph - 1)
  x.fillStyle = '#000'
  x.textBaseline = 'middle'
  x.textAlign = 'center'
  x.fillText(playText, HERO_W / 2, py0 + ph / 2 + 1)
  x.textAlign = 'left' // restore default for any later draws
```

(Canvas-2D texture fills are the one place raw hex is unavoidable — WebGL texture painting isn't CSS and the stylelint gate doesn't cover `.jsx`. Keep the value in sync with `--k-gold` via the trailing comment, consistent with how this file already inlines `#3ad76f`/`#ff5000` to match tokens.)

- [ ] **Step 2: Generalize `warpBadgeToScreen` to any element**

Rename `warpBadgeToScreen(badgeEl, canvasEl)` → `warpElToScreen(el, canvasEl)` (rename the param `badgeEl`→`el` throughout its body; logic is identical — it already only uses the element's measured rect). Update its one call site inside `CRTPlane` (badge) and add the PLAY call in Step 3.

- [ ] **Step 3: Pre-bake the PLAY texture + track PLAY hover/focus in `CRTPlane`**

In the build effect of `CRTPlane`, extend the two-texture pre-bake to three and query the PLAY anchor alongside the badge. Replace the `texNormal`/`texHover` pair with:

```js
    let texNormal = null
    let texBadge = null
    let texPlay = null
    let badgeEl = null
    let playEl = null
    let ro = null
    let badgeState = false // hover||focus on the badge
    let playState = false  // hover||focus on PLAY
    const sync = () => {
      if (!texNormal) return
      uniforms.uTex.value = badgeState ? texBadge : playState ? texPlay : texNormal
    }
```

Build all three and warm them on the GPU (mirroring the existing `gl.initTexture` warm-up):

```js
      texNormal = await buildHeroTexture(bgImg, logoImg, null)
      texBadge = await buildHeroTexture(bgImg, logoImg, 'badge')
      texPlay = await buildHeroTexture(bgImg, logoImg, 'play')
      if (cancelled) { texNormal.dispose(); texBadge.dispose(); texPlay.dispose(); return }
      gl.initTexture(texNormal); gl.initTexture(texBadge); gl.initTexture(texPlay)
      uniforms.uTex.value = texNormal
      setTexture(texNormal)
```

Wire the badge listeners to set `badgeState` (as before, via `sync()`), and add the symmetric PLAY listeners + warp:

```js
      playEl = document.querySelector('.herostage__flat .hero__play')
      if (playEl) {
        const onPEnter = () => { playState = true; sync() }
        const onPLeave = () => { playState = false; sync() }
        const onPFocus = () => { playState = matchesSafe(playEl, ':focus-visible'); sync() }
        const onPBlur = () => { playState = false; sync() }
        playEl.addEventListener('pointerenter', onPEnter)
        playEl.addEventListener('pointerleave', onPLeave)
        playEl.addEventListener('focusin', onPFocus)
        playEl.addEventListener('focusout', onPBlur)
        playEl._amkHandlers = { onPEnter, onPLeave, onPFocus, onPBlur } // for cleanup
        warpElToScreen(playEl, gl.domElement)
      }
```

Extend the existing `ResizeObserver` callback to also re-warp PLAY:

```js
        ro = new ResizeObserver(() => {
          if (badgeEl) warpElToScreen(badgeEl, gl.domElement)
          if (playEl) warpElToScreen(playEl, gl.domElement)
        })
        ro.observe(gl.domElement)
```

In the effect cleanup, dispose all three textures and remove the PLAY listeners + reset its transform:

```js
      if (playEl && playEl._amkHandlers) {
        const h = playEl._amkHandlers
        playEl.removeEventListener('pointerenter', h.onPEnter)
        playEl.removeEventListener('pointerleave', h.onPLeave)
        playEl.removeEventListener('focusin', h.onPFocus)
        playEl.removeEventListener('focusout', h.onPBlur)
        playEl.style.transform = ''
        playEl.style.transformOrigin = ''
      }
      if (texNormal) texNormal.dispose()
      if (texBadge) texBadge.dispose()
      if (texPlay) texPlay.dispose()
```

(Rename the badge's existing `texHover` references to `texBadge` and its `hovered`/`focused` flags into `badgeState` so the two elements are symmetric.)

- [ ] **Step 4: Gate**

Run: `npm run build && npm run lint && npm run lint:css`
Expected: all pass.

- [ ] **Step 5: Verify desktop CRT (observable)**

`npm run dev`, Playwright MCP at a desktop viewport (≥1280 wide) → `http://localhost:3000/demo`:
1. The PLAY button is visible **on the curved CRT** under the wordmark.
2. Tab to it → the drawn button inverts (focus visible through the CRT).
3. Click it → VS flash → overlay opens; ✕ returns focus to PLAY.
4. Take a screenshot; if PLAY's drawn pixels and the click hit-area feel misaligned, adjust `py0`/`top:680px` in tandem (this is the expected pixel-tuning knob — see the follow-up note in Task 9).

- [ ] **Step 6: Commit**

```bash
git add src/components/HeroDisplay3D/HeroDisplay3D.jsx
git commit -m "feat(hero): paint PLAY on the CRT + warp its hit-area"
```

---

### Task 7: `Cabinet3D` — YOU WIN screen variant + configurable play action

**Files:**
- Modify: `src/components/Cabinet3D/Cabinet3D.jsx` — `makeAttractTexture()` (parametrize), `CabinetModel`/`Cabinet` prop threading, the `onClick` nav (line ~323-331), and the top-level `Cabinet3D` signature (line ~507)
- Modify: `src/components/Cabinet3D/Cabinet3DMount.jsx` (pass-through already forwards `{...props}` — no edit needed, just confirm)

**Interfaces:**
- Consumes: `GAME_COPY`, `openGameTakeover` (Task 1).
- Produces: `Cabinet3D` (and `Cabinet3DMount`) accept `{ screenVariant?: 'play' | 'youwin', onPlay?: () => void }`. `screenVariant` defaults to `'play'` (today's attract art); `'youwin'` paints `GAME_COPY.youWin`. `onPlay` defaults to `openGameTakeover`; the START button and CRT click call it instead of hard-navigating to `/play`.

- [ ] **Step 1: Import shared helpers + parametrize the texture**

Add near the top of `Cabinet3D.jsx`:

```js
import { GAME_COPY, openGameTakeover } from '@/lib/game'
```

Change `function makeAttractTexture()` to take the variant and branch the headline (keep the same gradient/glow/scanline treatment; only the text changes):

```js
function makeAttractTexture(variant = 'play') {
  // ... unchanged canvas + gradients up to the headline ...
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  if (variant === 'youwin') {
    x.font = '700 84px Arial, sans-serif'
    x.lineJoin = 'round'
    x.lineWidth = 9
    x.strokeStyle = '#ff5000'          // matches --k-orange
    x.strokeText(GAME_COPY.youWin, 256, 168)
    x.fillStyle = '#ffd000'            // matches --k-title-yellow
    x.fillText(GAME_COPY.youWin, 256, 168)
    x.font = '24px "GT Pressura Mono", monospace'
    x.fillStyle = '#3ad76f'            // matches --k-accent-green
    x.fillText('FLAWLESS', 256, 246)
  } else {
    x.font = '700 96px Arial, sans-serif'
    x.lineJoin = 'round'
    x.lineWidth = 9
    x.strokeStyle = '#ff5000'
    x.strokeText(`${GAME_COPY.playGlyph} ${GAME_COPY.playLabel}`, 256, 168)
    x.fillStyle = '#ffd000'
    x.fillText(`${GAME_COPY.playGlyph} ${GAME_COPY.playLabel}`, 256, 168)
    x.font = '24px "GT Pressura Mono", monospace'
    x.fillStyle = '#3ad76f'
    x.fillText(GAME_COPY.pressStart, 256, 246)
  }
  const t = new THREE.CanvasTexture(c)
  t.anisotropy = 8
  return t
}
```

- [ ] **Step 2: Thread `screenVariant` + `onPlay` down to the model**

- Add `screenVariant`/`onPlay` to the `Cabinet3D` default export signature (alongside `armed`, `pinned`, `actProgressRef`, `onSupported`), defaulting `screenVariant = 'play'` and `onPlay = openGameTakeover`.
- Pass them through `<Cabinet .../>` → `<CabinetModel .../>`.
- In `CabinetModel`, use them: `uTex: { value: makeAttractTexture(screenVariant) }`, and in the `onClick` handler replace:

```js
        if (t.userData.kStart || t.userData.kScreen) {
          playSfx('confirm', 0.5)
          window.location.href = '/play'
        }
```

with:

```js
        if (t.userData.kStart || t.userData.kScreen) {
          playSfx('confirm', 0.5)
          onPlay() // default openGameTakeover; the finale plays in place
        }
```

- [ ] **Step 3: Gate**

Run: `npm run build && npm run lint && npm run lint:css`
Expected: all pass. (Behavioral check deferred to Task 8, where the cabinet is mounted in the finale — `Cabinet3D` has no independent mount after `ArcadeCabinet` retires.)

- [ ] **Step 4: Commit**

```bash
git add src/components/Cabinet3D/Cabinet3D.jsx
git commit -m "feat(cabinet): YOU WIN screen variant + configurable play action"
```

---

### Task 8: Finale assembly — trophy cabinet in `FinalCta`, retheme to victory, retire `ArcadeCabinet`

**Files:**
- Modify: `src/sections/FinalCta/FinalCta.jsx` (mount the cabinet; retheme copy/stages), `src/sections/FinalCta/FinalCta.css` (cabinet wrapper + victory re-skin)
- Modify: `src/app/demo/page.jsx` (remove the `ArcadeCabinet` import + `<ArcadeCabinet />`)
- Delete: `src/sections/ArcadeCabinet/ArcadeCabinet.jsx`, `src/sections/ArcadeCabinet/ArcadeCabinet.css`

**Interfaces:**
- Consumes: `Cabinet3DMount` with `screenVariant="youwin"` (Task 7); `Error3DBoundary` (existing); `GAME_COPY` (Task 1).
- Produces: the rethemed closing section. `id="register"` and the registration CTA/facts stay (hero badge still anchors here).

- [ ] **Step 1: Mount the trophy cabinet in `FinalCta`**

In `FinalCta.jsx`, import the mount + boundary + copy:

```jsx
import Cabinet3DMount from '@/components/Cabinet3D/Cabinet3DMount'
import Error3DBoundary from '@/components/Error3DBoundary/Error3DBoundary'
import { GAME_COPY } from '@/lib/game'
```

Inside the `<section id="register" ...>`, above the title, add the cabinet (no `armed`/`pinned`/`actProgressRef` → the static un-armed path: gentle dolly + parallax, no scroll act). It keeps its `.webp` fallback via the boundary:

```jsx
      <div className="finalcta__cabinet">
        <Error3DBoundary
          fallback={
            <img
              className="cab3d__fallback"
              src="/assets/demo/arcade-machine.webp"
              alt="Arcade cabinet showing YOU WIN"
              loading="lazy"
              decoding="async"
            />
          }
        >
          <Cabinet3DMount screenVariant="youwin" />
        </Error3DBoundary>
      </div>
```

- [ ] **Step 2: Retheme GAME OVER → victory**

In `FinalCta.jsx`, change the defeat framing to a win beat. Rename the "GAME OVER" slam to "YOU WIN!" using the shared copy, keeping the same stage sequencer and the reduced-motion immediate-resolve path (do NOT remove the ceremony — only re-skin its words). Concretely:

- Change the `finalcta__finish` placard text `★ FINISH HIM ★` → `★ FLAWLESS VICTORY ★` (and its `data-announce` to `FLAWLESS VICTORY`).
- Change the `.finalcta__gameover-text` content `GAME OVER` → `{GAME_COPY.youWin}`.
- Leave the countdown/scramble/`continue?`→registration flow intact (it still resolves into the registration CTA — the "claim your win" reward). The CTA button, `finalcta__facts`, and `PRESS ANY KEY TO CONTINUE` line stay verbatim.

(If any CSS class name literally encodes "gameover", keep the class names — only the visible text changes — to avoid touching `FinalCta.css`'s stage selectors.)

- [ ] **Step 3: Style the cabinet wrapper (tokens only)**

In `FinalCta.css`, add a sized wrapper so the R3F canvas has a box (reuse the cabinet aspect from the retired section — a tall-ish stage). Example:

```css
.finalcta__cabinet {
  width: 100%;
  max-width: 520px;
  aspect-ratio: 4 / 5;
  margin: 0 auto var(--k-6);
}
.finalcta__cabinet .cab3d,
.finalcta__cabinet .cab3d__fallback {
  width: 100%;
  height: 100%;
}
.finalcta__cabinet .cab3d__fallback {
  object-fit: contain;
}
```

(`.cab3d` is `Cabinet3D`'s own canvas wrapper class; it already exists in `Cabinet3D.css`.)

- [ ] **Step 4: Drop `ArcadeCabinet` from the page + delete its files**

In `src/app/demo/page.jsx`: remove `import ArcadeCabinet from '@/sections/ArcadeCabinet/ArcadeCabinet'` and the `<ArcadeCabinet />` line in `<main>`.

Then:

```bash
git rm src/sections/ArcadeCabinet/ArcadeCabinet.jsx src/sections/ArcadeCabinet/ArcadeCabinet.css
```

- [ ] **Step 5: Gate**

Run: `npm run build && npm run lint && npm run lint:css`
Expected: all pass, with no unresolved `ArcadeCabinet` import.

- [ ] **Step 6: Verify the finale (observable)**

`npm run dev`, Playwright MCP → `http://localhost:3000/demo`, scroll to the last block before the footer:
1. Desktop WebGL: the 3D cabinet renders with **YOU WIN!** on its CRT; clicking the screen/START opens the game overlay in place.
2. Force the fallback (e.g., a WebGL-disabled context / the boundary) → the `arcade-machine.webp` shows instead; page still renders.
3. The registration CTA + facts line are present; the hero's `>>> registration <<<` badge still scroll-anchors to this section (`#register`).
4. There is no cabinet mid-page and no leftover scroll gap where `ArcadeCabinet` used to sit.

- [ ] **Step 7: Commit**

```bash
git add src/sections/FinalCta/ src/app/demo/page.jsx
git commit -m "feat(finale): YOU WIN! trophy cabinet + victory retheme; retire ArcadeCabinet"
```

---

### Task 9: Full-page verification pass (reduced-motion, keyboard, mobile, gates)

**Files:** none created — this task hardens what Tasks 1–8 built and records the pixel-tuning follow-up.

**Interfaces:** consumes the whole feature.

- [ ] **Step 1: Full gate**

Run: `npm run build && npm run lint && npm run lint:css`
Expected: all green.

- [ ] **Step 2: Reduced-motion pass**

Playwright MCP with `prefers-reduced-motion: reduce`, on `/demo`:
- Hero PLAY opens the overlay with **no** VS flash (VsSplash fast path).
- The finale shows the resolved victory state immediately (no countdown/beeps/shake/scramble), cabinet static.

- [ ] **Step 3: Keyboard-only pass**

On `/demo`, using only Tab/Enter/Esc:
- Skip-link → DemoNav → hero **PLAY** reachable with a visible focus indicator (drawn on the CRT on desktop).
- Enter opens the overlay; the game chrome traps focus; Esc/✕ closes and focus returns to PLAY.
- The finale registration CTA is reachable and focus-visible.

- [ ] **Step 4: Mobile pass**

Phone viewport on `/demo`: hero PLAY visible in flow; overlay + on-screen `MobileControls` work; portrait shows the ROTATE prompt; the finale falls back to the cabinet `.webp` if WebGL is unavailable.

- [ ] **Step 5: `/` and `/classic` regression**

Load `/` and `/classic`: hero has **no** PLAY button on `/`; the floating PLAY on `/` still navigates to `/play`; `/classic` unaffected.

- [ ] **Step 6: Record the pixel-tuning follow-up**

The hero CRT PLAY position (`py0` in `buildHeroTexture` ↔ `.hero__play { top }`) and the finale cabinet framing are visual knobs. If a pixel-perfect pass is wanted, run the `figma-pixel-audit`/`run` verification and nudge those two numbers in tandem. Note this in the PR description — it is polish, not a blocker.

- [ ] **Step 7: Commit any tuning + final commit**

```bash
git add -A
git commit -m "chore(demo): verification pass — a11y, reduced-motion, mobile, regressions"
```

---

## Self-review

**Spec coverage** (against `docs/superpowers/specs/2026-07-13-hero-arcade-you-win-finale-design.md`):
- Unit A (hero PLAY, drawn-on-CRT + warp, flat fallback) → Tasks 5–6. ✅
- Unit B (fullscreen in-page takeover, reuse game islands, Esc/✕ close, scroll-lock + focus restore, VS pre-roll, `/play` kept) → Tasks 2–4. ✅ (VS pre-roll via VsSplash reuse — Task 4.)
- Unit C (relocate cabinet, YOU WIN texture, drop act, click→takeover, retheme FinalCta, remove mid-page section) → Tasks 7–8. ✅
- Unit D (shared open-action + copy constants) → Task 1. ✅
- Cross-cutting: no-hardcode (tokens + `GAME_COPY`) enforced per task; a11y/perf fallbacks called out in Tasks 6, 8, 9; `/` untouched via prop-gating (Task 5) + VsSplash availability flag (Task 4). ✅

**Placeholder scan:** no TBD/TODO/"handle edge cases"; every code step shows real code; the one acknowledged visual-tuning knob (Task 9 Step 6) is flagged as polish, not a gap.

**Type/name consistency:** `TAKEOVER_OPEN`, `openGameTakeover`, `takeoverAvailable`/`setTakeoverAvailable`, `GAME_COPY` (Task 1) are used verbatim in Tasks 3–8. `onExit` (Task 2) is consumed in Task 3. `withPlay` (Task 5) consumed by `HeroStage` and queried as `.hero__play` in Task 6. `screenVariant`/`onPlay` (Task 7) consumed in Task 8. `warpElToScreen` (renamed in Task 6) used for both badge and PLAY. Consistent.

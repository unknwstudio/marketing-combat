# Footer Victory Flash Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat, scroll-reveal "YOU SURVIVED" text at the bottom of `/demo` with a proper celebratory moment (full-viewport flash + screen shake + sound + particle burst), by reusing the site's existing arcade `Announcer` system, and leave the footer below it as a genuinely quiet legal block.

**Architecture:** Tag `Footer`'s `<footer>` element with `data-announce`/`data-sound`/`data-announce-burst`. The already-mounted, sitewide `Announcer` component (used elsewhere for "FIGHT!", "STAGE 0X", "FINISH HIM") picks it up via its existing `IntersectionObserver` — no new observer or animation code in `Footer`. `Announcer` gets a small opt-in extension to also fire a `HitSparks` particle burst when `data-announce-burst` is present. `Footer` itself is stripped down to only the pre-existing quiet brand/copyright/legal block.

**Tech Stack:** Next.js 14 (App Router, `'use client'` components), plain CSS (no CSS-in-JS), no test runner in this repo (no jest/vitest configured) — verification is via `npm run dev` + a real, scrolled browser check (not static full-page capture, which does not trigger `IntersectionObserver`-gated reveals) and `npm run build`.

## Global Constraints

- No new npm dependencies — everything needed (`Announcer`, `useJuice`, `useSparks`/`HitSparks`, `arcadeAudio.playSfx`) already exists in the codebase.
- `data-burst` is already a **different**, existing attribute consumed by `ClickBurst` (`src/components/ClickBurst/ClickBurst.jsx`) for pointerdown-triggered bursts at the click position. The new opt-in flag for `Announcer` MUST use a different attribute name (`data-announce-burst`) to avoid colliding with that behavior — reusing `data-burst` on `<footer>` would make every click anywhere inside the footer (e.g. on the legal links) also throw click-position shards, which is not the intended behavior.
- Must not change `FinalCta`'s existing "FINISH HIM"/"GAME OVER" ritual, or any other existing `data-announce` call-out ("FIGHT!", "STAGE 03/04/05") — those must fire exactly as before (no burst, since they won't carry `data-announce-burst`).
- Must preserve `prefers-reduced-motion` behavior: `Announcer`'s existing fade-only variant and `HitSparks.burst()`'s existing no-op guard are both reused as-is, not reimplemented.
- Footer flash copy is the literal string `YOU SURVIVED`; sound clip is `win` (`/public/game/audio/win.mp3`, already present, currently unused).

---

### Task 1: `Announcer` — optional particle burst on call-out

**Files:**
- Modify: `src/components/Announcer/Announcer.jsx`

**Interfaces:**
- Consumes: `useSparks()` from `@/effects/particles/HitSparks` → `{ burst: (x: number, y: number, opts?: object) => void }` (already exported; see `src/components/ClickBurst/ClickBurst.jsx` for the existing call pattern `burst(x, y, { count, power })`).
- Produces: no new exports. Behavior change only — `Announcer` now also fires a burst when the triggering element has a `data-announce-burst` attribute (presence-only, value ignored).

- [ ] **Step 1: Read the current file to confirm line numbers before editing**

Run: `sed -n '1,64p' src/components/Announcer/Announcer.jsx`

Expected: matches the code shown below (imports on lines 1-7, the `IntersectionObserver` callback body around lines 24-40).

- [ ] **Step 2: Add the `useSparks` import**

In `src/components/Announcer/Announcer.jsx`, change:

```js
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useJuice } from '@/effects/juice/useJuice'
import { playSfx } from '@/effects/audio/arcadeAudio'
import './Announcer.css'
```

to:

```js
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useJuice } from '@/effects/juice/useJuice'
import { useSparks } from '@/effects/particles/HitSparks'
import { playSfx } from '@/effects/audio/arcadeAudio'
import './Announcer.css'
```

- [ ] **Step 3: Destructure `burst` and fire it when `data-announce-burst` is present**

Change:

```js
export default function Announcer() {
  const { shake } = useJuice()
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const fired = new Set()
    let hideTimer = 0
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue
          const el = en.target
          const key = el.getAttribute('data-announce')
          if (!key || fired.has(key)) continue
          fired.add(key)
          setMsg(key)
          shake(7)
          const sound = el.getAttribute('data-sound')
          if (sound) playSfx(sound, 0.45)
          window.clearTimeout(hideTimer)
          hideTimer = window.setTimeout(() => setMsg(null), 1300)
          io.unobserve(el)
        }
      },
      { threshold: 0.55 }
    )
    document.querySelectorAll('[data-announce]').forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      window.clearTimeout(hideTimer)
    }
  }, [shake])
```

to:

```js
export default function Announcer() {
  const { shake } = useJuice()
  const { burst } = useSparks()
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const fired = new Set()
    let hideTimer = 0
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue
          const el = en.target
          const key = el.getAttribute('data-announce')
          if (!key || fired.has(key)) continue
          fired.add(key)
          setMsg(key)
          shake(7)
          const sound = el.getAttribute('data-sound')
          if (sound) playSfx(sound, 0.45)
          // opt-in: a handful of call-outs (the end-of-tour payoff) also want
          // a confetti-style particle burst, unlike mid-page ones ("FIGHT!",
          // "STAGE 0X") which don't set this attribute and are unaffected.
          if (el.hasAttribute('data-announce-burst')) {
            burst(window.innerWidth / 2, window.innerHeight / 2, { count: 40, power: 2.2 })
          }
          window.clearTimeout(hideTimer)
          hideTimer = window.setTimeout(() => setMsg(null), 1300)
          io.unobserve(el)
        }
      },
      { threshold: 0.55 }
    )
    document.querySelectorAll('[data-announce]').forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      window.clearTimeout(hideTimer)
    }
  }, [shake, burst])
```

- [ ] **Step 4: Update the file's doc comment to mention the new attribute**

Change:

```js
/**
 * Announcer — arcade "ROUND / FIGHT / FINISH HIM" call-outs. Watches elements
 * tagged `data-announce="TEXT"` (optional `data-sound="clip"`); when one scrolls
 * into view it slams a big pixel title center-screen, shakes the stage, and —
 * only after the user has interacted (autoplay policy) — plays the VO clip.
 * Each fires once.
 */
```

to:

```js
/**
 * Announcer — arcade "ROUND / FIGHT / FINISH HIM" call-outs. Watches elements
 * tagged `data-announce="TEXT"` (optional `data-sound="clip"`, optional
 * `data-announce-burst` for a center-screen HitSparks particle burst); when
 * one scrolls into view it slams a big pixel title center-screen, shakes the
 * stage, and — only after the user has interacted (autoplay policy) — plays
 * the VO clip. Each fires once.
 */
```

- [ ] **Step 5: Verify the file has no syntax errors**

Run: `cd "/Users/elenauvarova/git projects/unknw/marketing-combat" && npx next lint --file src/components/Announcer/Announcer.jsx 2>&1 | tail -20`

Expected: no parse errors reported for this file (pre-existing lint warnings elsewhere in the repo, if any, are out of scope).

- [ ] **Step 6: Commit**

```bash
cd "/Users/elenauvarova/git projects/unknw/marketing-combat"
git add src/components/Announcer/Announcer.jsx
git commit -m "feat(demo): Announcer supports an opt-in particle burst via data-announce-burst"
```

---

### Task 2: Mount `Announcer` inside the `HitSparks` provider

**Files:**
- Modify: `src/app/demo/page.jsx`

**Interfaces:**
- Consumes: nothing new — this only changes where `<Announcer />` sits in the JSX tree.
- Produces: `Announcer` now renders inside a live `HitSparks` context, so `useSparks()` inside it returns the real `burst` function instead of the no-op fallback (`src/effects/particles/HitSparks.jsx:22-24`).

**Why this task is required:** `Announcer` currently renders as a **sibling after** `</HitSparks>` closes (still inside `JuiceProvider`, but outside `HitSparks`). `useSparks()` falls back to a no-op `{ burst: NOOP }` outside the `HitSparks` provider (see `HitSparks.jsx:22-24` and `ClickBurst.jsx`'s own doc comment: "Must be mounted INSIDE the HitSparks provider — outside it useSparks() returns the NOOP fallback and taps silently do nothing."). Without this task, Task 1's burst call would silently never fire.

- [ ] **Step 1: Confirm current structure**

Run: `sed -n '62,104p' src/app/demo/page.jsx`

Expected output shows:
```jsx
      <JuiceProvider>
        <HitSparks>
          {/* delegated [data-burst] pixel-shard bursts — needs useSparks(),
              so it must sit INSIDE the HitSparks provider (outside it the
              hook returns the no-op fallback and taps silently do nothing) */}
          <ClickBurst />
          <PixelCursor enabled>
            ...
          </PixelCursor>
        </HitSparks>

        {/* inside the provider so it can trigger screen-shake; its overlay is
            portalled to <body> so the fixed positioning stays viewport-correct */}
        <Announcer />
      </JuiceProvider>
```

- [ ] **Step 2: Move `<Announcer />` inside `<HitSparks>`, next to `<ClickBurst />`**

Change:

```jsx
      <JuiceProvider>
        <HitSparks>
          {/* delegated [data-burst] pixel-shard bursts — needs useSparks(),
              so it must sit INSIDE the HitSparks provider (outside it the
              hook returns the no-op fallback and taps silently do nothing) */}
          <ClickBurst />
          <PixelCursor enabled>
```

to:

```jsx
      <JuiceProvider>
        <HitSparks>
          {/* delegated [data-burst] pixel-shard bursts — needs useSparks(),
              so it must sit INSIDE the HitSparks provider (outside it the
              hook returns the no-op fallback and taps silently do nothing) */}
          <ClickBurst />
          {/* also needs useSparks() for its own opt-in data-announce-burst
              flash burst (the footer's end-of-tour payoff); its overlay is
              portalled to <body>, so where it sits in this tree only affects
              which providers it can read from, not where it renders */}
          <Announcer />
          <PixelCursor enabled>
```

Then delete the now-stale trailing block (the old `<Announcer />` plus its comment, right before `</JuiceProvider>`):

```jsx
        </HitSparks>

        {/* inside the provider so it can trigger screen-shake; its overlay is
            portalled to <body> so the fixed positioning stays viewport-correct */}
        <Announcer />
      </JuiceProvider>
```

becomes:

```jsx
        </HitSparks>
      </JuiceProvider>
```

- [ ] **Step 3: Run the dev server and confirm the page still renders with no console errors**

Run:
```bash
cd "/Users/elenauvarova/git projects/unknw/marketing-combat"
npm run dev > /tmp/footer-flash-dev.log 2>&1 &
sleep 1
until grep -q "Ready in" /tmp/footer-flash-dev.log; do sleep 1; done
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/demo
```

Expected: `200`. Also check `/tmp/footer-flash-dev.log` and the terminal running `npm run dev` for compile errors — expect none.

- [ ] **Step 4: Commit**

```bash
cd "/Users/elenauvarova/git projects/unknw/marketing-combat"
git add src/app/demo/page.jsx
git commit -m "fix(demo): mount Announcer inside HitSparks so its opt-in burst can fire"
```

---

### Task 3: Simplify `Footer` to a single payoff moment

**Files:**
- Modify: `src/sections/Footer/Footer.jsx`
- Modify: `src/sections/Footer/Footer.css`

**Interfaces:**
- Consumes: nothing (no more hooks/refs — `Footer` becomes a plain presentational component). Its `<footer>` element is now the trigger element `Announcer` (Task 1) watches for `[data-announce]`.
- Produces: no exports change (`export default function Footer()` stays the same signature: no props).

- [ ] **Step 1: Replace the full contents of `Footer.jsx`**

Replace the entire file with:

```jsx
'use client'

import './Footer.css'

/**
 * Footer — the end-of-tour payoff is a full-viewport arcade call-out (see
 * Announcer, which watches data-announce/data-sound/data-announce-burst
 * below), the same system used for "FIGHT!" / "STAGE 0X" / "FINISH HIM"
 * elsewhere on /demo. The footer itself stays deliberately quiet once the
 * flash fades — no second loud element competing with that moment.
 */
export default function Footer() {
  return (
    <footer
      className="dsec footer"
      aria-label="Footer"
      data-announce="YOU SURVIVED"
      data-sound="win"
      data-announce-burst
    >
      <div className="footer__quiet">
        <span className="footer__title">AI MARKETING KOMBAT · JULY 2026 · BARCELONA</span>
        <div className="footer__legal">
          <span>© 2026 AI Marketing Kombat. All rights reserved.</span>
          {/* No live legal pages yet — a span with the destination text (not
              href="#") avoids the classic "link that teleports to the top of
              a 16 000px page" trap. Swap these for real <a> once /legal,
              /conduct and /privacy exist. */}
          <span className="footer__links">
            <span className="footer__linkPending">Legal information</span>
            <span aria-hidden="true">·</span>
            <span className="footer__linkPending">Code of conduct</span>
            <span aria-hidden="true">·</span>
            <span className="footer__linkPending">Privacy</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Replace the full contents of `Footer.css`**

Replace the entire file with:

```css
/* Quiet legal footer — the loud payoff moment lives in the arcade Announcer
   (Footer.jsx tags <footer> with data-announce/data-sound/data-announce-burst),
   not here. This block stays deliberately understated. */
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 40px;
  padding-top: 80px;
  padding-bottom: 72px;
  background: #000;
  border-top: 2px solid var(--k-line);
}

.footer__quiet {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.footer__title {
  font-family: var(--k-font-mono);
  font-size: 15px;
  letter-spacing: 0;
  color: #6f6f7a;
  text-transform: uppercase;
}

.footer__legal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-family: var(--k-font-mono);
  font-size: 14px;
  letter-spacing: -0.2px;
  color: #565660;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.footer__links a,
.footer__linkPending {
  color: #6f6f7a;
}

.footer__links a:hover {
  color: #fff;
  text-decoration: underline;
}

@media (max-width: 1023px) {
  .footer {
    gap: 28px;
    padding-top: 48px;
    /* the fixed ModeSwitcher pill (~46px tall + 16px offset + safe-area) sits
       on top of the page everywhere, footer included — extra clearance here
       so "Legal information / Code of conduct / Privacy" isn't hidden under it */
    padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px));
  }

  .footer__title {
    font-size: 11px;
  }

  .footer__legal {
    font-size: 11px;
  }
}
```

- [ ] **Step 3: Grep to confirm no other file references the deleted classes/exports**

Run:
```bash
cd "/Users/elenauvarova/git projects/unknw/marketing-combat"
grep -rn "footer__payoff\|footer__kicker\|footer__survived\|footer__letter" src/
```

Expected: no matches (empty output). If any match appears outside `Footer.jsx`/`Footer.css`, stop and investigate before continuing — it means something else depended on the removed markup.

- [ ] **Step 4: Commit**

```bash
cd "/Users/elenauvarova/git projects/unknw/marketing-combat"
git add src/sections/Footer/Footer.jsx src/sections/Footer/Footer.css
git commit -m "feat(demo): footer payoff becomes the Announcer flash; footer itself stays quiet-only"
```

---

### Task 4: End-to-end verification and build check

**Files:**
- None modified — this task only verifies Tasks 1-3 together in a real browser and via a production build.

**Interfaces:** N/A (verification only).

- [ ] **Step 1: Confirm the dev server is running**

Run:
```bash
cd "/Users/elenauvarova/git projects/unknw/marketing-combat"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/demo
```

Expected: `200`. If not running, start it: `npm run dev > /tmp/footer-flash-dev.log 2>&1 &` and wait for `Ready in` in the log before continuing.

- [ ] **Step 2: Write the verification script**

Locate the local Playwright install (already used in this session) or fall back to `npx --no-install playwright` if unavailable:

```bash
find ~/.npm/_npx -maxdepth 3 -iname "playwright" -type d 2>/dev/null | head -1
```

Create `/tmp/verify-footer-flash.cjs` with this content (replace `PLAYWRIGHT_PATH` with the path found above):

```js
const { chromium } = require('PLAYWRIGHT_PATH');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('http://localhost:3000/demo', { waitUntil: 'networkidle', timeout: 60000 });

  // Confirm the footer carries the expected attributes before it's ever observed.
  const attrs = await page.evaluate(() => {
    const f = document.querySelector('footer.footer');
    return f && {
      announce: f.getAttribute('data-announce'),
      sound: f.getAttribute('data-sound'),
      hasBurst: f.hasAttribute('data-announce-burst'),
      hasOldPayoffMarkup: !!document.querySelector('.footer__payoff, .footer__survived, .footer__kicker'),
    };
  });
  console.log('footer attrs:', JSON.stringify(attrs));
  if (!attrs) throw new Error('footer.footer not found');
  if (attrs.announce !== 'YOU SURVIVED') throw new Error(`expected data-announce="YOU SURVIVED", got ${attrs.announce}`);
  if (attrs.sound !== 'win') throw new Error(`expected data-sound="win", got ${attrs.sound}`);
  if (!attrs.hasBurst) throw new Error('expected data-announce-burst on <footer>');
  if (attrs.hasOldPayoffMarkup) throw new Error('old payoff markup (.footer__payoff etc.) still present');

  // Scroll to the very bottom and give the IntersectionObserver + slam
  // animation + timers time to run.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);

  const midFlash = await page.evaluate(() => {
    const el = document.querySelector('.announce__text');
    return el ? el.textContent : null;
  });
  console.log('mid-flash announce text:', midFlash);
  if (midFlash !== 'YOU SURVIVED') throw new Error(`expected the flash to read "YOU SURVIVED", got ${JSON.stringify(midFlash)}`);

  // After the flash's ~1.3s auto-hide, nothing loud should remain.
  await page.waitForTimeout(1200);
  const afterFlash = await page.evaluate(() => ({
    announceGone: !document.querySelector('.announce__text'),
    quietVisible: !!document.querySelector('.footer__quiet'),
  }));
  console.log('after-flash state:', JSON.stringify(afterFlash));
  if (!afterFlash.announceGone) throw new Error('flash overlay did not auto-hide');
  if (!afterFlash.quietVisible) throw new Error('quiet footer block missing');

  if (errors.length) throw new Error('page errors: ' + errors.join(' | '));

  console.log('PASS');
  await browser.close();
})().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
```

- [ ] **Step 3: Run the verification script**

Run: `node /tmp/verify-footer-flash.cjs`

Expected output ends with `PASS`. If it prints `FAIL: ...`, fix the underlying issue (re-check Tasks 1-3) before continuing — do not skip.

- [ ] **Step 3b: Confirm the reduced-motion path doesn't throw**

This repo doesn't add new reduced-motion logic (Task 1/3 reuse `Announcer`'s existing fade-only CSS and `HitSparks.burst()`'s existing no-op guard as-is) — this step is a regression check that wiring `Announcer` into a new provider position (Task 2) and adding the burst call (Task 1) didn't break that existing guarantee.

Create `/tmp/verify-footer-flash-reduced-motion.cjs` (same `PLAYWRIGHT_PATH` as Step 2):

```js
const { chromium } = require('PLAYWRIGHT_PATH');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.goto('http://localhost:3000/demo', { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);

  const text = await page.evaluate(() => {
    const el = document.querySelector('.announce__text');
    return el ? el.textContent : null;
  });
  console.log('reduced-motion flash text (may already be past its 1.3s window):', text);

  if (errors.length) throw new Error('page errors under reduced motion: ' + errors.join(' | '));
  console.log('PASS');
  await browser.close();
})().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
```

Run: `node /tmp/verify-footer-flash-reduced-motion.cjs`

Expected: `PASS`, with no thrown `pageerror` events (a broken `burst()` call under reduced motion, e.g. from a `window` access ordering bug, would surface here). The `text` line is informational only — reduced-motion still shows the flash per `Announcer.css`'s `@media (prefers-reduced-motion: reduce)` block, just without the slam animation, so it's timing-sensitive and not asserted strictly.

- [ ] **Step 4: Manually confirm the visual/audio result once**

Run: `open http://localhost:3000/demo` (or navigate there in a real browser), scroll to the very bottom at normal reading speed, and confirm by eye/ear:
- a full-screen "YOU SURVIVED" flash with the chromatic red/cyan split, same visual family as "FIGHT!" earlier on the page
- a brief screen shake
- (if sound is unmuted and this isn't the very first interaction on a fresh load — browsers block audio before a user gesture) a victory sound
- a burst of pixel shards from screen center
- after ~1.3s, only the quiet "AI MARKETING KOMBAT · JULY 2026 · BARCELONA" / copyright / legal-links block remains, with no leftover large text

- [ ] **Step 5: Confirm existing call-outs are unaffected**

Run:
```bash
cd "/Users/elenauvarova/git projects/unknw/marketing-combat"
grep -n "data-announce" src/sections/Stages/Stages.jsx src/sections/Tracks/Tracks.jsx src/sections/Arenas/Arenas.jsx src/sections/Marquee/Marquee.jsx src/sections/FinalCta/FinalCta.jsx
```

Expected: "STAGE 03/04/05", "FIGHT!", and (inside FinalCta, via its own `data-announce="FINISH HIM"`) are all still present, unmodified, and **do not** have `data-announce-burst` — confirm by inspecting each line's surrounding JSX has no `data-announce-burst` attribute added.

- [ ] **Step 6: Production build check**

Run:
```bash
cd "/Users/elenauvarova/git projects/unknw/marketing-combat"
npm run build 2>&1 | tail -40
```

Expected: build completes successfully (no type/compile errors related to `Footer`, `Announcer`, or `src/app/demo/page.jsx`).

- [ ] **Step 7: Stop the dev server**

Run: `pkill -f "next dev"` (only if you started it yourself in Step 1/earlier steps for this verification pass).

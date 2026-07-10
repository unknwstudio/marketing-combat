# /demo — effects research (Awwwards · Codrops · Mobbin · WebGL)

Curated, tailored to our stack (Next 14 + React 18, static export; existing `CRTOverlay`,
`JuiceProvider` screen-shake, `HitSparks`, `PixelCursor`, `GlitchText`, a Phaser game at `/play`,
ElevenLabs announcer audio). Everything must honor `prefers-reduced-motion` (we already do globally)
and keep pixels crisp (`image-rendering: pixelated`).

Effort = S (hours) / M (a day) / L (multi-day). Impact = 🔥 signature / ✦ nice.

---

## TL;DR — recommended shortlist (best bang, fits our theme)

1. **WebGL CRT upgrade** on the hero (barrel curvature + phosphor mask + chromatic aberration + bloom + scanline roll) — replaces our flat CSS CRT with a real shader. `@pixi/filters` `CRTFilter` or `crt-fx`. **M · 🔥**
2. **MK "announcer" scroll moments** — as each `ROUND 01/03/04/05` / `FIGHT!` / `FINISH HIM` section enters view, flash a big pixel title + screen-shake (reuse `JuiceProvider`) + optional announcer VO (we already have the audio). GSAP ScrollTrigger. **M · 🔥**
3. **Health-bar scroll progress** — a Mortal-Kombat health bar pinned top as the scroll indicator (ties to the hero's "will you survive? 15%"). Drains as you scroll; "ROUND" pips. Pure CSS/JS. **S · 🔥**
4. **Character-select hover on portraits** — fighters/bosses/organizers get an RGB-split + scanline-sweep + slight zoom on hover, "selected" flash + arcade blip. `@pixi/filters` (`RGBSplitFilter`,`GlitchFilter`) or VFX-JS. **M · ✦**
5. **Konami code easter egg** — `↑↑↓↓←→←→ B A` → full-screen "FATALITY" pixel flash + launches `/play`. Cheap, delightful, on-brand. **S · 🔥**

---

## A. Leverage what we already have (S, cheap wins)

- **Announcer VO on scroll** — we already generate ElevenLabs announcer clips (fight/flawless/finish him). Fire them on section-enter (muted by default, unlock on first user interaction). Pairs with #2.
- **CTA juice** — REGISTRATION buttons: magnetic hover (translate toward cursor) + on-click `HitSparks` + screen-shake + arcade SFX. We have the sparks + shake already; just wire to the CTAs.
- **Pixel cursor trail** — extend `PixelCursor` with a fading after-image trail, and a sword-slash swipe on click.
- **Marquee reacts to scroll velocity** — the `FIGHT!` ticker speeds up / briefly reverses with scroll speed (a classic Awwwards touch). ~10 lines on the existing marquee.
- **Count-up + bar-fill on scroll-in** — Stats (`300+`, `$100M+`) count up; Battle-Arena difficulty stars light up one-by-one; the hero energy meter animates. IntersectionObserver, no deps.

## B. WebGL / shaders (M–L, the "wow")

Our theme is 2D pixel-art, so **PixiJS + `@pixi/filters` is the sweet spot** — lighter than three.js and it ships the exact filters we want out of the box: `CRTFilter`, `GlitchFilter`, `RGBSplitFilter`, `PixelateFilter`, `ShockwaveFilter`, `BloomFilter`. Alternatives noted per effect.

- **CRT shader (whole-hero or whole-page overlay)** — real barrel distortion, phosphor/aperture mask, scanline roll, chromatic aberration, vignette, flicker. Libs: [`@pixi/filters` CRTFilter], [crt-fx], [CRTFilter.js], or Codrops' **Efecto** (ASCII + dithering + CRT). **M · 🔥**
- **Portrait hover distortion** — RGB-split + wave displacement + a scanline that sweeps down on hover; on "select", a shockwave ripple. `@pixi/filters` or **VFX-JS** (applies WebGL effects to existing DOM `<img>` with almost no rewrite). **M · ✦**
- **Pixel-dissolve section transitions** — mosaic/pixelate wipe between sections (grows the pixel size then resolves), or a "digital glitch" cut. Codrops WebGL shader transitions / `PixelateFilter`. Matches the pixel language. **M · ✦**
- **Animated synthwave hero backdrop** — a subtle retro sun + perspective grid + parallax fighters behind the wordmark (cf. **Threads**). Shader or three.js plane; keep it low and behind the CRT. **M · ✦**
- **Text chromatic-glitch on headings** — the `hackathon tracks` / `battle arenas` titles get an animated RGB-aberration + noise on enter/hover. `chromatic-distortion` GLSL or `@pixi/filters` GlitchFilter (we already have `GlitchText` for the CSS version). **S–M · ✦**
- **VFX-JS** deserves a call-out: "WebGL effects made easy" — glitch/pixelate/shine on any DOM node without a canvas rewrite. Lowest-friction way to add shader flair to the current static sections. **S–M**

## C. Scroll-driven storytelling (M)

- **GSAP ScrollTrigger** is the backbone: pin a section, drive the announcer moments, stagger card reveals, parallax layers. `ScrollSmoother` + `SplitText` for premium easing/among headings.
- **Pinned "ROUND" reveals** — pin each ROUND section briefly and play its intro (title slams in, shake, pips advance) before releasing scroll.
- **Roster stagger** — the 5 fighters / 4 arenas / crew cards slide + fade in one-by-one like a select screen populating.
- **Horizontal "select screen"** — turn the fighters/judges row into a horizontal-scroll strip on desktop (Awwwards staple).

## D. Signature / interactive (L, the headliner)

- **Interactive arcade cabinet** — a section framed as a pixel/3D arcade cabinet whose screen boots our existing **Phaser game** (`/play`) inline; "INSERT COIN → PRESS START". References: **basement.studio** Lab (3D cabinet you operate) and **Shader** (CRT computer running a game). We already have the game — this surfaces it as the centerpiece. **L · 🔥**
- **"Playable" hero micro-game** — the existing `PRESS ANY KEY TO CONTINUE` becomes real: a key triggers a tiny fighter clash animation, or a 10-second combo minigame that scores you and feeds the CTA (cf. **MANA Yerba Maté** "Press Space to jump", **Shopify Editions** "Play Horizon Drive"). **L · 🔥**
- **Konami easter egg** — as in the shortlist; trivial, high delight. **S · 🔥**

## E. Perf / UX guardrails

- Gate all WebGL behind `prefers-reduced-motion` + a mobile check; ship a static fallback (we already reflow < 1024px).
- Lazy-init canvases via IntersectionObserver; pause when offscreen / tab hidden; cap DPR on mobile.
- Keep one shared WebGL context if possible (Pixi app) rather than many.
- Audio only after a user gesture (autoplay policy); provide a mute toggle in the existing `ModeSwitcher` area.
- Preserve crisp pixels: nearest-neighbor sampling in shaders, `image-rendering: pixelated` on outputs.

---

## References

**Codrops / WebGL**
- [Efecto — real-time ASCII & dithering WebGL shaders (scanlines, curvature, chroma, vignette)](https://tympanus.net/codrops/2026/01/04/efecto-building-real-time-ascii-and-dithering-effects-with-webgl-shaders/)
- [VFX-JS — WebGL effects made easy (apply to DOM)](https://tympanus.net/codrops/2025/01/20/vfx-js-webgl-effects-made-easy/)
- [Animate WebGL shaders with GSAP — ripples, reveals, blur](https://tympanus.net/codrops/2025/10/08/how-to-animate-webgl-shaders-with-gsap-ripples-reveals-and-dynamic-blur-effects/)
- [WebGL shader techniques for dynamic image transitions](https://tympanus.net/codrops/2025/01/22/webgl-shader-techniques-for-dynamic-image-transitions/)
- [Creative WebGL image transitions](https://tympanus.net/codrops/2019/11/05/creative-webgl-image-transitions/)

**CRT / retro shader libs**
- [crt-fx — scanlines, phosphor mask, chromatic aberration, bloom, barrel distortion](https://github.com/stefanlegg/crt-fx)
- [CRTFilter.js — WebGL CRT for canvas](https://github.com/Ichiaka/CRTFilter)
- [chromatic-distortion — animated RGB aberration text shader](https://github.com/npanium/chromatic-distortion)
- [WebGL lens distortion hover (Curtains.js + GSAP)](https://freefrontend.com/code/webgl-lens-distortion-hover-2026-04-29/)

**Scroll**
- [GSAP Scroll / ScrollTrigger](https://gsap.com/scroll/) · [60+ ScrollTrigger examples](https://freefrontend.com/scroll-trigger-js/)

**Awwwards collections**
- [WebGL](https://www.awwwards.com/websites/webgl/) · [Retro](https://www.awwwards.com/websites/retro/) · [Games](https://www.awwwards.com/awwwards/collections/games/)

**Mobbin references (open the sites for live interaction)**
- [basement.studio — interactive 3D arcade cabinet + wireframe room](https://mobbin.com/sites/sections/28a88d90-f813-478b-bb89-336dbe1e48a0)
- [Threads — pixel-art avatars on a synthwave perspective grid](https://mobbin.com/sites/sections/83216193-a896-4546-bbec-161d1d1844c3)
- [Shader — retro CRT computer running an isometric game](https://mobbin.com/sites/sections/acc902bb-ea91-4876-ad44-a2378a7c778e)
- [MANA Yerba Maté — "Press Space to jump" playable character](https://mobbin.com/sites/sections/1bdcc550-68a0-4c2b-b010-473839dbf7bc)
- [Cofounder — pixel-art clouds/trees framing the UI](https://mobbin.com/sites/sections/29e1070c-b13e-4436-8325-40639ea38277)
- [Shopify Editions — "Play Horizon Drive" mini-game](https://mobbin.com/sites/sections/47c5f830-b25e-4912-8484-47377cd8a238)
- [Navigate — "Launch Game" nav + arcade tiles](https://mobbin.com/sites/sections/6509a3b4-cee3-4e78-85d4-6bf922f7f4f7)
- [Parker AI — vintage Macintosh boot screen](https://mobbin.com/sites/sections/8df76ac8-aff2-47cf-b3d3-b13081d23914)

---

## Addendum — deep dive

Second research pass (background agent). More concrete/implementable than the first doc: every technique carries the effect, why it fits our MKII/16-bit theme, a real reference, the exact library/API, a code-sketch, effort (S/M/L), and perf/reduced-motion notes. Stack reminder: **Next 14 `output: 'export'` (static) + React 18 + plain CSS** — every WebGL/canvas/audio thing is a **client component** (`'use client'`, `dynamic(() => …, { ssr: false })`), lazy-mounted via `IntersectionObserver`, gated behind `prefers-reduced-motion` + a mobile check.

### 1. Award-winning retro/arcade/WebGL sites — mapped to our page
- **Lacoste "Ace Breaker"** (members-play.lacoste.com/ace-breaker-rg) — a tightly-scoped playable Three.js mini-game that IS the campaign → strongest proof for the "arcade cabinet boots our Phaser game" idea.
- **Shopify Editions Spring 2026** — scroll-sequenced "staged moments" with particle-dispersing type → our ROUND 01…05 / FIGHT! / FINISH HIM as discrete staged beats.
- **The Crumbskees** (Awwwards SOTD) — full retro click arcade game + chiptune, cohesive pixel identity end-to-end.
- **Cartier Watches & Wonders** — six 3D "alcoves" with GLSL + GSAP + per-section Web Audio → blueprint for tasteful per-ROUND announcer audio.
- **basement.studio Lab** — operable 3D arcade cabinet (the exact cabinet framing).
- **Shader** — CRT computer running an isometric game (hero CRT over live content).
- **daenavan/crt-threejs** (daenavan.github.io/crt-threejs) + **cool-retro-term WebGL** — open, readable CRT shaders to crib uniform values from (curvature, scanlines, chroma, vignette, phosphor/burn-in).

### 2. Codrops tutorials (2024–2026) with reusable code
- Pixelation/retro: [Real-Time Dithering Shader (2025-06-04)](https://tympanus.net/codrops/2025/06/04/building-a-real-time-dithering-shader/) (Bayer 4×4 + pixelation, composable post-pass) · [Efecto — ASCII+dither+CRT (2026-01-04)](https://tympanus.net/codrops/2026/01/04/efecto-building-real-time-ascii-and-dithering-effects-with-webgl-shaders/) · Maxime Heckel [Art of Dithering & Retro Shading](https://blog.maximeheckel.com/posts/the-art-of-dithering-and-retro-shading-web/) — the definitive recipe (quantize → Bayer dither → CRT), single-pass. This is what makes it read authentically 16-bit vs "blur + scanline PNG".
- Glitch text: [Animating Letters with Shaders (2025-03-24)](https://tympanus.net/codrops/2025/03/24/animating-letters-with-shaders-interactive-text-effect-with-three-js-glsl/).
- Hover distortion: [Shader Techniques for Image Transitions (2025-01-22)](https://tympanus.net/codrops/2025/01/22/webgl-shader-techniques-for-dynamic-image-transitions/) · [Animate Shaders with GSAP — ripples/reveals (2025-10-08)](https://tympanus.net/codrops/2025/10/08/how-to-animate-webgl-shaders-with-gsap-ripples-reveals-and-dynamic-blur-effects/) · [VFX-JS (2025-01-20)](https://tympanus.net/codrops/2025/01/20/vfx-js-webgl-effects-made-easy/) (glitch/pixelate on DOM imgs, lowest friction).
- Scroll: [Layered Zoom (2025-10-29)](https://tympanus.net/codrops/2025/10/29/building-a-layered-zoom-scroll-effect-with-gsap-scrollsmoother-and-scrolltrigger/) · [3D Scroll Text (2025-11-04)](https://tympanus.net/codrops/2025/11/04/creating-3d-scroll-driven-text-animations-with-css-and-gsap/) · [SVG Mask Transitions (2026-03-11)](https://tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/) (pixel-blind wipe) · [SplitText→MorphSVG (2025-05-14)](https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/) (letters shatter = cheap FATALITY). Note: **all GSAP plugins are free since 2024**.

### 3. Lightweight WebGL — `@pixi/filters` filter params (v8; verify installed version)
- **CRTFilter** — `curvature:1, lineWidth:1, lineContrast:0.25, noise:0.3, vignetting:0.3, time` (animate `time`+`seed` for roll/flicker) → hero/page CRT.
- **GlitchFilter** — `slices:5, offset:100, red/green/blue:{x,y}, fillMode` → title glitch / "FINISH HIM" hit.
- **RGBSplitFilter** — `red:[-10,0], green:[0,0], blue:[0,10]` → portrait hover split.
- **PixelateFilter** — `size` (animate small→large→resolve) → mosaic section dissolve.
- **ShockwaveFilter** — `center, amplitude:30, wavelength:160, speed:500, time` → SELECT ripple.
- **BloomFilter** — `strength` → neon wordmark / hit-flash.

Bundle/effort: PixiJS+filters ~150 KB gz (prebuilt filters, best ROI, one shared WebGL context) · **ogl** ~15–20 KB (write your own GLSL) · three.js+postprocessing ~150 KB+ (overkill for 2D) · **raw single-shader `<canvas>`** 0-dep (best for just a fullscreen CRT pass). Static-export: import Pixi/ogl inside `useEffect` or `dynamic(ssr:false)`; nothing runs at build; cap DPR ~1.5 on mobile; nearest-neighbor + `image-rendering:pixelated`.

### 4. Arcade juice — implementation gotchas
- **Hit-stop**: brief global freeze on impact (~90 ms) is the difference between limp and punchy — pause animations then release into shake.
- **Screen-shake restart bug**: re-adding the class same-frame is coalesced → force reflow `el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake')`; use decaying amplitude (`e^-t`, random dir), shake a wrapper not `<body>`.
- **Particle bursts**: write to the DOM/canvas directly, NOT React state (re-renders tank FPS).
- **Combo counter**: pop `scale(1.4)→1` with `steps()`, pitch-up per streak, board-shake at milestones; count-up via `@property --num` + CSS counters.
- **Announcer timing**: ~120–200 ms lead so the title-slam lands before the VO; debounce fast scroll (kill previous clip).
- **PRESS-START blink**: `steps(1)` hard on/off (not a fade) sells the CRT. Coin-insert = SFX + credits tick doubling as the audio-unlock gesture.
- **Magnetic buttons**: translate toward cursor ramped by proximity (GSAP quickTo or `x=(e.clientX-cx)*0.3`); pair with HitSparks+shake.
- **Cursor trail**: ring-buffer after-image on PixelCursor + slash on click; off on touch/reduced-motion.
- Gate shake/parallax/hit-stop behind `prefers-reduced-motion: no-preference`; keep flash/sound/color, drop movement.

### 5. Sound for web arcades
- **Autoplay unlock**: create/resume `AudioContext` inside the first gesture (`if(ctx.state==='suspended') await ctx.resume()`) — our "INSERT COIN / PRESS ANY KEY" is the unlock. Refs: [Chrome Web Audio autoplay](https://developer.chrome.com/blog/web-audio-autoplay), [MDN Autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).
- **Audio sprites** (one file, offsets) for low latency; **[howler.js](https://howlerjs.com/)** is the pragmatic choice (Web Audio + HTML5 fallback, `sprite:{}`, master GainNode).
- **Ducking**: route SFX + announcer to separate GainNodes; ramp the chiptune bed down during VO (`gain.setTargetAtTime(0.25, t, 0.1)`).
- Provide a **mute toggle** (in ModeSwitcher), persist to localStorage, **default muted**.

### 6. 2025–2026 trends worth adopting
- **CSS scroll-driven animations** (`animation-timeline: scroll()/view()`) — zero-JS; perfect for the health-bar indicator + ROUND pips. Safari lacks it → [scroll-timeline polyfill](https://github.com/flackr/scroll-timeline) or JS fallback. ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations), [Chrome](https://developer.chrome.com/blog/scroll-triggered-animations))
- **View Transitions API** (cross-doc in Chrome/Edge 126+, Safari 18.2+, Firefox 144) — native pixel/CRT wipe for `/demo → /play`.
- **WebGPU baseline** across browsers (2025–26); three.js `three/webgpu` auto-falls back — future path if the 3D synthwave backdrop grows.
- **Scrollytelling as staged moments** is the dominant 2026 pattern.

### Build-next (agent's picks)
1. Real CRT hero via `@pixi/filters` CRTFilter (or the 0-dep raw shader) — **M · 🔥**
2. CSS scroll-driven health-bar indicator (+ Safari polyfill) — **S · 🔥**
3. Announcer "staged moments" — pin ROUND, 150 ms title-slam → ducked VO → hit-stop + decaying shake (reflow-restart fix) — **M · 🔥**
4. CTA juice pass — magnetic + hit-stop + direct-DOM particles + coin/hit SFX (first click = audio unlock) — **S · 🔥**
5. Portrait character-select hover — VFX-JS or `@pixi/filters` RGBSplit + scanline + Shockwave on SELECT — **M · ✦**
6. Pixel-dither section transition (+ View-Transitions pixel wipe to /play) — **M · ✦**

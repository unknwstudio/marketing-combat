# Principles of Creating Pixel-Art Fighting Games

**Working reference for "AI Marketing Kombat"** — a browser pixel-art fighter (MK-style skin, 5 marketer archetypes), React 18 + Next.js static export on Vercel, battle stage in **Phaser 3** as a client-only island. Single-player vs AI first; async multiplayer later (no rollback/real-time netcode). Characters are AI-generated + post-pixelated pose sheets (~125px-tall sprites on flat `#FF00FF` backgrounds).

Skim it. Each section = concrete rules → **APPLIES TO US** → sources at the bottom.

---

## 1. Pixel-Art Fundamentals for Games

**The two rules that make or break everything:**

- **Nearest-neighbor filtering + integer scaling, always together.** Nearest-neighbor keeps edges hard; integer scaling keeps every source pixel the same on-screen size. You need both. Skip nearest-neighbor → blur. Skip integer scaling → some pixel columns render fatter than others and straight lines look lumpy.
- **Scale by whole numbers only: 2x, 3x, 4x, 5x.** Never 1.5x, 2.3x, or "fit to window" fractional scaling. At 3x, every source pixel becomes an identical 3×3 block. Fractional scale = uneven pixels = the #1 thing that makes pixel art look cheap.
- **Pick ONE canonical internal resolution and ONE pixel density.** All art shares the same pixels-per-detail budget. A 32-tall detail on the character and a 32-tall detail on a prop must read as the "same size" pixels. Mixed pixel scales (a crisp character over a differently-scaled background, or a hi-res HUD baked into the pixel layer) is the most common amateur tell.
- **Web knobs you must set:**
  - CSS on the canvas/image: `image-rendering: pixelated;` (Chrome/Edge/Safari) — also keep `image-rendering: crisp-edges;` as a fallback token.
  - Canvas 2D context: `ctx.imageSmoothingEnabled = false;`
  - In Phaser: set `pixelArt: true` in the game config (it flips texture filtering to NEAREST and enables `roundPixels`). It defaults to **false**, so you must set it.
- **Avoid sub-pixel jitter.** Snap sprite/camera positions to integers at the internal resolution before the upscale. A sprite drawn at x=10.4 vs 10.6 will "shimmer" between pixel rows as it moves. Round positions (or let Phaser's `roundPixels` do it) and keep the camera on integer coordinates.
- **Don't rotate or non-integer-scale pixel art at runtime.** Rotation resamples the grid → jagged, crawling edges ("pixel soup"). Free scaling does the same. If a sprite must face both directions, **flip horizontally** (mirror, `flipX`) — that's lossless. If something must "rotate" (a spinning special, a tilt), pre-render the rotation as discrete animation frames instead of rotating the sprite transform.
- **Limited palettes** unify the look and hide AI-generation noise. A per-character palette of ~16–32 colors (plus shared shadow/rim tones) reads as deliberate; hundreds of near-duplicate colors read as a screenshot someone shrank.

**APPLIES TO US:**
- Your characters are ~125px tall. Choose an **internal render resolution around 480×270** (16:9). A 125px fighter then fills ~46% of frame height — correct fighter proportions — and 480×270 integer-scales cleanly to 1440×810 (3x) and 1920×1080 (4x). Let Phaser letterbox/scale the whole canvas by integer factors to fit the browser; never let CSS stretch it fractionally.
- Set `pixelArt: true`, `roundPixels: true`, `antialias: false` in the Phaser config, and `image-rendering: pixelated` on the wrapping `<canvas>`.
- Because sprites are AI-generated, they will NOT natively share one pixel density or palette — **normalization is mandatory** (see §6). Decide the canonical density once (e.g. character sprites authored at 125px tall, no per-character rescaling), then hold everyone to it.
- Face left/right by `flipX`, not by generating mirrored art. Never rotate the special-move sprite; bake rotation into frames.

Sources: [Pixel-Perfect Scaling (nearest-neighbor + integer)](https://spritesheetgenerator.online/blog/pixel-perfect-scaling-nearest-neighbor) · [Pixel-art setup in Godot 4 (density/filtering principles)](https://www.gdquest.com/library/pixel_art_setup_godot4/) · [Pixel-art resolution guide](https://pixnote.net/en/learn/resolution/) · [Complete pixel-art tutorial](https://generalistprogrammer.com/tutorials/pixel-art-complete-tutorial-beginner-to-pro)

---

## 2. Sprite Animation Principles

**Timing beats frame count.** Four well-timed frames beat twelve at uniform speed. Vary frame duration: slow on wind-up, fast through the strike, slow on recovery. This is the single biggest lever.

**The principles that survive at pixel resolution:**

- **Anticipation** — one counter-movement frame before every action (crouch before a jump, pull the fist back before the punch). Even a single 60–80ms wind-up frame makes a 3-frame move read as intentional. In a fighter it doubles as the **telegraph the opponent reacts to** — it IS the "startup" the player sees.
- **Squash & stretch within pixel limits** — you have 1–3 pixels to work with, and that's enough. Compress 1–2px vertically + widen 1px on landing/impact; stretch 1–2px taller on launch. Hold the squash frame a beat longer (80–120ms) to sell weight.
- **Follow-through / overlapping action** — 1–2 extra frames after the main movement where the fist, hair, cape, or scarf catches up and settles, instead of snapping to idle. Skipping it makes moves feel interrupted. At ~125px you have room for real follow-through.
- **Solid drawing / consistent volume** — use onion-skinning so the torso stays (say) N pixels wide across frames unless you're deliberately squashing. AI frames drift in size; this is where you catch it.
- **Secondary action** — dust puffs on landing, hit sparks on contact, a scarf flutter. Cheap frames, big feel multiplier.
- **Staging / readability** — the squint test: blur the animation until you can't see detail; you should still read the action. Smaller/faster sprites need MORE exaggerated poses and higher frame-to-frame contrast.

**Frame-count budgets (fighter-appropriate, keep them lean):**

| Action | Frames | Notes |
|---|---|---|
| Idle | 2–4 | breathing bob; 300–500ms holds |
| Walk (fwd/back) | 4–6 | contact → passing → contact → passing |
| Jump | 3 poses | launch (anticipation) → apex (held) → land (squash) |
| Punch / Kick | 3–6 | wind-up → strike → impact-hold → recovery |
| Block | 1–2 | plus a short "block-stun shake" |
| Hit reaction | 1–3 | snap-back pose, held during hitstun |
| KO | 3–6 | the money shot; give it follow-through |
| Special | 4–8 | biggest budget; anticipation + effects frames |
| Victory | 3–6 | loop or one-shot |

**Timing cheat sheet (per-frame durations):** idle 300–500ms · walk 100–150ms · attack wind-up 60–80ms · **impact-hold 120–200ms** (the hold is what sells power) · recovery 80–100ms · jump apex 120–180ms (held) · landing squash 80–120ms.

**Consistent baseline/anchor:** every frame of a character must share the same **foot baseline (bottom-center anchor)** and the same "hurtbox center." If the feet or center jump between frames, the character visibly slides/teleports. Author every frame on a fixed canvas with the feet on the same y-line. Key frames first (extreme poses), then in-betweens only where motion needs smoothing.

**APPLIES TO US:**
- Your generated set (idle, walk, jump, punch, kick, block, hit, KO, special, victory) is exactly the right per-character list — hold each action to the budgets above. Don't ask the AI for 12-frame everything; ask for the **key poses** and interpolate/hold in Phaser via per-frame durations.
- Enforce a shared **foot-baseline and vertical center** across every frame during the §6 normalization pass — this is the difference between "fighter" and "sticker sliding around."
- Bank your polish on: 1 anticipation frame per attack, a held impact frame, and 1 hit-spark secondary frame. That trio carries the whole feel.

Sources: [12 animation principles for pixel sprites (durations & squash/stretch)](https://www.sprite-ai.art/guides/animation-principles) · [SLYNYRD Pixelblog 8 — Intro to Animation](https://www.slynyrd.com/blog/2018/8/19/pixelblog-8-intro-to-animation) · [How many sprite frames you actually need](https://www.sprite-ai.art/blog/sprite-animation-frames)

---

## 3. Fighting-Game Design Specifics

**Hitboxes vs hurtboxes (the core abstraction — decouple from art):**
- **Hurtbox** = the region attached to a character that, when overlapped by an enemy hitbox, takes damage ("what the character is").
- **Hitbox** = the region attached to an attack that, when it overlaps a hurtbox, registers a hit ("what the attack does").
- These are **logic rectangles, not the sprite pixels.** Author them by hand per frame. A punch's hitbox appears only on the active frames and extends past the fist; the attacker's hurtbox may shrink or extend during the move (that's why some moves "beat" others).

**Frame data — every attack has 3 phases** (count in game frames at your fixed tick):
- **Startup** — before the hitbox exists (the anticipation frames). Fast = ~3–6f, slow/heavy = ~10–20f.
- **Active** — hitbox is out (typically 2–4f).
- **Recovery** — after active, before you can act again. This is where whiffed moves get punished.
- **On block / on hit advantage** = who recovers first. Positive on block = your turn continues; negative = you can be punished. This single number drives all offense/defense.

**Stun & freeze — three different timers, don't confuse them:**
- **Hitstun** — victim can't act while the hit animation plays (they're combo-able during it).
- **Blockstun** — same but shorter, when the hit was blocked (chip only, or zero).
- **Hitstop / "hit-freeze"** — **both** characters freeze for a few frames at the moment of contact. Heavier hit = longer hitstop. It's the feel of impact AND the window that lets a player hit-confirm / cancel into a follow-up. (Covered again as juice in §4 — it's both a mechanic and a feel tool.)

**Spacing / footsies (the neutral game):** attack from a range where **your** best normal reaches but the opponent's doesn't; bait a whiff, then punish the recovery. Even vs an AI, giving moves distinct ranges and recovery makes positioning matter instead of mash-fests.

**Move taxonomy:**
- **Normals** — the button attacks (light/medium/heavy punch & kick). Define the footsie ranges.
- **Specials** — the signature moves (fireball, uppercut). In classic fighters these need motion inputs (↓↘→ + punch); we will NOT require that (§ Modern controls below).
- **Cancels / combos** — canceling a normal's recovery into a special (or a light into a medium) before it finishes = a combo. The **hitstop window** is when the game reads the cancel. Auto-combos remove the timing skill entirely by scripting the sequence.

**Match structure:** health bars, rounds, **best-of-3** (first to 2 round wins), a round timer, and a chip/KO condition. Keep it standard — players already know it.

**Simplifying inputs for NON-gamers (critical — our audience is marketers):**
- Model on **SF6 "Modern controls":** collapse to **3 attack buttons (Light/Medium/Heavy)** + a **Special button**. Press Special alone or Special + a direction to get different specials — **no motion inputs**.
- **One-button specials** and **auto-combos** (hold an Assist button and mash one attack; the game picks the sequence and even ends on a super). This is what lets a first-timer "grab it and immediately have fun."
- SF6 offers an even simpler **Dynamic** control type (context-aware, almost no execution) for total beginners. Consider a "Casual/Auto" mode as your default.
- Trade-off to know: SF6's Modern deliberately **can't access every move and does slightly reduced damage** vs Classic, as the balance cost of simplicity. For us that trade-off barely matters (no ranked meta) — bias hard toward accessibility.

**APPLIES TO US:**
- Build the **hit/hurtbox layer as data (JSON per animation frame), fully decoupled from the AI sprites.** Don't derive boxes from pixels — the AI art is too noisy. This also lets you tune balance without re-exporting art.
- Ship **Modern-style controls as the ONLY scheme for v1:** 3 attack buttons + 1 special button + one-button specials + an auto-combo button. No quarter-circles. Marketers will bounce off motion inputs.
- Keep the match loop boring-familiar: two health bars, best-of-3, a timer. Put ALL the novelty in the characters and juice, none in the input complexity.

Sources: [Frame data & hitboxes — Fighter Fundamentals](https://fighterfundamentals.home.blog/2019/03/30/frame-data-and-hitboxes/) · [Frame-data patterns for game designers (CritPoints)](https://critpoints.net/2023/02/20/frame-data-patterns-that-game-designers-should-know/) · [Hitbox vs hurtbox explained](https://pudgycat.io/hitbox-vs-hurtbox-explained-game-design/) · [Scrub Fighter — frames/hitboxes/hurtboxes](https://sites.google.com/site/scrubfighter/understanding-the-mechanics-frames-hitboxes-and-hurtboxes) · [FOOTSIES — fighting games distilled](https://supercombo.gg/2022/06/16/footsies-fighting-games-distilled/) · [SF6 Controls (Modern/Dynamic, one-button specials, auto-combos)](https://wiki.supercombo.gg/w/Street_Fighter_6/Controls) · [SF6 Fighting Ground / control types](https://www.streetfighter.com/6/mode/fightingground) · [Hands-on with SF6's simplified controls (accessibility)](https://access-ability.uk/2022/06/23/hands-on-with-street-fighter-6s-simplified-control-scheme/)

---

## 4. Game Feel / "Juice"

**Steve Swink's definition of game feel:** *"real-time control of virtual objects in a simulated space, with interactions emphasized by polish."* Three parts: **real-time control** (the whole read→decide→act→feedback loop under ~100ms), **simulated space** (weight, gravity, collision), and **polish = the juice**. Juice is added on top of something that already works — it is never load-bearing for whether the game works.

**The core juice techniques (Vlambeer / Nijman "The Art of Screenshake"; Jonasson & Purho "Juice it or lose it"):**
- **Hitstop / hit-freeze** — pause both fighters ~60–120ms on a clean hit (Nijman's "sleep" ≈ 0.2s on enemy hits). Longer for heavier hits. Cheapest, highest-impact effect there is.
- **Screen shake — with a little rotation.** Use ~3 magnitudes (tiny for routine, big for real events). Pure translational shake reads as a glitch; add **a few tenths of a degree of rotation** and it reads as force. Decay it fast.
- **Camera punch / zoom** — a quick 1–3% zoom-in snap on big impacts and KOs.
- **Particles** — hit sparks, dust on landing/dash, debris on KO. 2–3 frame bursts.
- **Anticipation & animation** — enemies/attacks flinch and telegraph (the §2 wind-up).
- **Sound** — a punchy hit SFX + a low-end "thud"; layered sound sells impact more than any single visual.
- **Flash / recoil** — flash the hurt sprite white for 1–2 frames; knock both characters back (attacker recoil + victim pushback).
- **Restraint:** a 60–80ms freeze on a *destructive/decisive* moment says "that mattered." Over-shaking everything just becomes noise — reserve the big variants for KOs.

**What to add, specifically, per event:**
- **On hit (light/med/heavy):** hitstop scaled to weight (60/90/120ms) · hit-spark particle · white flash on victim (1–2f) · small screen shake (+tiny rotation on heavy) · pushback · hit SFX + thud.
- **On block:** short hitstop (~40ms) · block-spark (different color/shape) · tiny shake · "blip" block SFX · slight pushback, no flash. Must FEEL different from a clean hit so the player learns the read.
- **On KO:** longest hitstop → then **slow-mo (time-scale ~0.3) for ~0.5s** · big shake + rotation · camera zoom-punch · debris/particles · desaturate or flash the screen · heavy KO SFX + a stinger. This is the payoff moment — over-invest here.

**APPLIES TO US:**
- If you ship only three juice effects, ship **hitstop + hit-spark + screen-shake-with-rotation.** They convert "AI sprites sliding into each other" into "a fight."
- Make **block unmistakably different** from a hit (different spark, no flash, blip SFX). It's how non-gamers learn defense without a tutorial.
- Blow the budget on the **KO**: hitstop → slow-mo → zoom → shake → stinger. It's the shareable moment for a marketing-themed game.
- Keep control latency low (Swink's <100ms loop): read input every fixed tick, don't gate attacks behind long non-cancelable animations.

Sources: [Nijman — "The Art of Screenshake" (talk)](https://www.youtube.com/watch?v=AJdEqssNZ-U) · [Game feel on the web: squash, shake, juice (concrete numbers)](https://valdemird.com/blog/game-feel-on-the-web/) · [Steve Swink — Game Feel, Ch.1 "Defining Game Feel" (PDF)](http://mycours.es/gamedesign2014/files/2014/10/Game-Feel-Steve-Swink-chapter-1.pdf) · [Game feel — Wikipedia (Swink definition + Juice it or lose it)](https://en.wikipedia.org/wiki/Game_feel)

---

## 5. Web / Phaser 3 Technical

**Sprites + AnimationManager:**
- Load frames, then register animations once (they're **global** on `this.anims`, shared by all sprites):
  ```js
  this.anims.create({
    key: 'ryu_punch',
    frames: this.anims.generateFrameNames('ryu', { prefix: 'punch_', start: 0, end: 4, zeroPad: 2 }),
    frameRate: 12,          // or use `duration` in ms for exact timing
    repeat: 0               // -1 = loop (idle/walk); 0 = one-shot (attacks)
  });
  sprite.play('ryu_idle');            // sprite.play(key, true) = ignoreIfPlaying
  sprite.chain('ryu_recover');        // queue next anim
  sprite.on('animationcomplete', (anim) => { /* return to idle, open recovery */ });
  ```
- `generateFrameNumbers()` = uniform spritesheet grid (frame indexes). `generateFrameNames()` = **texture atlas** (named frames, arbitrary sizes/positions).
- Per-frame timing: set individual frame durations (or `frameRate`/`duration`) so you can do the fast-strike / held-impact timing from §2.

**Texture atlas vs individual frames — use an atlas:**
- A packed **texture atlas** (one image + JSON of named frames, tightly packed) beats a naive uniform spritesheet: better memory/bandwidth and, critically, **fewer texture swaps** (the single most expensive GPU operation in a 2D renderer). One atlas per character (or a shared atlas) = fast batching.
- Uniform spritesheets are fine for small uniform sets but waste space on variable-size fighter frames.
- Tooling: pack with TexturePacker / free-tex-packer, export the Phaser JSON-Hash/JSON-Array format.

**Perf / batching:**
- Keep everything a fighter uses in **one atlas** so draws batch into few GPU calls. Mixing many textures per frame breaks the batch.
- `pixelArt: true` also enables GPU pixel-rounding (`uRoundPixels` uniform) so rounding math runs on the GPU, not the CPU — meaningful in an effects-heavy scene.
- Keep particle counts sane; reuse object pools for hit-sparks.

**Fixed-timestep vs rAF for a fighter:**
- Fighting-game logic (frame data, hitstun counts) must run on a **fixed timestep** so "5-frame startup" means the same real time on every machine. Do NOT tie gameplay counters to raw `requestAnimationFrame` delta.
- Configure Phaser's loop with `fps: { target: 60, forceSetTimeOut: true }` (or accumulate delta and step logic in fixed 1/60s increments), and treat rendering as interpolated/variable. Count frame data in fixed ticks, not milliseconds, to keep parity with classic-fighter design.

**Loading:** preload the atlas(es) + audio in a boot/preload scene with a loading bar; don't stream sprites mid-match.

**Next.js `dynamic({ ssr:false })` client-island pattern (Phaser is browser-only — it touches `window`/`canvas`/WebGL):**
- Wrap the Phaser mount in a **Client Component**, then import it with SSR disabled:
  ```js
  // app/play/GameClient.tsx  → 'use client'; creates the Phaser.Game in useEffect, destroys on unmount
  // app/play/page.tsx (server):
  import dynamic from 'next/dynamic';
  const Game = dynamic(() => import('./GameClient'), { ssr: false });
  ```
- **Pitfalls:**
  - In the **App Router, `ssr:false` is NOT allowed inside a Server Component** — you'll get an error. Put the `dynamic()` call in a `'use client'` wrapper (or keep the page a client boundary). This is the #1 gotcha.
  - Create `new Phaser.Game(...)` inside `useEffect` (client-only), and **`game.destroy(true)` on unmount** or you leak WebGL contexts / get duplicate canvases on hot-reload and route changes.
  - **Static export (`output: 'export'`)** works fine for a client-only island — the page is a static shell, Phaser boots on the client. Just ensure nothing Phaser-related runs at module top-level or during SSR/build (guard with `typeof window !== 'undefined'` if needed). Load assets from the static `/public` path.
  - Avoid hydration mismatches: the island renders an empty deterministic container on the server; all dynamic content appears only after mount.

**APPLIES TO US:**
- Confirmed fit: keep Next.js as the static site, mount the whole fight as **one `dynamic(..., { ssr:false })` client island** at `/play`. Static export → Vercel stays as-is.
- One **texture atlas per character** (all 10 actions), packed with TexturePacker, loaded in a preload scene. Set `pixelArt:true`, `roundPixels:true`, `antialias:false`, `fps:{ target:60, forceSetTimeOut:true }`.
- Run all frame-data/hitstun logic on a **fixed 60Hz tick**; render is just the view. Destroy the Phaser game on route unmount.

Sources: [Phaser 3 Animations (anims.create, generateFrameNames/Numbers, play/chain, events)](https://docs.phaser.io/phaser/concepts/animations) · [Phaser 3 Textures (atlas vs spritesheet, texture swaps)](https://docs.phaser.io/phaser/concepts/textures) · [Phaser v3.70 notes — pixelArt default false, uRoundPixels GPU rounding](https://github.com/phaserjs/phaser/discussions/6665) · [Next.js Lazy Loading / `dynamic` `ssr:false` (App Router limitation)](https://nextjs.org/docs/app/guides/lazy-loading)

---

## 6. AI-Generated Pixel Assets → Game-Ready Pipeline

**Why AI sprites need normalization:** image models don't respect a pixel grid, a fixed palette, a consistent character size, or a shared anchor. Across a character's 10 poses you'll get drifting proportions, slightly different palettes, anti-aliased/dithered edges, and inconsistent foot positions. Un-normalized, they'll shimmer, slide, and look like 10 different characters. The pipeline below turns raw generations into a clean atlas.

**Pipeline (repeat per character):**
1. **Generate on flat chroma-key backgrounds** — you already do `#FF00FF` (magenta), the correct choice: it never appears in skin/most designs, so keying is clean. Keep it pure and unshaded.
2. **Chroma-key to transparency.** With ImageMagick per frame:
   ```
   magick in.png -fuzz 12% -transparent "#FF00FF" out.png
   ```
   Tune `-fuzz` (≈10–20%) to catch the anti-aliased magenta halo without eating the character. If a colored halo/fringe remains, add a de-fringe/despill pass (reduce magenta channel at edges) or key in Aseprite (Select by Color → uncheck **Contiguous** → delete). Halos are the most common bug.
3. **Post-pixelate / down-quantize** to your canonical density (nearest-neighbor downscale to the pixel grid). This is what makes AI output *actually* pixel art rather than a shrunk illustration.
4. **Palette unification across the whole character.** Build ONE master palette per character (16–32 colors + shared shadow/rim), then remap every frame to it (Aseprite's palette-reduction/quantize scripts, or index all frames to a shared `.pal`). This kills per-frame color drift and is what makes the set read as one fighter.
5. **Clean up by hand in Aseprite/LibreSprite** — fix stray pixels, tighten silhouettes, redraw edges the down-quantize mangled, add the 1-px squash/anticipation frames the AI didn't give you.
6. **Normalize anchor & baseline.** Composite every frame onto a **fixed canvas** with the **feet on the same y-line and the body on the same vertical center.** Trim/pad consistently. This is the make-or-break step — without it the fighter slides between frames (see §2). Script it with ImageMagick (`-background none -gravity south -extent WxH`) or PIL (paste onto a fixed-size transparent canvas at a computed offset).
7. **Pack into a texture atlas** (TexturePacker → Phaser JSON) with the frames named per action (`idle_00`, `punch_02`, …) matching your `generateFrameNames` prefixes.
8. **Author hit/hurtboxes** as separate JSON keyed to frame names (§3) — never derived from the noisy pixels.

**Tools:**
- **Aseprite** (paid) / **LibreSprite** (free fork) — the standard pixel editors; palette ops, onion-skin, sprite-sheet export, scripting.
- **ImageMagick** — batch chroma-key, de-fringe, extent/anchor normalization, downscale.
- **Python + PIL/Pillow** — programmatic anchor alignment, palette remap, batch cutting/keying.
- **TexturePacker / free-tex-packer** — atlas packing to Phaser format.
- (Optional) **Retro Diffusion** (Aseprite extension) — AI pixel gen + one-click background removal + smart color reduction, if you want more of this inside Aseprite.

**APPLIES TO US:**
- Magenta `#FF00FF` on flat backgrounds is exactly right — just keep it un-shaded and add a de-fringe pass; magenta halos on hair/edges are your likeliest artifact.
- The **two non-optional steps** for us are **(4) per-character palette unification** and **(6) anchor/baseline normalization.** Everything else is polish; these two are the difference between "a fighter" and "10 stickers."
- Script the pipeline (ImageMagick + PIL) so re-generating a character is one command — you'll iterate on AI poses a lot.

Sources: [Remove colored background from a sprite sheet (Aseprite: Select by Color, uncheck Contiguous)](https://community.aseprite.org/t/remove-colored-background-from-sprite-sheet/14318) · [ImageMagick: make a background color transparent (`-fuzz` / `-transparent`)](https://telatin.wordpress.com/2016/09/28/imagemagick-remove-background-color-make-transparent-background/) · [Retro Diffusion — AI pixel gen + bg removal + color reduction in Aseprite](https://astropulse.itch.io/retrodiffusion) · [Phaser 3 Textures — atlas packing/naming](https://docs.phaser.io/phaser/concepts/textures)

---

## Recommended for Our Vertical Slice (ship this first)

Goal: ONE playable matchup (2 of the 5 archetypes), best-of-3, vs a simple AI, that already *feels* like a fighter.

**Minimum animation set (per character — ~26 frames total, lean on timing not count):**
- Idle (2f) · Walk fwd/back (4f, reuse mirrored) · Jump (3 poses) · one Punch (4f: wind-up/strike/impact-hold/recover) · one Kick (4f) · Block (1f + stun-shake) · Hit reaction (2f) · KO (4f) · one Special (6f) · Victory (3f).
- Author key poses only; do the "fast strike / held impact / slow recovery" via per-frame durations. Enforce shared foot-baseline + palette across all frames (§6 steps 4 & 6).

**Minimum juice (the trio + the payoff):**
- **Hitstop** scaled to weight (light 60ms / heavy 120ms) · **hit-spark** particle (pooled) · **screen shake with a touch of rotation** (small on normals, big on KO).
- **Block feels different:** block-spark + blip SFX + tiny shake, no white flash.
- **KO payoff:** long hitstop → ~0.5s slow-mo (timescale 0.3) → camera zoom-punch → big shake → KO stinger SFX. Plus a per-hit white flash (1–2f) on the victim and pushback. Hit + thud SFX on every connect.

**Minimum input scheme (Modern-only, no motion inputs):**
- **3 attack buttons** (Light / Medium / Heavy) + **1 Special button** (Special alone, or Special + direction for a 2nd special) + **1 Auto-combo button** (hold + mash → scripted string). Left/right, jump, crouch, block-by-holding-back.
- Playable on keyboard AND touch (marketers on laptops and phones). Default to the auto/assisted mode; hide any complexity behind an optional "Advanced" toggle later.

**Technical spine:** internal res **480×270**, integer-scaled; Phaser `pixelArt:true` + fixed 60Hz logic tick for frame data; one texture atlas per character; the whole stage as a Next.js `dynamic({ssr:false})` client island under static export on Vercel; hit/hurtboxes as per-frame JSON decoupled from the art.

---

## Sources (all links)

**Pixel fundamentals:** [Pixel-Perfect Scaling](https://spritesheetgenerator.online/blog/pixel-perfect-scaling-nearest-neighbor) · [Godot pixel-art setup](https://www.gdquest.com/library/pixel_art_setup_godot4/) · [Resolution guide](https://pixnote.net/en/learn/resolution/) · [Complete pixel-art tutorial](https://generalistprogrammer.com/tutorials/pixel-art-complete-tutorial-beginner-to-pro)

**Animation:** [12 principles for pixel sprites](https://www.sprite-ai.art/guides/animation-principles) · [SLYNYRD Pixelblog 8](https://www.slynyrd.com/blog/2018/8/19/pixelblog-8-intro-to-animation) · [How many frames you need](https://www.sprite-ai.art/blog/sprite-animation-frames)

**Fighting-game design:** [Fighter Fundamentals — frame data/hitboxes](https://fighterfundamentals.home.blog/2019/03/30/frame-data-and-hitboxes/) · [CritPoints — frame-data patterns](https://critpoints.net/2023/02/20/frame-data-patterns-that-game-designers-should-know/) · [Hitbox vs hurtbox](https://pudgycat.io/hitbox-vs-hurtbox-explained-game-design/) · [Scrub Fighter — mechanics](https://sites.google.com/site/scrubfighter/understanding-the-mechanics-frames-hitboxes-and-hurtboxes) · [FOOTSIES distilled](https://supercombo.gg/2022/06/16/footsies-fighting-games-distilled/) · [SF6 Controls](https://wiki.supercombo.gg/w/Street_Fighter_6/Controls) · [SF6 Fighting Ground](https://www.streetfighter.com/6/mode/fightingground) · [SF6 simplified controls (accessibility)](https://access-ability.uk/2022/06/23/hands-on-with-street-fighter-6s-simplified-control-scheme/) · [SF6 Game Data (real frame numbers)](https://wiki.supercombo.gg/w/Street_Fighter_6/Game_Data)

**Game feel / juice:** [Nijman — Art of Screenshake](https://www.youtube.com/watch?v=AJdEqssNZ-U) · [Game feel on the web](https://valdemird.com/blog/game-feel-on-the-web/) · [Swink — Game Feel Ch.1 (PDF)](http://mycours.es/gamedesign2014/files/2014/10/Game-Feel-Steve-Swink-chapter-1.pdf) · [Game feel — Wikipedia](https://en.wikipedia.org/wiki/Game_feel)

**Phaser / Next.js:** [Phaser Animations](https://docs.phaser.io/phaser/concepts/animations) · [Phaser Textures](https://docs.phaser.io/phaser/concepts/textures) · [Phaser v3.70 notes](https://github.com/phaserjs/phaser/discussions/6665) · [Next.js `dynamic` / lazy loading](https://nextjs.org/docs/app/guides/lazy-loading)

**AI → game-ready pipeline:** [Aseprite — remove colored bg](https://community.aseprite.org/t/remove-colored-background-from-sprite-sheet/14318) · [ImageMagick transparent bg](https://telatin.wordpress.com/2016/09/28/imagemagick-remove-background-color-make-transparent-background/) · [Retro Diffusion (Aseprite)](https://astropulse.itch.io/retrodiffusion)

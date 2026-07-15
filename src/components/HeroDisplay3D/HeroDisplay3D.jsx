'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'
import { K_WHITE, K_BLACK, K_GOLD, K_ORANGE, K_ACCENT_GREEN } from '@/game/palette'
import './HeroDisplay3D.css'

/**
 * HERO CRT — a GENUINE WebGL shader pass over the hero, not a CSS filter. The
 * real DOM Hero (bg art + all copy) stays mounted underneath, unchanged and
 * fully accessible/interactive (the registration link works — this canvas is
 * `pointer-events:none`); we draw an equivalent of its content into a canvas
 * texture and run it through the SAME technique as the cabinet's own CRT
 * screen (Cabinet3D.jsx: barrel warp + chromatic aberration + aperture-grille
 * scanlines + vignette), extended with a slow flicker/roll and a cheap
 * multi-tap bloom so bright edges actually glow. No new dependency — plain
 * three.js + canvas2D, same as the cabinet's attract-screen texture.
 * Desktop / WebGL only — see HeroStage for the flat fallback.
 */

const HERO_W = 1440
const HERO_H = 804
const TEX_SCALE = 2 // oversample the content canvas for crisp text pre-warp

/* ---------- build a canvas2D texture matching the real Hero's content ---------- */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  const lines = []
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight))
  return lines.length
}

/**
 * Draw the hero content into a canvas2D texture. The canvas covers the DOM
 * hero, so its CSS :hover/:focus-visible are invisible; instead we pre-bake one
 * texture per interactive state and swap uniforms on the real elements'
 * pointer/focus events (see CRTPlane) — the invert also doubles as the keyboard
 * focus indicator, which the opaque canvas would otherwise hide (WCAG 2.4.7).
 * The lit element reads *through* the CRT, warp and all.
 *
 * `active` names which interactive element is lit: 'badge' | 'playbig' |
 * 'tag0'..'tag3' | null. Each pre-baked texture shows exactly one lit element
 * (or none), matching the DOM :hover/:focus-visible of the real element the
 * canvas covers.
 */
async function buildHeroTexture(bgImg, logoImg, active = null) {
  const S = TEX_SCALE
  const c = document.createElement('canvas')
  c.width = HERO_W * S
  c.height = HERO_H * S
  const x = c.getContext('2d')
  x.scale(S, S)

  x.drawImage(bgImg, 0, 0, HERO_W, HERO_H)

  const MONO = '"GT Pressura Mono", "Courier New", monospace'

  // badge (top-left) — inverts on hover, matching .hero__badge:hover
  x.font = `24px ${MONO}`
  x.textBaseline = 'alphabetic'
  const badgeText = '>>> registration <<<'
  const bw = x.measureText(badgeText).width + 16
  const bh = 24 + 18
  x.fillStyle = active === 'badge' ? K_WHITE : K_BLACK
  x.fillRect(19, 23, bw, bh)
  x.strokeStyle = K_WHITE
  x.lineWidth = 1
  x.strokeRect(19.5, 23.5, bw - 1, bh - 1)
  x.fillStyle = active === 'badge' ? K_BLACK : K_WHITE
  x.fillText(badgeText, 27, 23 + bh - 14)

  // lede (below badge)
  x.fillStyle = K_ACCENT_GREEN
  x.font = '24px ' + MONO
  wrapText(
    x,
    'the first international hackathon for senior marketers of the ai era. two days. real cases. use ai or get finished.',
    19,
    23 + bh + 24 + 20,
    680,
    30
  )

  // energy meter (top-right)
  const mx0 = 1206
  const my0 = 23
  x.fillStyle = 'rgba(0,0,0,0.6)'
  x.fillRect(mx0, my0, 213, 43)
  x.strokeStyle = K_ORANGE
  x.lineWidth = 2
  x.strokeRect(mx0 + 1, my0 + 1, 211, 41)
  x.fillStyle = K_ORANGE
  for (let i = 0; i < 4; i++) {
    x.fillRect(mx0 + 4 + i * 10, my0 + 4, 8, 35)
  }
  x.font = '24px ' + MONO
  x.fillText('15%', mx0 + 4 + 4 * 10 + 6, my0 + 43 - 12)
  x.fillStyle = K_ORANGE
  x.font = '24px ' + MONO
  x.fillText('will you survive?', mx0 + 213 - x.measureText('will you survive?').width, my0 + 43 + 32)

  // wordmark
  if (logoImg) {
    const lw = 765
    const lh = lw * (logoImg.height / logoImg.width)
    x.drawImage(logoImg, (HERO_W - lw) / 2, 530, lw, lh)
  }

  // big pixel PLAY button — mirrors .hero__playbig (centerPlay) on /demo. Its
  // DOM hit-area (the <a>) is warped to sit under these pixels (warpElToScreen).
  // Chunky 8-bit look: a notched black border (4 axis-only slabs leave the
  // corners cut), an inset bevel (light top-left / dark bottom-right), a hard
  // pixel drop-shadow, and a black stepped triangle + "PLAY". active==='playbig'
  // is the hover state (lighter gold face, = the CSS color-mix). Box math mirrors
  // the DOM button (top:300, padding --k-2/--k-4, gap --k-2) so the warped
  // hit-area lands exactly under the drawing.
  {
    const U = 5 // --u pixel unit (notch + bevel thickness)
    const bPadX = 32 // --k-4
    const bPadY = 16 // --k-2
    const bGap = 16 // --k-2
    const triW = 26
    const triH = 36
    const lit = active === 'playbig'
    x.font = `34px "Press Start 2P", ${MONO}`
    x.textBaseline = 'alphabetic'
    // lowercase to match the DOM button (.hero sets text-transform: lowercase);
    // PS2P is monospace so the box width is identical either way (hit-area safe)
    const label = 'play'
    const labelW = x.measureText(label).width
    const bw = triW + bGap + labelW + bPadX * 2
    const bh = Math.max(triH, 34) + bPadY * 2
    const bx = (HERO_W - bw) / 2
    const by = 300
    // hard pixel drop-shadow (offset 7,9), behind everything
    x.fillStyle = 'rgba(0,0,0,0.45)'
    x.fillRect(bx - U + 7, by - U + 9, bw + U * 2, bh + U * 2)
    // notched black border — 4 axis-only slabs, corners left open
    x.fillStyle = K_BLACK
    x.fillRect(bx - U, by, U, bh)
    x.fillRect(bx + bw, by, U, bh)
    x.fillRect(bx, by - U, bw, U)
    x.fillRect(bx, by + bh, bw, U)
    // gold face (lighter when lit)
    x.fillStyle = lit ? '#ffda62' : K_GOLD
    x.fillRect(bx, by, bw, bh)
    // inset bevel: light top-left, dark bottom-right
    x.fillStyle = 'rgba(255,255,255,0.5)'
    x.fillRect(bx, by, bw, U)
    x.fillRect(bx, by, U, bh)
    x.fillStyle = 'rgba(0,0,0,0.28)'
    x.fillRect(bx, by + bh - U, bw, U)
    x.fillRect(bx + bw - U, by, U, bh)
    // content — stepped pixel triangle + label, black, vertically centered
    const cy = by + bh / 2
    const cX = bx + bPadX
    const uW = triW / 6
    const uH = triH / 10
    x.fillStyle = K_BLACK
    for (let k = 0; k < 5; k++) {
      x.fillRect(cX + k * uW, cy - triH / 2 + k * uH, uW, triH - 2 * k * uH)
    }
    x.textBaseline = 'middle'
    x.fillText(label, cX + triW + bGap, cy + 2)
    x.textBaseline = 'alphabetic'
  }

  // bottom tag pills, space-between across x:347..1093
  x.font = '24px ' + MONO
  const tags = ['round 01', 'july 2026', '300+ fighters', 'final · barcelona']
  const pad = 4
  const widths = tags.map((t) => x.measureText(t).width + pad * 2)
  const totalW = widths.reduce((a, b) => a + b, 0)
  const gap = (746 - totalW) / (tags.length - 1)
  let tx = 347
  const ty = 765
  // inert labels — no hover/focus state (see the wiring block below), so they
  // always render in the resting green frame
  tags.forEach((t, i) => {
    const w = widths[i]
    x.fillStyle = 'rgba(0,0,0,0.6)'
    x.fillRect(tx, ty, w, 40)
    x.strokeStyle = K_WHITE
    x.lineWidth = 1
    x.beginPath()
    x.moveTo(tx, ty + 0.5)
    x.lineTo(tx + w, ty + 0.5)
    x.moveTo(tx, ty + 39.5)
    x.lineTo(tx + w, ty + 39.5)
    x.stroke()
    x.fillStyle = K_ACCENT_GREEN
    x.fillText(t, tx + pad, ty + 27)
    tx += w + gap
  })

  const tex = new THREE.CanvasTexture(c)
  // NO colorSpace tag (passthrough), deliberately: tagging SRGBColorSpace
  // makes the GPU decode samples to linear, and a RAW ShaderMaterial never
  // re-encodes on output (no colorspace_fragment chunk) — the picture shipped
  // linear-as-sRGB and read crushed-dark in the mids, which no flat gain
  // could honestly compensate. Passthrough keeps the canvas2D pixel values
  // end-to-end — exactly how Cabinet3D's screen texture already works.
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** matches() that survives engines without :focus-visible (pre-2022 Safari):
    if the selector can't parse, err on SHOWING the focus state. */
function matchesSafe(el, selector) {
  try {
    return el.matches(selector)
  } catch {
    return true
  }
}

/* ---------- badge hit-area ↔ curved screen registration ---------- */

// MUST stay in sync with `barrel` in CRT_FRAG. The shader maps every OUTPUT
// pixel cc_o to SOURCE texel cc_s = cc_o·(1 + |cc_o|²·k) — i.e. it draws the
// picture pulled toward the screen center, strongest in the corners. The DOM
// badge sits at the UN-warped position (top-left corner ⇒ ~2.5% of the frame
// off), so pointer/hover landed beside the badge the eye sees. We invert the
// mapping and transform the (invisible, hit-area-only) DOM badge to sit
// exactly under the pixels the shader draws.
const BARREL = 0.05

/** invert r_s = r_o·(1 + k·r_o²) by fixed-point iteration (k is small, so
    3-4 passes converge to far below a pixel at hero scale) */
function unwarpPoint(fx, fy) {
  const cx = fx * 2 - 1
  const cy = fy * 2 - 1
  const rs = Math.hypot(cx, cy)
  if (rs === 0) return [fx, fy]
  let ro = rs
  for (let i = 0; i < 4; i++) ro = rs / (1 + BARREL * ro * ro)
  const s = ro / rs
  return [(cx * s + 1) / 2, (cy * s + 1) / 2]
}

/** compute + apply an element's warp transform; slides its (invisible)
    hit-area under the barrel-warped pixels the shader draws for it.
    All rects are measured live so ScaleCanvas zoom / relayout can't drift us:
    normalized fractions are zoom-invariant, and the px offset is converted to
    the element's LOCAL units via the measured zoom (rect ÷ offsetWidth). */
function warpElToScreen(el, canvasEl) {
  el.style.transform = '' // measure the untransformed layout box
  const stage = canvasEl.getBoundingClientRect()
  const rect = el.getBoundingClientRect()
  if (!stage.width || !rect.width || !el.offsetWidth) return
  const zoom = rect.width / el.offsetWidth

  // warp all 4 corners, take the bounding box (the true shape is a hair
  // trapezoidal; at k=0.05 the difference is sub-pixel — fine for a hit-area)
  const corners = [
    [rect.left, rect.top],
    [rect.right, rect.top],
    [rect.left, rect.bottom],
    [rect.right, rect.bottom],
  ].map(([x, y]) =>
    unwarpPoint((x - stage.left) / stage.width, (y - stage.top) / stage.height)
  )
  const xs = corners.map((c) => stage.left + c[0] * stage.width)
  const ys = corners.map((c) => stage.top + c[1] * stage.height)
  const left = Math.min(...xs)
  const top = Math.min(...ys)
  const w = Math.max(...xs) - left
  const h = Math.max(...ys) - top

  el.style.transformOrigin = '0 0'
  el.style.transform =
    `translate(${(left - rect.left) / zoom}px, ${(top - rect.top) / zoom}px) ` +
    `scale(${w / rect.width}, ${h / rect.height})`
}

/* ---------- the CRT fragment shader: barrel + chromatic aberration + ---------- */
/* ---------- aperture-grille scanlines + vignette + flicker + bloom     ---------- */

const CRT_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const CRT_FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uTime;
uniform float uMotion;
varying vec2 vUv;

vec3 sampleTex(vec2 uv) {
  return texture2D(uTex, clamp(uv, 0.0, 1.0)).rgb;
}

vec3 bloomTap(vec2 s, vec2 dir, float texel) {
  vec3 c = sampleTex(s + dir * texel);
  // threshold tuned for sRGB-space samples (passthrough texture): 0.58 was
  // picked when samples arrived linear-decoded and darker across the board
  float b = max(0.0, dot(c, vec3(0.299, 0.587, 0.114)) - 0.68);
  return c * b;
}

void main() {
  vec2 cc = vUv * 2.0 - 1.0;
  float barrel = 0.05;
  vec2 uv = (cc * (1.0 + dot(cc, cc) * barrel)) * 0.5 + 0.5;
  float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  vec2 s = clamp(uv, 0.0, 1.0);

  float rim = length(cc);
  float ca = 0.0011 * (0.3 + rim);
  vec3 col;
  col.r = sampleTex(s + vec2(ca, 0.0)).r;
  col.g = sampleTex(s).g;
  col.b = sampleTex(s - vec2(ca, 0.0)).b;

  float texel = 3.0 / uRes.x;
  vec3 bloom = bloomTap(s, vec2(1.0, 0.0), texel)
             + bloomTap(s, vec2(-1.0, 0.0), texel)
             + bloomTap(s, vec2(0.0, 1.0), texel)
             + bloomTap(s, vec2(0.0, -1.0), texel)
             + bloomTap(s, vec2(0.7, 0.7), texel)
             + bloomTap(s, vec2(-0.7, -0.7), texel);
  col += (bloom / 6.0) * 0.5;

  // overall gain — the CRT passes below (scanline + grille + vignette) are all
  // multiplicative dimmers; lift the picture so their average cancels out.
  // (Was 1.14 back when it also fought the sRGB-decode darkening — with the
  // passthrough texture that big a gain clips the sky gradient to bands.)
  col *= 1.06;

  float sl = sin(gl_FragCoord.y * 3.14159 * 0.95);
  col *= 0.94 + 0.06 * (0.5 + 0.5 * sl);

  float mx = mod(gl_FragCoord.x, 3.0);
  vec3 mask = vec3(0.99);
  mask.r += step(mx, 1.0) * 0.05;
  mask.g += step(1.0, mx) * step(mx, 2.0) * 0.05;
  mask.b += step(2.0, mx) * 0.05;
  col *= mask;

  // gentler vignette — was mix(...,0.6): corners fell to ~40% and swallowed the art
  float vig = pow(16.0 * s.x * s.y * (1.0 - s.x) * (1.0 - s.y), 0.28);
  col *= mix(1.0, vig, 0.3);

  float t = uTime * uMotion;
  col *= 0.98 + 0.02 * sin(t * 5.0 + s.y * 6.0);
  float band = fract(s.y - t * 0.035);
  col += smoothstep(0.0, 0.06, band) * smoothstep(0.16, 0.08, band) * 0.03;

  gl_FragColor = vec4(col * inside, 1.0);
}`

function ResUniform({ uniforms }) {
  const { size, gl } = useThree()
  useEffect(() => {
    const dpr = gl.getPixelRatio()
    uniforms.uRes.value.set(size.width * dpr, size.height * dpr)
  }, [size, gl, uniforms])
  return null
}

function OrthoFit() {
  const { camera, size } = useThree()
  useEffect(() => {
    camera.left = -size.width / 2
    camera.right = size.width / 2
    camera.top = size.height / 2
    camera.bottom = -size.height / 2
    camera.near = 0.1
    camera.far = 10
    camera.position.set(0, 0, 5)
    camera.updateProjectionMatrix()
  }, [camera, size])
  return null
}

function CRTPlane() {
  const { size, gl } = useThree()
  const [texture, setTexture] = useState(null)
  const reducedMotion = useMemo(() => prefersReducedMotion(), [])

  const uniforms = useMemo(
    () => ({
      uTex: { value: null },
      uRes: { value: new THREE.Vector2(HERO_W, HERO_H) },
      uTime: { value: 0 },
      uMotion: { value: reducedMotion ? 0 : 1 },
    }),
    [reducedMotion]
  )

  useEffect(() => {
    let cancelled = false
    // The canvas is pointer-events:none, so hover/focus land on the REAL DOM
    // elements underneath (Hero.jsx's flat layer) — we mirror their state onto
    // the shader by swapping uTex to a pre-baked "lit" texture for that element.
    // KEYBOARD focus is mirrored the same way: the opaque canvas hides the DOM
    // :focus-visible ring, so without this Tab lands with no visible indicator
    // (WCAG 2.4.7). The two interactive elements (badge, playbig) are baked
    // eagerly and warmed to the GPU; the tag pills are inert, so they get no
    // lit texture at all.
    const textures = {} // key -> THREE.Texture: 'normal'|'badge'|'playbig'
    let activeKey = null
    let bgImg = null
    let logoImg = null
    const wired = [] // { el, handlers }
    let ro = null // ResizeObserver keeping the warped hit-areas registered

    const sync = () => {
      const t = (activeKey && textures[activeKey]) || textures.normal
      if (t) uniforms.uTex.value = t
    }
    const buildTex = async (key) => {
      const t = await buildHeroTexture(bgImg, logoImg, key === 'normal' ? null : key)
      if (cancelled) {
        t.dispose()
        return null
      }
      gl.initTexture(t) // upload now so the first swap isn't a texImage2D hitch
      textures[key] = t
      return t
    }
    const ensure = (key) => (textures[key] ? Promise.resolve(textures[key]) : buildTex(key))
    const isLit = (el) =>
      el.matches(':hover') ||
      (document.activeElement === el && matchesSafe(el, ':focus-visible'))

    // wire one interactive element: warp its hit-area under the shader pixels,
    // and light its texture while hovered / :focus-visible (mirroring the CSS).
    const wire = (key, el) => {
      if (!el) return
      const enter = () => {
        ensure(key).then(() => {
          if (!cancelled && isLit(el)) {
            activeKey = key
            sync()
          }
        })
      }
      const leave = () => {
        if (activeKey === key) {
          activeKey = null
          sync()
        }
      }
      // :focus-visible only — a click also focuses, but must not latch the lit
      // texture after pointerleave (the CSS styles :focus-visible too)
      const focus = () => {
        if (matchesSafe(el, ':focus-visible'))
          ensure(key).then(() => {
            if (!cancelled) {
              activeKey = key
              sync()
            }
          })
      }
      const blur = () => {
        if (activeKey === key) {
          activeKey = null
          sync()
        }
      }
      el.addEventListener('pointerenter', enter)
      el.addEventListener('pointerleave', leave)
      el.addEventListener('focusin', focus)
      el.addEventListener('focusout', blur)
      wired.push({ el, key, handlers: { enter, leave, focus, blur } })
      warpElToScreen(el, gl.domElement)
    }

    async function build() {
      const imgs = await Promise.all([
        loadImage('/assets/hero/hero-bg.webp'),
        loadImage('/assets/hero/logo.webp'),
      ])
      bgImg = imgs[0]
      logoImg = imgs[1]
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready
        } catch {}
      }
      if (cancelled) return
      // eager: the normal frame + the two prominent lit states, warmed to GPU
      await buildTex('normal')
      await buildTex('badge')
      await buildTex('playbig')
      if (cancelled) return
      uniforms.uTex.value = textures.normal
      setTexture(textures.normal)

      // guard: flat-only mode unmounts this component, but query defensively —
      // any missing element simply never lights.
      // Only the genuinely interactive elements get a lit state — the four tag
      // pills are inert <span>s (no hover/focus affordance in the DOM), so they
      // stay in their resting green frame and are NOT wired.
      wire('badge', document.querySelector('.herostage__flat .hero__badge'))
      wire('playbig', document.querySelector('.herostage__flat .hero__playbig'))

      // pointer or focus may already be resting on an element when textures
      // finish loading — sync once so the first frame isn't stale
      const resting = wired.find(({ el }) => isLit(el))
      if (resting)
        ensure(resting.key).then(() => {
          if (!cancelled) {
            activeKey = resting.key
            sync()
          }
        })

      // re-derive every warp on resize — the normalized fractions are
      // zoom-invariant, but a reflow can move an element inside the stage
      if (wired.length) {
        ro = new ResizeObserver(() => {
          wired.forEach(({ el }) => warpElToScreen(el, gl.domElement))
        })
        ro.observe(gl.domElement)
      }
    }
    build()
    return () => {
      cancelled = true
      if (ro) ro.disconnect()
      wired.forEach(({ el, handlers }) => {
        el.removeEventListener('pointerenter', handlers.enter)
        el.removeEventListener('pointerleave', handlers.leave)
        el.removeEventListener('focusin', handlers.focus)
        el.removeEventListener('focusout', handlers.blur)
        // hand the flat fallback its untouched layout back
        el.style.transform = ''
        el.style.transformOrigin = ''
      })
      Object.keys(textures).forEach((k) => textures[k] && textures[k].dispose())
    }
  }, [uniforms, gl])

  useFrame((_, dt) => {
    uniforms.uTime.value += dt
  })

  if (!texture) return null

  return (
    <mesh scale={[size.width, size.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={CRT_VERT}
        fragmentShader={CRT_FRAG}
        uniforms={uniforms}
        toneMapped={false}
      />
      <ResUniform uniforms={uniforms} />
    </mesh>
  )
}

export default function HeroDisplay3D() {
  const wrapRef = useRef(null)
  const [active, setActive] = useState(true)

  // pause the WebGL loop once the hero scrolls out (same recipe as
  // Cabinet3D) — this shader ran at 60fps for the whole session even
  // deep into the /demo scroll, with nothing left to animate on-screen
  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      rootMargin: '200px 0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="herodisp" aria-hidden="true" ref={wrapRef}>
      <Canvas
        orthographic
        dpr={[1, 1.6]}
        gl={{ antialias: false, alpha: true }}
        camera={{ position: [0, 0, 5] }}
        frameloop={active ? 'always' : 'never'}
      >
        <OrthoFit />
        <Suspense fallback={null}>
          <CRTPlane />
        </Suspense>
      </Canvas>
    </div>
  )
}

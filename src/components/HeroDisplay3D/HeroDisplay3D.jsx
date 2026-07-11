'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
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

async function buildHeroTexture(bgImg, logoImg) {
  const S = TEX_SCALE
  const c = document.createElement('canvas')
  c.width = HERO_W * S
  c.height = HERO_H * S
  const x = c.getContext('2d')
  x.scale(S, S)

  x.drawImage(bgImg, 0, 0, HERO_W, HERO_H)

  const MONO = '"GT Pressura Mono", "Courier New", monospace'

  // badge (top-left)
  x.font = `24px ${MONO}`
  x.textBaseline = 'alphabetic'
  const badgeText = '>>> registration <<<'
  const bw = x.measureText(badgeText).width + 16
  const bh = 24 + 18
  x.fillStyle = '#000'
  x.fillRect(19, 23, bw, bh)
  x.strokeStyle = '#fff'
  x.lineWidth = 1
  x.strokeRect(19.5, 23.5, bw - 1, bh - 1)
  x.fillStyle = '#fff'
  x.fillText(badgeText, 27, 23 + bh - 14)

  // lede (below badge)
  x.fillStyle = '#3ad76f'
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
  x.strokeStyle = '#ff5000'
  x.lineWidth = 2
  x.strokeRect(mx0 + 1, my0 + 1, 211, 41)
  x.fillStyle = '#ff5000'
  for (let i = 0; i < 4; i++) {
    x.fillRect(mx0 + 4 + i * 10, my0 + 4, 8, 35)
  }
  x.font = '24px ' + MONO
  x.fillText('15%', mx0 + 4 + 4 * 10 + 6, my0 + 43 - 12)
  x.fillStyle = '#ff5000'
  x.font = '24px ' + MONO
  x.fillText('will you survive?', mx0 + 213 - x.measureText('will you survive?').width, my0 + 43 + 32)

  // wordmark
  if (logoImg) {
    const lw = 765
    const lh = lw * (logoImg.height / logoImg.width)
    x.drawImage(logoImg, (HERO_W - lw) / 2, 530, lw, lh)
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
  tags.forEach((t, i) => {
    const w = widths[i]
    x.fillStyle = 'rgba(0,0,0,0.6)'
    x.fillRect(tx, ty, w, 40)
    x.strokeStyle = '#fff'
    x.lineWidth = 1
    x.beginPath()
    x.moveTo(tx, ty + 0.5)
    x.lineTo(tx + w, ty + 0.5)
    x.moveTo(tx, ty + 39.5)
    x.lineTo(tx + w, ty + 39.5)
    x.stroke()
    x.fillStyle = '#3ad76f'
    x.fillText(t, tx + pad, ty + 27)
    tx += w + gap
  })

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
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
  float b = max(0.0, dot(c, vec3(0.299, 0.587, 0.114)) - 0.58);
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
  // multiplicative dimmers; lift the picture first so the hero reads bright.
  col *= 1.14;

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
  const { size } = useThree()
  const [texture, setTexture] = useState(null)
  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

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
    async function build() {
      const [bgImg, logoImg] = await Promise.all([
        loadImage('/assets/hero/hero-bg.png'),
        loadImage('/assets/hero/logo.png'),
      ])
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready
        } catch {}
      }
      if (cancelled) return
      const tex = await buildHeroTexture(bgImg, logoImg)
      if (cancelled) return
      uniforms.uTex.value = tex
      setTexture(tex)
    }
    build()
    return () => {
      cancelled = true
    }
  }, [uniforms])

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
  return (
    <div className="herodisp" aria-hidden="true">
      <Canvas
        orthographic
        dpr={[1, 1.6]}
        gl={{ antialias: false, alpha: true }}
        camera={{ position: [0, 0, 5] }}
      >
        <OrthoFit />
        <Suspense fallback={null}>
          <CRTPlane />
        </Suspense>
      </Canvas>
    </div>
  )
}

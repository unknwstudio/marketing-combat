'use client'

import { useEffect, useRef } from 'react'
import './CrtScreen.css'

/**
 * CrtScreen — a real WebGL CRT for the arcade cabinet glass. The attract screen
 * (PLAY / PRESS START on a dark tube) is drawn to an offscreen 2D canvas and fed
 * as a texture to a fragment shader that adds barrel curvature, hard scanlines,
 * an RGB subpixel aperture mask, edge chromatic aberration, vignette and a faint
 * flicker — so the image bows to the glass like a real tube.
 *
 * Progressive enhancement: this sits ON TOP of a CSS attract-screen fallback.
 * With no JS / no WebGL the canvas stays transparent (or hides) and the CSS
 * screen shows. Motion is dropped under prefers-reduced-motion.
 */
const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uTime;
varying vec2 vUv;

vec2 curve(vec2 uv) {
  uv = uv * 2.0 - 1.0;
  vec2 off = abs(uv.yx) / vec2(6.5, 4.8); // curvature strength
  uv = uv + uv * off * off;
  return uv * 0.5 + 0.5;
}

void main() {
  vec2 uv = curve(vUv);
  // 1.0 inside the tube, 0.0 past the curved edge (no early-return)
  float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  vec2 s2 = clamp(uv, 0.0, 1.0);

  // edge-weighted chromatic aberration
  float ca = 0.0018 * (0.35 + length(uv - 0.5));
  vec3 col;
  col.r = texture2D(uTex, s2 + vec2(ca, 0.0)).r;
  col.g = texture2D(uTex, s2).g;
  col.b = texture2D(uTex, s2 - vec2(ca, 0.0)).b;

  // hard scanlines
  float sl = sin(uv.y * uRes.y * 3.14159);
  col *= 0.78 + 0.22 * (0.5 + 0.5 * sl);

  // RGB subpixel aperture mask (no vec3 ternary)
  float mx = mod(gl_FragCoord.x, 3.0);
  vec3 mask = vec3(0.86);
  mask.r += step(mx, 1.0) * 0.26;
  mask.g += step(1.0, mx) * step(mx, 2.0) * 0.26;
  mask.b += step(2.0, mx) * 0.26;
  col *= mask;

  // vignette
  float vig = pow(16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y), 0.22);
  col *= vig;

  // faint flicker
  col *= 0.96 + 0.04 * sin(uTime * 7.5 + uv.y * 8.0);

  gl_FragColor = vec4(col * inside, 1.0);
}`

function compile(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    if (typeof window !== 'undefined') {
      window.__crterr = gl.getShaderInfoLog(sh) || 'compile failed'
    }
    gl.deleteShader(sh)
    return null
  }
  return sh
}

export default function CrtScreen() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false })
    if (!gl) {
      canvas.style.display = 'none' // let the CSS fallback show
      return
    }

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) {
      canvas.style.display = 'none' // shader failed → fall back to the CSS screen
      return
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.style.display = 'none'
      return
    }
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTex = gl.getUniformLocation(prog, 'uTex')
    const uRes = gl.getUniformLocation(prog, 'uRes')
    const uTime = gl.getUniformLocation(prog, 'uTime')

    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.uniform1i(uTex, 0)

    // offscreen 2D "screen content"
    const scene = document.createElement('canvas')
    const c2 = scene.getContext('2d')
    let W = 2
    let H = 2

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const r = canvas.getBoundingClientRect()
      W = Math.max(2, Math.round(r.width * dpr))
      H = Math.max(2, Math.round(r.height * dpr))
      canvas.width = W
      canvas.height = H
      scene.width = W
      scene.height = H
      gl.viewport(0, 0, W, H)
      gl.uniform2f(uRes, W, H)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = (t) => {
      const ctx = c2
      // tube background
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, '#0a1a11')
      g.addColorStop(0.5, '#06120c')
      g.addColorStop(1, '#040d08')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      // warm attract glow
      const rg = ctx.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, W * 0.55)
      rg.addColorStop(0, 'rgba(255,160,40,0.16)')
      rg.addColorStop(1, 'rgba(255,160,40,0)')
      ctx.fillStyle = rg
      ctx.fillRect(0, 0, W, H)

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const cx = W / 2
      const cy = H * 0.46

      // PLAY
      const playSize = Math.round(H * 0.17)
      ctx.font = `${playSize}px "Platform", sans-serif`
      ctx.lineJoin = 'round'
      ctx.lineWidth = Math.max(2, playSize * 0.07)
      ctx.strokeStyle = '#ff5000'
      ctx.strokeText('▶ PLAY', cx, cy)
      ctx.shadowColor = 'rgba(255,120,0,0.9)'
      ctx.shadowBlur = playSize * 0.35
      ctx.fillStyle = '#ffd000'
      ctx.fillText('▶ PLAY', cx, cy)
      ctx.shadowBlur = 0

      // PRESS START (blink)
      const psSize = Math.round(H * 0.052)
      ctx.font = `${psSize}px "GT Pressura Mono", monospace`
      const blink = reduced ? 1 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 3.2))
      ctx.globalAlpha = blink
      ctx.fillStyle = '#3ad76f'
      ctx.fillText('PRESS START', cx, cy + playSize * 0.9)
      ctx.globalAlpha = 1

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene)
      gl.uniform1f(uTime, t)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    let raf = 0
    let running = true
    const loop = (nowMs) => {
      if (!running) return
      draw(nowMs / 1000)
      if (reduced) return // one static frame
      raf = requestAnimationFrame(loop)
    }

    // pause when the cabinet is offscreen
    const vis = new IntersectionObserver(
      (entries) => {
        const on = entries[0]?.isIntersecting
        if (on && !running) {
          running = true
          raf = requestAnimationFrame(loop)
        } else if (!on) {
          running = false
          cancelAnimationFrame(raf)
        }
      },
      { threshold: 0 }
    )
    vis.observe(canvas)

    // start once the display fonts are ready so PLAY renders in Platform
    const start = () => {
      running = true
      raf = requestAnimationFrame(loop)
    }
    if (document.fonts?.ready) {
      Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 800))]).then(start)
    } else {
      start()
    }

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      vis.disconnect()
      const ext = gl.getExtension('WEBGL_lose_context')
      ext?.loseContext()
    }
  }, [])

  return <canvas ref={canvasRef} className="cabinet__crt" aria-hidden="true" />
}

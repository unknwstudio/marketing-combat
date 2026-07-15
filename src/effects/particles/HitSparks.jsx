'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'
import { K_WHITE, K_GOLD, K_CYAN } from '@/game/palette'

const SparksContext = createContext(null)

const NOOP = () => {}

/**
 * Access the particle burst API.
 * @returns {{ burst: (x: number, y: number, opts?: object) => void }}
 */
export function useSparks() {
  return useContext(SparksContext) ?? { burst: NOOP }
}

const GRAVITY = 0.18
const FRICTION = 0.86

// White core + arcade yellow + cyan. Yellow/cyan are read from the CSS tokens
// so a Figma palette swap flows through; the palette.js mirrors are only fallbacks.
const readPalette = () => {
  if (typeof window === 'undefined') return [K_WHITE, K_GOLD, K_CYAN]
  const s = getComputedStyle(document.documentElement)
  const y = s.getPropertyValue('--k-gold').trim() || K_GOLD
  const c = s.getPropertyValue('--k-cyan').trim() || K_CYAN
  return [K_WHITE, y, c]
}

// Fixed, full-viewport, click-through overlay.
const CANVAS_STYLE = {
  position: 'fixed',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 9998,
}

/**
 * Full-viewport pixel-shard particle layer. Renders a canvas (portaled to
 * <body> so it stays truly viewport-fixed even while the juice wrapper is
 * transformed mid-shake) and provides burst(x, y, opts) to descendants.
 */
export default function HitSparks({ children }) {
  const canvasRef = useRef(null)
  const partsRef = useRef([])
  const rafRef = useRef(0)
  const dprRef = useRef(1)
  const paletteRef = useRef([K_WHITE, K_GOLD, K_CYAN])

  // Portals must not render during SSR / first client render or hydration
  // mismatches (server has no <canvas>, client would). Gate on a mount flag so
  // both the server and the initial client render agree (nothing), then portal.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Size the canvas to the viewport (DPR-aware, integer) and keep it crisp.
  // Runs once the canvas exists (i.e. after mount), so keyed on `mounted`.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    paletteRef.current = readPalette()

    const resize = () => {
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1))
      dprRef.current = dpr
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      ctx.imageSmoothingEnabled = false
    }

    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [mounted])

  // Single shared rAF loop; runs only while particles are alive.
  const loop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      rafRef.current = 0
      return
    }
    const ctx = canvas.getContext('2d')
    const dpr = dprRef.current
    const parts = partsRef.current

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.imageSmoothingEnabled = false

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]
      p.vx *= FRICTION
      p.vy = p.vy * FRICTION + GRAVITY
      p.x += p.vx
      p.y += p.vy
      p.life -= p.decay
      if (p.life <= 0) {
        parts.splice(i, 1)
        continue
      }
      ctx.globalAlpha = p.life < 1 ? p.life : 1
      ctx.fillStyle = p.color
      ctx.fillRect(
        Math.round(p.x * dpr),
        Math.round(p.y * dpr),
        p.size * dpr,
        p.size * dpr
      )
    }
    ctx.globalAlpha = 1

    rafRef.current = parts.length > 0 ? requestAnimationFrame(loop) : 0
  }, [])

  // Fire ~12-20 pixel shards from (x, y). opts: count, angle, spread, power, color.
  const burst = useCallback(
    (x, y, opts = {}) => {
      if (prefersReducedMotion()) return

      const count = opts.count ?? 12 + Math.floor(Math.random() * 8) // 12-19
      const spread = opts.spread ?? Math.PI * 2
      const baseAngle = opts.angle ?? 0
      const power = opts.power ?? 1
      const palette = paletteRef.current
      const parts = partsRef.current

      for (let i = 0; i < count; i++) {
        const angle = baseAngle + (Math.random() - 0.5) * spread
        const speed = (1.5 + Math.random() * 4.5) * power
        parts.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.floor(Math.random() * 3), // 2-4px
          color: opts.color ?? palette[Math.floor(Math.random() * palette.length)],
          life: 1,
          decay: 0.02 + Math.random() * 0.03,
        })
      }

      if (!rafRef.current) rafRef.current = requestAnimationFrame(loop)
    },
    [loop]
  )

  const value = useMemo(() => ({ burst }), [burst])

  return (
    <SparksContext.Provider value={value}>
      {mounted &&
        createPortal(
          <canvas
            ref={canvasRef}
            className="pixelated"
            style={CANVAS_STYLE}
            aria-hidden="true"
          />,
          document.body
        )}
      {children}
    </SparksContext.Provider>
  )
}
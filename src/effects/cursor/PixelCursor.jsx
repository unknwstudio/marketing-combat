'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './cursor.css'

// Only replace the OS cursor on real pointing devices (skip touch / no-hover).
const canHover = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(hover: hover) and (pointer: fine)').matches

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Replaces the OS cursor with a pixel crosshair and emits a fading square dust
 * trail on move. Portaled to <body> so it stays viewport-fixed regardless of
 * any ancestor transform (the juice shake).
 *
 * @param {{ enabled?: boolean, children?: React.ReactNode }} props
 */
export default function PixelCursor({ enabled = true, children }) {
  const [active, setActive] = useState(false)
  const dotRef = useRef(null)
  const layerRef = useRef(null)
  const lastTrail = useRef(0)

  // Decide on mount / when toggled whether we take over the cursor at all.
  useEffect(() => {
    setActive(enabled && canHover())
  }, [enabled])

  useEffect(() => {
    if (!active) return
    const root = document.documentElement
    root.classList.add('k-cursor-on')

    const reduce = prefersReducedMotion()

    const move = (e) => {
      const x = e.clientX
      const y = e.clientY
      const dot = dotRef.current
      if (dot) dot.style.transform = `translate(${x}px, ${y}px)`

      const layer = layerRef.current
      if (reduce || !layer) return

      const now = performance.now()
      if (now - lastTrail.current < 24) return // throttle spawns
      lastTrail.current = now

      const jx = x + (Math.random() * 6 - 3)
      const jy = y + (Math.random() * 6 - 3)
      const dust = document.createElement('span')
      dust.className = 'k-cursor-dust'
      layer.appendChild(dust)

      const anim = dust.animate(
        [
          { opacity: 0.9, transform: `translate(${jx}px, ${jy}px) scale(1)` },
          { opacity: 0, transform: `translate(${jx}px, ${jy}px) scale(0.4)` },
        ],
        { duration: 320, easing: 'steps(4, end)' }
      )
      const cleanup = () => dust.remove()
      anim.onfinish = cleanup
      anim.oncancel = cleanup
    }

    window.addEventListener('mousemove', move, { passive: true })
    return () => {
      window.removeEventListener('mousemove', move)
      root.classList.remove('k-cursor-on')
      layerRef.current?.replaceChildren()
    }
  }, [active])

  return (
    <>
      {active &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="k-cursor" aria-hidden="true">
            <div className="k-cursor-layer" ref={layerRef} />
            <div className="k-cursor-dot" ref={dotRef} />
          </div>,
          document.body
        )}
      {children}
    </>
  )
}
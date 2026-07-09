'use client'

import { useEffect, useRef, useState } from 'react'
import './ScaleCanvas.css'

/**
 * Fits a fixed design-width canvas (default 1440px) to the viewport.
 *
 * - Desktop (viewport >= breakpoint): scales the 1440px canvas down uniformly,
 *   preserving the pixel-perfect absolute layout, and reserves the scaled height.
 * - Tablet / mobile (viewport < breakpoint): drops the scaling entirely and lets
 *   the sections reflow fluidly at full width (each section's own media queries
 *   handle the mobile layout). A CSS fallback mirrors this so the reflowed layout
 *   is already correct on first paint, before hydration.
 */
export default function ScaleCanvas({ width = 1440, breakpoint = 1024, children }) {
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState(0)
  const [fluid, setFluid] = useState(false)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const measure = () => {
      if (window.innerWidth < breakpoint) {
        setFluid(true)
        setScale(1)
        setHeight(0)
        return
      }
      setFluid(false)
      const s = Math.min(outer.clientWidth / width, 1)
      setScale(s)
      setHeight(inner.offsetHeight * s)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(outer)
    ro.observe(inner)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [width, breakpoint])

  return (
    <div
      className="scale-canvas"
      ref={outerRef}
      style={{ height: fluid ? undefined : height || undefined }}
    >
      <div
        className={'scale-canvas__inner' + (fluid ? ' scale-canvas__inner--fluid' : '')}
        ref={innerRef}
        style={fluid ? undefined : { width, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  )
}

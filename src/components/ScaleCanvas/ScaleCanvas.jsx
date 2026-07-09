'use client'

import { useEffect, useRef, useState } from 'react'
import './ScaleCanvas.css'

/**
 * Fits a fixed design-width canvas (default 1440px) to the viewport.
 *
 * - Desktop (viewport >= breakpoint): scales the 1440px canvas to the full
 *   viewport width (up or down) uniformly, preserving the pixel-perfect absolute
 *   layout, and reserves the scaled height so the page flows normally.
 * - Tablet / mobile (viewport < breakpoint): drops the scaling entirely and lets
 *   the sections reflow fluidly at full width (each section's own media queries
 *   handle the mobile layout). A CSS fallback mirrors this so the reflowed layout
 *   is already correct on first paint, before hydration.
 *
 * Two scaling engines (prop `mode`):
 * - 'transform' (default): transform:scale + JS-reserved height. Composited
 *   and battle-tested, but the visual/layout divergence breaks position:sticky
 *   inside the canvas (sticky constraints are computed in untransformed layout
 *   space, so at scale != 1 pinned elements drift with scroll).
 * - 'zoom': CSS zoom. Zoom multiplies LAYOUT geometry, so scroll math and
 *   position:sticky stay correct at any scale, and no height reservation is
 *   needed. Use this for pages with sticky/pinned scroll elements (classic).
 */
export default function ScaleCanvas({
  width = 1440,
  breakpoint = 1024,
  mode = 'transform',
  children,
}) {
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
      // fill the full viewport width — scale up on wide screens, down on narrow
      const s = outer.clientWidth / width
      setScale(s)
      // zoom participates in layout, so the document flows around the zoomed
      // height by itself; only the transform engine must reserve it manually
      setHeight(mode === 'zoom' ? 0 : inner.offsetHeight * s)
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
  }, [width, breakpoint, mode])

  return (
    <div
      className="scale-canvas"
      ref={outerRef}
      style={{ height: fluid ? undefined : height || undefined }}
    >
      <div
        className={'scale-canvas__inner' + (fluid ? ' scale-canvas__inner--fluid' : '')}
        ref={innerRef}
        style={
          fluid
            ? undefined
            : mode === 'zoom'
              ? { width, zoom: scale }
              : { width, transform: `scale(${scale})` }
        }
      >
        {children}
      </div>
    </div>
  )
}

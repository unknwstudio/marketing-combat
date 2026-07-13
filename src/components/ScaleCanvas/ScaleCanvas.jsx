// @ts-check
'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './ScaleCanvas.css'

// useLayoutEffect measures + applies the zoom BEFORE the browser paints the
// post-hydration frame, so the viewer never sees the intermediate zoom:1 state
// snap to the real scale. It warns during SSR (no layout), so fall back to
// useEffect on the server where effects don't run anyway.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

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
/**
 * @param {object} props
 * @param {number} [props.width]  fixed design width in px (default 1440)
 * @param {number} [props.breakpoint]  below this viewport width, reflow fluidly (default 1024)
 * @param {'transform' | 'zoom'} [props.mode]  scaling engine (see doc above)
 * @param {import('react').ReactNode} [props.children]
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

  useIsoLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    // Touch tablets (iPad landscape/Surface etc.) sit in the 1024–1439px band
    // and would otherwise get a zoom-fitted DESKTOP layout with shrunk targets
    // and no hover equivalents. Opt any coarse-pointer device into the fluid
    // mobile reflow regardless of width (the /play game already reads coarse).
    const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches

    const measure = () => {
      if (window.innerWidth < breakpoint || coarse) {
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

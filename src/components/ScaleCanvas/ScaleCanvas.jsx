'use client'

import { useEffect, useRef, useState } from 'react'
import './ScaleCanvas.css'

/**
 * Scales a fixed design-width canvas (default 1440px) down to the viewport
 * width, preserving the pixel-perfect absolute layout of the ported sections.
 * The wrapper reserves the correct scaled height so the page flows normally.
 */
export default function ScaleCanvas({ width = 1440, children }) {
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const measure = () => {
      const available = outer.clientWidth
      const s = Math.min(available / width, 1)
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
  }, [width])

  return (
    <div className="scale-canvas" ref={outerRef} style={{ height: height || undefined }}>
      <div
        className="scale-canvas__inner"
        ref={innerRef}
        style={{ width, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  )
}
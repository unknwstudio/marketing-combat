'use client'

import { useEffect, useRef } from 'react'
import './ClassicMenu.css'

/**
 * Orange menu card (Figma node 36:4312, x=1288 y=16 w=133) — per the design
 * it stays in the same place through the whole page. position:fixed can't
 * live inside ScaleCanvas (the transformed canvas becomes its containing
 * block), so the card renders outside the canvas and mirrors the canvas
 * scale itself: scale = viewportWidth / 1440 on desktop, 1 in fluid mode.
 */
export default function ClassicMenu() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const apply = () => {
      const w = document.documentElement.clientWidth
      const scale = w >= 1024 ? w / 1440 : 1
      el.style.transform = `scale(${scale})`
    }
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [])

  return (
    <div className="c-menu" ref={ref}>
      <nav className="c-menu__card" aria-label="Page menu">
        <div className="c-menu__links">
          {/* /classic doesn't carry these sections itself — they live on the
              full /demo tour, so these are cross-page anchors (same pattern
              as the hero's registration badge). */}
          <a className="c-menu__link" href="/demo#format">
            How it works
          </a>
          <span className="c-menu__rule" aria-hidden="true" />
          {/* Judges dropped while that /demo section is hidden — see
              src/app/demo/page.jsx */}
          <a className="c-menu__link" href="/demo#faq">
            FAQs
          </a>
          <span className="c-menu__rule" aria-hidden="true" />
        </div>
        <button className="c-menu__apply" type="button">
          Apply
        </button>
      </nav>
    </div>
  )
}

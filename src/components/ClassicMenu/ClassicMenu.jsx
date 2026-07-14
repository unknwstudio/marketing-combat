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
          {/* /classic now carries these sections itself, so the menu anchors
              to the local section ids (was cross-page /#… while the page only
              had the hero). */}
          <a className="c-menu__link" href="#c-how">
            How it works
          </a>
          <span className="c-menu__rule" aria-hidden="true" />
          <a className="c-menu__link" href="#c-judges">
            Judges
          </a>
          <span className="c-menu__rule" aria-hidden="true" />
          <a className="c-menu__link" href="#c-faq">
            FAQs
          </a>
          <span className="c-menu__rule" aria-hidden="true" />
        </div>
        <a className="c-menu__apply" href="#cta" data-register>
          Apply
        </a>
      </nav>
    </div>
  )
}

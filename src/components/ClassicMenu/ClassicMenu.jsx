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
      // mirror ScaleCanvas's fluid decision EXACTLY, including its coarse-pointer
      // branch — without it a 1024-1439px touch tablet gets a fluid mobile page
      // body under a shrunk desktop menu card (2026-07-16 audit). Read inside
      // apply so 2-in-1 mode flips are picked up live.
      const coarse =
        typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
      const w = document.documentElement.clientWidth
      const scale = w >= 1024 && !coarse ? w / 1440 : 1
      el.style.transform = `scale(${scale})`
    }
    apply()
    window.addEventListener('resize', apply)
    const mq =
      typeof window.matchMedia === 'function' ? window.matchMedia('(pointer: coarse)') : null
    mq?.addEventListener?.('change', apply)
    return () => {
      window.removeEventListener('resize', apply)
      mq?.removeEventListener?.('change', apply)
    }
  }, [])

  return (
    <div className="c-menu" ref={ref}>
      <nav className="c-menu__card" aria-label="Page menu">
        <div className="c-menu__links">
          {/* /classic now carries these sections itself, so the menu anchors
              to the local section ids — the same live set the footer's EVENT
              column links (How it works / Tracks / Case tracks / FAQ). */}
          <a className="c-menu__link" href="#c-how">
            How it works
          </a>
          <span className="c-menu__rule" aria-hidden="true" />
          <a className="c-menu__link" href="#c-tracks">
            Tracks
          </a>
          <span className="c-menu__rule" aria-hidden="true" />
          <a className="c-menu__link" href="#c-arenas">
            Case tracks
          </a>
          <span className="c-menu__rule" aria-hidden="true" />
          {/* Judges link hidden together with the ClassicJury section
              (ClassicApp.jsx) — they toggle as a pair, else the link scrolls
              nowhere. Re-enable both at once (and restore its rule).
          <a className="c-menu__link" href="#c-judges">
            Judges
          </a>
          <span className="c-menu__rule" aria-hidden="true" />
          */}
          <a className="c-menu__link" href="#c-faq">
            FAQ
          </a>
        </div>
        <a className="c-menu__apply" href="#cta" data-register>
          Apply
        </a>
      </nav>
    </div>
  )
}

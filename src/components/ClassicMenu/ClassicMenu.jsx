'use client'

import { useEffect, useRef, useState } from 'react'
import './ClassicMenu.css'

/**
 * Orange menu card (Figma node 36:4312, x=1288 y=16 w=133) — per the design
 * it stays in the same place through the whole page. position:fixed can't
 * live inside ScaleCanvas (the transformed canvas becomes its containing
 * block), so the card renders outside the canvas and mirrors the canvas
 * scale itself: scale = viewportWidth / 1440 on desktop, 1 in fluid mode.
 *
 * MOBILE (2026-07-17): a disclosure — the fixed "Menu" pill expands into the
 * same orange card (section anchors + Apply). Replaces the lone Apply pill,
 * which left an ~8000px page with no in-page navigation on phones (UX audit
 * finding). Standard disclosure a11y: aria-expanded/controls, Esc closes and
 * returns focus to the trigger, outside tap and link taps close. The whole
 * component still hides while the hero is on screen (the hero carries its own
 * Registration CTA, and the pill used to clip the H1).
 */
export default function ClassicMenu() {
  const ref = useRef(null)
  const triggerRef = useRef(null)
  const [open, setOpen] = useState(false)

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

    // Mobile: while the hero (with its own full-width Registration CTA) is on
    // screen, the fixed pill only collides with the H1 (it clipped "MARKETER",
    // 2026-07-17). Track hero visibility; the CSS hides the menu below the
    // desktop split only. Also fold the disclosure when hiding.
    let io
    const hero = document.querySelector('.c-hero')
    if (hero && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(([entry]) => {
        el.classList.toggle('c-menu--over-hero', entry.isIntersecting)
        if (entry.isIntersecting) setOpen(false)
      })
      io.observe(hero)
    }

    return () => {
      window.removeEventListener('resize', apply)
      mq?.removeEventListener?.('change', apply)
      io?.disconnect()
    }
  }, [])

  // disclosure dismissal — armed only while open
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    const onPointerDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <div className={'c-menu' + (open ? ' c-menu--open' : '')} ref={ref}>
      {/* mobile-only disclosure trigger (desktop shows the full card, CSS-hidden there) */}
      <button
        className="c-menu__trigger"
        type="button"
        ref={triggerRef}
        aria-expanded={open}
        aria-controls="c-menu-card"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Close' : 'Menu'}
      </button>
      <nav
        className="c-menu__card"
        id="c-menu-card"
        aria-label="Page menu"
        /* any link tap (anchor or Apply) folds the disclosure — the jump is
           the task completion; keeping the card open would cover the target */
        onClick={(e) => {
          if (e.target.closest('a')) setOpen(false)
        }}
      >
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

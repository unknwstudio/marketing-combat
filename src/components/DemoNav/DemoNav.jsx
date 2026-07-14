'use client'

import { useEffect, useState } from 'react'
import './DemoNav.css'

/**
 * DemoNav — "LEVEL SELECT" strip for the ~16 400px /demo tour. Anchors
 * (prizes / format / faq / register) so the tour is never more than one
 * click from any point. Sits directly under ScrollHealth's bar and follows
 * the same show/hide-over-hero rule so the two read as one HUD.
 * Ordered to match the page's own section order, not alphabetically or by
 * "importance" — a nav that jumps ahead of itself is more confusing than
 * none. ("judges" removed while that section is hidden — see demo/page.jsx.)
 */
const LINKS = [
  { href: '#prizes', label: 'prizes' },
  { href: '#format', label: 'format' },
  { href: '#faq', label: 'faq' },
  { href: '#register', label: 'register' },
]

export default function DemoNav() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    let raf = 0
    let lastY = document.documentElement.scrollTop
    const measure = () => {
      const el = document.documentElement
      const y = el.scrollTop
      const max = el.scrollHeight - el.clientHeight
      const pastHero = (max > 0 ? y / max : 0) > 0.03
      const dir = y - lastY
      lastY = y
      // Past the hero the strip is a fixed, centered pill — while scrolling DOWN
      // (reading) it would sit on top of each section heading as it passes, so
      // hide it then and re-show on any upward scroll (when the nav is actually
      // wanted). 2026-07-14 UX audit M4. Tiny jitter (|dir|<=4) keeps the state.
      setShown((prev) => {
        if (!pastHero) return false
        if (dir > 4) return false
        if (dir < -4) return true
        return prev
      })
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <nav
      className={'dnav' + (shown ? ' dnav--shown' : '')}
      aria-label="Jump to section"
      aria-hidden={shown ? undefined : true}
    >
      <span className="dnav__kicker">level select</span>
      <span className="dnav__links">
        {/* while opacity: 0 / pointer-events: none (before scroll) these links
            leave the tab order — otherwise keyboard focus lands on a control
            that is 100% invisible (WCAG 2.4.11 Focus Not Obscured) */}
        {LINKS.map((l) => (
          <a
            key={l.href}
            className="dnav__link"
            href={l.href}
            tabIndex={shown ? undefined : -1}
          >
            {l.label}
          </a>
        ))}
      </span>
    </nav>
  )
}

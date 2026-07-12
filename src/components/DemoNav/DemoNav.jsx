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
    const measure = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      const p = max > 0 ? el.scrollTop / max : 0
      setShown(p > 0.03)
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
    <nav className={'dnav' + (shown ? ' dnav--shown' : '')} aria-label="Jump to section">
      <span className="dnav__kicker">level select</span>
      <span className="dnav__links">
        {LINKS.map((l) => (
          <a key={l.href} className="dnav__link" href={l.href}>
            {l.label}
          </a>
        ))}
      </span>
    </nav>
  )
}

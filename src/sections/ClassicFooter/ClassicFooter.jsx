'use client'

import { useEffect, useRef } from 'react'
import MadeByUnknw from '@/components/MadeByUnknw/MadeByUnknw'
import './ClassicFooter.css'

/**
 * FOOTER — dark sitemap close. Brand + tagline, one column of real in-page
 * nav anchors, and the legal column. Legal links point at the classic-skin
 * legal routes so the pages match the site version they open from. Green
 * link-hover is the single accent.
 *
 * REVEAL-FROM-UNDER (Frame 74 wave 1): the footer hides beneath the final CTA
 * (negative top margin, lower z-index) and pins bottom-aligned (sticky) while
 * the CTA scrolls away above it — the page appears to lift off the footer.
 * The pin offset and overlap are design px measured through the canvas scale;
 * margin-bottom re-adds the reveal runway the negative margin removed.
 */

const NAV = [
  { label: 'How it works', href: '#c-how' },
  { label: 'Tracks', href: '#c-tracks' },
  { label: 'Battle arenas', href: '#c-arenas' },
  { label: 'FAQ', href: '#c-faq' },
]

const LEGAL = [
  { label: 'Legal information', href: '/legal/classic/notice' },
  { label: 'Code of conduct', href: '/legal/classic/conduct' },
  { label: 'Privacy', href: '/legal/classic/privacy' },
]

export default function ClassicFooter() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const setPin = () => {
      const scale = el.getBoundingClientRect().width / 1440
      const h = el.getBoundingClientRect().height / scale
      const vh = window.innerHeight / scale
      // set on the PARENT so both the footer and the runway spacer read them
      el.parentElement.style.setProperty('--foot-h', `${h}px`)
      // bottom-aligned pin; clamp to 0 if the footer is taller than the viewport
      el.parentElement.style.setProperty('--foot-pin', `${Math.max(vh - h, 0)}px`)
    }
    setPin()
    const ro = new ResizeObserver(setPin)
    const scaler = el.closest('.scale-canvas')
    if (scaler) ro.observe(scaler)
    ro.observe(el)
    window.addEventListener('resize', setPin)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', setPin)
    }
  }, [])

  return (
    <>
    <footer className="c-foot" id="c-footer" aria-label="Footer" ref={ref}>
      <div className="c-wrap c-foot__grid">
        <div className="c-foot__brand">
          <p className="c-foot__wordmark cap-trim">AI Marketing Kombat</p>
          <p className="c-foot__tag">The best marketer on the planet, decided.</p>
        </div>

        <nav className="c-foot__col" aria-label="Sections">
          <p className="c-foot__col-h cap-trim">Event</p>
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <a className="c-foot__link" href={n.href}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="c-foot__col">
          <p className="c-foot__col-h cap-trim">Legal</p>
          <ul>
            {LEGAL.map((l) => (
              <li key={l.href}>
                <a className="c-foot__link" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="c-wrap c-foot__base">
        <p className="cap-trim">© 2026 AI Marketing Kombat · July 2026 · Barcelona</p>
        <MadeByUnknw />
      </div>
    </footer>
    {/* reveal runway: the scroll distance the sticky footer is unveiled over —
        a SIBLING (not the footer's own margin, which would cancel the sticky
        displacement bound) */}
    <div className="c-foot-runway" aria-hidden="true" />
    </>
  )
}

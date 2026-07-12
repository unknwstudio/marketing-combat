'use client'

import { useEffect, useRef, useState } from 'react'
import './Footer.css'

const PAYOFF = 'YOU SURVIVED'

/**
 * Footer — two distinct beats, not one loud one.
 *
 * 1. The payoff: Hero opens with "will you survive?" — this is the answer,
 *    for anyone who actually scrolled the full ~16 000px tour. Letters slam
 *    in one at a time (steps() stagger, once, on scroll-into-view) instead
 *    of fading, matching the site's house "quantized, never smooth" motion
 *    rule. Reduced-motion: the full word renders instantly, no stagger.
 * 2. Everything below — brand line + legal — stays deliberately quiet (small,
 *    muted, no glow). Dropped the old "GAME OVER" line here on purpose: right
 *    under "YOU SURVIVED" it read as a contradiction (lost vs. made it), and
 *    a quiet footer shouldn't carry a second loud statement anyway.
 */
export default function Footer() {
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setRevealed(true)
        io.disconnect()
      },
      { threshold: 0.6 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <footer className="dsec footer" aria-label="Footer">
      <div className="footer__payoff" ref={ref}>
        <span className="footer__kicker">full tour cleared</span>
        <h2 className={'footer__survived' + (revealed ? ' footer__survived--in' : '')}>
          {PAYOFF.split('').map((ch, i) => (
            <span
              key={i}
              className="footer__letter"
              aria-hidden="true"
              style={{ '--i': i }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
          <span className="sr-only">{PAYOFF}</span>
        </h2>
      </div>

      <div className="footer__quiet">
        <span className="footer__title">AI MARKETING KOMBAT · JULY 2026 · BARCELONA</span>
        <div className="footer__legal">
          <span>© 2026 AI Marketing Kombat. All rights reserved.</span>
          {/* No live legal pages yet — a span with the destination text (not
              href="#") avoids the classic "link that teleports to the top of
              a 16 000px page" trap. Swap these for real <a> once /legal,
              /conduct and /privacy exist. */}
          <span className="footer__links">
            <span className="footer__linkPending">Legal information</span>
            <span aria-hidden="true">·</span>
            <span className="footer__linkPending">Code of conduct</span>
            <span aria-hidden="true">·</span>
            <span className="footer__linkPending">Privacy</span>
          </span>
        </div>
      </div>
    </footer>
  )
}

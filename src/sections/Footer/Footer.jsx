import MadeByUnknw from '@/components/MadeByUnknw/MadeByUnknw'
import './Footer.css'

/**
 * Footer — a pure static server component (no hooks/handlers of its own); the
 * data-announce/data-sound/data-announce-burst attributes below are read by the
 * client-side Announcer, so no 'use client' boundary is needed here.
 *
 * Three-column layout (desktop): brand + copyright on the left, the legal
 * links stacked in the centre, the "made by unknw" studio credit on the right.
 * Everything collapses to a centred single column below 1024px.
 *
 * The end-of-tour payoff is a full-viewport arcade call-out (see Announcer,
 * which watches data-announce/data-sound/data-announce-burst below); the footer
 * itself stays deliberately quiet once the flash fades.
 */
export default function Footer() {
  return (
    <footer
      className="dsec footer"
      aria-label="Footer"
      data-announce="YOU SURVIVED"
      data-sound="win"
      data-announce-burst
    >
      <div className="footer__inner">
        {/* left — brand line + copyright */}
        <div className="footer__brand">
          <span className="footer__title">AI MARKETING KOMBAT · JULY 2026 · BARCELONA</span>
          <span className="footer__copy">© 2026 AI Marketing Kombat. All rights reserved.</span>
        </div>

        {/* centre — legal links (routes under /legal/* — see src/lib/legal.js) */}
        <nav className="footer__links" aria-label="Legal">
          <a href="/legal/notice">Legal information</a>
          <a href="/legal/conduct">Code of conduct</a>
          <a href="/legal/privacy">Privacy</a>
        </nav>

        {/* right — studio credit */}
        <div className="footer__credit">
          <MadeByUnknw className="footer__madeby" />
        </div>
      </div>
    </footer>
  )
}

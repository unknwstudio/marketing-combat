import './Footer.css'

/**
 * Footer — a pure static server component (no hooks/handlers of its own); the
 * data-announce/data-sound/data-announce-burst attributes below are read by the
 * client-side Announcer, so no 'use client' boundary is needed here.
 *
 * The end-of-tour payoff is a full-viewport arcade call-out (see
 * Announcer, which watches data-announce/data-sound/data-announce-burst
 * below), the same system used for "FIGHT!" / "STAGE 0X" / "FINISH HIM"
 * elsewhere on /demo. The footer itself stays deliberately quiet once the
 * flash fades — no second loud element competing with that moment.
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
      <div className="footer__quiet">
        <span className="footer__title">AI MARKETING KOMBAT · JULY 2026 · BARCELONA</span>
        <div className="footer__legal">
          <span>© 2026 AI Marketing Kombat. All rights reserved.</span>
          {/* Legal routes live under /legal/* (AI skin) — see src/lib/legal.js. */}
          <span className="footer__links">
            <a href="/legal/notice">Legal information</a>
            <span aria-hidden="true">·</span>
            <a href="/legal/conduct">Code of conduct</a>
            <span aria-hidden="true">·</span>
            <a href="/legal/privacy">Privacy</a>
          </span>
        </div>
      </div>
    </footer>
  )
}

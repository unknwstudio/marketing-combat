'use client'

import './Footer.css'

/**
 * Footer — the end-of-tour payoff is a full-viewport arcade call-out (see
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

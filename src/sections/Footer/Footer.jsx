import './Footer.css'
import PixelIcon from '@/components/PixelIcon/PixelIcon'

/**
 * GAME OVER footer. Copy verbatim from the original site.
 * Stars are SVG PixelIcons — the ★ glyph is an emoji lottery across platforms.
 */
export default function Footer() {
  return (
    <footer className="dsec footer" aria-label="Footer">
      <span className="footer__over">
        <PixelIcon name="star" size="0.9em" /> GAME OVER <PixelIcon name="star" size="0.9em" />
      </span>
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
    </footer>
  )
}

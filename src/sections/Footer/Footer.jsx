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
        <span className="footer__links">
          <a href="#">Legal information</a>
          <span aria-hidden="true">·</span>
          <a href="#">Code of conduct</a>
          <span aria-hidden="true">·</span>
          <a href="#">Privacy</a>
        </span>
      </div>
    </footer>
  )
}

import './Footer.css'

/**
 * GAME OVER footer. Copy verbatim from the original site.
 */
export default function Footer() {
  return (
    <footer className="dsec footer" aria-label="Footer">
      <span className="footer__over">★ GAME OVER ★</span>
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

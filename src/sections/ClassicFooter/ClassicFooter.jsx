import './ClassicFooter.css'

/**
 * FOOTER — dark sitemap close. Brand + tagline, one column of real in-page
 * nav anchors, and legal placeholders (no destinations yet, rendered as muted
 * non-interactive text so nothing pretends to be a working link). Green
 * link-hover is the single accent.
 */

const NAV = [
  { label: 'How it works', href: '#c-how' },
  { label: 'Tracks', href: '#c-tracks' },
  { label: 'Battle arenas', href: '#c-arenas' },
  { label: 'FAQ', href: '#c-faq' },
]

const LEGAL = ['Legal information', 'Code of conduct', 'Privacy']

export default function ClassicFooter() {
  return (
    <footer className="c-foot" id="c-footer" aria-label="Footer">
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
              <li key={l}>
                <span className="c-foot__legal">{l}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="c-wrap c-foot__base">
        <p className="cap-trim">© 2026 AI Marketing Kombat · July 2026 · Barcelona</p>
      </div>
    </footer>
  )
}

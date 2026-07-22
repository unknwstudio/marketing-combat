import { PARTNERS } from '@/config/partners'
import './Sponsors.css'

/**
 * SPONSORS — OUR PARTNERS. Placeholder logo wall: the roster lives in
 * src/config/partners.js (interim — logos get added / replaced as deals
 * close). Dark-skin treatment per the top-site pattern (Framer/Linear/
 * Resend): white monochrome marks straight on the bg — the CSS filter
 * flattens any brand colors, so the light-bg SVG set needs no dark variants.
 * A partner without an SVG yet renders as a plain wordmark.
 */
export default function Sponsors() {
  return (
    <section className="dsec sponsors" aria-label="Our partners">
      <div className="dsec__head">
        <span className="dsec__round">Sponsors — this fight is brought to you by</span>
        <h2 className="dsec__title">our partners</h2>
      </div>

      <ul className="sponsors__grid">
        {PARTNERS.map((p) => (
          <li key={p.name} className="sponsors__tile">
            {p.src ? (
              <img className="sponsors__logo" src={p.src} alt={p.name} loading="lazy" />
            ) : (
              <span className="sponsors__word">{p.name}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

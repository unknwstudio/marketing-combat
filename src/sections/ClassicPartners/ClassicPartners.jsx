import MaskHead from '@/components/classic-motion/MaskHead'
import { PARTNERS } from '@/config/partners'
import './ClassicPartners.css'

/**
 * PARTNERS & SPONSORS — placeholder logo wall: hairline-ruled tiles, logos at
 * their original brand colors on white. The roster lives in
 * src/config/partners.js (interim — logos get added / replaced as deals
 * close); a partner without an SVG yet renders as a plain wordmark.
 */
export default function ClassicPartners() {
  return (
    <section className="c-sec" id="c-partners" aria-label="Partners and sponsors">
      <div className="c-wrap">
        <header className="c-partners__head">
          <MaskHead lines={['Partners & sponsors']} />
        </header>

        <ul className="c-partners__grid">
          {PARTNERS.map((p, i) => (
            <li
              className="c-partners__cell c-reveal"
              key={p.name}
              style={{ '--i': i, '--logo-h': p.h + 'px' }}
            >
              {p.src ? (
                <img className="c-partners__logo" src={p.src} alt={p.name} loading="lazy" />
              ) : (
                <span className="c-partners__word cap-trim">{p.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

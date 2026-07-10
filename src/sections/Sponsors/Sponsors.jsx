import './Sponsors.css'

/**
 * SPONSORS — OUR PARTNERS. The original site shows placeholder partner tiles;
 * we mirror that (no invented sponsor names).
 */
const SLOTS = Array.from({ length: 6 })

export default function Sponsors() {
  return (
    <section className="dsec sponsors" aria-label="Our partners">
      <div className="dsec__head">
        <span className="dsec__round">Sponsors — this fight is brought to you by</span>
        <h2 className="dsec__title">our partners</h2>
      </div>

      <ul className="sponsors__grid">
        {SLOTS.map((_, i) => (
          <li key={i} className="dcard sponsors__slot" aria-hidden="true">
            <span className="sponsors__mark">PARTNER</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

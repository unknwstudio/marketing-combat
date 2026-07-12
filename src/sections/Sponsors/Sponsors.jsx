import './Sponsors.css'

/**
 * SPONSORS — OUR PARTNERS. No sponsor names to show yet; the slots stay
 * honest about being open rather than reading as an unfinished section.
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
            <span className="sponsors__mark">SLOT OPEN</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

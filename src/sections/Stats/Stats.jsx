import './Stats.css'

/**
 * Stats strip — the four headline numbers the original site states.
 * Verbatim values; no invented figures.
 */
const STATS = [
  { value: '1', unit: 'st', caption: 'International hackathon' },
  { value: '300', unit: '+', caption: 'Participants' },
  { value: '30', unit: '', caption: 'Finalists in Barcelona' },
  { value: '$100M', unit: '+', caption: 'Budget under management' },
]

export default function Stats() {
  return (
    <section className="dsec stats" aria-label="By the numbers">
      <ul className="stats__row">
        {STATS.map((s) => (
          <li key={s.caption} className="stats__cell">
            <span className="stats__value">
              {s.value}
              <span className="stats__unit">{s.unit}</span>
            </span>
            <span className="stats__caption">{s.caption}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

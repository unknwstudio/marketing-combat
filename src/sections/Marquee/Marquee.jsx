import './Marquee.css'

/**
 * FIGHT! marquee strip — the scrolling arcade ticker the original site runs
 * between the roster and the stats. Two copies of the track loop seamlessly.
 */
const ITEMS = [
  'FIGHT!',
  'AI MARKETING KOMBAT',
  'ROUND 1 — QUALIFICATION OPEN',
  'JULY 2026',
  'FINAL IN BARCELONA',
  'FATALITY ON YOUR CAC',
  'FLAWLESS VICTORY',
  'FINISH HIM',
]

function Track() {
  return (
    <div className="marquee__track" aria-hidden="true">
      {ITEMS.map((t, i) => (
        <span key={i} className="marquee__item">
          <span className="marquee__star">★</span> {t}
        </span>
      ))}
    </div>
  )
}

export default function Marquee() {
  return (
    <section className="marquee" aria-label="AI Marketing Kombat ticker">
      <div className="marquee__viewport">
        <Track />
        <Track />
      </div>
    </section>
  )
}

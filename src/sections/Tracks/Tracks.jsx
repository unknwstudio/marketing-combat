import './Tracks.css'

/**
 * ROUND 03 — HACKATHON TRACKS. Two fighting-style tracks.
 * Copy verbatim from the original site (special line, bullets, tags).
 */
const TRACKS = [
  {
    n: '01',
    name: 'AI-CREATIVES',
    special: 'HOLOGRAPHIC BANNER MAKER',
    bullets: [
      '↘ AI-automated generation of creative packs',
      '↗ Banner-pack verification via an AI-agent auditor',
    ],
    tags: ['SPEED', 'CREATIVITY', 'SCALE'],
  },
  {
    n: '02',
    name: 'AI-PERFORMANCE',
    special: 'ZERO-WASTE MEDIA SPLIT',
    bullets: [
      '↘ Strategy',
      '↘ Analytics',
      '↗ Buying Paid Media',
      '↗ Media Split Management',
    ],
    tags: ['STRATEGY', 'ANALYTICS', 'ROAS'],
  },
]

export default function Tracks() {
  return (
    <section className="dsec tracks" aria-label="Hackathon tracks">
      <div className="dsec__head">
        <span className="dsec__round">Round 03 — choose your fighting style</span>
        <h2 className="dsec__title">hackathon tracks</h2>
      </div>

      <ul className="tracks__grid">
        {TRACKS.map((t) => (
          <li key={t.n} className="dcard tracks__card">
            <div className="tracks__top">
              <span className="dindex">{t.n}</span>
              <h3 className="tracks__name">{t.name}</h3>
            </div>

            <div className="tracks__special">
              <span className="tracks__specialLabel">SPECIAL:</span>
              <span className="tracks__specialValue">{t.special}</span>
            </div>

            <ul className="tracks__bullets">
              {t.bullets.map((b) => (
                <li key={b} className="tracks__bullet">
                  {b}
                </li>
              ))}
            </ul>

            <div className="tracks__tags">
              {t.tags.map((tag) => (
                <span key={tag} className="dpill">
                  {tag}
                </span>
              ))}
            </div>

            <span className="tracks__fight">FIGHT!</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

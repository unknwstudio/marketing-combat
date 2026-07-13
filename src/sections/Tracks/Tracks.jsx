import './Tracks.css'
import PixelIcon from '@/components/PixelIcon/PixelIcon'

/**
 * STAGE 03 — HACKATHON TRACKS. Two fighting-style tracks.
 * Copy verbatim from the original site (special line, bullets, tags).
 */
const TRACKS = [
  {
    n: '01',
    img: 'ai-creatives.webp',
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
    img: 'ai-performance.webp',
    name: 'AI-PERFORMANCE',
    special: 'ZERO-WASTE MEDIA SPLIT',
    bullets: [
      '↘ Strategy',
      '↘ Analytics',
      '↗ Paid Media Buying',
      '↗ Media Split Management',
    ],
    tags: ['STRATEGY', 'ANALYTICS', 'ROAS'],
  },
]

export default function Tracks() {
  return (
    <section className="dsec tracks" aria-label="Hackathon tracks">
      <div className="dsec__head">
        <span className="dsec__round">Stage 03 — choose your fighting style</span>
        <h2 className="dsec__title">hackathon tracks</h2>
      </div>

      <ul className="tracks__grid">
        {TRACKS.map((t, i) => [
          /* deliberately NOT focusable: the card does nothing on Enter, so a
             tab stop would only add dead stops before the real CTAs and make
             screen readers announce the whole card as actionable. The
             marching ants stay a hover flourish. */
          <li key={t.n} className="dcard tracks__card">
            <img
              className="tracks__art pixelated"
              src={`/assets/demo/tracks/${t.img}`}
              alt={`${t.name} track illustration`}
              loading="lazy"
              decoding="async"
            />
            <div className="tracks__top">
              <span className="dindex">{t.n}</span>
              <h3 className="tracks__name">{t.name}</h3>
            </div>

            <div className="tracks__special">
              <span className="tracks__specialLabel">SPECIAL:</span>
              <span className="tracks__specialValue">{t.special}</span>
            </div>

            <ul className="tracks__bullets">
              {/* bullets keep their verbatim ↘/↗ copy in data; the arrow is
                  rendered as an SVG PixelIcon (unicode arrows emoji-render on
                  some platforms) */}
              {t.bullets.map((b) => (
                <li key={b} className="tracks__bullet">
                  <PixelIcon
                    name={b.startsWith('↗') ? 'arrowNE' : 'arrowSE'}
                    size="0.85em"
                  />{' '}
                  {b.slice(2)}
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
          </li>,
          /* VS badge sits between the two cards so "pick one track" reads
             instantly from the grid itself, without depending on the
             section head (which can scroll out of view above it). Hidden
             from AT: the section aria-label + track names already say it. */
          i === 0 && (
            <li key="vs" className="tracks__vs" aria-hidden="true">
              <img
                className="tracks__vsImg pixelated"
                src="/assets/demo/tracks/vs.png"
                alt=""
                loading="lazy"
                decoding="async"
              />
            </li>
          ),
        ])}
      </ul>
    </section>
  )
}

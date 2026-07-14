import MaskHead from '@/components/classic-motion/MaskHead'
import './ClassicTracks.css'

/**
 * HACKATHON TRACKS — two tall poster tiles, color-blocked opposites (black
 * vs blue) so the pair reads as a choice, not two identical boxes. Title top,
 * arrow bottom, shared internal baseline. Arrow slides on hover/focus.
 */

const TRACKS = [
  {
    n: 'Track 01',
    variant: 'dark',
    title: 'AI-Creatives',
    body: 'Special: holographic banner maker. AI-automated generation of creative packs, and banner-pack verification via an AI-agent auditor.',
  },
  {
    n: 'Track 02',
    variant: 'blue',
    title: 'AI-Performance',
    body: 'Special: zero-waste media split. Strategy, analytics, paid-media buying and media-split management.',
  },
]

export default function ClassicTracks() {
  return (
    <section className="c-sec acc-blue" id="c-tracks" aria-label="Hackathon tracks">
      <div className="c-wrap">
        <header className="c-tracks__head">
          <MaskHead lines={['Choose your', 'fighting style']} />
          <p className="c-lede c-reveal c-tracks__intro">
            Two directions to compete in — pick the one that plays to your strengths.
          </p>
        </header>

        <div className="c-tracks__grid">
          {TRACKS.map((t, i) => (
            <article
              className={`c-track c-track--${t.variant} c-reveal`}
              key={t.n}
              style={{ '--i': i }}
            >
              <p className="c-track__kicker cap-trim">{t.n}</p>
              <h3 className="c-track__title cap-trim">{t.title}</h3>
              <p className="c-track__body">{t.body}</p>
              <span className="c-track__go" aria-hidden="true">
                <span className="c-track__go-label">Special move</span>
                <span className="c-track__arrow">→</span>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

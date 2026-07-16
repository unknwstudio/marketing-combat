import MaskHead from '@/components/classic-motion/MaskHead'
import { typeset } from '@/lib/typeset'
import './ClassicTracks.css'

/**
 * HACKATHON TRACKS — two color-blocked poster tiles, opposites (black vs blue)
 * so the pair reads as a choice, not two identical boxes. Champion-card layout
 * (Frame 10): title pinned to the top, body pinned to the bottom, the space
 * filling between them. Static (no hover affordance).
 */

const TRACKS = [
  {
    variant: 'dark',
    title: 'AI-Creatives',
    body: 'Holographic banner maker, AI-automated generation of creative packs, and banner-pack verification via an AI-agent auditor.',
  },
  {
    variant: 'blue',
    title: 'AI-Performance',
    body: 'Zero-waste media split — strategy, analytics, paid-media buying and media-split management.',
  },
]

export default function ClassicTracks() {
  return (
    <section className="c-sec acc-blue" id="c-tracks" aria-label="Hackathon tracks">
      <div className="c-wrap">
        <header className="c-tracks__head">
          <MaskHead lines={['Choose your', 'fighting style']} />
          <p className="c-lede c-reveal c-tracks__intro">
            {typeset('Two directions to compete in — pick the one that plays to your strengths.')}
          </p>
        </header>

        <div className="c-tracks__grid">
          {TRACKS.map((t, i) => (
            <article
              className={`c-track c-track--${t.variant} c-reveal`}
              key={t.title}
              style={{ '--i': i }}
            >
              <h3 className="c-track__title cap-trim">{t.title}</h3>
              <p className="c-track__body">{typeset(t.body)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

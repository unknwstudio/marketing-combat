import MaskHead from '@/components/classic-motion/MaskHead'
import { typeset } from '@/lib/typeset'
import './ClassicFloor.css'

/**
 * FROM THE FLOOR — asymmetric photo bento (one 2x2 hero + five 1x1) tiling a
 * 3-col grid perfectly. All six share one duotone grade (CSS, not baked) so
 * the disparate event shots read as one authored set. Captions sit below;
 * contained hover zoom keeps the frame fixed.
 */

const BASE = '/assets/classic/floor'
// No alt field: each photo sits in a <figure> whose visible caption (cap + sub)
// carries the information, so the images are decorative-within-a-captioned-figure
// (alt="") — the old generic alts ("Hackathon moment" ×2) only duplicated less
// than the captions already say (1.1.1, 2026-07-16 audit).
// -1300/-960 WebP (new names per the cache-busting convention): the old 2206px
// JPGs rendered at ≤~900 design px THROUGH the grayscale+blend grade — full-res
// color chroma was paid for and thrown away (2026-07-16 perf audit, −816KB).
const PHOTOS = [
  { src: `${BASE}/hackathon-960.webp`, cap: 'On the clock', sub: 'Qualifying round' },
  { src: `${BASE}/speaker-stage-1300.webp`, cap: 'On stage', sub: 'Opening talk' },
  { src: `${BASE}/room-1300.webp`, cap: 'The room', sub: 'Harbour.Space' },
  { src: `${BASE}/audience-1300.webp`, cap: 'All eyes in', sub: 'Jury & peers' },
  { src: `${BASE}/speaker-1300.webp`, cap: 'Closing words', sub: 'Barcelona final' },
  { src: `${BASE}/hackathon-2-960.webp`, cap: 'Heads down', sub: 'Solving the brief' },
]

export default function ClassicFloor() {
  return (
    <section className="c-sec acc-blue" id="c-floor" aria-label="From the floor">
      <div className="c-wrap">
        <header className="c-floor__head">
          <MaskHead lines={['Inside the arena']} />
          <p className="c-lede c-reveal c-floor__intro">
            {typeset('Moments from the battle — strategy under pressure, AI in the hands of the best.')}
          </p>
        </header>

        <div className="c-floor__grid">
          {PHOTOS.map((p, i) => (
            <figure className="c-floor__item c-reveal" key={p.cap} style={{ '--i': i }}>
              <span className="c-floor__frame">
                <img src={p.src} alt="" loading="lazy" />
              </span>
              <figcaption className="c-floor__cap cap-trim">
                <span className="c-floor__cap-t">{typeset(p.cap)}</span>
                <span className="c-floor__cap-s">{typeset(p.sub)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

import MaskHead from '@/components/classic-motion/MaskHead'
import './ClassicFloor.css'

/**
 * FROM THE FLOOR — asymmetric photo bento (one 2x2 hero + five 1x1) tiling a
 * 3-col grid perfectly. All six share one duotone grade (CSS, not baked) so
 * the disparate event shots read as one authored set. Captions sit below;
 * contained hover zoom keeps the frame fixed.
 */

const BASE = '/assets/classic/floor'
const PHOTOS = [
  { src: `${BASE}/hackathon.jpg`, alt: 'Hackathon moment', cap: 'On the clock', sub: 'Qualifying round' },
  { src: `${BASE}/speaker-stage.jpg`, alt: 'Speaker on stage', cap: 'On stage', sub: 'Opening talk' },
  { src: `${BASE}/room.jpg`, alt: 'The room', cap: 'The room', sub: 'Harbour.Space' },
  { src: `${BASE}/audience.jpg`, alt: 'In the audience', cap: 'All eyes in', sub: 'Jury & peers' },
  { src: `${BASE}/speaker.jpg`, alt: 'Speaker', cap: 'Closing words', sub: 'Barcelona final' },
  { src: `${BASE}/hackathon-2.jpg`, alt: 'Hackathon moment', cap: 'Heads down', sub: 'Solving the brief' },
]

export default function ClassicFloor() {
  return (
    <section className="c-sec acc-blue" id="c-floor" aria-label="From the floor">
      <div className="c-wrap">
        <header className="c-floor__head">
          <p className="c-kicker">From the floor</p>
          <MaskHead lines={['Inside the arena.']} />
          <p className="c-lede c-reveal c-floor__intro">
            Moments from the battle — strategy under pressure, AI in the hands of the best.
          </p>
        </header>

        <div className="c-floor__grid">
          {PHOTOS.map((p, i) => (
            <figure className="c-floor__item c-reveal" key={p.cap} style={{ '--i': i }}>
              <span className="c-floor__frame">
                <img src={p.src} alt={p.alt} loading="lazy" />
              </span>
              <figcaption className="c-floor__cap cap-trim">
                <span className="c-floor__cap-t">{p.cap}</span>
                <span className="c-floor__cap-s">{p.sub}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

import MaskHead from '@/components/classic-motion/MaskHead'
import { typeset } from '@/lib/typeset'
import './ClassicHow.css'

/**
 * HOW IT WORKS — a two-column compose (like the champion block, #10): the
 * heading column pins (position: sticky) while the three steps stack vertically
 * on the right and rise into place beside it on scroll. Oversized weight-400
 * indices walk the palette orange -> blue -> green so the row reads as one coded
 * sequence (orange, not the bright yellow, so the numeral stays readable).
 */

const STEPS = [
  {
    n: '01',
    // the site's signature orange (--k-orange), not --c-yellow: this accent
    // colors the giant "01" numeral, and bright yellow on the white page is
    // unreadable (1.07:1)
    accent: 'var(--k-orange)',
    title: 'Qualifying round',
    body: '45 minutes online. A real case to solve under pressure, with the AI stack of your choice.',
  },
  {
    n: '02',
    accent: 'var(--c-blue)',
    title: 'Evaluation',
    body: 'A panel of judges + AI assesses every solution. The client gets the final word.',
  },
  {
    n: '03',
    accent: 'var(--c-green)',
    title: 'The final',
    body: '2 hours in Barcelona at Harbour.Space University — in person. A closed networking event and a private closing party follow.',
  },
]

export default function ClassicHow() {
  return (
    <section className="c-sec acc-blue" id="c-how" aria-label="How it works">
      <div className="c-wrap c-how">
        <header className="c-how__head">
          <MaskHead lines={['Registration.', 'Qualifying round.', 'Final']} />
          <p className="c-lede c-reveal c-how__intro">
            {typeset(
              'A real task — a brief, a data room, Google / Meta / TikTok, a creative block, AI tools, and limited time.'
            )}
          </p>
        </header>

        <ol className="c-how__steps">
          {STEPS.map((s, i) => (
            <li className="c-step c-reveal" key={s.n} style={{ '--i': i }}>
              <span className="c-step__n cap-trim" style={{ '--step-accent': s.accent }}>
                {s.n}
              </span>
              <h3 className="c-step__title cap-trim">{typeset(s.title)}</h3>
              <p className="c-step__body">{typeset(s.body)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

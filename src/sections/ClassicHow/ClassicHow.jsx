import MaskHead from '@/components/classic-motion/MaskHead'
import { typeset } from '@/lib/typeset'
import './ClassicHow.css'

/**
 * HOW IT WORKS — a two-column compose (like the champion block, #10): the
 * heading column pins (position: sticky) while the steps rise into place beside
 * it on scroll. The steps are a large hover-list in the "who it's for" idiom —
 * each title is big editorial type that turns blue with a ► marker on hover; a
 * quiet line of detail sits under each.
 */

const STEPS = [
  {
    title: 'Qualifying round',
    body: '45 minutes online. A real case to solve under pressure, with the AI stack of your choice.',
  },
  {
    title: 'Evaluation',
    body: 'A panel of judges + AI assesses every solution. The client gets the final word.',
  },
  {
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
            <li className="c-step c-reveal" key={s.title} style={{ '--i': i }}>
              <span className="c-step__item">
                <svg className="c-step__arrow" viewBox="0 0 52 27" aria-hidden="true" focusable="false">
                  <path d="M0 0L51.75 13.42L0 26.85Z" fill="var(--k-classic-blue)" />
                </svg>
                <span className="c-step__title cap-trim">{typeset(s.title)}</span>
              </span>
              <p className="c-step__body">{typeset(s.body)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

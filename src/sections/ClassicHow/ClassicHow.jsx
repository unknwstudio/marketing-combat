import MaskHead from '@/components/classic-motion/MaskHead'
import { typeset } from '@/lib/typeset'
import './ClassicHow.css'

/**
 * HOW IT WORKS — a two-column compose (like the champion block, #10): the
 * heading column pins (position: sticky) while the right column scrolls up
 * beside it. The right column lists what a real task throws at you as a large
 * hover-list in the "who it's for" idiom — each item is big editorial type that
 * turns blue with a ► marker sliding in on hover.
 */

// the components of "A real task —": each becomes one hover-list item
const TASK = ['a brief', 'a data room', 'Google / Meta / TikTok', 'a creative block', 'AI tools', 'limited time']

export default function ClassicHow() {
  return (
    <section className="c-sec acc-blue" id="c-how" aria-label="How it works">
      <div className="c-wrap c-how">
        <header className="c-how__head">
          <MaskHead lines={['Registration.', 'Qualifying round.', 'Final']} />
        </header>

        <div className="c-how__body">
          <p className="c-lede c-reveal c-how__intro">{typeset('A real task —')}</p>
          <ol className="c-how__steps">
            {TASK.map((label, i) => (
              <li className="c-step c-reveal" key={label} style={{ '--i': i }}>
                <span className="c-step__item">
                  <svg className="c-step__arrow" viewBox="0 0 52 27" aria-hidden="true" focusable="false">
                    <path d="M0 0L51.75 13.42L0 26.85Z" fill="var(--k-classic-blue)" />
                  </svg>
                  <span className="c-step__title cap-trim">{typeset(label)}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

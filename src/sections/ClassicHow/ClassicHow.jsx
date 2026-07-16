import MaskHead from '@/components/classic-motion/MaskHead'
import { typeset } from '@/lib/typeset'
import './ClassicHow.css'

/**
 * HOW IT WORKS — a two-column layout. The left column carries the heading and,
 * under it, what a real task throws at you as a large hover-list in the "who
 * it's for" idiom (each component turns blue with a ► marker sliding in on
 * hover). The right column holds the three phase cards — a 1px frame + a coded
 * accent strip walking orange → blue → green.
 */

// the components of "A real task —": each becomes one hover-list item
const TASK = ['A brief', 'A data room', 'Google / Meta / TikTok', 'A creative block', 'AI tools', 'Limited time']

const PHASES = [
  {
    n: '01',
    // the site's signature orange (--k-orange), not --c-yellow: bright yellow on
    // the white page is unreadable (1.07:1)
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
        <div className="c-how__lead">
          <header className="c-how__head">
            <MaskHead lines={['Registration.', 'Qualifying round.', 'Final']} />
          </header>
          {/* second heading movement: names the challenge and heads its list */}
          <div className="c-how__task">
            <MaskHead lines={['A real task —']} className="c-how__task-h" />
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

        <ol className="c-how__cards">
          {PHASES.map((p, i) => (
            <li className="c-phase c-reveal" key={p.n} style={{ '--i': i, '--phase-accent': p.accent }}>
              <span className="c-phase__n cap-trim">{p.n}</span>
              <h3 className="c-phase__title cap-trim">{typeset(p.title)}</h3>
              <p className="c-phase__body">{typeset(p.body)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

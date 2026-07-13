import MaskHead from '@/components/classic-motion/MaskHead'
import './ClassicHow.css'

/**
 * HOW IT WORKS — three numbered steps as hairline-ruled columns (editorial,
 * not carded). Oversized weight-400 indices walk the palette
 * yellow -> blue -> green so the row reads as one coded sequence.
 */

const STEPS = [
  {
    n: '01',
    accent: 'var(--c-yellow)',
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
      <div className="c-wrap">
        <header className="c-how__head">
          <p className="c-kicker">How it works</p>
          <MaskHead lines={['Registration.', 'Qualifying round. Final.']} />
          <p className="c-lede c-reveal c-how__intro">
            A real task — a brief, a data room, Google / Meta / TikTok, a creative block, AI tools,
            and limited time.
          </p>
        </header>

        <ol className="c-how__steps">
          {STEPS.map((s, i) => (
            <li className="c-step c-reveal" key={s.n} style={{ '--i': i }}>
              <span className="c-step__n cap-trim" style={{ '--step-accent': s.accent }}>
                {s.n}
              </span>
              <h3 className="c-step__title cap-trim">{s.title}</h3>
              <p className="c-step__body">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

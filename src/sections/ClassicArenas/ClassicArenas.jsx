import MaskHead from '@/components/classic-motion/MaskHead'
import './ClassicArenas.css'

/**
 * BATTLE ARENAS — the case-track roster. Four quiet white cards, each coded by
 * a 4px accent top-border (green / blue / yellow / black) so the row reads as
 * a set. Hover/focus inverts the card to black; the accent bar stays.
 */

const ARENAS = [
  {
    tag: 'A1',
    accent: 'var(--c-green)',
    title: 'Healthcare',
    body: 'Complex funnel. Long cycle. High LTV. Mission: cut CAC and speed up first-purchase conversion.',
  },
  {
    tag: 'A2',
    accent: 'var(--c-blue)',
    title: 'B2B SaaS',
    body: 'Long sales cycles. Many stakeholders. Mission: turn PQLs into pipeline with AI-driven demand gen.',
  },
  {
    tag: 'A3',
    accent: 'var(--c-yellow)',
    title: 'E-commerce',
    body: 'High volume. Thin margins. ROAS pressure. Mission: scale creative and squeeze CAC with AI.',
  },
  {
    tag: 'A4',
    accent: 'var(--k-black)',
    title: 'Enterprise',
    body: 'Six-figure deals. Long procurement. Mission: run AI-powered ABM that lands target accounts.',
  },
]

export default function ClassicArenas() {
  return (
    <section className="c-sec acc-blue" id="c-arenas" aria-label="Battle arenas">
      <div className="c-wrap">
        <header className="c-arenas__head">
          <p className="c-kicker">Battle arenas</p>
          <MaskHead lines={['Case tracks.']} />
          <p className="c-lede c-reveal c-arenas__intro">
            Real client briefs across industries. Win and the client pays the prize.
          </p>
        </header>

        <ul className="c-arenas__grid">
          {ARENAS.map((a, i) => (
            <li
              className="c-arena c-reveal"
              key={a.tag}
              style={{ '--i': i, '--card-accent': a.accent }}
            >
              <span className="c-arena__tag cap-trim">{a.tag}</span>
              <h3 className="c-arena__title cap-trim">{a.title}</h3>
              <p className="c-arena__body">{a.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

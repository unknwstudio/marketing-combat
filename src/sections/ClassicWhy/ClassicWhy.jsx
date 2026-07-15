import MaskHead from '@/components/classic-motion/MaskHead'
import { typeset } from '@/lib/typeset'
import './ClassicWhy.css'

/**
 * WHY JOIN — two-column compose (same principle as How / Champion, #10) but
 * MIRRORED: the heading pins on the RIGHT while the six numbered reasons stack
 * and scroll up on the LEFT. Alternating the anchored side from block to block
 * keeps the page from repeating the same left-heading layout every section.
 */

const REASONS = [
  { n: '01', title: 'Challenge', body: 'Compare yourself with other market leaders in real-world conditions.' },
  { n: '02', title: 'Community', body: 'Get into a closed, professional community of senior practitioners.' },
  { n: '03', title: 'Networking', body: 'Networking with the jury, sponsors, and market colleagues.' },
  { n: '04', title: 'Opportunity', body: 'The best solutions on GitHub. Offers from sponsoring companies.' },
  { n: '05', title: 'Portfolio case', body: 'A real AI marketing case study — with numbers — in your portfolio.' },
  { n: '06', title: 'Prize vault', body: 'Annual subscriptions to AI services and individual sessions with experts.' },
]

export default function ClassicWhy() {
  return (
    <section className="c-sec acc-blue" id="c-why" aria-label="Why join">
      <div className="c-wrap c-why">
        <header className="c-why__head">
          <MaskHead lines={['Why join the', 'hackathon?']} />
          <p className="c-lede c-reveal c-why__intro">
            {typeset('Find out your real level of mastering AI tools for marketing alongside your peers.')}
          </p>
        </header>

        <ol className="c-why__list">
          {REASONS.map((r, i) => (
            <li className="c-why__item c-reveal" key={r.n} style={{ '--i': i }}>
              <span className="c-why__n cap-trim">{r.n}</span>
              <div className="c-why__text">
                <h3 className="c-why__title cap-trim">{typeset(r.title)}</h3>
                <p className="c-why__body">{typeset(r.body)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

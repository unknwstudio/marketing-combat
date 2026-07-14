import MaskHead from '@/components/classic-motion/MaskHead'
import './ClassicWhy.css'

/**
 * WHY JOIN — six reasons as a two-up numbered contents list. Big weight-400
 * indices (single blue accent), hairline dividers, index left / copy right.
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
      <div className="c-wrap">
        <header className="c-why__head">
          <MaskHead lines={['Why join the', 'hackathon?']} />
          <p className="c-lede c-reveal c-why__intro">
            Find out your real level of mastering AI tools for marketing alongside your peers.
          </p>
        </header>

        <ul className="c-why__list">
          {REASONS.map((r, i) => (
            <li className="c-why__item c-reveal" key={r.n} style={{ '--i': i % 2 }}>
              <span className="c-why__n cap-trim">{r.n}</span>
              <div className="c-why__text">
                <h3 className="c-why__title cap-trim">{r.title}</h3>
                <p className="c-why__body">{r.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

import './WhyJoin.css'

/**
 * WHY JOIN THE HACKATHON? — six numbered reasons.
 * Copy verbatim from the original site (glyphs, titles, body, and the
 * one-word arcade tag on each card).
 */
const REASONS = [
  {
    n: '01',
    icon: 'icon-challenge.png',
    title: 'CHALLENGE',
    body: 'Compare yourself with other market leaders in real-world conditions.',
    tag: 'POWER',
  },
  {
    n: '02',
    icon: 'icon-community.png',
    title: 'COMMUNITY',
    body: 'Get into a closed, professional community of senior practitioners.',
    tag: 'UNITY',
  },
  {
    n: '03',
    icon: 'icon-networking.png',
    title: 'NETWORKING',
    body: 'Networking with the jury, sponsors, and market colleagues.',
    tag: 'REACH',
  },
  {
    n: '04',
    icon: 'icon-opportunity.png',
    title: 'OPPORTUNITY',
    body: 'The best solutions on GitHub. Offers from sponsoring companies.',
    tag: 'LUCK',
  },
  {
    n: '05',
    icon: 'icon-portfolio.png',
    title: 'PORTFOLIO CASE',
    body: 'A real AI marketing case study — with numbers — in your portfolio.',
    tag: 'PROOF',
  },
  {
    n: '06',
    icon: 'icon-prize.png',
    title: 'PRIZE VAULT',
    body: 'Annual subscriptions to AI services and individual sessions with experts.',
    tag: 'LOOT',
  },
]

export default function WhyJoin() {
  return (
    <section className="dsec dsec--alt whyjoin" aria-label="Why join the hackathon">
      <div className="dsec__head">
        <span className="dsec__round">Why join?</span>
        <h2 className="dsec__title">why join the hackathon?</h2>
        <p className="dsec__sub">
          Find out your real level of mastering AI tools for marketing alongside your peers.
          Decide who is №1 marketer on the planet — and №1 AI Creator.
        </p>
      </div>

      <ul className="whyjoin__grid">
        {REASONS.map((r) => (
          <li key={r.n} className="dcard whyjoin__card">
            <div className="whyjoin__top">
              <span className="dindex">{r.n}</span>
              <img
                className="whyjoin__icon pixelated"
                src={`/assets/demo/whyjoin/${r.icon}`}
                alt=""
                aria-hidden="true"
              />
            </div>
            <h3 className="whyjoin__title">{r.title}</h3>
            <p className="whyjoin__body">{r.body}</p>
            <span className="dpill whyjoin__tag">{r.tag}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

import './Stages.css'

/**
 * STAGE 05 — HACKATHON STAGES. Three stages to compete.
 * Copy verbatim from the original site (meta line, body, CTA text).
 */
const STAGES = [
  {
    n: '01',
    title: 'ROUND 1',
    meta: 'SOLO · OPEN QUALIFICATION',
    body: 'Self-applied participants only. Individual solutions for standardized cases. Those who fail receive an observer subscription with full hackathon access.',
    cta: '>>> registration <<<',
  },
  {
    n: '02',
    title: 'ROUND 2',
    meta: 'INVITE · LIVE MAIN TOUR',
    body: 'Invited participants start here. Anonymized real-life case studies from startups and enterprise clients. Use of AI is mandatory, not recommended.',
    cta: '>>> registration <<<',
  },
  {
    n: '03',
    title: 'FINAL ROUND',
    meta: 'OFFLINE · BARCELONA',
    heading: 'BARCELONA FINAL',
    body: 'Individual case solutions and jury presentation. The jury evaluates — but the final word belongs to the client.',
    cta: '>>> finish him <<<',
    final: true,
  },
]

export default function Stages() {
  return (
    <section id="format" className="dsec stages" aria-label="Hackathon stages">
      <div className="dsec__head">
        <span className="dsec__round" data-announce="STAGE 05" data-sound="round3">
          Stage 05 — three stages to compete
        </span>
        <h2 className="dsec__title">hackathon stages</h2>
        <p className="dsec__sub">
          After qualification, participants are ranked according to their level of expertise.
        </p>
      </div>

      <ul className="stages__grid">
        {STAGES.map((s) => (
          <li
            key={s.n}
            className={'dcard stages__card' + (s.final ? ' stages__card--final' : '')}
          >
            <div className="stages__top">
              <span className="dindex">{s.n}</span>
              <span className="stages__meta">{s.meta}</span>
            </div>
            <h3 className="stages__title">{s.heading || s.title}</h3>
            <p className="stages__body">{s.body}</p>
            <button
              type="button"
              className={'d-btn stages__cta' + (s.final ? ' d-btn--red' : '')}
              data-magnetic
              data-sfx="confirm"
            >
              {s.cta}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

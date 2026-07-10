import './Judges.css'

/**
 * BOSS ROSTER — THE JUDGES. Three placeholder bosses + one secret boss.
 * Copy verbatim from the original site (which itself shows placeholders).
 */
const JUDGES = [
  { n: '01', name: 'JUDGE PLACEHOLDER', line: 'Position, company — placeholder' },
  { n: '02', name: 'JUDGE PLACEHOLDER', line: 'Position, company — placeholder' },
  { n: '03', name: 'JUDGE PLACEHOLDER', line: 'Position, company — placeholder' },
]

export default function Judges() {
  return (
    <section className="dsec judges" aria-label="The judges">
      <div className="dsec__head">
        <span className="dsec__round">Boss roster — meet the masters</span>
        <h2 className="dsec__title">the judges</h2>
        <p className="dsec__sub">
          The jury evaluates the case solutions — but the final word is up to the client.
        </p>
      </div>

      <ul className="judges__grid">
        {JUDGES.map((j) => (
          <li key={j.n} className="dcard judges__card">
            <div className="judges__portrait" aria-hidden="true">
              <span className="judges__silhouette">◈</span>
            </div>
            <span className="judges__tag">BOSS · {j.n}</span>
            <h3 className="judges__name">{j.name}</h3>
            <p className="judges__line">{j.line}</p>
          </li>
        ))}

        <li className="dcard judges__card judges__card--secret">
          <div className="judges__portrait judges__portrait--secret" aria-hidden="true">
            <span className="judges__question">?</span>
          </div>
          <span className="judges__tag judges__tag--secret">SECRET BOSS ???</span>
          <h3 className="judges__name">UNLOCK SOON</h3>
          <p className="judges__line">Identity revealed before the main tour</p>
        </li>
      </ul>
    </section>
  )
}

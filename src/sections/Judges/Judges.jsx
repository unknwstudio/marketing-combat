import './Judges.css'

/**
 * BOSS ROSTER — THE JUDGES. Three unrevealed bosses + one secret boss.
 * Roster is announced closer to the event — copy stays in-world (matches
 * the secret-boss idiom below) instead of shipping a literal "placeholder"
 * to production. Portraits are generated pixel-art bosses.
 */
const JUDGES = [
  { n: '01', img: 'boss-01.webp', name: 'BOSS 01 — REVEALED SOON', line: 'Identity unlocks before the main tour' },
  { n: '02', img: 'boss-02.webp', name: 'BOSS 02 — REVEALED SOON', line: 'Identity unlocks before the main tour' },
  { n: '03', img: 'boss-03.webp', name: 'BOSS 03 — REVEALED SOON', line: 'Identity unlocks before the main tour' },
]

export default function Judges() {
  return (
    <section id="judges" className="dsec judges" aria-label="The judges">
      <div className="dsec__head">
        <span className="dsec__round">Boss roster — meet the masters</span>
        <h2 className="dsec__title">the judges</h2>
        <p className="dsec__sub">
          The jury evaluates the case solutions — but the final word is up to the client.
        </p>
      </div>

      <ul className="judges__grid">
        {JUDGES.map((j) => (
          <li key={j.n} className="dcard judges__card" data-select-sfx="hit">
            <div className="judges__frame">
              <img
                className="judges__portrait pixelated"
                src={`/assets/demo/judges/${j.img}`}
                alt={`Boss ${j.n} portrait`}
                loading="lazy"
                decoding="async"
              />
              <span className="judges__sweep" aria-hidden="true" />
            </div>
            <span className="judges__tag">BOSS · {j.n}</span>
            <h3 className="judges__name">{j.name}</h3>
            <p className="judges__line">{j.line}</p>
          </li>
        ))}

        <li className="dcard judges__card judges__card--secret" data-select-sfx="hit">
          <div className="judges__frame">
            <img
              className="judges__portrait pixelated"
              src={`/assets/demo/judges/secret-boss.webp`}
              alt="Secret boss — identity hidden"
              loading="lazy"
              decoding="async"
            />
            <span className="judges__sweep" aria-hidden="true" />
          </div>
          <span className="judges__tag judges__tag--secret">SECRET BOSS ???</span>
          <h3 className="judges__name">UNLOCK SOON</h3>
          <p className="judges__line">Identity revealed before the main tour</p>
        </li>
      </ul>
    </section>
  )
}

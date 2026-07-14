import MaskHead from '@/components/classic-motion/MaskHead'
import './ClassicJury.css'

/**
 * THE JURY — a native scroll-snap rail of portrait cards. The roster isn't
 * public yet, so the judges are neutral duotone placeholders (silhouette drawn
 * in CSS — no asset needed) and the final card is the memorable move: a flat
 * black SECRET JUDGE tile using absence as the design.
 */

const JUDGES = [
  { name: 'Judge placeholder', role: 'Position · Company', bio: 'Short description of the judge’s expertise — placeholder.' },
  { name: 'Judge placeholder', role: 'Position · Company', bio: 'Short description of the judge’s expertise — placeholder.' },
  { name: 'Judge placeholder', role: 'Position · Company', bio: 'Short description of the judge’s expertise — placeholder.' },
]

function Silhouette() {
  return (
    <svg className="c-judge__glyph" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="24" r="12" />
      <path d="M12 58c0-11 9-18 20-18s20 7 20 18Z" />
    </svg>
  )
}

export default function ClassicJury() {
  return (
    <section className="c-sec acc-blue" id="c-judges" aria-label="The jury">
      <div className="c-wrap">
        <header className="c-jury__head">
          <MaskHead lines={['Judges']} />
          <p className="c-lede c-reveal c-jury__intro">
            The jury evaluates the case solutions — but the final word is up to the client. Full
            roster revealed before the main tour.
          </p>
        </header>
      </div>

      <ul className="c-jury__rail" aria-label="Judges">
        {JUDGES.map((j, i) => (
          <li className="c-judge" key={i}>
            <span className="c-judge__photo">
              <Silhouette />
            </span>
            <span className="c-judge__name cap-trim">{j.name}</span>
            <span className="c-judge__role cap-trim">{j.role}</span>
            <span className="c-judge__bio">{j.bio}</span>
          </li>
        ))}
        <li className="c-judge c-judge--secret">
          <span className="c-judge__q" aria-hidden="true">
            ?
          </span>
          <span className="c-judge__name cap-trim">Secret judge</span>
          <span className="c-judge__role cap-trim">Revealed soon</span>
          <span className="c-judge__bio">Identity revealed before the main tour.</span>
        </li>
      </ul>
    </section>
  )
}

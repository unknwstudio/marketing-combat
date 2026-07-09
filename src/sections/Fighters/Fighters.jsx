import './Fighters.css'

/**
 * CHOOSE YOUR FIGHTER — roster section.
 * Ported pixel-faithfully from Figma "Frame 46" (node 35:4234), 1440x755.
 * Graphics are exported PNGs under /assets/fighters; text and layout are code.
 */

const FIGHTERS = [
  { img: 'fighter1.png', label: 'CMOs' },
  { img: 'fighter2.png', label: 'HEADS OF GROWTH' },
  { img: 'fighter3.png', label: 'PERFORMANCE LEAD GEN', selected: true },
  { img: 'fighter4.png', label: 'AI CREATORS' },
  { img: 'fighter5.png', label: '…& FUTURE LEGENDS' },
]

export default function Fighters() {
  return (
    <section className="fighters" aria-label="Choose your fighter">
      <img
        className="fighters__bg"
        src={`/assets/fighters/bg.png`}
        alt=""
        aria-hidden="true"
      />

      <h2 className="fighters__title">choose your fighter</h2>

      <div className="fighters__content">
        <div className="fighters__caption">
          <span>Choose your fighter • who it&rsquo;s for</span>
          <span>For senior marketers of the AI era.</span>
        </div>

        <ul className="fighters__row">
          {FIGHTERS.map((f) => (
            <li
              key={f.label}
              className={
                'fighters__card' +
                (f.selected ? ' fighters__card--selected' : '')
              }
            >
              <img
                className="fighters__portrait"
                src={`/assets/fighters/${f.img}`}
                alt={`${f.label} fighter portrait`}
              />
              <div className="fighters__label">{f.label}</div>
              <a
                className="fighters__cardlink"
                href="/play"
                aria-label={`Play — ${f.label}`}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

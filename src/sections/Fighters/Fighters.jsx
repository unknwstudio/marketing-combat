import './Fighters.css'

/**
 * CHOOSE YOUR FIGHTER — roster section.
 * Ported pixel-faithfully from Figma "Frame 46" (node 35:4234), 1440x755.
 * Graphics are exported PNGs under /assets/fighters; text and layout are code.
 */

const FIGHTERS = [
  { img: 'fighter1.webp', label: 'CMOs' },
  { img: 'fighter2.webp', label: 'HEADS OF GROWTH' },
  { img: 'fighter3.webp', label: 'PERFORMANCE LEAD GEN', selected: true },
  { img: 'fighter4.webp', label: 'AI CREATORS' },
  { img: 'fighter5.webp', label: '…& FUTURE LEGENDS' },
]

export default function Fighters() {
  return (
    <section className="fighters" aria-label="Choose your fighter">
      <img
        className="fighters__bg"
        src={`/assets/fighters/bg.webp`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
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
              data-select-sfx="hit"
              /* deliberately NOT focusable: the card does nothing on Enter,
                 so a tab stop would add 5 dead stops on the way to the real
                 CTAs and make screen readers announce whole cards as
                 actionable. The marching ants stay a hover flourish. */
            >
              <div className="fighters__frame">
                <img
                  className="fighters__portrait"
                  src={`/assets/fighters/${f.img}`}
                  alt={`${f.label} fighter portrait`}
                  loading="lazy"
                  decoding="async"
                />
                <span className="fighters__sweep" aria-hidden="true" />
                <span className="fighters__select" aria-hidden="true">
                  {'>>> select <<<'}
                </span>
              </div>
              <div className="fighters__label">{f.label}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

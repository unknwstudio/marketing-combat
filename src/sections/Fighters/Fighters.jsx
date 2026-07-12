import './Fighters.css'

/**
 * CHOOSE YOUR FIGHTER — roster section.
 * Ported pixel-faithfully from Figma "Frame 46" (node 35:4234), 1440x755.
 * Graphics are exported PNGs under /assets/fighters; text and layout are code.
 */

const FIGHTERS = [
  { img: 'fighter1.webp', label: 'CMOs' },
  { img: 'fighter2.webp', label: 'HEADS OF GROWTH' },
  { img: 'fighter3.webp', label: 'PERFORMANCE LEAD GEN' },
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
              className="fighters__card"
              data-select-sfx="hit"
              /* deliberately NOT focusable: the card does nothing on Enter,
                 so a tab stop would add 5 dead stops on the way to the real
                 CTAs and make screen readers announce whole cards as
                 actionable. The marching ants stay a hover flourish. */
            >
              {/* strikes down from off the top of the section into whichever
                  card is hovered — hidden by default, flashed in on hover
                  (see .fighters__bolt in Fighters.css). Tall enough to run
                  behind "choose your fighter" itself (the title's z-index
                  keeps it legible on top); two short forks break off the
                  main stem partway down so it reads as lightning, not a
                  single ruled line. A fresh layer, not a crop of
                  fighters__bg: that background is one flat composite image
                  with its own bolt painted into it once, aimed at nothing
                  in particular. */}
              <svg
                className="fighters__bolt"
                aria-hidden="true"
                viewBox="0 0 100 370"
                preserveAspectRatio="none"
              >
                <path
                  d="M54,0 L42,58 L60,64 L38,126 L56,132 L34,196 L52,202 L40,264 L58,270 L46,370 L34,366 L46,270 L28,264 L40,202 L22,196 L44,132 L26,126 L48,64 L30,58 Z M56,130 L80,150 L94,178 L82,168 L68,150 L58,136 Z M42,256 L20,278 L8,300 L18,288 L30,278 L44,264 Z"
                  fill="#eaffff"
                  stroke="#3fe0ff"
                  strokeWidth="2"
                  strokeLinejoin="miter"
                />
              </svg>
              <div className="fighters__frame">
                <img
                  className="fighters__portrait"
                  src={`/assets/fighters/${f.img}`}
                  alt={`${f.label} fighter portrait`}
                  loading="lazy"
                  decoding="async"
                />
                <span className="fighters__sweep" aria-hidden="true" />
              </div>
              <div className="fighters__label">{f.label}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

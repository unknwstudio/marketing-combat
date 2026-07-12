import './Fighters.css'

/**
 * CHOOSE YOUR FIGHTER — roster section.
 * Ported pixel-faithfully from Figma "Frame 46" (node 35:4234), 1440x755.
 * Graphics are exported PNGs under /assets/fighters; text and layout are code.
 */

const FIGHTERS = [
  {
    img: 'fighter1.webp',
    label: 'CMOs',
    // leans in hard from the right — this card sits far left of the real
    // bg bolt's trunk, so its fork has the longest reach back to it
    bolt: 'M211,0 L187,44 L164,89 L161,133 L126,178 L120,222 L100,267 L76,311 L68,356 L44,400 L50,400 L80,356 L83,311 L112,267 L127,222 L138,178 L168,133 L176,89 L194,44 L223,0 Z M170,89 L136,115 L122,125 L155,108 Z M164,133 L194,157 L206,167 L185,142 Z M124,222 L106,238 L98,245 L116,234 Z M106,267 L120,281 L126,287 L116,272 Z M79,311 L70,321 L66,325 L75,318 Z',
  },
  {
    img: 'fighter2.webp',
    label: 'HEADS OF GROWTH',
    bolt: 'M125,0 L134,44 L113,89 L102,133 L102,178 L80,222 L76,267 L69,311 L48,356 L53,400 L59,400 L60,356 L76,311 L88,267 L87,222 L114,178 L109,133 L125,89 L140,44 L137,0 Z M119,89 L85,115 L71,125 L104,108 Z M106,133 L136,157 L148,167 L126,142 Z M83,222 L65,238 L58,245 L76,234 Z M82,267 L97,281 L103,287 L93,272 Z M73,311 L63,321 L59,325 L69,318 Z',
  },
  {
    img: 'fighter3.webp',
    label: 'PERFORMANCE LEAD GEN',
    // near-vertical: this card sits almost directly under the real
    // trunk, so its own strike barely has to lean at all
    bolt: 'M50,0 L38,44 L51,89 L45,133 L40,178 L54,222 L38,267 L49,311 L47,356 L41,400 L48,400 L59,356 L56,311 L50,267 L61,222 L52,178 L52,133 L63,89 L45,44 L62,0 Z M57,89 L23,115 L9,125 L42,108 Z M49,133 L79,157 L91,167 L69,142 Z M57,222 L39,238 L32,245 L50,234 Z M44,267 L58,281 L64,287 L54,272 Z M52,311 L43,321 L39,325 L49,318 Z',
  },
  {
    img: 'fighter4.webp',
    label: 'AI CREATORS',
    bolt: 'M-48,0 L-38,44 L-18,89 L-20,133 L-3,178 L10,222 L7,267 L33,311 L31,356 L45,400 L52,400 L43,356 L40,311 L19,267 L16,222 L9,178 L-14,133 L-6,89 L-31,44 L-36,0 Z M-12,89 L22,115 L36,125 L11,98 Z M-17,133 L-47,157 L-59,167 L-30,151 Z M13,222 L31,238 L38,245 L25,228 Z M13,267 L-1,281 L-7,287 L8,277 Z M37,311 L46,321 L50,325 L43,315 Z',
  },
  {
    img: 'fighter5.webp',
    label: '…& FUTURE LEGENDS',
    bolt: 'M-121,0 L-87,44 L-88,89 L-57,133 L-42,178 L-31,222 L-2,267 L8,311 L25,356 L52,400 L58,400 L37,356 L14,311 L10,267 L-25,222 L-30,178 L-51,133 L-76,89 L-81,44 L-109,0 Z M-82,89 L-48,115 L-34,125 L-59,98 Z M-54,133 L-84,157 L-96,167 L-67,151 Z M-28,222 L-10,238 L-3,245 L-16,228 Z M4,267 L-11,281 L-17,287 L-2,277 Z M11,311 L21,321 L24,325 L18,315 Z',
  },
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
                  keeps it legible on top). Each card gets its own path
                  (f.bolt) rather than one shared shape: the five paths all
                  lean toward the same point above the row — where
                  fighters__bg's real painted bolt actually runs — so on
                  hover a card's strike reads as a fork breaking off that
                  bolt, not an unrelated line. Same forking-ribbon style as
                  the bg art (thin core + small perpendicular ticks) so the
                  two match. A fresh SVG layer, not a crop of fighters__bg:
                  that background is one flat composite image. */}
              <svg
                className="fighters__bolt"
                aria-hidden="true"
                viewBox="0 0 100 400"
                preserveAspectRatio="none"
              >
                <path
                  d={f.bolt}
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

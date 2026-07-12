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
    // top end sits at local x=678 -- ~700px right of this card's own
    // center, which lands it exactly on the real bg bolt's trunk (all
    // five paths converge on that same point; see the shared comment
    // below the FIGHTERS array)
    bolt: 'M678,0 L596,44 L539,89 L464,133 L388,178 L333,222 L247,267 L189,311 L116,356 L41,400 L48,400 L128,356 L195,311 L259,267 L339,222 L400,178 L470,133 L551,89 L603,44 L690,0 Z M545,89 L511,115 L497,125 L530,108 Z M467,133 L497,157 L509,167 L487,142 Z M336,222 L318,238 L311,245 L329,234 Z M253,267 L267,281 L273,287 L263,272 Z M192,311 L182,321 L178,325 L188,318 Z',
  },
  {
    img: 'fighter2.webp',
    label: 'HEADS OF GROWTH',
    bolt: 'M353,0 L336,44 L290,89 L254,133 L228,178 L181,222 L153,267 L120,311 L73,356 L53,400 L59,400 L85,356 L127,311 L165,267 L188,222 L240,178 L261,133 L302,89 L343,44 L365,0 Z M296,89 L262,115 L248,125 L281,108 Z M258,133 L288,157 L300,167 L278,142 Z M185,222 L167,238 L160,245 L177,234 Z M159,267 L173,281 L179,287 L169,272 Z M123,311 L114,321 L110,325 L120,318 Z',
  },
  {
    img: 'fighter3.webp',
    label: 'PERFORMANCE LEAD GEN',
    // near-vertical: this card sits almost directly under the real
    // trunk, so its own strike barely has to lean at all
    bolt: 'M60,0 L53,44 L46,89 L60,133 L42,178 L53,222 L50,267 L42,311 L51,356 L44,400 L50,400 L63,356 L49,311 L62,267 L60,222 L54,178 L67,133 L58,89 L60,44 L72,0 Z M52,89 L18,115 L5,125 L38,108 Z M64,133 L94,157 L106,167 L84,142 Z M57,222 L39,238 L31,245 L49,234 Z M56,267 L70,281 L76,287 L66,272 Z M46,311 L36,321 L32,325 L42,318 Z',
  },
  {
    img: 'fighter4.webp',
    label: 'AI CREATORS',
    bolt: 'M-258,0 L-225,44 L-182,89 L-161,133 L-120,178 L-84,222 L-63,267 L-13,311 L7,356 L45,400 L52,400 L19,356 L-7,311 L-51,267 L-77,222 L-108,178 L-154,133 L-170,89 L-218,44 L-246,0 Z M-176,89 L-142,115 L-128,125 L-153,98 Z M-157,133 L-187,157 L-199,167 L-170,151 Z M-81,222 L-63,238 L-55,245 L-68,228 Z M-57,267 L-71,281 L-77,287 L-62,277 Z M-10,311 L-1,321 L3,325 L-3,315 Z',
  },
  {
    img: 'fighter5.webp',
    label: '…& FUTURE LEGENDS',
    // top end sits ~610 local units left of this card's own center --
    // the longest reach of the five, back to the same shared trunk point
    bolt: 'M-571,0 L-487,44 L-438,89 L-357,133 L-292,178 L-231,222 L-152,267 L-92,311 L-25,356 L52,400 L58,400 L-13,356 L-86,311 L-140,267 L-225,222 L-280,178 L-350,133 L-426,89 L-480,44 L-559,0 Z M-432,89 L-398,115 L-384,125 L-409,98 Z M-354,133 L-384,157 L-396,167 L-367,151 Z M-228,222 L-210,238 L-203,245 L-215,228 Z M-146,267 L-161,281 L-167,287 L-152,277 Z M-89,311 L-79,321 L-76,325 L-82,315 Z',
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
                  (f.bolt) rather than one shared shape: all five paths'
                  top ends are placed at local x=720-cardCenter (converted
                  to the svg's local units) so, despite five very different
                  lean angles, every one lands on the exact same pixel —
                  x=720, the top of the section — which is where
                  fighters__bg's real painted trunk sits. On hover, a
                  card's strike touches down right out of that trunk
                  instead of floating as an unrelated line. Same
                  forking-ribbon style as the bg art (thin core + small
                  perpendicular ticks) so the two match visually too. A
                  fresh SVG layer, not a crop of fighters__bg: that
                  background is one flat composite image. */}
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

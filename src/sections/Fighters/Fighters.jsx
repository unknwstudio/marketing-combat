import './Fighters.css'
import { typeset } from '@/lib/typeset'

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
    bolt: 'M672,0 L626,33 L571,67 L513,100 L449,133 L432,167 L360,200 L297,233 L248,267 L218,300 L146,333 L96,367 L44,400 L56,400 L102,367 L158,333 L225,300 L260,267 L303,233 L372,200 L438,167 L461,133 L520,100 L583,67 L632,33 L684,0 Z M577,67 L611,93 L624,103 L599,76 Z M455,133 L427,155 L416,164 L443,150 Z M366,200 L384,216 L391,223 L378,206 Z M254,267 L239,281 L233,287 L248,277 Z M152,333 L162,343 L165,347 L159,337 Z',
  },
  {
    img: 'fighter2.webp',
    label: 'HEADS OF GROWTH',
    bolt: 'M362,0 L334,33 L319,67 L287,100 L245,133 L227,167 L223,200 L175,233 L138,267 L129,300 L105,333 L70,367 L44,400 L56,400 L77,367 L117,333 L136,300 L150,267 L182,233 L235,200 L233,167 L257,133 L294,100 L331,67 L341,33 L374,0 Z M325,67 L359,93 L372,103 L347,76 Z M251,133 L223,155 L212,164 L239,150 Z M229,200 L247,216 L254,223 L241,206 Z M144,267 L129,281 L124,287 L138,277 Z M111,333 L121,343 L125,347 L118,337 Z',
  },
  {
    img: 'fighter3.webp',
    label: 'PERFORMANCE LEAD GEN',
    // near-vertical: this card sits almost directly under the real
    // trunk, so its own strike barely has to lean at all
    bolt: 'M53,0 L51,33 L49,67 L67,100 L47,133 L37,167 L53,200 L66,233 L38,267 L40,300 L52,333 L50,367 L44,400 L56,400 L56,367 L64,333 L47,300 L50,267 L72,233 L65,200 L44,167 L59,133 L74,100 L61,67 L58,33 L65,0 Z M55,67 L21,93 L7,103 L40,86 Z M53,133 L25,155 L14,164 L41,150 Z M59,200 L41,216 L34,223 L52,212 Z M44,267 L30,281 L24,287 L38,277 Z M58,333 L49,343 L45,347 L54,340 Z',
  },
  {
    img: 'fighter4.webp',
    label: 'AI CREATORS',
    bolt: 'M-256,0 L-229,33 L-214,67 L-175,100 L-143,133 L-138,167 L-119,200 L-65,233 L-50,267 L-38,300 L-10,333 L27,367 L44,400 L56,400 L33,367 L2,333 L-31,300 L-38,267 L-58,233 L-107,200 L-131,167 L-131,133 L-168,100 L-202,67 L-223,33 L-244,0 Z M-208,67 L-242,93 L-256,103 L-223,86 Z M-137,133 L-109,155 L-98,164 L-119,141 Z M-113,200 L-131,216 L-138,223 L-121,212 Z M-44,267 L-29,281 L-24,287 L-34,272 Z M-4,333 L-13,343 L-17,347 L-8,340 Z',
  },
  {
    img: 'fighter5.webp',
    label: '…& FUTURE LEGENDS',
    // top end sits ~610 local units left of this card's own center --
    // the longest reach of the five, back to the same shared trunk point
    bolt: 'M-566,0 L-509,33 L-469,67 L-420,100 L-350,133 L-303,167 L-274,200 L-215,233 L-142,267 L-108,300 L-64,333 L-4,367 L44,400 L56,400 L2,367 L-52,333 L-101,300 L-130,267 L-208,233 L-262,200 L-296,167 L-338,133 L-414,100 L-457,67 L-502,33 L-554,0 Z M-463,67 L-497,93 L-510,103 L-477,86 Z M-344,133 L-316,155 L-304,164 L-325,141 Z M-268,200 L-286,216 L-293,223 L-275,212 Z M-136,267 L-122,281 L-116,287 L-126,272 Z M-58,333 L-68,343 L-71,347 L-62,340 Z',
  },
]

export default function Fighters() {
  return (
    <section className="fighters" aria-label="Choose your fighter">
      <h2 className="fighters__title">choose your fighter</h2>

      <div className="fighters__content">
        <div className="fighters__caption">
          <span>{typeset('Choose your fighter · who it’s for')}</span>
          <span>{typeset('For senior marketers of the AI era.')}</span>
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
                  x=720, the top of the section. All five strikes therefore
                  fork out of a single shared origin point instead of five
                  unrelated lines. (The lightning background image this used
                  to emerge from has been removed; the shared-origin geometry
                  is kept so the strikes still read as one coherent bolt.) */}
              <svg
                className="fighters__bolt"
                aria-hidden="true"
                viewBox="0 0 100 400"
                preserveAspectRatio="none"
              >
                <path
                  d={f.bolt}
                  /* was a bare #eaffff — a near-dupe of the HUD ink token
                     (imperceptible 1-step diff on a 2px bolt, 2026-07-16 audit) */
                  fill="var(--k-hud-ink)"
                  stroke="var(--k-cyan)"
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

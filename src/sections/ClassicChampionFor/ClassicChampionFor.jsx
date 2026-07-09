'use client'

import { useEffect, useRef } from 'react'
import './ClassicChampionFor.css'

/**
 * CHAMPION GETS / WHO IT'S FOR — the scroll-pinned block.
 *
 * Figma sources: section states 38:4330 ("Champion gets" right, left gap)
 * and 38:4361 ("who it's for" left, right gap); the composed end state is
 * Frame 54 (node 38:4415) — both columns side by side in one 556px block.
 *
 * The pin is NATIVE position:sticky — no per-frame JS, so it can never
 * jiggle (a rAF fake-sticky corrects position one frame after the browser
 * paints the scroll, which visibly wobbles). Sticky works inside the
 * ScaleCanvas because .scale-canvas clips with overflow:clip (NOT hidden —
 * hidden would make it a scroll container and kill sticky).
 *
 * Geometry (1440-design px, section-local):
 *   - champion column: natural y=60 (Figma 38:4330), sticky top:60; its
 *     lane ends at y=1025 so the pin releases exactly when the column
 *     reaches y=589 — beside "who it's for".
 *   - who column: static at y=589 (its Figma stacked position); it scrolls
 *     up 1:1 with the page into the left gap — no transforms needed.
 *   - runway height = 529 (pin travel) + one viewport, set on resize only,
 *     so the composition completes exactly at the end of the page scroll.
 */

const TRAVEL = 529 // champion pin travel: 589 - 60
const BLOCK_H = 556 // composed block height incl. 60px paddings (Figma 38:4415)

export default function ClassicChampionFor() {
  const outerRef = useRef(null)

  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return
    const mqMobile = window.matchMedia('(max-width: 1023px)')

    // Runway = pin travel + one viewport (in design px): the pin finishes
    // exactly when the document runs out of scroll, leaving the composed
    // block on screen. Height only — nothing scroll-driven lives in JS.
    const setRunway = () => {
      if (mqMobile.matches) {
        outer.style.height = ''
        return
      }
      const scale = outer.getBoundingClientRect().width / 1440
      const viewportH = window.innerHeight / scale
      outer.style.height = `${TRAVEL + Math.max(viewportH, BLOCK_H)}px`
    }

    setRunway()
    // Re-measure when the canvas zoom lands after hydration: RO reports
    // LAYOUT boxes, which zoom does not change — so observe the
    // .scale-canvas wrapper (outside the zoom): its layout height is the
    // zoomed content height and jumps the moment the scale applies.
    const ro = new ResizeObserver(setRunway)
    const scaler = outer.closest('.scale-canvas')
    if (scaler) ro.observe(scaler)
    ro.observe(outer)
    window.addEventListener('resize', setRunway)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', setRunway)
    }
  }, [])

  return (
    <section
      className="cfw"
      ref={outerRef}
      aria-label="Champion gets and who it's for"
    >
      {/* right lane — Champion gets pins (native sticky) until it lands at y=589 */}
      <div className="cfw__champ-lane">
        <div className="cfw__col cfw__champ">
          <h2 className="cfw__h2 cap-trim">Champion gets</h2>
          <div className="cfw__grid">
            <div className="cfw__card">
              <p className="cfw__card-t cap-trim">$30K+</p>
              <p className="cfw__card-s cap-trim">in AI tool subscriptions</p>
            </div>
            <div className="cfw__card">
              <p className="cfw__card-t cap-trim">Intros</p>
              <p className="cfw__card-s cap-trim">to A16Z &amp; YC growth partners</p>
            </div>
            <div className="cfw__card">
              <p className="cfw__card-t cap-trim">Offers</p>
              <p className="cfw__card-s cap-trim">from sponsoring companies</p>
            </div>
            <div className="cfw__card">
              <p className="cfw__card-t cap-trim">Offers</p>
              <p className="cfw__card-s cap-trim">from sponsoring companies</p>
            </div>
            <div className="cfw__strip">
              <p className="cap-trim">5 min to apply · 3 questions · AI review · 48 hr response</p>
            </div>
          </div>
        </div>
      </div>

      {/* left column — who it's for, static at its Figma slot; the page
          scroll itself carries it up into the gap beside the pinned cards.
          The ► arrow marks the ACTIVE item: it sits on "Future legends" at
          rest (the Figma state) and follows whichever item is hovered. */}
      <div className="cfw__col cfw__who">
        <h2 className="cfw__h2 cap-trim">who it&rsquo;s for</h2>
        <ul className="cfw__list">
          {['CMOs', 'Heads of growth', 'Performance lead gens', 'AI creator'].map((label) => (
            <li className="cfw__item" key={label}>
              <svg className="cfw__arrow" viewBox="0 0 52 27" aria-hidden="true">
                <path d="M0 0L51.75 13.42L0 26.85Z" fill="#0052DA" />
              </svg>
              <span className="cfw__text cap-trim">{label}</span>
            </li>
          ))}
          <li className="cfw__item cfw__item--legend">
            <svg className="cfw__arrow" viewBox="0 0 52 27" aria-hidden="true">
              <path d="M0 0L51.75 13.42L0 26.85Z" fill="#0052DA" />
            </svg>
            <span className="cfw__text cap-trim">Future legends</span>
          </li>
        </ul>
      </div>
    </section>
  )
}

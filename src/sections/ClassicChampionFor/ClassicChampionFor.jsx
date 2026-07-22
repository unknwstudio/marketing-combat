'use client'

import { useEffect, useRef } from 'react'
import { typeset } from '@/lib/typeset'
import './ClassicChampionFor.css'

/**
 * CHAMPION GETS / WHO IT'S FOR — the scroll-pinned block.
 *
 * Figma sources: section states 38:4330 and 38:4361; the composed end state
 * is Frame 54 (node 38:4415) — both columns side by side in one 556px block.
 * Sides SWAPPED vs the Figma source on owner request (2026-07-17): champion
 * pins LEFT, the who-list rides up on the RIGHT.
 *
 * The pin is NATIVE position:sticky — no per-frame JS, so it can never
 * jiggle (a rAF fake-sticky corrects position one frame after the browser
 * paints the scroll, which visibly wobbles). Sticky works inside the
 * ScaleCanvas because .scale-canvas clips with overflow:clip (NOT hidden —
 * hidden would make it a scroll container and kill sticky).
 *
 * Geometry (1440-design px, section-local):
 *   - champion column: natural y=60 (Figma 38:4330); the CSS pins it at
 *     top:270 (raised from the Figma 60 on purpose — clears the fixed
 *     top-right menu, see ClassicChampionFor.css). The release point does
 *     not depend on the sticky offset: the lane ends at y=1025 so the pin
 *     releases exactly when the column reaches y=589 — beside "who it's for".
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
        outer.style.marginBottom = ''
        return
      }
      const scale = outer.getBoundingClientRect().width / 1440
      const viewportH = window.innerHeight / scale
      const runway = TRAVEL + Math.max(viewportH, BLOCK_H)
      outer.style.marginBottom = ''
      outer.style.height = `${runway}px`
      // The runway is a full viewport tall so the pin can finish (above), which
      // leaves a tall blank BELOW the composed block on tall viewports. Pull the
      // next section up into that blank (viewport-aware) so the composed block is
      // followed by a normal gap, not ~400px of dead space (#12). Measure the
      // REAL composed-content bottom (the who-list overflows its nominal column
      // height, so a constant would clip "Future legends") in section-local px.
      const sectionTop = outer.getBoundingClientRect().top + window.scrollY
      const toLocal = (el) => (el.getBoundingClientRect().bottom + window.scrollY - sectionTop) / scale
      const list = outer.querySelector('.cfw__list')
      const lane = outer.querySelector('.cfw__champ-lane')
      const composedEnd = Math.max(list ? toLocal(list) : 0, lane ? toLocal(lane) : 0)
      const KEEP = 48 // small gap; the next section adds its own top padding
      outer.style.marginBottom = `${-Math.max(runway - composedEnd - KEEP, 0)}px`
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
      {/* left lane — Champion gets pins (native sticky) until it lands at y=589 */}
      <div className="cfw__champ-lane">
        <div className="cfw__col cfw__champ">
          <h2 className="cfw__h2 cap-trim">Champion gets</h2>
          <div className="cfw__grid">
            <div className="cfw__card">
              <p className="cfw__card-t cap-trim">$30K+</p>
              <p className="cfw__card-s cap-trim">{typeset('in AI tool subscriptions')}</p>
            </div>
            <div className="cfw__card">
              <p className="cfw__card-t cap-trim">Intros</p>
              <p className="cfw__card-s cap-trim">{typeset('to A16Z & YC growth partners')}</p>
            </div>
            <div className="cfw__card">
              <p className="cfw__card-t cap-trim">Offers</p>
              <p className="cfw__card-s cap-trim">{typeset('from sponsoring companies')}</p>
            </div>
            <div className="cfw__card">
              <p className="cfw__card-t cap-trim">{typeset('The title')}</p>
              <p className="cfw__card-s cap-trim">{typeset('#1 AI marketer of 2026')}</p>
            </div>
            <div className="cfw__strip">
              {/* NBSP binds each "·" to the segment BEFORE it, so narrow
                  screens wrap after a separator — never onto a leading dot */}
              <p className="cap-trim">{'5 min to apply · 3 questions · AI review · 48 hr response'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* right column — who it's for, static at its Figma slot; the page
          scroll itself carries it up into the gap beside the pinned cards.
          The ► arrow marks the ACTIVE item: nothing is selected at rest,
          the arrow appears next to whichever item is hovered (the Figma
          resting marker on "Future legends" was dropped — owner 2026-07-17). */}
      <div className="cfw__col cfw__who">
        <h2 className="cfw__h2 cap-trim">who it&rsquo;s for</h2>
        <ul className="cfw__list">
          {['CMOs', 'Heads of growth', 'Performance marketer', 'AI creator', 'Future legends'].map(
            (label) => (
              <li className="cfw__item" key={label}>
                <svg className="cfw__arrow" viewBox="0 0 52 27" aria-hidden="true">
                  <path d="M0 0L51.75 13.42L0 26.85Z" fill="currentColor" />
                </svg>
                <span className="cfw__text cap-trim">{typeset(label)}</span>
              </li>
            )
          )}
        </ul>
      </div>
    </section>
  )
}

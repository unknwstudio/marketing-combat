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
 * Interaction (as specced by the design): when the block reaches the top of
 * the viewport the stage pins; the "Champion gets" cards stay put while the
 * "who it's for" column scrolls 1:1 with the page up into the left gap.
 * When it lands (the composed 38:4415 look) the pin releases.
 *
 * CSS position:sticky can't do this here — ScaleCanvas wraps the page in a
 * transformed, overflow:hidden canvas, which disables sticky/fixed. So the
 * pin is a rAF "fake sticky": the runway (this section) gets extra height
 * equal to the pin travel, and the stage is translated to hold its viewport
 * position. All math is in 1440-design-px; the current canvas scale is
 * derived from the section's rendered width.
 */

const STAGE_H = 556 // composed block height (Figma 38:4415)
const TRAVEL = 556 // scroll distance while pinned = who-column travel (1:1)

export default function ClassicChampionFor() {
  const outerRef = useRef(null)
  const stageRef = useRef(null)
  const whoRef = useRef(null)

  useEffect(() => {
    const outer = outerRef.current
    const stage = stageRef.current
    const who = whoRef.current
    if (!outer || !stage || !who) return

    const mqMobile = window.matchMedia('(max-width: 1023px)')
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isStatic = () => mqMobile.matches || mqReduce.matches
    let raf = 0

    // Runway = pin travel + one viewport (in design px), so the pin can play
    // out fully before the document runs out of scroll.
    const setRunway = () => {
      if (isStatic()) {
        outer.style.height = ''
        return
      }
      const scale = outer.getBoundingClientRect().width / 1440
      const viewportH = window.innerHeight / scale
      outer.style.height = `${TRAVEL + Math.max(viewportH, STAGE_H)}px`
    }

    const update = () => {
      raf = 0
      if (isStatic()) {
        stage.style.transform = ''
        who.style.transform = 'none'
        return
      }
      const rect = outer.getBoundingClientRect()
      const scale = rect.width / 1440
      // how far the runway has scrolled past the viewport top, clamped to the pin range
      const offset = Math.min(Math.max(-rect.top / scale, 0), TRAVEL)
      stage.style.transform = `translate3d(0, ${offset}px, 0)`
      // who-column slides up from below the stage into the left gap, 1:1 with scroll
      const progress = offset / TRAVEL
      who.style.transform = `translate3d(0, ${(1 - progress) * STAGE_H}px, 0)`
    }

    const requestUpdate = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const onResize = () => {
      setRunway()
      requestUpdate()
    }

    setRunway()
    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', onResize)
    mqReduce.addEventListener('change', onResize)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', onResize)
      mqReduce.removeEventListener('change', onResize)
    }
  }, [])

  return (
    <section
      className="cfw"
      ref={outerRef}
      aria-label="Champion gets and who it's for"
    >
      <div className="cfw__stage" ref={stageRef}>
        {/* right column — Champion gets (pins with the stage) */}
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

        {/* left column — who it's for (scrolls up into the gap) */}
        <div className="cfw__col cfw__who" ref={whoRef}>
          <h2 className="cfw__h2 cap-trim">who it&rsquo;s for</h2>
          <ul className="cfw__list">
            <li className="cfw__item cap-trim">CMOs</li>
            <li className="cfw__item cap-trim">Heads of growth</li>
            <li className="cfw__item cap-trim">Performance lead gens</li>
            <li className="cfw__item cap-trim">AI creator</li>
            <li className="cfw__item cfw__item--legend">
              <svg
                className="cfw__arrow"
                viewBox="0 0 52 27"
                width="52"
                height="27"
                aria-hidden="true"
              >
                <path d="M0 0L51.75 13.42L0 26.85Z" fill="#0052DA" />
              </svg>
              <span className="cap-trim">Future legends</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

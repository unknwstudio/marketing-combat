'use client'

import { useEffect, useRef } from 'react'
import MaskHead from '@/components/classic-motion/MaskHead'
import { typeset } from '@/lib/typeset'
import './ClassicHow.css'

/**
 * HOW IT WORKS — the scroll-pinned compose, same principle as the champion /
 * who-it's-for block: two headed columns start stacked and compose side by side
 * on scroll, held by native position: sticky.
 *
 *   left  — "A real task —" + the components list       (who-it's-for analog)
 *   right — "Registration. Qualifying round. Final" +   (champion-gets analog)
 *           the 01/02/03 phase cards
 *
 * The LEFT column pins (it's the shorter of the two, so it fits the viewport
 * when stuck); the taller RIGHT column (heading + cards) scrolls up 1:1 into the
 * gap beside it and overflows below the fold like the champion's who-list. The
 * pin sits at 200 so the composed heads clear the fixed top-right menu.
 *
 * Geometry is measured at runtime: the right column is stacked one pinned-column
 * height + gap below, travel = that offset, the lane = travel + pinned column so
 * the unpin lands exactly on the compose, runway = travel + one viewport, and a
 * negative marginBottom pulls the next section up under the composed block.
 */

const STICKY_TOP = 200 // pin position — clears the fixed top-right menu (~187)
const TOP = 60 // both columns' natural top in the section
const GAP = 80 // stacked gap between the pinned column's bottom and the riser's top

// the components of "A real task —": each becomes one hover-list item
const TASK = ['A brief', 'A data room', 'Google / Meta / TikTok', 'A creative block', 'AI tools', 'Limited time']

const PHASES = [
  {
    n: '01',
    accent: 'var(--k-orange)',
    title: 'Qualifying round',
    body: '45 minutes online. A real case to solve under pressure, with the AI stack of your choice.',
  },
  {
    n: '02',
    accent: 'var(--c-blue)',
    title: 'Evaluation',
    body: 'A panel of judges + AI assesses every solution. The client gets the final word.',
  },
  {
    n: '03',
    accent: 'var(--c-green)',
    title: 'The final',
    body: '2 hours in Barcelona at Harbour.Space University — in person. A closed networking event and a private closing party follow.',
  },
]

export default function ClassicHow() {
  const outerRef = useRef(null)

  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return
    const mqMobile = window.matchMedia('(max-width: 1023px)')

    const setLayout = () => {
      if (mqMobile.matches) {
        outer.style.height = ''
        outer.style.marginBottom = ''
        outer.style.removeProperty('--how-rise-top')
        outer.style.removeProperty('--how-lane-h')
        return
      }
      const scale = outer.getBoundingClientRect().width / 1440
      const viewportH = window.innerHeight / scale
      const pinned = outer.querySelector('.c-how__lead') // left, pins
      const riser = outer.querySelector('.c-how__cards-col') // right, rises
      const pinnedH = pinned.getBoundingClientRect().height / scale
      const riserH = riser.getBoundingClientRect().height / scale

      // stack the rising right column one pinned-column-height + gap below the top
      const riseTop = TOP + pinnedH + GAP
      outer.style.setProperty('--how-rise-top', `${riseTop}px`)
      // travel = the offset between the two columns' natural tops. lane =
      // travel + pinned column keeps the pin until the riser reaches it (unpin
      // lands on the compose), then both scroll away together.
      const travel = riseTop - TOP
      outer.style.setProperty('--how-lane-h', `${travel + pinnedH}px`)
      // runway = travel + one viewport (the riser is the tall composed block)
      const runway = travel + Math.max(viewportH, riserH)
      outer.style.height = `${runway}px`
      // pull the next section up into the blank the tall runway leaves below
      const sectionTop = outer.getBoundingClientRect().top + window.scrollY
      const toLocal = (el) => (el.getBoundingClientRect().bottom + window.scrollY - sectionTop) / scale
      const composedEnd = Math.max(toLocal(riser), toLocal(outer.querySelector('.c-how__lead-lane')))
      const KEEP = 48
      outer.style.marginBottom = `${-Math.max(runway - composedEnd - KEEP, 0)}px`
    }

    setLayout()
    const ro = new ResizeObserver(setLayout)
    const scaler = outer.closest('.scale-canvas')
    if (scaler) ro.observe(scaler)
    ro.observe(outer)
    window.addEventListener('resize', setLayout)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', setLayout)
    }
  }, [])

  return (
    <section className="c-how" ref={outerRef} id="c-how" aria-label="How it works">
      {/* right column — "Registration…" heading + phase cards; scrolls up into
          the composed slot. DOM-first so the mobile static stack leads with the
          section heading; on desktop both columns are absolute so order is moot. */}
      <div className="c-how__cards-col">
        <header className="c-how__head">
          <MaskHead lines={['Registration.', 'Qualifying round.', 'Final']} />
        </header>
        <ol className="c-how__cards">
          {PHASES.map((p) => (
            <li className="c-phase" key={p.n} style={{ '--phase-accent': p.accent }}>
              <span className="c-phase__n cap-trim">{p.n}</span>
              <h3 className="c-phase__title cap-trim">{typeset(p.title)}</h3>
              <p className="c-phase__body">{typeset(p.body)}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* left lane — "A real task —" + components list; pins (native sticky) */}
      <div className="c-how__lead-lane">
        <div className="c-how__lead">
          <MaskHead lines={['A real task —']} className="c-how__task-h" />
          <ol className="c-how__steps">
            {TASK.map((label, i) => (
              <li className="c-step" key={label} style={{ '--i': i }}>
                <span className="c-step__item">
                  <svg className="c-step__arrow" viewBox="0 0 52 27" aria-hidden="true" focusable="false">
                    <path d="M0 0L51.75 13.42L0 26.85Z" fill="var(--k-classic-blue)" />
                  </svg>
                  <span className="c-step__title cap-trim">{typeset(label)}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import MaskHead from '@/components/classic-motion/MaskHead'
import { typeset } from '@/lib/typeset'
import './ClassicHow.css'

/**
 * HOW IT WORKS — the scroll-pinned compose, same principle as the champion /
 * who-it's-for block: the two columns start STACKED (cards above, the heading +
 * "A real task" list below) and COMPOSE side by side as you scroll, held by
 * native position: sticky (no per-frame JS, so it can't jiggle).
 *
 * The phase cards pin on the right; the lead column (heading + list) scrolls up
 * 1:1 into the gap beside them. Geometry is measured at runtime (the content
 * isn't Figma-pixel-fixed): the cards column is set to the lead's height so the
 * composed pair is equal, the lead is stacked one column-height + gap below, and
 * the runway = pin travel + one viewport so the compose finishes as the page
 * scroll runs out. Because both columns are ~680px (taller than the champion's
 * ~440), the very start shows mostly the cards with the heading rising in — the
 * stack can't fully fit one screen, but the compose motion is identical.
 */

const STICKY_TOP = 200 // pin position — clears the fixed top-right menu (~187)
const GAP = 80 // stacked gap between the cards' bottom and the lead's top

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
        outer.style.removeProperty('--how-col-h')
        outer.style.removeProperty('--how-lead-top')
        outer.style.removeProperty('--how-lane-h')
        return
      }
      const scale = outer.getBoundingClientRect().width / 1440
      const viewportH = window.innerHeight / scale
      const lead = outer.querySelector('.c-how__lead')
      const leadH = lead.getBoundingClientRect().height / scale

      // equal-height columns: the cards fill the lead's height
      outer.style.setProperty('--how-col-h', `${leadH}px`)
      // stack the lead one card-column-height + gap below the cards' start (60)
      const cardsTop = 60
      const leadTop = cardsTop + leadH + GAP
      outer.style.setProperty('--how-lead-top', `${leadTop}px`)
      // Travel is the offset between the two columns' natural tops (like the
      // champion's who_top − champ_top). The lane = travel + column keeps the
      // cards pinned until the lead reaches them (unpin lands exactly on the
      // compose), then both scroll away together.
      const travel = leadTop - cardsTop
      outer.style.setProperty('--how-lane-h', `${travel + leadH}px`)
      // runway = travel + one viewport so the pin finishes at the end of scroll
      const runway = travel + Math.max(viewportH, leadH)
      outer.style.height = `${runway}px`
      // pull the next section up into the blank the tall runway leaves below the
      // composed block (mirrors the champion) — measure the real composed bottom
      const sectionTop = outer.getBoundingClientRect().top + window.scrollY
      const toLocal = (el) => (el.getBoundingClientRect().bottom + window.scrollY - sectionTop) / scale
      const laneEl = outer.querySelector('.c-how__cards-lane')
      const composedEnd = Math.max(toLocal(lead), laneEl ? toLocal(laneEl) : 0)
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
      {/* left column — heading + "A real task" list; scrolls up 1:1 into the
          gap beside the pinned cards. DOM-first so the mobile stack (both
          columns become static) reads heading → cards, not cards → heading;
          on desktop both columns are absolute so source order is irrelevant. */}
      <div className="c-how__lead">
        <header className="c-how__head">
          <MaskHead lines={['Registration.', 'Qualifying round.', 'Final']} />
        </header>
        <div className="c-how__task">
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

      {/* right lane — the phase cards pin (native sticky) until they compose */}
      <div className="c-how__cards-lane">
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
    </section>
  )
}

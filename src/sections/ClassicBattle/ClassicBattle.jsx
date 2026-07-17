'use client'

import { useEffect, useRef } from 'react'
import MaskHead from '@/components/classic-motion/MaskHead'
import { useCountUp } from '@/components/classic-motion/useCountUp'
import { typeset } from '@/lib/typeset'
import './ClassicBattle.css'

/**
 * THE BATTLE — the manifesto + the four headline figures, as a scroll-pinned
 * compose (champion idiom, Frame 74): the four blue stat cards PIN on the right
 * (the anchor — the numbers tease first), and the question ("Who can use AI
 * without limits?" + lede) rides up 1:1 into the slot beside them, then
 * the composed pair scrolls away together. Numbers count up on view.
 *
 * Same runtime geometry as ClassicHow: riser stacked one anchor-height + gap
 * below, lane = travel + anchor so the unpin lands exactly on the compose,
 * runway = travel + one viewport, negative marginBottom pulls the next section
 * up under the composed block.
 */

// Pin position (top: 200px, clears the ~187px fixed top-right menu) lives in
// ClassicBattle.css — the CSS is the single source; there is no JS constant.
const TOP = 60 // both columns' natural top in the section
const GAP = 80 // stacked gap between the pinned column's bottom and the riser's top

const STATS = [
  { target: 1, suffix: 'st', label: 'International hackathon' },
  { target: 300, suffix: '+', label: 'Participants' },
  { prefix: '$', target: 100, suffix: 'M+', label: 'Budget under management' },
  { target: 30, label: 'Finalists in Barcelona' },
]

// Sponsors hidden for now (not ready yet) — parity with the modern skin.
// The monochrome SVG logos + `.c-battle__sponsors` styles stay in the tree;
// re-enable together with the strip when sponsors are confirmed.

function Stat({ prefix, target, suffix, label, index }) {
  const [ref, text] = useCountUp({ target, prefix, suffix })
  return (
    <div className="c-stat c-reveal" style={{ '--i': index }}>
      <span ref={ref} className="c-stat__num cap-trim">
        {text}
      </span>
      <span className="c-stat__label cap-trim">{typeset(label)}</span>
    </div>
  )
}

export default function ClassicBattle() {
  const outerRef = useRef(null)

  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return
    const mqMobile = window.matchMedia('(max-width: 1023px)')

    const setLayout = () => {
      if (mqMobile.matches) {
        outer.style.height = ''
        outer.style.marginBottom = ''
        outer.style.removeProperty('--battle-rise-top')
        outer.style.removeProperty('--battle-lane-h')
        return
      }
      const scale = outer.getBoundingClientRect().width / 1440
      const viewportH = window.innerHeight / scale
      const pinned = outer.querySelector('.c-battle__stats-col') // right: the stat cards, the anchor
      const riser = outer.querySelector('.c-battle__intro') // left: the question, rides in
      const pinnedH = pinned.getBoundingClientRect().height / scale
      const riserH = riser.getBoundingClientRect().height / scale

      const riseTop = TOP + pinnedH + GAP
      outer.style.setProperty('--battle-rise-top', `${riseTop}px`)
      const travel = riseTop - TOP
      outer.style.setProperty('--battle-lane-h', `${travel + pinnedH}px`)
      const runway = travel + Math.max(viewportH, pinnedH, riserH)
      outer.style.height = `${runway}px`
      const sectionTop = outer.getBoundingClientRect().top + window.scrollY
      const toLocal = (el) => (el.getBoundingClientRect().bottom + window.scrollY - sectionTop) / scale
      const composedEnd = Math.max(toLocal(riser), toLocal(outer.querySelector('.c-battle__lane')))
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
    <section className="c-battle" ref={outerRef} id="c-battle" aria-label="The battle">
      {/* left riser — the question rides up into the slot beside the pinned
          stats. DOM-first so the mobile static stack leads with the heading. */}
      <div className="c-battle__intro">
        <MaskHead lines={['Who can use AI', 'without limits?']} className="c-battle__h2" />
        <p className="c-lede c-reveal c-battle__lede">
          {typeset(
            'The time has come to settle the legendary battle and find out who the best marketer in the world is. AI Marketing Kombat is the marketers’ battle that ranks the best specialists on planet Earth.'
          )}
        </p>
      </div>

      {/* right lane — the four stat cards pin (native sticky) */}
      <div className="c-battle__lane">
        <div className="c-battle__stats-col">
          <div className="c-battle__stats c-reveal">
            {STATS.map((s, i) => (
              <Stat key={s.label} index={i} {...s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import MaskHead from '@/components/classic-motion/MaskHead'
import { typeset } from '@/lib/typeset'
import './ClassicArenas.css'

/**
 * BATTLE ARENAS — the case-track roster. Four solid yellow cards (the champion
 * card idiom, black on --c-yellow): title pinned to the top, the mission line
 * to the bottom, the fill breathing between them.
 *
 * PINNED DEAL: the section pins (native sticky) for RUNWAY px of scroll while
 * the four cards ride up from a staircase into the flat row, dealt left→right,
 * 1:1 with the scroll and reversible. Pinning is what makes the motion VISIBLE:
 * the viewport holds still and the cards travel — without it the staircase
 * lives below the fold and the eye only catches the tail of the move.
 * Transforms only (design px — the zoom canvas scales them); the runway height
 * is set by JS on resize, mirroring the compose sections.
 */

const PIN_TOP = 100 // design px — where the scene rests while pinned
const RUNWAY = 650 // design px of scroll the deal plays over
// staircase depth = BASE + i × STEP: the FIRST card starts exactly home
// (flush under the lede at the section's normal 64px rhythm — no hole on
// approach); the depth grows rightward, so the deal plays on cards 2–4
const BASE = 0
const STEP = 130
const LAG = 0.12 // per-card progress lag (dealt left → right)

const ARENAS = [
  {
    title: 'Healthcare',
    body: 'Complex funnel. Long cycle. High LTV. Mission: cut CAC and speed up first-purchase conversion.',
  },
  {
    title: 'B2B SaaS',
    body: 'Long sales cycles. Many stakeholders. Mission: turn PQLs into pipeline with AI-driven demand gen.',
  },
  {
    title: 'E-commerce',
    body: 'High volume. Thin margins. ROAS pressure. Mission: scale creative and squeeze CAC with AI.',
  },
  {
    title: 'Enterprise',
    body: 'Six-figure deals. Long procurement. Mission: run AI-powered ABM that lands target accounts.',
  },
]

export default function ClassicArenas() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const pin = section.querySelector('.c-arenas__pin')
    const grid = section.querySelector('.c-arenas__grid')
    const cards = Array.from(grid.children)
    const mqMobile = window.matchMedia('(max-width: 1023px)')
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const off = () => mqMobile.matches || mqReduce.matches

    // runway: the section grows by RUNWAY so the pin has scroll to play over
    const setLayout = () => {
      if (off()) {
        section.style.height = ''
        return
      }
      const scale = section.getBoundingClientRect().width / 1440
      section.style.height = '' // measure the natural height first
      const naturalH = section.getBoundingClientRect().height / scale
      section.style.height = `${naturalH + RUNWAY}px`
    }

    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        if (off()) {
          cards.forEach((c) => c.style.removeProperty('transform'))
          return
        }
        const scale = section.getBoundingClientRect().width / 1440
        // deal progress: 0 until the pin engages (section top reaches PIN_TOP),
        // 1 when the RUNWAY has been scrolled through
        const secTop = section.getBoundingClientRect().top / scale
        const p = Math.min(Math.max((PIN_TOP - secTop) / RUNWAY, 0), 1)
        cards.forEach((c, i) => {
          const pi = Math.min(Math.max((p - i * LAG) / (1 - 3 * LAG), 0), 1)
          const e = 1 - (1 - pi) ** 3 // soft landing
          const offY = (1 - e) * (BASE + i * STEP)
          if (offY > 0.5) c.style.transform = `translateY(${offY.toFixed(1)}px)`
          else c.style.removeProperty('transform')
        })
      })
    }

    setLayout()
    onScroll()
    const ro = new ResizeObserver(() => {
      setLayout()
      onScroll()
    })
    const scaler = section.closest('.scale-canvas')
    if (scaler) ro.observe(scaler)
    window.addEventListener('resize', setLayout)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', setLayout)
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className="c-sec acc-blue" id="c-arenas" aria-label="Battle arenas" ref={sectionRef}>
      <div className="c-arenas__pin">
        <div className="c-wrap">
          <header className="c-arenas__head">
            <MaskHead lines={['Case tracks']} />
            <p className="c-lede c-reveal c-arenas__intro">
              {typeset('Real client briefs across industries. Win and the client pays the prize.')}
            </p>
          </header>

          <ul className="c-arenas__grid">
            {ARENAS.map((a) => (
              <li className="c-arena" key={a.title}>
                <h3 className="c-arena__title cap-trim">{a.title}</h3>
                <p className="c-arena__body">{typeset(a.body)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

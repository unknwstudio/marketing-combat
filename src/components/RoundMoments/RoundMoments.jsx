'use client'

import { useEffect, useRef } from 'react'
import './RoundMoments.css'

/**
 * RoundMoments — GSAP ScrollTrigger "ROUND" beats. As each round section's
 * header travels up through the viewport, a big arcade ROUND placard slams in,
 * its best-of-three pips light up, it holds pinned, then dissolves — all
 * scrubbed to scroll position so it feels tied to your hand on the wheel.
 *
 * Division of labour with the existing Announcer: the Announcer owns the brief
 * FOREGROUND flash + VO clip + screen-shake on the same sections (it observes
 * the same data-announce labels). This adds the SCRUBBED, held placard layer on
 * top — so the two compose into one round-start moment instead of duplicating
 * VO/shake.
 *
 * Architecture: the placards are position:fixed and rendered OUTSIDE ScaleCanvas
 * (top level, like ScrollHealth/Announcer) so they pin to the viewport cleanly —
 * no in-canvas transform/zoom containing-block issues. ScrollTrigger only reads
 * each section's scroll position (correct under ScaleCanvas zoom mode) and scrubs
 * the fixed placard. Reduced-motion: never runs (nothing shown).
 */
const ROUNDS = [
  { key: 'STAGE 03', num: '03', tag: 'choose your style' },
  { key: 'STAGE 04', num: '04', tag: 'select your arena' },
  { key: 'STAGE 05', num: '05', tag: 'three stages' },
]

export default function RoundMoments() {
  const rootRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const root = rootRef.current
    if (!root) return

    let cancelled = false
    let refresh = null
    const tls = []

    ;(async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)

      ROUNDS.forEach((r) => {
        const label = document.querySelector(`.dsec__round[data-announce="${r.key}"]`)
        const section = label && label.closest('.dsec')
        const placard = root.querySelector(`[data-round="${r.num}"]`)
        if (!section || !placard) return
        const num = placard.querySelector('.roundmoment__num')
        const pips = placard.querySelectorAll('.roundmoment__pip')

        gsap.set(placard, { autoAlpha: 0 })

        // Range = the section header crossing the upper viewport. Kept short enough
        // that consecutive round sections never overlap (they'd stack at center),
        // so exactly one placard is ever live.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 8%',
            scrub: 0.4,
          },
        })
        // slam in
        tl.fromTo(placard, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'none' }, 0)
        tl.fromTo(num, { scale: 1.35, yPercent: -2 }, { scale: 1, yPercent: 0, duration: 0.55, ease: 'power3.out' }, 0)
        // pips light up one at a time on the way in
        pips.forEach((pip, i) => {
          tl.fromTo(
            pip,
            { autoAlpha: 0.2, scale: 0.55 },
            { autoAlpha: 1, scale: 1, duration: 0.2, ease: 'back.out(2.2)' },
            0.22 + i * 0.11
          )
        })
        // hold (occupies scroll distance so the placard reads as pinned)
        tl.to(placard, { autoAlpha: 1, duration: 1.2 })
        // dissolve out + sink
        tl.to(placard, { autoAlpha: 0, duration: 0.5, ease: 'none' })
        tl.to(num, { scale: 0.9, yPercent: 3, duration: 0.5, ease: 'none' }, '<')

        tls.push(tl)
      })

      // ScaleCanvas applies its zoom in its own effect/ResizeObserver, which can
      // land after these triggers are built. Recompute start/end once layout has
      // settled (rAF) and again on full load so the scroll math matches the
      // zoomed geometry. (GSAP already auto-refreshes on resize.)
      ScrollTrigger.refresh()
      refresh = () => ScrollTrigger.refresh()
      requestAnimationFrame(refresh)
      window.addEventListener('load', refresh)
    })()

    return () => {
      cancelled = true
      if (refresh) window.removeEventListener('load', refresh)
      tls.forEach((tl) => {
        if (tl.scrollTrigger) tl.scrollTrigger.kill()
        tl.kill()
      })
    }
  }, [])

  return (
    <div className="roundmoment-root" ref={rootRef} aria-hidden="true">
      {ROUNDS.map((r) => (
        <div className="roundmoment" data-round={r.num} key={r.num}>
          <span className="roundmoment__kicker">stage</span>
          <span className="roundmoment__num">{r.num}</span>
          <span className="roundmoment__tag">{r.tag}</span>
          <span className="roundmoment__pips">
            <i className="roundmoment__pip" />
            <i className="roundmoment__pip" />
            <i className="roundmoment__pip" />
          </span>
        </div>
      ))}
    </div>
  )
}

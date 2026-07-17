'use client'

import { useEffect, useRef, useState } from 'react'
import './ScrollHealth.css'

/**
 * ScrollHealth — a Mortal-Kombat health bar pinned to the top that doubles as
 * the page scroll indicator. P1 (you) charges up as you scroll deeper toward the
 * win, reaching 100% at the bottom; the CPU bar drains to 0%. Hidden over the
 * hero (which has its own energy meter) and fades in once you start scrolling.
 * Decorative → aria-hidden.
 *
 * It also publishes its state on <html> as a coordination signal: the class
 * `hp-shown` (mirrors the visible state) and `--hp-h` (its measured height). The
 * adaptive sticky SOUND/MOTION squares read these to dock right under the bar
 * once it slides in (owner 2026-07-17) instead of leaving a gap.
 */
export default function ScrollHealth() {
  const [p, setP] = useState(0) // 0..1 scroll progress
  const rootRef = useRef(null)

  useEffect(() => {
    let raf = 0
    const measure = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      const prog = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0
      setP(prog)
      document.documentElement.classList.toggle('hp-shown', prog > 0.03)
    }
    // the bar's height only changes on resize (breakpoint swap), not per scroll
    // frame — measure it there to avoid a layout read every rAF
    const setHpHeight = () => {
      if (rootRef.current) {
        document.documentElement.style.setProperty('--hp-h', `${rootRef.current.offsetHeight}px`)
      }
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    const onResize = () => {
      setHpHeight()
      onScroll()
    }
    setHpHeight()
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('hp-shown')
      document.documentElement.style.removeProperty('--hp-h')
    }
  }, [])

  const hp = Math.max(0, Math.min(100, Math.round(p * 100))) // P1 charges up as you scroll to the win
  const cpu = 100 - hp
  const state = hp <= 25 ? ' sh--low' : hp <= 55 ? ' sh--mid' : ''
  const shown = p > 0.03 ? ' sh--shown' : ''

  return (
    <div className={'sh' + state + shown} aria-hidden="true" ref={rootRef}>
      <div className="sh__side">
        <span className="sh__tag">P1</span>
        <span className="sh__bar">
          <span className="sh__fill" style={{ width: hp + '%' }} />
        </span>
      </div>

      <span className="sh__mid">{hp}%</span>

      <div className="sh__side sh__side--p2">
        <span className="sh__bar">
          <span className="sh__fill sh__fill--cpu" style={{ width: cpu + '%' }} />
        </span>
        <span className="sh__tag">CPU</span>
      </div>
    </div>
  )
}

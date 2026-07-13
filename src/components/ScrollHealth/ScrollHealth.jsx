'use client'

import { useEffect, useState } from 'react'
import './ScrollHealth.css'

/**
 * ScrollHealth — a Mortal-Kombat health bar pinned to the top that doubles as
 * the page scroll indicator. P1 (you) charges up as you scroll deeper toward the
 * win, reaching 100% at the bottom; the CPU bar drains to 0%. Hidden over the
 * hero (which has its own energy meter) and fades in once you start scrolling.
 * Decorative → aria-hidden.
 */
export default function ScrollHealth() {
  const [p, setP] = useState(0) // 0..1 scroll progress

  useEffect(() => {
    let raf = 0
    const measure = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      setP(max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0)
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const hp = Math.max(0, Math.min(100, Math.round(p * 100))) // P1 charges up as you scroll to the win
  const cpu = 100 - hp
  const state = hp <= 25 ? ' sh--low' : hp <= 55 ? ' sh--mid' : ''
  const shown = p > 0.03 ? ' sh--shown' : ''

  return (
    <div className={'sh' + state + shown} aria-hidden="true">
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

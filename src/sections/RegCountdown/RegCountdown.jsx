'use client'

import { useEffect, useState } from 'react'
import { REG_DEADLINE, REG_TARGET, regCount } from '@/config/registration'
import './RegCountdown.css'

/**
 * RegCountdown — AI-mode-only HUD strip under the hero: an MK round-timer
 * counting down to the end of open registration next to a health-bar tally of
 * registered fighters. Dates and the (fake, hand-tunable) counter curve live
 * in src/config/registration.js.
 *
 * Hydration-safe: the server renders "--" placeholders; real values only land
 * in the mount effect (Date.now() at render time would mismatch). The ticking
 * digits are aria-hidden — screen readers get the stable deadline sentence on
 * the timer element instead of a per-second announcement.
 */

const pad2 = (n) => String(n).padStart(2, '0')

const splitLeft = (deadline, now) => {
  const s = Math.max(0, Math.floor((deadline - now) / 1000))
  return {
    days: String(Math.floor(s / 86400)),
    hrs: pad2(Math.floor((s % 86400) / 3600)),
    min: pad2(Math.floor((s % 3600) / 60)),
    sec: pad2(s % 60),
    over: s <= 0,
  }
}

export default function RegCountdown() {
  const [t, setT] = useState(null) // null until mounted → SSR-safe placeholders
  const [count, setCount] = useState(null)

  useEffect(() => {
    const deadline = Date.parse(REG_DEADLINE)
    const tick = () => {
      setT(splitLeft(deadline, Date.now()))
      setCount(regCount())
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const cells = [
    { v: t ? t.days : '--', u: 'DAYS' },
    { v: t ? t.hrs : '--', u: 'HRS' },
    { v: t ? t.min : '--', u: 'MIN' },
    { v: t ? t.sec : '--', u: 'SEC' },
  ]
  const pct = count ? Math.min(100, Math.round((count / REG_TARGET) * 100)) : 0

  return (
    <section className="regc" aria-label="Registration status">
      <div className="regc__inner">
        <div className="regc__block">
          <span className="regc__label">OPEN REGISTRATION CLOSES IN</span>
          <span
            className="regc__timer"
            role="timer"
            aria-label="Registration is open until September 20"
          >
            {cells.map((c, i) => (
              <span className="regc__group" key={c.u} aria-hidden="true">
                {i > 0 && <span className="regc__colon">:</span>}
                <span className="regc__cell">
                  <span className="regc__digits">{c.v}</span>
                  <span className="regc__unit">{c.u}</span>
                </span>
              </span>
            ))}
          </span>
          <span className={'regc__date' + (t?.over ? ' regc__date--over' : '')}>
            {t?.over ? 'REGISTRATION CLOSED' : 'ENDS SEP 20'}
          </span>
        </div>

        <div className="regc__block">
          <span className="regc__label">FIGHTERS REGISTERED</span>
          <span className="regc__count">
            <span className="regc__count-n">{count ?? '--'}</span>
            <span className="regc__count-of">/ {REG_TARGET}</span>
          </span>
          <span className="regc__bar" aria-hidden="true">
            <span className="regc__fill" style={{ width: pct + '%' }} />
          </span>
        </div>
      </div>
    </section>
  )
}

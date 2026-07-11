'use client'

import { useEffect, useRef } from 'react'
import './Stats.css'

/**
 * Stats strip — the four headline numbers the original site states.
 * Verbatim values (split into prefix/count/suffix so the number can count up
 * on scroll-in); no invented figures.
 */
const STATS = [
  { prefix: '', count: 1, suffix: '', unit: 'st', caption: 'International hackathon' },
  { prefix: '', count: 300, suffix: '', unit: '+', caption: 'Participants' },
  { prefix: '', count: 30, suffix: '', unit: '', caption: 'Finalists in Barcelona' },
  { prefix: '$', count: 100, suffix: 'M', unit: '+', caption: 'Budget under management' },
]

const DURATION = 1100
const easeOutQuad = (t) => 1 - (1 - t) * (1 - t)

export default function Stats() {
  const sectionRef = useRef(null)
  const numRefs = useRef([])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || typeof IntersectionObserver === 'undefined') {
      numRefs.current.forEach((el, i) => {
        if (el) el.textContent = String(STATS[i].count)
      })
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min(1, (now - start) / DURATION)
          const eased = easeOutQuad(t)
          numRefs.current.forEach((el, i) => {
            if (el) el.textContent = String(Math.round(STATS[i].count * eased))
          })
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    if (sectionRef.current) io.observe(sectionRef.current)
    return () => io.disconnect()
  }, [])

  return (
    <section className="dsec stats" aria-label="By the numbers" ref={sectionRef}>
      <ul className="stats__row">
        {STATS.map((s, i) => (
          <li key={s.caption} className="stats__cell">
            <span className="stats__value">
              {s.prefix}
              <span ref={(el) => (numRefs.current[i] = el)}>0</span>
              {s.suffix}
              <span className="stats__unit">{s.unit}</span>
            </span>
            <span className="stats__caption">{s.caption}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

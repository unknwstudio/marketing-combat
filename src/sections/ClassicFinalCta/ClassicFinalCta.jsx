'use client'

import { useRef } from 'react'
import MaskHead from '@/components/classic-motion/MaskHead'
import CArrow from '@/components/classic-motion/CArrow'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'
import './ClassicFinalCta.css'

/**
 * FINAL CTA — the loudest band: full-bleed yellow, one marquee ribbon of the
 * event name, one big statement, one black pill. The pill is subtly magnetic
 * (max ±8px pull toward the cursor); disabled under reduced motion. The
 * registration link is intentionally dead for now (see project note).
 */

// Trailing separator uses a non-breaking space on purpose: the two ribbon
// copies are flex items, and flex items trim their trailing whitespace — a
// plain space would collapse at the seam, gluing "Barcelona ·" to the next
// "AI Marketing". The nbsp survives the trim so the seam spaces like every
// internal "· " join.
const RIBBON = 'AI Marketing Kombat · July 2026 · Barcelona · '
const MAX_PULL = 8

export default function ClassicFinalCta() {
  const pillRef = useRef(null)

  const onMove = (e) => {
    const el = pillRef.current
    if (!el || prefersReducedMotion()) return
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.2
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.2
    const clamp = (v) => Math.max(-MAX_PULL, Math.min(MAX_PULL, v))
    el.style.transform = `translate(${clamp(dx)}px, ${clamp(dy)}px)`
  }

  const onLeave = () => {
    const el = pillRef.current
    if (el) el.style.transform = ''
  }

  return (
    <section className="c-sec c-cta acc-yellow" id="cta" aria-label="Join the battle">
      <div className="c-cta__ribbon" aria-hidden="true">
        <div className="c-cta__ribbon-track">
          <span>{RIBBON.repeat(4)}</span>
          <span>{RIBBON.repeat(4)}</span>
        </div>
      </div>

      <div className="c-wrap c-cta__body">
        <MaskHead lines={['Join the battle']} className="c-cta__h2" />
        <p className="c-lede c-reveal c-cta__lede">
          Apply for the first round and put yourself on the map of the best AI marketers on the
          planet.
        </p>
        <button
          className="c-cta__pill"
          type="button"
          ref={pillRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          data-register
        >
          <span className="c-cta__pill-label">Registration</span>
          <CArrow className="c-cta__pill-arrow" />
        </button>
        <p className="c-cta__fine cap-trim">5 min to apply · 3 questions · AI review · 48 hr response</p>
      </div>
    </section>
  )
}

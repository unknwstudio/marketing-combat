'use client'

import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'
import './Stats.css'

/**
 * Stats strip — the four headline numbers the original site states.
 * Verbatim values (split into prefix/count/suffix); no invented figures.
 *
 * The counter is a per-digit slot-machine odometer: every digit is an
 * overflow:hidden window over a vertical strip of 0-9 glyphs. On scroll-in
 * (same IntersectionObserver trigger the old count-up used: once, at 40%
 * section visibility) each strip tweens down with a steps(10) ease SNAPPED to
 * whole-digit offsets, so every mid-spin frame shows a complete glyph —
 * quantized, pixel-honest motion, never a sheared half-digit. The rightmost
 * column travels the most revolutions and runs the longest, so the score
 * ratchets to rest left-to-right like an arcade cabinet tally.
 *
 * Correctness: SSR / no-JS / reduced-motion render the FINAL number as
 * plain text — the odometer markup only swaps in after mount when motion is
 * allowed, and each strip's travel is computed (then pinned in onComplete) so
 * it lands EXACTLY on the real digit. Screen readers get a visually-hidden
 * copy of the value; the spinning strips are aria-hidden decoration.
 *
 * Digit-box width: while spinning, every digit window is left at its natural
 * shrink-to-fit width (wide enough for the widest 0-9 glyph in the accent
 * font) so no frame of the reel gets clipped. But that font is proportional —
 * "1" renders roughly half as wide as "0" — so a narrow final digit centered
 * in that wide box leaves visible dead space beside it (e.g. "$100M+" reads
 * with a gap between "1" and "00"). Once every digit in a stat has landed
 * (tracked per .stats__odo group so a still-spinning neighbor never gets
 * shoved sideways), pinGroupWidths re-measures each landed glyph with a DOM
 * Range and collapses its box to that exact width, matching how the plain
 * (unspun) text lays out.
 */
const STATS = [
  { prefix: '', count: 1, suffix: '', unit: 'st', caption: 'International hackathon' },
  { prefix: '', count: 300, suffix: '', unit: '+', caption: 'Participants' },
  { prefix: '', count: 30, suffix: '', unit: '', caption: 'Finalists in Barcelona' },
  { prefix: '$', count: 100, suffix: 'M', unit: '+', caption: 'Budget under management' },
]

const pad = (n) => `${n}`

// spin choreography (seconds); col = digit index from the LEFT, so the
// rightmost digit starts last and spins longest
const SPIN_BASE = 0.72
const SPIN_PER_COL = 0.16
const SPIN_STAGGER = 0.06

export default function Stats() {
  const sectionRef = useRef(null)
  // false until we know JS is live AND motion is allowed; until then (and
  // forever under reduced-motion / missing IO) the real numbers stay static
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    const reduce = prefersReducedMotion()
    if (reduce || typeof IntersectionObserver === 'undefined') return
    setArmed(true)
  }, [])

  useEffect(() => {
    if (!armed) return
    const section = sectionRef.current
    if (!section) return

    let cancelled = false
    const tweens = []

    // exact final offset: the strip's last glyph IS the real digit, so parking
    // at -travel/(travel+1) of its own height shows the true value
    const finalTransform = (travel) =>
      `translateY(${(-travel * 100) / (travel + 1)}%)`

    // collapse every digit in a landed stat to its own glyph's natural width
    // (in em, so it keeps tracking the responsive font-size breakpoints)
    // instead of the wide shrink-to-fit box sized for the widest 0-9 frame
    const pinGroupWidths = (odo) => {
      odo.querySelectorAll('.stats__digit').forEach((digit) => {
        const finalGlyph = digit.querySelector('.stats__strip').lastElementChild
        const range = document.createRange()
        range.selectNodeContents(finalGlyph)
        const widthPx = range.getBoundingClientRect().width
        const fontSizePx = parseFloat(getComputedStyle(digit).fontSize)
        digit.style.width = `${widthPx / fontSizePx}em`
      })
    }

    // same trigger timing as the old count-up: fire once at 40% visibility
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const strips = Array.from(section.querySelectorAll('.stats__strip'))
        ;(async () => {
          try {
            const { gsap } = await import('gsap')
            if (cancelled) return
            // per-stat countdown so width-pinning only runs once ALL of that
            // stat's digits have landed — pinning mid-spin would yank a
            // still-spinning neighbor sideways as its box narrows
            const remaining = new Map()
            strips.forEach((strip) => {
              const odo = strip.closest('.stats__odo')
              remaining.set(odo, (remaining.get(odo) || 0) + 1)
            })
            strips.forEach((strip) => {
              const travel = Number(strip.dataset.travel)
              const col = Number(strip.dataset.col)
              const odo = strip.closest('.stats__odo')
              // one digit, in % of strip height (4 decimals keeps gsap's snap
              // increment sane; the residual error is < 0.2px, and onComplete
              // pins the mathematically exact resting offset anyway)
              const step = Math.round((100 / (travel + 1)) * 1e4) / 1e4
              tweens.push(
                gsap.fromTo(
                  strip,
                  { yPercent: 0 },
                  {
                    yPercent: -travel * step,
                    duration: SPIN_BASE + col * SPIN_PER_COL,
                    delay: col * SPIN_STAGGER,
                    ease: 'steps(10)',
                    // steps(10) alone would jump between glyph boundaries on
                    // long strips; snapping to one-digit increments keeps every
                    // frame on a whole glyph
                    snap: { yPercent: step },
                    onComplete: () => {
                      strip.style.transform = finalTransform(travel)
                      const left = remaining.get(odo) - 1
                      remaining.set(odo, left)
                      if (left === 0) pinGroupWidths(odo)
                    },
                  }
                )
              )
            })
          } catch {
            // gsap chunk failed to load: no spin, but the numbers MUST still
            // be right — park every strip on its final digit
            if (!cancelled) {
              strips.forEach((strip) => {
                strip.style.transform = finalTransform(Number(strip.dataset.travel))
              })
              const odoEls = new Set(strips.map((strip) => strip.closest('.stats__odo')))
              odoEls.forEach(pinGroupWidths)
            }
          }
        })()
      },
      { threshold: 0.4 }
    )
    io.observe(section)

    return () => {
      cancelled = true
      io.disconnect()
      tweens.forEach((t) => t.kill())
    }
  }, [armed])

  return (
    <section className="dsec stats" aria-label="By the numbers" ref={sectionRef}>
      <ul className="stats__row">
        {STATS.map((s) => (
          <li key={s.caption} className="stats__cell">
            <span className="stats__value">
              {s.prefix}
              {armed ? (
                <>
                  {/* real value for assistive tech; the strips are decoration */}
                  <span className="stats__sr">{pad(s.count)}</span>
                  <span className="stats__odo" aria-hidden="true">
                    {pad(s.count)
                      .split('')
                      .map((ch, col) => {
                        // column `col` spins col+1 full revolutions, then
                        // travels on to its final digit — rightmost spins most
                        const travel = (col + 1) * 10 + Number(ch)
                        return (
                          <span className="stats__digit" key={col}>
                            <span
                              className="stats__strip"
                              data-travel={travel}
                              data-col={col}
                            >
                              {Array.from({ length: travel + 1 }, (_, k) => (
                                <span key={k}>{k % 10}</span>
                              ))}
                            </span>
                          </span>
                        )
                      })}
                  </span>
                </>
              ) : (
                <span>{pad(s.count)}</span>
              )}
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

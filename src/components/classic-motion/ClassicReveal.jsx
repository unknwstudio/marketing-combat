'use client'

import { useEffect } from 'react'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'

/**
 * ClassicReveal — calm, editorial scroll-reveal for the /classic sections.
 * Renders nothing; it only toggles classes.
 *
 * Contract (mirrors the arcade ScrollReveal's safety model, minus the pixel
 * aesthetic): the hidden state in classic.css is armed ONLY while <html> has
 * `classic-reveal-on`, so a no-JS / SSR paint shows everything. We add that
 * class on mount and bail entirely under reduced motion, so motion-averse
 * users also see the final state. Stagger is declarative (elements set --i
 * inline); JS just flips `.is-in` once per element as it enters view. A
 * failsafe reveals any straggler so content can never get stuck hidden.
 *
 * Observes `.c-reveal` (fade+rise groups) and `.c-mask-head` (line-mask
 * headings) anywhere under .classic.
 */
const SELECTOR = '.c-reveal, .c-mask-head'

export default function ClassicReveal() {
  useEffect(() => {
    if (prefersReducedMotion()) return // leave everything visible

    const root = document.documentElement
    root.classList.add('classic-reveal-on')

    const els = Array.from(document.querySelectorAll(SELECTOR))
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-in')
          } else if (en.boundingClientRect.top > 0) {
            // The element left through the BOTTOM edge (the user scrolled back
            // up above it): RE-ARM it so the reveal replays on the next pass
            // down. One-shot semantics made the animation feel broken — it
            // only ever played once per page load. Leaving through the TOP
            // (scrolling on past it) keeps it revealed, so nothing re-animates
            // while scrolling back up through already-seen content.
            en.target.classList.remove('is-in')
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
    els.forEach((el) => io.observe(el))

    // Never leave anything stuck hidden IN VIEW: force-reveal only elements
    // already inside the viewport at the deadline. A blanket reveal here used
    // to flip every below-fold element 4s after load, which silently disarmed
    // all scroll-in animations (the arenas staircase never played because of
    // it) — below-fold elements stay observed and reveal on scroll instead.
    const failsafe = window.setTimeout(() => {
      els.forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in')
      })
    }, 4000)

    return () => {
      io.disconnect()
      window.clearTimeout(failsafe)
      root.classList.remove('classic-reveal-on')
    }
  }, [])

  return null
}

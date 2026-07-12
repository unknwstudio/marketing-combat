'use client'

import { useEffect } from 'react'

/**
 * ScrollReveal — cards and section headers fade + rise in as they scroll into
 * view. Behaviour-only (renders nothing).
 *
 * Stagger has two modes:
 * - GRID groups (2+ matched siblings sharing a parent — the arena/track/
 *   judge/organizer card grids, the stats row, the FAQ list) power on from
 *   the CENTER outward: per-element delays come from gsap.utils.distribute
 *   ({ grid: 'auto', from: 'center', ease: 'steps(4)' }), i.e. a radial wave
 *   quantized into rings — a CRT warming up, not a smooth SaaS ripple.
 *   distribute measures the rendered grid via getBoundingClientRect, and only
 *   RELATIVE positions matter, so it stays correct under ScaleCanvas zoom.
 * - Solo elements (section heads) keep the simple per-batch index stagger.
 *
 * gsap is lazy-loaded; until it lands (or if the chunk fails) grid members
 * fall back to the index stagger, so nothing ever waits on gsap to reveal.
 *
 * Safety: the initial hidden state is applied ONLY after JS mounts (via the
 * `reveal-on` class on <html>), so a no-JS / SSR render shows everything. Under
 * reduced-motion we never hide anything. A timeout reveals any stragglers so
 * content can never get stuck hidden.
 */
const SELECTOR = '.dcard, .dsec__head, .stats__cell, .faq__item'

// max extra delay (ms) across a grid; steps(4) quantizes it into 5 rings
const WAVE_MS = 420
// per-element step for the solo / pre-gsap fallback index stagger
const SOLO_MS = 55

export default function ScrollReveal() {
  useEffect(() => {
    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return // leave everything visible, no motion

    const root = document.documentElement
    root.classList.add('reveal-on')

    const els = Array.from(document.querySelectorAll(SELECTOR))

    // Group matched elements by parent: 2+ siblings form one grid whose
    // members share a center-out wave (solo children stay on index stagger).
    const byParent = new Map()
    els.forEach((el) => {
      const p = el.parentElement
      if (!p) return
      byParent.has(p) ? byParent.get(p).push(el) : byParent.set(p, [el])
    })
    const groupOf = new Map() // element -> { members, wave }
    byParent.forEach((members) => {
      if (members.length < 2) return
      const group = { members, wave: null }
      members.forEach((el) => groupOf.set(el, group))
    })

    // Lazy gsap — we only need gsap.utils.distribute. Never awaited by the
    // observer: reveals that fire before it lands just use the fallback.
    let distribute = null
    import('gsap')
      .then(({ gsap }) => {
        distribute = gsap.utils.distribute
      })
      .catch(() => {}) // no gsap -> index stagger everywhere (still reveals)

    const delayFor = (el, batchIndex) => {
      const group = groupOf.get(el)
      if (group && distribute) {
        if (!group.wave) {
          // built lazily on first intersection, once the grid is laid out
          group.wave = distribute({
            base: 0,
            amount: WAVE_MS,
            grid: 'auto',
            from: 'center',
            ease: 'steps(4)',
          })
        }
        return Math.round(
          group.wave(group.members.indexOf(el), el, group.members)
        )
      }
      return Math.min(batchIndex, 6) * SOLO_MS
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en, i) => {
          if (!en.isIntersecting) return
          const el = en.target
          const delay = delayFor(el, i)
          el.style.transitionDelay = `${delay}ms`
          // stagger the pixel-dissolve mosaic in lock-step with the fade
          el.style.animationDelay = `${delay}ms`
          el.classList.add('revealed')
          io.unobserve(el)
          // clear the stagger delay once the 0.6s fade is done so it can't lag
          // hover states (delay-dependent: wave delays outrun a fixed cutoff)
          window.setTimeout(() => {
            el.style.transitionDelay = ''
            el.style.animationDelay = ''
          }, delay + 700)
          // failsafe: once the mosaic burst is over, strip the mask so the resting
          // card is never left masked — covers browsers without @property support
          // (where the mask can't animate open) and guarantees a clean final state.
          window.setTimeout(() => {
            el.style.webkitMaskImage = 'none'
            el.style.maskImage = 'none'
          }, delay + 650)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    )
    els.forEach((el) => io.observe(el))

    // safety net: never leave anything stuck hidden
    const failsafe = window.setTimeout(() => {
      els.forEach((el) => el.classList.add('revealed'))
    }, 4000)

    return () => {
      io.disconnect()
      window.clearTimeout(failsafe)
      root.classList.remove('reveal-on')
    }
  }, [])

  return null
}

'use client'

import { useEffect } from 'react'

/**
 * ScrollReveal — cards and section headers fade + rise in as they scroll into
 * view, with a small stagger. Behaviour-only (renders nothing).
 *
 * Safety: the initial hidden state is applied ONLY after JS mounts (via the
 * `reveal-on` class on <html>), so a no-JS / SSR render shows everything. Under
 * reduced-motion we never hide anything. A timeout reveals any stragglers so
 * content can never get stuck hidden.
 */
const SELECTOR = '.dcard, .dsec__head, .stats__cell, .faq__item'

export default function ScrollReveal() {
  useEffect(() => {
    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return // leave everything visible, no motion

    const root = document.documentElement
    root.classList.add('reveal-on')

    const els = Array.from(document.querySelectorAll(SELECTOR))
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en, i) => {
          if (!en.isIntersecting) return
          const el = en.target
          const delay = Math.min(i, 6) * 55
          el.style.transitionDelay = `${delay}ms`
          // stagger the pixel-dissolve mosaic in lock-step with the fade
          el.style.animationDelay = `${delay}ms`
          el.classList.add('revealed')
          io.unobserve(el)
          // clear the stagger delay once revealed so it can't lag hover states
          window.setTimeout(() => {
            el.style.transitionDelay = ''
            el.style.animationDelay = ''
          }, 800)
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

'use client'

import { useEffect } from 'react'
// Reuse GlitchText's RGB channel-split CSS (.k-glitch + the one-shot .k-glitch--burst
// variant) — this is how the otherwise-unused GlitchText effect gets "wired onto"
// the /demo section titles.
import '@/components/GlitchText/GlitchText.css'
import './GlitchTitles.css'

/**
 * GlitchTitles — fires a single RGB-glitch BURST on each `.dsec__title` as it
 * scrolls into view, then settles crisp. A permanent glitch on every title would
 * wreck readability + accessibility; a one-shot on entry reads as an arcade
 * "signal lock". Behaviour-only (renders nothing).
 *
 * Safety: titles render normally server-side; the burst is applied only after JS
 * mounts, fires once per title, and the burst keyframes end fully transparent so a
 * title can never get stuck mid-glitch. Reduced-motion: never runs.
 */
export default function GlitchTitles() {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    if (typeof IntersectionObserver === 'undefined') return

    const titles = Array.from(document.querySelectorAll('.dsec__title'))
    if (!titles.length) return

    const timers = new Set()
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue
          const el = en.target
          io.unobserve(el)
          // GlitchText's pseudo-elements duplicate the text via data-text; the
          // ::before/::after read it. Set it just for the burst, then clean up.
          el.setAttribute('data-text', el.textContent)
          el.classList.add('k-glitch', 'k-glitch--burst')
          const t = window.setTimeout(() => {
            el.classList.remove('k-glitch', 'k-glitch--burst')
            el.removeAttribute('data-text')
            timers.delete(t)
          }, 700)
          timers.add(t)
        }
      },
      { threshold: 0.6 }
    )
    titles.forEach((el) => io.observe(el))

    return () => {
      io.disconnect()
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  return null
}

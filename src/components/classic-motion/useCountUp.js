'use client'

import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'

/**
 * useCountUp — eases a figure from 0 to `target` once it scrolls into view.
 *
 * The display string is templated so the numeral animates while any prefix
 * (`$`) and suffix (`+`, `st`, `M`) stay fixed: pass e.g. { target: 100,
 * prefix: '$', suffix: 'M+' } to count "$0M+" -> "$100M+". Under reduced
 * motion (or if IntersectionObserver is unavailable) it renders the final
 * value immediately.
 *
 * Returns [ref, text]: attach ref to the element that should trigger on
 * view, render text as its content.
 */
export function useCountUp({ target, prefix = '', suffix = '', duration = 1200 }) {
  const ref = useRef(null)
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0))

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setValue(target)
      return
    }

    let raf = 0
    let start = 0
    const ease = (t) => 1 - Math.pow(1 - t, 3) // easeOutCubic

    const run = (now) => {
      if (!start) start = now
      const t = Math.min((now - start) / duration, 1)
      setValue(Math.round(ease(t) * target))
      if (t < 1) raf = requestAnimationFrame(run)
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return
          raf = requestAnimationFrame(run)
          obs.disconnect()
        })
      },
      { threshold: 0.4 }
    )
    io.observe(el)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [target, duration])

  return [ref, `${prefix}${value}${suffix}`]
}

'use client'

import { useEffect, useState } from 'react'
import CtaLabel from '@/components/CtaLabel/CtaLabel'
import './PlayFab.css'

/**
 * Floating registration launcher — desktop top-left, touch/narrow bottom-center.
 * Shares the site's one registration-CTA look (mono ">>> registration <<<").
 * Opens the register modal via the delegated [data-register] listener, with the
 * /#register fragment as the no-JS fallback; data-burst fires the pixel burst.
 * (Component/class name kept as PlayFab/.playfab to avoid churn across imports.)
 *
 * `lowered`: on desktop the launcher sits top-left where the ScrollHealth P1
 * strip fades in on scroll — but it also has to clear the hero lede at rest,
 * and (since ScaleCanvas shrinks the hero on narrower widths, floating the lede
 * up) no single fixed top clears BOTH. So it stays high over the hero (clears
 * the lede) and drops just below the HP strip once you scroll past the hero —
 * by then the lede has scrolled away, so there's nothing to collide with. The
 * threshold mirrors ScrollHealth's own reveal (scroll progress > 3%).
 */
export default function PlayFab() {
  const [lowered, setLowered] = useState(false)

  useEffect(() => {
    let raf = 0
    const measure = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      setLowered(max > 0 && el.scrollTop / max > 0.03)
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

  return (
    <a
      className={'playfab' + (lowered ? ' playfab--lowered' : '')}
      href="/#register"
      data-burst
      data-register
      aria-label="Register for the tournament"
    >
      <CtaLabel>registration</CtaLabel>
    </a>
  )
}

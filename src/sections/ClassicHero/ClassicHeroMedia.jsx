'use client'

import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'

/**
 * ClassicHeroMedia — the hero visual, poster-first. `autoPlay` downloads the
 * whole clip regardless of `preload`, so a static <video> shipped ~4.5MB to
 * everyone, including users who asked for reduced motion or are on Save-Data.
 * We render the poster <img> as the baseline (also the SSR/first-paint image)
 * and only upgrade to the looping <video> on the client when motion is allowed
 * and the connection isn't metered/slow. Same `.c-hero__photo` box either way,
 * so the swap is visually seamless.
 */
export default function ClassicHeroMedia() {
  const [play, setPlay] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const conn = navigator.connection
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return
    setPlay(true)
  }, [])

  if (!play) {
    return (
      <img
        className="c-hero__photo"
        src="/assets/classic/hero-photo.jpg"
        alt="Winners holding trophies at the award ceremony"
      />
    )
  }

  return (
    <video
      className="c-hero__photo"
      src="/assets/classic/hero-video.mp4"
      poster="/assets/classic/hero-photo.jpg"
      autoPlay
      muted
      loop
      playsInline
      aria-label="Winners holding trophies at the award ceremony"
    />
  )
}

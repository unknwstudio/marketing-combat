'use client'

import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'
import {
  initMotionPause,
  isMotionPaused,
  subscribeMotionPaused,
} from '@/effects/motion/motionPause'

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
  const videoRef = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const conn = navigator.connection
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return
    // MotionToggle paused (WCAG 2.2.2): stay on the poster — don't even start
    // the ~1.5MB download; upgrade to the video if the user unpauses later.
    initMotionPause()
    if (!isMotionPaused()) setPlay(true)
    return subscribeMotionPaused((paused) => {
      if (!paused) setPlay(true)
    })
  }, [])

  // once the <video> is live, MotionToggle pauses/resumes it in place
  useEffect(() => {
    if (!play) return
    const sync = (paused) => {
      const v = videoRef.current
      if (!v) return
      if (paused) v.pause()
      else v.play().catch(() => {}) // autoplay policy — muted, so this only fails in exotic cases
    }
    sync(isMotionPaused())
    return subscribeMotionPaused(sync)
  }, [play])

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
      ref={videoRef}
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

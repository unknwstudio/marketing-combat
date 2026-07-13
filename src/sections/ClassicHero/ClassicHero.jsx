'use client'

import { useEffect, useRef, useState } from 'react'
import PixelIcon from '@/components/PixelIcon/PixelIcon'
import './ClassicHero.css'

/**
 * CLASSIC HERO — pixel-faithful port of Figma "Frame 29" (node 35:4238).
 * Fixed 1440x804 stage: yellow left half (headline + lede + registration
 * pill), photo right half with the fact chips overlaid at the bottom.
 * The orange menu card from this frame is NOT here — it must stay fixed
 * through the whole page, so it lives in components/ClassicMenu.
 *
 * The right-half footage is a real looping clip. Auto-playing motion needs a
 * pause control (WCAG 2.2.2) and must not start under prefers-reduced-motion —
 * so this is a client component: it plays only when motion is allowed and
 * exposes a pause/play toggle; reduced-motion users just see the poster frame.
 */
export default function ClassicHero() {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      v.pause()
      setPlaying(false)
      return
    }
    const p = v.play()
    if (p && typeof p.catch === 'function') p.catch(() => setPlaying(false))
  }, [])

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  return (
    <section className="c-hero" aria-label="AI Marketing Kombat — classic">
      <div className="c-hero__left">
        <div className="c-hero__head">
          <h1 className="c-hero__title cap-trim">
            The best marketer on&nbsp;the planet, decided
          </h1>
          <p className="c-hero__lede cap-trim">
            The first international hackathon for senior marketers of the AI era. Real client
            cases. Use AI — compare your skills.
          </p>
        </div>
        <button className="c-hero__cta" type="button">
          Registration
        </button>
      </div>

      <div className="c-hero__media">
        <video
          ref={videoRef}
          className="c-hero__photo"
          src="/assets/classic/hero-video.mp4"
          poster="/assets/classic/hero-photo.jpg"
          muted
          loop
          playsInline
          aria-label="Winners holding trophies at the award ceremony"
        />
        <button
          type="button"
          className="c-hero__video-toggle"
          onClick={toggle}
          aria-label={playing ? 'Pause background video' : 'Play background video'}
        >
          <PixelIcon name={playing ? 'pause' : 'play'} size="0.9em" />
        </button>
      </div>

      <div className="c-hero__chips">
        <span className="c-hero__chip">round 01</span>
        <span className="c-hero__chip">july 2026</span>
        <span className="c-hero__chip">300+ fighters</span>
        <span className="c-hero__chip">final · Barcelona</span>
      </div>
    </section>
  )
}

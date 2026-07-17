'use client'

import { useEffect, useState } from 'react'
import {
  initMotionPause,
  isMotionPaused,
  toggleMotionPaused,
  subscribeMotionPaused,
} from '@/effects/motion/motionPause'

/**
 * ClassicMotionChip — the classic skin's pause control for auto-moving content
 * (WCAG 2.2.2): the hero video, the final-CTA ribbon and the credit shimmer.
 * Rendered as one of the hero fact chips (the floating MotionToggle pill read
 * as arcade chrome on the editorial skin and collided with the footer base
 * row). Toggles the same GLOBAL motion-paused state as the AI skin's pill, so
 * a pause set on either skin can be lifted from the other.
 *
 * Icon-only (owner request): inline SVG glyphs, not unicode — ▶/⏸ render as
 * emoji on some platforms. The swapping aria-label carries name + state
 * (no aria-pressed on top of a state-swapping name — the SoundToggle rule).
 */
export default function ClassicMotionChip() {
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    initMotionPause()
    setPaused(isMotionPaused())
    return subscribeMotionPaused(setPaused)
  }, [])

  return (
    <button
      className="c-hero__chip c-hero__chip--motion"
      type="button"
      aria-label={paused ? 'Play motion' : 'Pause motion'}
      onClick={toggleMotionPaused}
    >
      {paused ? (
        /* play: triangle nudged +1px right of geometric center — optical balance */
        <svg className="c-hero__chip-glyph" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4.5 1.8 L14 8 L4.5 14.2 Z" fill="currentColor" />
        </svg>
      ) : (
        /* pause: two 4px bars, 4px gap — same visual weight as the triangle */
        <svg className="c-hero__chip-glyph" viewBox="0 0 16 16" aria-hidden="true">
          <rect x="2.5" y="1.8" width="4" height="12.4" fill="currentColor" />
          <rect x="9.5" y="1.8" width="4" height="12.4" fill="currentColor" />
        </svg>
      )}
    </button>
  )
}

'use client'

import { useEffect, useState } from 'react'
import {
  initMotionPause,
  isMotionPaused,
  toggleMotionPaused,
  subscribeMotionPaused,
} from '@/effects/motion/motionPause'
import PixelIcon from '@/components/PixelIcon/PixelIcon'
import './MotionToggle.css'

/**
 * MotionToggle — the universal pause control for auto-moving content
 * (WCAG 2.2.2): marquees/tickers on both skins, the footer credit shimmer,
 * and the classic hero video. Docked with SoundToggle, styled as its sibling.
 */
// `inline` renders the in-flow hero instance (touch/narrow — owner frame 77);
// see SoundToggle for the dual-mount contract.
export default function MotionToggle({ inline = false }) {
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    initMotionPause()
    setPaused(isMotionPaused())
    return subscribeMotionPaused(setPaused)
  }, [])

  return (
    <button
      className={
        'motiontoggle' + (inline ? ' motiontoggle--inline' : '') + (paused ? ' motiontoggle--off' : '')
      }
      type="button"
      /* No aria-label / aria-pressed: the visible swapping "MOTION ON/OFF"
         label is the accessible name AND the state — the SoundToggle pattern
         (a pressed state on top of a state-swapping label is ambiguous). */
      onClick={toggleMotionPaused}
    >
      <PixelIcon className="motiontoggle__icon" name={paused ? 'motionOff' : 'motionOn'} size="1.3em" />
      <span className="motiontoggle__label">{paused ? 'MOTION OFF' : 'MOTION ON'}</span>
    </button>
  )
}

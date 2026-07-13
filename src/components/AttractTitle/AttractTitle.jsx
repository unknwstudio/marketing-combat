'use client'

import { useEffect } from 'react'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'

/**
 * AttractTitle — behaviour-only (renders nothing). Arcade "attract mode" for
 * the browser TAB: when the page is hidden the document title blinks between
 * "● INSERT COIN ●" and the real title every 1.2s — an idle cabinet flashing
 * for a quarter, pulling the player back to the tab. On return to the tab (or
 * unmount) the original title is restored and the interval cleared.
 *
 * Safety: the original title is captured at the moment the tab hides (not at
 * mount), so any earlier runtime title change is what gets restored. Blinking
 * only ever starts while hidden, so the visible tab's title is never touched.
 * Reduced-motion: never blinks — a flashing tab title is exactly the kind of
 * attention-grabbing motion that preference asks us to drop.
 */
const COIN_TITLE = '● INSERT COIN ●'
const BLINK_MS = 1200

export default function AttractTitle() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    let interval = 0
    let original = null

    const stop = () => {
      if (interval) {
        clearInterval(interval)
        interval = 0
      }
      if (original !== null) {
        document.title = original
        original = null
      }
    }

    const onVisibility = () => {
      if (document.hidden) {
        if (interval) return // already blinking
        original = document.title
        document.title = COIN_TITLE // flip immediately, don't wait a beat
        interval = window.setInterval(() => {
          document.title = document.title === COIN_TITLE ? original : COIN_TITLE
        }, BLINK_MS)
      } else {
        stop()
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      stop()
    }
  }, [])

  return null
}

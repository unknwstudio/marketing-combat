'use client'

import { useEffect } from 'react'
import { playSfx } from '@/effects/audio/arcadeAudio'

/**
 * SelectSfx — behaviour-only (renders nothing). Plays a short blip the first
 * time the pointer enters any element tagged `data-select-sfx` (value = clip
 * name, default "hit") within a 400ms window per element, so rapid re-hover
 * doesn't machine-gun the sound. Desktop pointer only (mirrors MagneticCTA).
 */
export default function SelectSfx() {
  useEffect(() => {
    const canHover = window.matchMedia?.('(hover: hover)').matches
    if (!canHover) return

    const cooldowns = new WeakMap()
    const onEnter = (e) => {
      const el = e.currentTarget
      const now = performance.now()
      if (now - (cooldowns.get(el) || 0) < 400) return
      cooldowns.set(el, now)
      playSfx(el.getAttribute('data-select-sfx') || 'hit', 0.3)
    }

    const els = Array.from(document.querySelectorAll('[data-select-sfx]'))
    els.forEach((el) => el.addEventListener('pointerenter', onEnter))
    return () => els.forEach((el) => el.removeEventListener('pointerenter', onEnter))
  }, [])

  return null
}

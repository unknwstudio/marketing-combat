'use client'

import { useEffect } from 'react'
import { playSfx } from '@/effects/audio/arcadeAudio'

/**
 * MagneticCTA — behaviour-only (renders nothing). Enhances every element tagged
 * `data-magnetic` with a cursor-magnet pull and a click SFX (`data-sfx`, default
 * "confirm"). Magnet is disabled on touch / reduced-motion; the SFX still fires.
 */
export default function MagneticCTA() {
  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const canHover = window.matchMedia?.('(hover: hover)').matches
    const cleanups = []

    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const sfx = el.getAttribute('data-sfx') || 'confirm'
      const onClick = () => playSfx(sfx, 0.5)
      el.addEventListener('click', onClick)
      cleanups.push(() => el.removeEventListener('click', onClick))

      if (reduced || !canHover) return

      const strength = 0.3
      let raf = 0
      let origin = null // untransformed center, captured once per hover session
      const onEnter = () => {
        // el.style.transform is '' here (onLeave always clears it before this
        // can fire again), so this rect is the true layout position — reading
        // it fresh on every pointermove instead would measure the element
        // AFTER last frame's translate, feeding the offset back into itself
        // (each move's target center drifts toward wherever the cursor just
        // was), which reads as exactly this: jittery, runaway motion.
        const r = el.getBoundingClientRect()
        origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
      }
      const onMove = (e) => {
        if (!origin) onEnter()
        const dx = (e.clientX - origin.x) * strength
        const dy = (e.clientY - origin.y) * strength
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate(${dx}px, ${dy}px)`
        })
      }
      const onLeave = () => {
        cancelAnimationFrame(raf)
        el.style.transform = ''
        origin = null
      }
      el.addEventListener('pointerenter', onEnter)
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      cleanups.push(() => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
        cancelAnimationFrame(raf)
      })
    })

    return () => cleanups.forEach((fn) => fn())
  }, [])

  return null
}

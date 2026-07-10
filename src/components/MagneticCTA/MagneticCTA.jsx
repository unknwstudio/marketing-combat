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
      const onMove = (e) => {
        const r = el.getBoundingClientRect()
        const dx = (e.clientX - (r.left + r.width / 2)) * strength
        const dy = (e.clientY - (r.top + r.height / 2)) * strength
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate(${dx}px, ${dy}px)`
        })
      }
      const onLeave = () => {
        cancelAnimationFrame(raf)
        el.style.transform = ''
      }
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

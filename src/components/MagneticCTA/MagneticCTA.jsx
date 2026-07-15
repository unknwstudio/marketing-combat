'use client'

import { useEffect } from 'react'
import { playSfx } from '@/effects/audio/arcadeAudio'

/**
 * MagneticCTA — behaviour-only (renders nothing). Attaches a click SFX
 * (`data-sfx`, default "confirm") to every element tagged `data-magnetic`.
 *
 * The cursor-magnet pull that used to move these buttons toward the pointer was
 * removed: it read as the buttons "running away" from the cursor. The
 * `data-magnetic` hook is kept purely as the click-SFX selector so no markup
 * had to change across the site.
 */
export default function MagneticCTA() {
  useEffect(() => {
    const cleanups = []

    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const sfx = el.getAttribute('data-sfx') || 'confirm'
      const onClick = () => playSfx(sfx, 0.5)
      el.addEventListener('click', onClick)
      cleanups.push(() => el.removeEventListener('click', onClick))
    })

    return () => cleanups.forEach((fn) => fn())
  }, [])

  return null
}

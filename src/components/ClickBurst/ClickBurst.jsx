'use client'

import { useEffect } from 'react'
import { useSparks } from '@/effects/particles/HitSparks'

/**
 * ClickBurst — behaviour-only (renders nothing), same idiom as MagneticCTA.
 * ONE delegated pointerdown listener on document fires a chunky pixel-shard
 * burst (via the HitSparks canvas layer) at the pointer position whenever a
 * press lands inside an element tagged `data-burst`.
 *
 * WHY delegated + pointerdown (not per-element click listeners):
 * - Delegation covers late-mounted targets for free — the cabinet's PRESS
 *   START handoff frame only exists while the scroll act is armed, and a
 *   document-level listener needs no re-scan when it appears.
 * - pointerdown lands the shards the instant the button is pressed, so the
 *   burst is actually seen even when the press immediately navigates away
 *   (every data-burst target today leaves the page: badge / enter / handoff).
 *
 * Coordinates: HitSparks' canvas is portaled to <body>, OUTSIDE ScaleCanvas's
 * zoom wrapper, and e.clientX/Y are real viewport px — they map 1:1, no zoom
 * math needed.
 *
 * Reduced-motion: HitSparks.burst() itself no-ops under
 * prefers-reduced-motion, so this stays a dumb forwarder (one source of
 * truth for the motion gate, no drift between the two checks).
 *
 * Must be mounted INSIDE the HitSparks provider — outside it useSparks()
 * returns the NOOP fallback and taps silently do nothing.
 */
export default function ClickBurst() {
  const { burst } = useSparks()

  useEffect(() => {
    const onPointerDown = (e) => {
      // primary presses only — right/middle-click menus shouldn't throw shards
      if (e.button !== 0) return
      const t = e.target
      if (!(t instanceof Element) || !t.closest('[data-burst]')) return
      // Chunkier than the default hit spark: more shards, a bit more power.
      // Shard shape / palette / quantization are HitSparks' own — square
      // fillRect shards in white / --k-yellow / --k-cyan at integer px sizes.
      burst(e.clientX, e.clientY, { count: 20, power: 1.25 })
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [burst])

  return null
}

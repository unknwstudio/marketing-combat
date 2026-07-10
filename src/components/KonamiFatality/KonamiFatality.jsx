'use client'

import { useEffect, useState } from 'react'
import './KonamiFatality.css'

// ↑ ↑ ↓ ↓ ← → ← → B A
const SEQ = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

/**
 * KonamiFatality — the Konami code triggers a full-screen "FATALITY" flash,
 * then drops the player into the real game at /play. Pure keyboard easter egg.
 */
export default function KonamiFatality() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    let i = 0
    const onKey = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (k === SEQ[i]) {
        i += 1
        if (i === SEQ.length) {
          i = 0
          setActive(true)
          window.setTimeout(() => {
            window.location.href = '/play'
          }, 1700)
        }
      } else {
        i = k === SEQ[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!active) return null

  return (
    <div className="fatality" role="alert" aria-label="Fatality — launching the arena">
      <span className="fatality__flash" aria-hidden="true" />
      <span className="fatality__text" data-text="FATALITY">
        FATALITY
      </span>
      <span className="fatality__sub">▮ ENTERING THE ARENA ▮</span>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import FightGame from '@/components/FightGame/FightGame'
import MobileControls from '@/components/MobileControls/MobileControls'
import GameChrome from '@/components/GameChrome/GameChrome'
import RotateHint from '@/components/RotateHint/RotateHint'
import { TAKEOVER_OPEN, setTakeoverAvailable } from '@/lib/game'
import '@/styles/game-surface.css'
import './GameTakeover.css'

/**
 * GameTakeover — the game as a fullscreen IN-PAGE overlay on /demo (no route
 * change). Mounted once, viewport-fixed, OUTSIDE ScaleCanvas. It hosts the very
 * same islands /play renders (FightGame + MobileControls + GameChrome + the
 * rotate hint), so there is no game duplication; Phaser is created on mount and
 * destroyed on unmount by FightGame's own cleanup. Opening is requested via the
 * shared openGameTakeover() event; closing is GameChrome's own ✕/EXIT, rewired
 * through onExit to close in place. While it's mounted it advertises itself so
 * VsSplash opens it (see Task 4) instead of navigating.
 */
export default function GameTakeover() {
  const [open, setOpen] = useState(false)
  const openerRef = useRef(null) // focus is returned here on close
  const containerRef = useRef(null) // the dialog boundary — focus target on open + trap edge

  // advertise availability for the whole mounted lifetime (not just while open)
  useEffect(() => {
    setTakeoverAvailable(true)
    return () => setTakeoverAvailable(false)
  }, [])

  useEffect(() => {
    const onOpen = () => {
      openerRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      setOpen(true)
    }
    window.addEventListener(TAKEOVER_OPEN, onOpen)
    return () => window.removeEventListener(TAKEOVER_OPEN, onOpen)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  // lock page scroll + restore focus to the opener when the overlay closes
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
      const opener = openerRef.current
      if (opener && opener.isConnected) opener.focus({ preventScroll: true })
    }
  }, [open])

  // a11y: on open, move focus INTO the dialog (previously it stayed on the opener and
  // Tab escaped straight to the underlying page — task-9 Finding 2) and keep it there
  // with a boundary focus trap. Escape closes the WHOLE takeover only when nothing
  // inside already handled it — GameChrome signals "I handled this" by calling
  // e.preventDefault() on its own Escape branches (how-to/pause/confirm/share closing,
  // or pause opening). That listener lives on `window` in the CAPTURE phase, and this
  // one lives on `document` in the CAPTURE phase, so GameChrome is GUARANTEED to run
  // first (capture flows window -> document -> ... -> target) no matter which effect
  // last (re)registered its listener — registration order alone can't be trusted here,
  // since GameChrome's listener is torn down and rebuilt on nearly every state change.
  // GameChrome's own sub-modal trap (its `anyModal` effect) already keeps Tab inside
  // whichever card is open; this trap only needs to catch Tab when it would otherwise
  // leave `.game-takeover` entirely (title/select/fight scenes with no sub-modal up).
  useEffect(() => {
    if (!open) return
    containerRef.current?.focus({ preventScroll: true })

    // NOTE: a comma-selector like `button:not([disabled]),[tabindex]:not([tabindex="-1"])`
    // does NOT exclude tabindex="-1" buttons — that :not() only binds to the
    // `[tabindex]` branch, not the `button` branch, so MobileControls' 8 (deliberately
    // inert, tabindex="-1") pad buttons would still match. Filtering on the resolved
    // `.tabIndex` DOM property (0 by default for button/`[href]`, -1 once set) avoids
    // that trap entirely.
    const focusables = () => {
      const el = containerRef.current
      if (!el) return []
      return [...el.querySelectorAll('button,[href],[tabindex]')].filter(
        (node) => !node.disabled && node.tabIndex >= 0
      )
    }

    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (!e.defaultPrevented) close()
        return
      }
      if (e.key !== 'Tab') return
      const el = containerRef.current
      const f = focusables()
      if (!el || !f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (!el.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
        return
      }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open, close])

  if (!open) return null

  return (
    <div ref={containerRef} className="game-takeover" role="dialog" aria-modal="true" aria-label="AI Marketing Kombat" tabIndex={-1}>
      <FightGame />
      <MobileControls />
      {/* onExit closes in place instead of navigating away from /demo */}
      <GameChrome onExit={close} />
      <RotateHint />
    </div>
  )
}

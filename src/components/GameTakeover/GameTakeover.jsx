'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import FightGame from '@/components/FightGame/FightGame'
import MobileControls from '@/components/MobileControls/MobileControls'
import GameChrome from '@/components/GameChrome/GameChrome'
import { TAKEOVER_OPEN, setTakeoverAvailable } from '@/lib/game'
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

  if (!open) return null

  return (
    <div className="game-takeover" role="dialog" aria-modal="true" aria-label="AI Marketing Kombat">
      <FightGame />
      <MobileControls />
      {/* onExit closes in place instead of navigating away from /demo */}
      <GameChrome onExit={close} />
      <div className="rotate-hint" aria-hidden="true">
        <div className="rot-phone" />
        <div className="rot-big">ROTATE YOUR<br />PHONE</div>
        <div className="rot-sm">the arena needs landscape</div>
      </div>
    </div>
  )
}

'use client'

import './PlayFab.css'

/**
 * PlayFab — a floating PLAY launcher pinned bottom-right, mirroring SoundToggle
 * (bottom-left). Same 8-bit pixel look as the hero's PLAY button (.hero__playbig)
 * — gold face, notched corners, inset bevel, hard drop-shadow, stepped pixel
 * triangle — just compact for a corner. Plain <a> to /play: VsSplash's delegated
 * a[href="/play"] listener catches it for the first-visit VS flash, and
 * data-burst fires the pixel-shard burst (same contract as PlayLink).
 */
export default function PlayFab() {
  return (
    <a
      className="playfab"
      href="/play"
      data-sfx="confirm"
      data-burst
      aria-label="Play the game"
    >
      <svg className="playfab__tri" viewBox="0 0 6 10" aria-hidden="true">
        <path d="M0 0h1v10H0zM1 1h1v8H1zM2 2h1v6H2zM3 3h1v4H3zM4 4h1v2H4z" />
      </svg>
      play
    </a>
  )
}

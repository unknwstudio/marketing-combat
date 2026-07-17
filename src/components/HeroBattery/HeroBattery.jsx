'use client'

import { useEffect, useState } from 'react'
import PixelIcon from '@/components/PixelIcon/PixelIcon'
// styles live in Hero.css (.hero__battery / .hero__meter* / drain animation) —
// this component only ever renders inside Hero, which loads that stylesheet.

/**
 * HeroBattery — the hero's "energy meter" (four bars + "15%" + "will you
 * survive?"). On touch/narrow (owner 2026-07-17) the whole battery IS the game
 * entry: it renders as an <a href="/play"> so VsSplash's delegated listener
 * runs the VS flash / takeover, and a hover "discharge" animation (bars drain
 * right-to-left, the % flips to ▶ PLAY) invites the click. On desktop it stays
 * a plain decorative <div> — the desktop hero keeps its own bottom PLAY link.
 *
 * The link is JS-gated (matchMedia) rather than a CSS toggle because an <a>
 * can't be un-linked by CSS alone; SSR renders the decorative <div> and the
 * first client render matches it (no hydration mismatch), then the effect
 * upgrades to the play link on the adaptive arm. /play is a JS-only game, so
 * no-JS clients losing the link costs nothing they could use anyway.
 */
const METER = (
  <>
    <div className="hero__meter">
      <div className="hero__bars" aria-hidden="true">
        <span className="hero__bar" />
        <span className="hero__bar" />
        <span className="hero__bar" />
        <span className="hero__bar" />
      </div>
      <span className="hero__readout">
        <span className="hero__meter-pct">15%</span>
        <span className="hero__meter-go" aria-hidden="true">
          <PixelIcon name="play" size="0.8em" />
          play
        </span>
      </span>
    </div>
    <p className="hero__survive">will you survive?</p>
  </>
)

export default function HeroBattery() {
  const [asPlay, setAsPlay] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(max-width: 1023px), (pointer: coarse)')
    const update = () => setAsPlay(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  if (asPlay) {
    return (
      <a
        className="hero__battery hero__battery--play"
        href="/play"
        data-sfx="confirm"
        data-burst
        aria-label="Play AI Marketing Kombat"
      >
        {METER}
      </a>
    )
  }
  return <div className="hero__battery">{METER}</div>
}

'use client'

import './crt.css'

/**
 * CRTOverlay — a fixed, full-viewport arcade-cabinet screen overlay.
 *
 * Renders on top of the whole app (pointer-events: none) to sell the
 * "arcade cabinet" look: scanlines, a subtle flicker + slow rolling band,
 * a soft vignette, a faint RGB aperture-grille, and an optional power-on
 * mount animation. Purely decorative, so it is aria-hidden.
 *
 * Props:
 *   scanlineGap  px period of the scanline gradient (1px dark + gap). Default 3.
 *   flicker      constant flicker + slow rolling band on/off. Default true.
 *   vignette     soft radial edge-darkening on/off. Default true.
 *   powerOn      collapse-to-a-line -> bloom + brightness flash on mount. Default true.
 *   intensity    overall strength (scanline/vignette/grille opacity). Default 0.25.
 *   scoped       cover only the nearest positioned ancestor (a section) instead
 *                of the whole viewport — for applying CRT per-section. Default false.
 *
 * Motion (flicker, rolling band, power-on) is disabled under
 * prefers-reduced-motion; static scanlines and vignette are kept.
 */
export default function CRTOverlay({
  scanlineGap = 3,
  flicker = true,
  vignette = true,
  powerOn = true,
  intensity = 0.25,
  scoped = false,
}) {
  const className = [
    'crt',
    scoped && 'crt--scoped',
    flicker && 'crt--flicker',
    powerOn && 'crt--power-on',
  ]
    .filter(Boolean)
    .join(' ')

  const style = {
    '--crt-scanline-gap': `${scanlineGap}px`,
    '--crt-intensity': intensity,
  }

  return (
    <div className={className} style={style} aria-hidden="true">
      <div className="crt__scanlines" />
      <div className="crt__grille" />
      {flicker && <div className="crt__roll" />}
      {vignette && <div className="crt__vignette" />}
      {powerOn && <div className="crt__power" />}
    </div>
  )
}
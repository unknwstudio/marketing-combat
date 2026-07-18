'use client'

import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'
import { isMotionPaused, subscribeMotionPaused } from '@/effects/motion/motionPause'
import './AttractMode.css'

/**
 * AttractMode — the on-PAGE idle loop (sister of AttractTitle, which owns the
 * browser TAB while it's hidden; this one owns the visible page while the
 * player walks away from the machine). After ATTRACT_IDLE_MS with zero input,
 * and only while the player is still near the top of the page (the hero is
 * what they'd "return" to — deep in the content an INSERT COIN wall would
 * just obscure what they were reading), a dim overlay fades in with a
 * blinking INSERT COIN / PRESS ANY KEY in the pixel font — an idle cabinet
 * flashing for a quarter.
 *
 * Dismissal: ANY input — key, pointer press/move, wheel, scroll, touch —
 * hides it instantly and re-arms the timer. While LIVE the overlay itself
 * catches the press (pointer-events: auto + its own onPointerDown that
 * preventDefaults/stopPropagations): on touch there is no pointermove
 * warning shot, so a pass-through tap would land on whatever sits under the
 * 78%-opaque wall — the fixed PLAY link or the hero badge — and navigate
 * from an element the user could barely see. The first tap only wakes the
 * machine; every later one interacts normally. Still aria-hidden + no tab
 * stop, so it never leaks into the accessibility tree.
 *
 * Reduced-motion: skipped ENTIRELY (no timer, never shown) — a blinking
 * full-screen flasher is exactly the attention-grabbing motion that
 * preference asks us to drop, and a static version of it is pure obstruction.
 * The in-page MOTION OFF toggle (WCAG 2.2.2) silences it the same way, and it
 * fires at most ONCE per tab session so it can't keep eating a visitor's next
 * click on a real control (2026-07-18 audit).
 *
 * Fixed overlay → mounted OUTSIDE JuiceProvider (its will-change wrapper
 * would pin position:fixed to the page instead of the viewport).
 */

// Exported so tests can assert the idle threshold instead of hard-coding 25s.
export const ATTRACT_IDLE_MS = 25000

// "Near the top": scrollY under this many viewport-heights. 1.5 covers the
// hero plus the first peek of Champion — past that the player is reading.
const NEAR_TOP_VH = 1.5

// Every input channel that proves a human is still at the controls.
const INPUT_EVENTS = ['keydown', 'pointerdown', 'pointermove', 'wheel', 'scroll', 'touchstart']

export default function AttractMode() {
  const [live, setLive] = useState(false)
  // the effect's dismiss+re-arm closure, exposed so the overlay's own
  // pointerdown (which stops propagation and thus skips the window listener)
  // can still dismiss and restart the idle timer
  const dismissRef = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return

    // Once per tab session: the idle flourish charms the first time, but
    // re-firing every idle window kept consuming the visitor's NEXT click on a
    // real control (registration / mode switcher). Show it at most once
    // (2026-07-18 audit). sessionStorage, so a fresh tab gets it again.
    const SEEN_KEY = 'amk:attract-seen'
    const seen = () => {
      try {
        return window.sessionStorage.getItem(SEEN_KEY) === '1'
      } catch {
        return false
      }
    }
    const markSeen = () => {
      try {
        window.sessionStorage.setItem(SEEN_KEY, '1')
      } catch {
        /* storage unavailable — session-only anyway, it just won't persist */
      }
    }
    if (seen()) return

    let timer = 0
    // Mirror of `live` for the handlers — avoids re-subscribing the six
    // window listeners on every show/hide just to read fresh state.
    let liveNow = false

    const arm = () => {
      window.clearTimeout(timer)
      // never arm once shown this session or while MOTION is paused
      if (seen() || isMotionPaused()) return
      timer = window.setTimeout(show, ATTRACT_IDLE_MS)
    }

    const show = () => {
      if (seen() || isMotionPaused()) return
      // Fire only near the top and while the tab is actually visible —
      // AttractTitle already covers the hidden-tab case, and stacking both
      // would flash the title bar AND the page on return. Otherwise re-arm
      // and check again next cycle.
      if (window.scrollY < window.innerHeight * NEAR_TOP_VH && !document.hidden) {
        liveNow = true
        markSeen() // burn the one-shot the moment it appears
        setLive(true)
      } else {
        arm()
      }
    }

    const dismiss = () => {
      if (liveNow) {
        liveNow = false
        setLive(false)
      }
    }

    const onInput = () => {
      dismiss()
      arm() // no-op after the one-shot (arm bails on seen())
    }

    // MOTION OFF (WCAG 2.2.2 toggle) mid-idle: tear the overlay down and stop
    // arming; MOTION ON re-arms (unless already shown this session).
    const unsubMotion = subscribeMotionPaused((paused) => {
      if (paused) {
        window.clearTimeout(timer)
        dismiss()
      } else {
        arm()
      }
    })

    // passive: we never preventDefault — dismissal must not eat the key/press
    // that woke the machine (pointer presses are the exception: the overlay's
    // own handler consumes those while live, see the JSX).
    INPUT_EVENTS.forEach((t) => window.addEventListener(t, onInput, { passive: true }))
    dismissRef.current = onInput
    arm()

    return () => {
      window.clearTimeout(timer)
      INPUT_EVENTS.forEach((t) => window.removeEventListener(t, onInput))
      unsubMotion()
      dismissRef.current = null
    }
  }, [])

  if (!live) return null

  return (
    <div
      className="attract"
      aria-hidden="true"
      onPointerDown={(e) => {
        // consume the waking press so it can't also activate whatever the
        // overlay is covering (PLAY link, hero badge, ModeSwitcher)
        e.preventDefault()
        e.stopPropagation()
        dismissRef.current?.()
      }}
    >
      <span className="attract__coin">INSERT COIN</span>
      <span className="attract__key">PRESS ANY KEY</span>
    </div>
  )
}

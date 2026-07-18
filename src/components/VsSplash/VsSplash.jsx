'use client'

import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'
import { takeoverAvailable, openGameTakeover } from '@/lib/game'
import './VsSplash.css'

/**
 * VsSplash — the fighting-game VS screen between the landing and the game.
 * ONE delegated click listener on document intercepts activations of any
 * a[href="/play"] (the hero battery-as-PLAY, the finale cabinet's enter
 * link…), flashes a 500ms full-screen "YOU vs THE ALGORITHM" card —
 * the two names slam in from opposite sides on steps() motion — then either
 * opens the game in-place as an overlay (on the home landing, where takeover
 * is mounted) or hard navigates to /play (on routes with no overlay, e.g.
 * /classic).
 *
 * WHY delegated (not per-link): same reasoning as ClickBurst — one listener
 * covers every /play link on the page, including ones that mount late, with
 * no re-scan bookkeeping.
 *
 * The splash must NEVER read as lag twice:
 * - sessionStorage flag ('kombat_vs_seen'): after the first flash this
 *   session, every later /play click navigates natively — straight through,
 *   riding the site's @view-transition pixel dissolve (App.css). The
 *   splash-driven nav itself OPTS OUT of that dissolve (pageswap →
 *   skipTransition below): the splash already is this navigation's
 *   ceremony, the dissolve's outgoing snapshot would be the all-black
 *   splash card (invisible work), and letting both run makes Chromium
 *   abort the view transition mid-flight with a "Transition was skipped"
 *   console error. One nav, one transition.
 * - reduced-motion: navigates natively, always (checked live per click so a
 *   mid-session OS toggle is respected).
 * - modified clicks (ctrl/cmd/shift/alt, non-primary button, target=_blank)
 *   pass through UNTOUCHED so open-in-new-tab keeps working. Middle clicks
 *   never fire `click` in modern browsers, so they pass through by nature.
 *
 * Known non-target: the cabinet's armed HANDOFF overlay boots /play
 * programmatically (a div onClick → goPlay), not via an anchor — by then the
 * player is already inside a full-screen takeover, so a second splash on top
 * would be noise, not ceremony.
 *
 * Fixed overlay → mounted OUTSIDE JuiceProvider (its will-change wrapper
 * would pin position:fixed to the page instead of the viewport).
 */

// How long the card holds before navigation. 500ms: long enough to read
// three words, short enough to feel like a cut, not a loading screen.
export const SPLASH_MS = 500

// Session flag — "the player has seen the VS screen this visit".
const SEEN_KEY = 'kombat_vs_seen'

const seen = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch (e) {
    return false // no storage (private mode) — worst case the splash repeats
  }
}

const markSeen = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch (e) {
    /* no storage — nothing to persist */
  }
}

export default function VsSplash() {
  const [live, setLive] = useState(false)
  const liveRef = useRef(false)
  const timerRef = useRef(0)

  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented) return
      // modified activations keep their native meaning (new tab / window /
      // download) — the splash only owns the plain left-click journey
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const a = e.target instanceof Element && e.target.closest('a[href="/play"]')
      if (!a || a.target === '_blank') return

      // splash already running — swallow the double-click, keep the timer
      if (liveRef.current) {
        e.preventDefault()
        return
      }

      // repeat visit this session, or reduced-motion: skip the flash. On /demo
      // open the overlay in place; elsewhere fall through to native /play nav.
      if (seen() || prefersReducedMotion()) {
        markSeen()
        if (takeoverAvailable()) {
          e.preventDefault()
          openGameTakeover()
        }
        return
      }

      e.preventDefault()
      markSeen()
      liveRef.current = true
      setLive(true)
      timerRef.current = window.setTimeout(() => {
        if (takeoverAvailable()) {
          // /demo: the flash was the ceremony; open the game in place and tear
          // down the card as the game overlay mounts on top.
          setLive(false)
          liveRef.current = false
          openGameTakeover()
          return
        }
        // /: no overlay mounted — hard-nav to /play, opting out of the
        // @view-transition dissolve exactly as before. `live` stays true so the
        // black VS card holds through the page swap, unchanged from before.
        window.addEventListener(
          'pageswap',
          (ev) => {
            const vt = ev.viewTransition
            if (!vt) return
            vt.ready?.catch?.(() => {})
            vt.finished?.catch?.(() => {})
            vt.updateCallbackDone?.catch?.(() => {})
            vt.skipTransition()
          },
          { once: true }
        )
        window.location.href = a.href
      }, SPLASH_MS)
    }

    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
      window.clearTimeout(timerRef.current)
    }
  }, [])

  if (!live) return null

  // aria-hidden: a sub-second decorative flash — announcing it would only
  // delay AT users on their way into the game.
  return (
    <div className="vs-splash" aria-hidden="true">
      <span className="vs-splash__name vs-splash__name--you">YOU</span>
      <span className="vs-splash__vs">VS</span>
      <span className="vs-splash__name vs-splash__name--algo">THE ALGORITHM</span>
    </div>
  )
}

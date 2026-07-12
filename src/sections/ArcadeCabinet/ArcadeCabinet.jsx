'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import './ArcadeCabinet.css'
import Cabinet3DMount from '@/components/Cabinet3D/Cabinet3DMount'
import { playSfx } from '@/effects/audio/arcadeAudio'

/**
 * PLAY THE GAME — an interactive 3D arcade cabinet (R3F) staged as a
 * scroll-choreographed "act":
 *
 * - Always (every device / no act needed): the cabinet's buttons are live 3D
 *   hotspots (hover glow + depress + click SFX, wired inside Cabinet3D), and a
 *   real focusable link below the cabinet is the canonical keyboard /
 *   screen-reader / mobile path into /play. The old design wrapped the whole
 *   canvas in an <a>, which swallowed every mesh click — hence the <div>.
 * - Desktop pointer devices (min-width 1024px + hover) with motion allowed AND
 *   a live WebGL canvas: the section holds at the viewport for ~130% of scroll.
 *   Phase A (0→.5) grows the cabinet past its framing; phase B (.5→1) dives the
 *   camera into the CRT; from p .75 a DOM overlay (game still + blinking PRESS
 *   START) fades in — fully opaque by .95 — and takes over: click/Enter (and a
 *   real focused <button>) boot /play. The takeover RELEASES the instant the
 *   hold ends in either direction — overlay input and the Enter listener must
 *   never outlive the act (they'd hijack Enter on the FAQ/footer/CTA below).
 *
 * THE HOLD IS NATIVE position:sticky, NOT a ScrollTrigger pin. /demo renders
 * inside ScaleCanvas mode="zoom", and CSS zoom multiplies every descendant
 * translate length — ScrollTrigger's pin (even pinType:'transform') counter-
 * scrolls in LOCAL px, so the pinned section drifts by translate*(zoom-1):
 * ~450px off by act's end at 1920x1080, upward drift below 1440px. gsap has no
 * zoom compensation; sticky is computed by the engine in zoomed layout space
 * and holds pixel-true at every width (the whole reason ScaleCanvas grew a
 * zoom mode — ClassicChampionFor runs the same sticky+runway pattern).
 * Mechanics: .cabinet__stage sticks below the viewport top while the empty
 * .cabinet__runway after it provides the scroll distance; an UN-pinned
 * ScrollTrigger scrubs proxy.p over exactly that runway. The trigger's
 * isActive (via onToggle) is the "mid-hold" signal that also gates the R3F
 * frameloop (`pinned`) — arming alone must NOT keep the loop hot for the whole
 * session, that regressed the IntersectionObserver's off-screen pause.
 *
 * Reduced-motion / mobile / WebGL-fallback keep today's behavior exactly:
 * gentle dolly, no hold, no zoom, link-only navigation.
 */

// the act is a desktop-pointer flourish; touch + small screens keep the plain flow
const ACT_GATE = '(min-width: 1024px) and (hover: hover)'
// sticky hold = 130% of the real viewport, the same feel as the old pin's '+=130%'
const ACT_HOLD_VH = 1.3

const clamp01 = (v) => Math.max(0, Math.min(1, v))

export default function ArcadeCabinet() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const runwayRef = useRef(null)
  const overlayRef = useRef(null)
  const handoffBtnRef = useRef(null)
  const actProgressRef = useRef(0) // 0..1 over the sticky hold; 0 = act idle
  const liveRef = useRef(false)
  const pinnedRef = useRef(false) // mirrors ScrollTrigger.isActive for the scrub
  const [webglReady, setWebglReady] = useState(false)
  const [armed, setArmed] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [handoffLive, setHandoffLive] = useState(false)

  // Cabinet3D reports its render path; the act never arms over the <img> fallback
  const onSupported = useCallback((ok) => setWebglReady(ok), [])

  const goPlay = useCallback(() => {
    playSfx('confirm', 0.5)
    // plain MPA nav — the site's View Transition CSS runs the pixel dissolve
    window.location.href = '/play'
  }, [])

  /* ---------- arm the act (gate check only — no gsap needed to decide) ---------- */
  useEffect(() => {
    if (!webglReady) return
    if (typeof window === 'undefined' || !window.matchMedia) return
    if (!window.matchMedia(ACT_GATE).matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setArmed(true)
    return () => setArmed(false)
  }, [webglReady])

  /* ---------- the scroll act: sticky hold + scrub ----------
     Split from the arming effect on purpose: this one runs only AFTER the
     armed markup (sticky class + runway div) is committed to the DOM, so the
     trigger never measures a pre-arm layout. */
  useEffect(() => {
    if (!armed) return
    const section = sectionRef.current
    const stage = stageRef.current
    const runway = runwayRef.current
    if (!section || !stage || !runway) return

    let cancelled = false
    let tween = null
    let refresh = null
    let sizeRunway = null
    let ST = null

    ;(async () => {
      // gsap is lazy-imported inside the effect (same as RoundMoments) so the
      // act costs nothing on the devices that never arm it
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)
      ST = ScrollTrigger

      // The runway extends the section's CONTENT below the stage, and sticky
      // can only travel within the content box — its height IS the hold
      // distance. Sized in LOCAL (pre-zoom) px so that after ScaleCanvas's
      // zoom it measures exactly ACT_HOLD_VH of the real viewport in document
      // px (same measure-the-zoom recipe as ClassicChampionFor). Until this
      // runs the runway is 0 high, so a failed gsap import simply leaves the
      // section in today's static flow.
      sizeRunway = () => {
        const zoom = section.getBoundingClientRect().width / (section.offsetWidth || 1) || 1
        runway.style.height = `${Math.round((window.innerHeight * ACT_HOLD_VH) / zoom)}px`
      }
      sizeRunway()
      // re-measure before every ScrollTrigger refresh (fires on resize too)
      ScrollTrigger.addEventListener('refreshInit', sizeRunway)

      // a proxy tween (not raw onUpdate progress) so scrub:0.5 smoothing applies
      // to everything the act drives — 3D phases and the DOM handoff alike
      const proxy = { p: 0 }
      tween = gsap.to(proxy, {
        p: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          // the stage's natural offset inside the section equals its sticky
          // top (.dsec padding), so the stick engages exactly at 'top top'
          start: 'top top',
          // scrub over exactly the sticky travel, measured in DOCUMENT px
          // (rects are post-zoom) — p hits 1 precisely when the stick ends
          end: () => '+=' + Math.max(1, Math.round(runway.getBoundingClientRect().height)),
          scrub: 0.5,
          // isActive is the one signal the scrub can't provide: past the end
          // proxy.p parks at 1 and onUpdate goes silent, so release HERE.
          onToggle: (self) => {
            pinnedRef.current = self.isActive
            setPinned(self.isActive)
            const overlay = overlayRef.current
            if (self.isActive) {
              // back mid-hold: the scrub owns the overlay's opacity again
              if (overlay) gsap.killTweensOf(overlay)
              return
            }
            // leaving in EITHER direction drops the takeover — the Enter
            // hijack and the full-frame click target must die with the hold
            if (liveRef.current) {
              liveRef.current = false
              setHandoffLive(false)
            }
            // past the end the scrub never writes opacity again — fade the
            // frame off so it doesn't sit over the section as an opaque,
            // click-dead cover while it scrolls away
            if (overlay && self.progress >= 1) {
              gsap.to(overlay, { opacity: 0, duration: 0.25, ease: 'none', overwrite: 'auto' })
            }
          },
        },
        onUpdate: () => {
          actProgressRef.current = proxy.p
          // HANDOFF: overlay opacity maps p .75 → .95 (imperative style write —
          // no React churn at scroll frequency). Starting at .75 gives the fade
          // a real runway: fully opaque with 5% of the hold still to scrub,
          // instead of only hitting 1 at the very last pixel.
          const overlay = overlayRef.current
          if (overlay) overlay.style.opacity = String(clamp01((proxy.p - 0.75) / 0.2))
          // live only while genuinely mid-hold: after a fast scroll past the
          // end the scrub keeps easing p toward 1 AFTER onToggle released —
          // without the pinnedRef guard those trailing updates would re-latch
          const live = proxy.p >= 0.95 && pinnedRef.current
          if (live !== liveRef.current) {
            liveRef.current = live
            setHandoffLive(live)
          }
        },
      })

      // ScaleCanvas applies its zoom in its own effect/ResizeObserver, which can
      // land after this trigger is built. Recompute start/end once layout has
      // settled (rAF) and again on full load so the scroll math matches the
      // zoomed geometry. (GSAP already auto-refreshes on resize.)
      ScrollTrigger.refresh()
      refresh = () => ScrollTrigger.refresh()
      requestAnimationFrame(refresh)
      window.addEventListener('load', refresh)
    })()

    return () => {
      cancelled = true
      if (refresh) window.removeEventListener('load', refresh)
      if (ST && sizeRunway) ST.removeEventListener('refreshInit', sizeRunway)
      if (tween) {
        if (tween.scrollTrigger) tween.scrollTrigger.kill()
        tween.kill()
      }
      runway.style.height = ''
      actProgressRef.current = 0
      liveRef.current = false
      pinnedRef.current = false
      setHandoffLive(false)
      setPinned(false)
    }
  }, [armed])

  // While the handoff is fully shown, a bare Enter boots the game too — but
  // ONLY a bare one: modified combos (cmd/ctrl/alt/shift) and Enter aimed at a
  // real control (links, buttons, the FAQ <summary>s, anything tabbable) keep
  // their native meaning. handoffLive itself releases when the hold ends, so
  // this listener can never leak onto the rest of the page.
  useEffect(() => {
    if (!handoffLive) return
    const onKey = (e) => {
      if (e.key !== 'Enter') return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      const t = e.target
      if (t instanceof Element && t.closest('a,button,summary,input,select,textarea,[tabindex]'))
        return
      goPlay()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handoffLive, goPlay])

  // WCAG 2.4.11: when the opaque PRESS START frame takes over, sequential
  // focus must not vanish beneath it — move focus onto the overlay's real
  // <button> (its ring renders on top of the frame), and hand it back to
  // wherever it was the moment the takeover releases.
  useEffect(() => {
    if (!handoffLive) return
    const btn = handoffBtnRef.current
    const prev = document.activeElement instanceof HTMLElement ? document.activeElement : null
    btn?.focus({ preventScroll: true }) // never fight the scrub for scroll position
    return () => {
      // hand back only if focus is still ours — if the user already tabbed
      // onward, yanking it to `prev` would fight their keyboard navigation
      if (!btn || document.activeElement !== btn) return
      if (prev && prev.isConnected) prev.focus({ preventScroll: true })
      else btn.blur()
    }
  }, [handoffLive])

  return (
    <section
      ref={sectionRef}
      className={`dsec dsec--alt cabinet${armed ? ' cabinet--armed' : ''}`}
      aria-label="Play the game"
    >
      {/* STAGE — the visible frame (head + cabinet + link + handoff). Armed,
          it position:sticky-holds at the viewport while the runway below
          provides the scroll distance; un-armed it's a plain wrapper. */}
      <div ref={stageRef} className="cabinet__stage">
        <div className="dsec__head">
          <span className="dsec__round">Insert coin — enter the arena</span>
          <h2 className="dsec__title">play the game</h2>
        </div>

        {/* a <div>, NOT a link: the canvas needs its pointer events for the 3D
            button hotspots; navigation lives on the meshes + the link below */}
        <div className="cabinet__unit cabinet__unit--3d">
          <Cabinet3DMount
            armed={armed}
            pinned={pinned}
            actProgressRef={actProgressRef}
            onSupported={onSupported}
          />
        </div>

        {/* while the opaque handoff covers this link it leaves the tab order —
            otherwise keyboard focus lands on a control that is 100% hidden
            under the frame (WCAG 2.4.11 Focus Not Obscured) */}
        <a
          className="d-btn cabinet__enter"
          href="/play"
          data-magnetic
          data-sfx="confirm"
          aria-label="Play AI Marketing Kombat"
          tabIndex={handoffLive ? -1 : undefined}
          aria-hidden={handoffLive || undefined}
        >
          {'>>> insert coin — press start <<<'}
        </a>

        {/* HANDOFF overlay — only mounted while the act is armed; faded in by
            the scrub (p .75 → .95), inert (aria-hidden + no pointer-events)
            until fully shown, then any click / Enter boots the game */}
        {armed && (
          <div
            ref={overlayRef}
            className={`cabinet__handoff${handoffLive ? ' cabinet__handoff--live' : ''}`}
            aria-hidden={!handoffLive}
            onClick={handoffLive ? goPlay : undefined}
          >
            <img
              className="cabinet__handoff-bg"
              src="/game/stages/enterprise.png"
              alt=""
              draggable="false"
            />
            {/* a real <button> so the takeover has a focusable control with a
                visible ring (focus is moved here while live). No onClick of its
                own: activating it bubbles to the frame's onClick above, so
                Enter can never boot the game twice. */}
            <button
              ref={handoffBtnRef}
              type="button"
              className="cabinet__handoff-copy"
              tabIndex={handoffLive ? 0 : -1}
            >
              <span className="cabinet__handoff-press">press start</span>
              <span className="cabinet__handoff-coin">insert coin — click or hit enter</span>
            </button>
          </div>
        )}
      </div>

      {/* RUNWAY — armed only: an empty block after the stage whose JS-set
          height is the sticky travel (the act effect owns it; see sizeRunway) */}
      {armed && <div ref={runwayRef} className="cabinet__runway" aria-hidden="true" />}
      {/* Cabinet model credit is kept in
          public/assets/demo/MODEL-CREDITS.txt (author: Alena Zolotareva, via Rodin). */}
    </section>
  )
}

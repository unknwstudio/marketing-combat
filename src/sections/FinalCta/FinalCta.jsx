'use client'

import { useEffect, useRef } from 'react'
import CtaLabel from '@/components/CtaLabel/CtaLabel'
import { useJuice } from '@/effects/juice/useJuice'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'
import Cabinet3DGate from '@/components/Cabinet3D/Cabinet3DGate'
import PixelIcon from '@/components/PixelIcon/PixelIcon'
import { GAME_COPY } from '@/lib/game'
import './FinalCta.css'

// Running-band victory callout. FINISH_LABEL rides in data-announce (Announcer.jsx
// flashes it + plays the KO cue on scroll-in) AND as the wrapper's aria-label, so
// assistive tech hears it once — the crawling copy below is decorative/aria-hidden.
const FINISH_LABEL = GAME_COPY.youFinished
const FINISH_REPEAT = 5 // items per run; the run is duplicated for a seamless -50% loop

// One run of the ticker; rendered twice (tags 'a'/'b') for the loop. Keys are
// tag-scoped so the two runs don't collide as siblings of the track.
function FinishRun({ tag }) {
  return Array.from({ length: FINISH_REPEAT }, (_, i) => (
    <span className="finalcta__finish-item" key={`${tag}-${i}`}>
      <span className="finalcta__finish-star">
        <PixelIcon name="star" />
      </span>
      {FINISH_LABEL}
    </span>
  ))
}

/**
 * JOIN THE BATTLE — closing call to action, staged as an arcade
 * "GAME OVER -> CONTINUE?" ritual: the round ends, a silent countdown ticks,
 * and instead of hitting zero it resolves into the registration CTA (the
 * game's one-more-move is: register). Any keypress or click skips straight to
 * the resolved state. Reduced-motion shows the resolved state immediately, no
 * countdown/shake/scramble.
 *
 * The headline also DECODES on entry (GSAP ScrambleText, lazy-imported like
 * RoundMoments so gsap never lands in the base bundle): CRT glyph noise
 * resolves into "join the battle" once per page load. The static aria-label
 * on the <h2> keeps the accessible name intact while textContent cycles
 * through noise, so screen readers never announce garbage. "Press any key"
 * fast-forwards the scramble to its final frame along with everything else.
 */
export default function FinalCta() {
  const sectionRef = useRef(null)
  const numRef = useRef(null)
  const titleRef = useRef(null)
  const { shake } = useJuice()

  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const reduce = prefersReducedMotion()

    if (reduce) {
      el.classList.add('finalcta--stage-ready')
      return
    }

    let cancelled = false
    let scrambleTween = null
    const timers = []
    const after = (fn, ms) => timers.push(setTimeout(fn, ms))

    const skipToReady = () => {
      if (cancelled) return
      cancelled = true
      timers.forEach(clearTimeout)
      // "press any key" resolves EVERYTHING, headline decode included — jump
      // the scramble to its last frame so the title lands on the real string.
      if (scrambleTween) scrambleTween.progress(1)
      el.classList.remove('finalcta--stage-gameover', 'finalcta--stage-countdown')
      el.classList.add('finalcta--stage-ready')
      window.removeEventListener('keydown', skipToReady)
      window.removeEventListener('pointerdown', skipToReady)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()

        shake(7)
        el.classList.add('finalcta--stage-gameover')
        window.addEventListener('keydown', skipToReady)
        window.addEventListener('pointerdown', skipToReady)

        // HEADLINE DECODE — kicked off with the ritual, runs alongside the
        // GAME OVER slam. Lazy import keeps gsap out of the base bundle; the
        // `cancelled` guard means a skip (or unmount) before the chunk lands
        // simply never starts the scramble — the title is already the real
        // text in the static HTML, so nothing needs undoing.
        const title = titleRef.current
        if (title) {
          const original = title.textContent
          ;(async () => {
            const { gsap } = await import('gsap')
            const { ScrambleTextPlugin } = await import('gsap/ScrambleTextPlugin')
            if (cancelled) return
            gsap.registerPlugin(ScrambleTextPlugin)
            scrambleTween = gsap.to(title, {
              duration: 1.2,
              ease: 'none', // char swaps ARE the quantization — no easing on top
              // fixed-width glyphs only (no ▓▒░ blocks): those render wider
              // than the mono font's cell and made the line visibly jump
              // width mid-decode, right at the page's conversion moment.
              scrambleText: { text: original, chars: '<>/0123456789', speed: 0.4 },
            })
          })()
        }

        after(() => {
          if (cancelled) return
          el.classList.replace('finalcta--stage-gameover', 'finalcta--stage-countdown')
          let n = 5
          if (numRef.current) numRef.current.textContent = String(n)
          const tick = () => {
            if (cancelled) return
            n -= 1
            if (n <= 0) {
              skipToReady()
              return
            }
            if (numRef.current) numRef.current.textContent = String(n)
            after(tick, 700)
          }
          after(tick, 700)
        }, 650)
      },
      { threshold: 0.5 }
    )
    io.observe(el)

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      if (scrambleTween) scrambleTween.kill()
      io.disconnect()
      window.removeEventListener('keydown', skipToReady)
      window.removeEventListener('pointerdown', skipToReady)
    }
  }, [shake])

  // id="register" — fragment target of the hero's ">>> registration <<<"
  // badge link (Hero.jsx); the scroll offset lives in FinalCta.css.
  return (
    <section
      id="register"
      className="dsec dsec--alt finalcta"
      aria-label="Join the battle"
      ref={sectionRef}
    >
      <div
        className="finalcta__finish"
        data-announce={FINISH_LABEL}
        data-sound="ko"
        role="img"
        aria-label="You finished them"
      >
        <div className="finalcta__finish-track" aria-hidden="true">
          <FinishRun tag="a" />
          <FinishRun tag="b" />
        </div>
      </div>

      <Cabinet3DGate
        screenVariant="youwin"
        screenPower={0.95}
        restYaw={0}
        parallaxYaw={0.09}
        parallaxPitch={0.045}
        camFar={4.8}
        camNear={4.2}
        camY={0.78}
        fov={26}
      />

      <div className="finalcta__gameover" aria-hidden="true">
        <span className="finalcta__gameover-text">{GAME_COPY.youWin}</span>
      </div>

      {/* aria-label = the real string: the accessible name stays intact while
          the visible textContent cycles through scramble noise on entry */}
      <h2 className="finalcta__title" aria-label="join the battle" ref={titleRef}>
        join the battle
      </h2>
      <p className="finalcta__body">
        Compare your skills, put yourself on the map, and find out who is the best marketer on
        the planet. One battle. One leaderboard.
      </p>

      <div className="finalcta__continue" aria-hidden="true">
        <span className="finalcta__continue-label">continue?</span>
        <span className="finalcta__continue-num" ref={numRef}>
          5
        </span>
      </div>

      {/* data-burst: consumed by the global [data-burst] click listener
          (pixel-shard burst on activate) — attribute-only contract here */}
      <button
        type="button"
        className="d-btn finalcta__cta"
        data-magnetic
        data-sfx="confirm"
        data-burst
        data-register
      >
        <CtaLabel>registration</CtaLabel>
      </button>
      {/* same fact line as /classic (ClassicChampionFor.jsx) and the /mcp
          prompt — surfacing it here too so the / and /demo CTA isn't a leap
          of faith about how much registering actually costs in time */}
      <p className="finalcta__facts">5 min to apply · 3 questions · AI review · 48 hr response</p>
    </section>
  )
}

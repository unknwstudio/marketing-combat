'use client'

import { useEffect, useRef } from 'react'
import { useJuice } from '@/effects/juice/useJuice'
import './FinalCta.css'

/**
 * JOIN THE BATTLE — closing call to action, staged as an arcade
 * "GAME OVER -> CONTINUE?" ritual: the round ends, a countdown ticks with a
 * beep each second, and instead of hitting zero it resolves into the
 * registration CTA (the game's one-more-move is: register). Any keypress or
 * click skips straight to the resolved state. Reduced-motion shows the
 * resolved state immediately, no countdown/beeps/shake.
 */
export default function FinalCta() {
  const sectionRef = useRef(null)
  const numRef = useRef(null)
  const { shake } = useJuice()

  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      el.classList.add('finalcta--stage-ready')
      return
    }

    let cancelled = false
    const timers = []
    const after = (fn, ms) => timers.push(setTimeout(fn, ms))

    let audioCtx = null
    const beep = (freq, dur = 0.09) => {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext
        audioCtx = audioCtx || new Ctx()
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.type = 'square'
        osc.frequency.value = freq
        gain.gain.value = 0.05
        osc.connect(gain).connect(audioCtx.destination)
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur)
        osc.stop(audioCtx.currentTime + dur)
      } catch {
        /* Web Audio unavailable — the visual sequence still plays */
      }
    }

    const skipToReady = () => {
      if (cancelled) return
      cancelled = true
      timers.forEach(clearTimeout)
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
        beep(180, 0.14)
        window.addEventListener('keydown', skipToReady)
        window.addEventListener('pointerdown', skipToReady)

        after(() => {
          if (cancelled) return
          el.classList.replace('finalcta--stage-gameover', 'finalcta--stage-countdown')
          let n = 5
          if (numRef.current) numRef.current.textContent = String(n)
          beep(660)
          const tick = () => {
            if (cancelled) return
            n -= 1
            if (n <= 0) {
              skipToReady()
              return
            }
            if (numRef.current) numRef.current.textContent = String(n)
            beep(660)
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
      <span className="finalcta__finish" data-announce="FINISH HIM" data-sound="ko">
        ★ FINISH HIM ★
      </span>

      <div className="finalcta__gameover" aria-hidden="true">
        <span className="finalcta__gameover-text">GAME OVER</span>
      </div>

      <h2 className="finalcta__title">join the battle</h2>
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

      <button type="button" className="d-btn finalcta__cta" data-magnetic data-sfx="confirm">
        &gt;&gt;&gt; registration &lt;&lt;&lt;
      </button>
      <span className="finalcta__press">▮ PRESS ANY KEY TO CONTINUE ▮</span>
    </section>
  )
}

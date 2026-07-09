'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { JuiceContext } from './useJuice'
import './juice.css'

// Read once per call so a runtime toggle of the OS setting is respected.
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Wraps the app in a shake/freeze target and exposes { shake, hitstop, impact }
 * to descendants via useJuice(). See "The Art of Screenshake" (Vlambeer): the
 * small rotation is what makes a shake read as force rather than as a glitch.
 */
export default function JuiceProvider({ children }) {
  const wrapRef = useRef(null)
  const rafRef = useRef(0)
  const freezeRef = useRef(0)

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(freezeRef.current)
    },
    []
  )

  // Screen shake: translate + tiny rotate, amplitude decaying to 0.
  const shake = useCallback((strength = 8) => {
    const el = wrapRef.current
    if (!el || prefersReducedMotion()) return

    cancelAnimationFrame(rafRef.current)
    const s = Math.min(strength, 20)
    const duration = 150 + s * 7 // ~150-290ms, scaled by strength
    const start = performance.now()

    const tick = (now) => {
      const t = (now - start) / duration
      if (t >= 1) {
        el.style.transform = ''
        rafRef.current = 0
        return
      }
      const amp = strength * (1 - t) // linear decay
      const dx = Math.round((Math.random() * 2 - 1) * amp)
      const dy = Math.round((Math.random() * 2 - 1) * amp)
      const rot = (Math.random() * 2 - 1) * 0.5 * (1 - t) // max +/-0.5deg
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  // Freeze-frame. Returns a promise so callers can sequence hitstop -> shake.
  const hitstop = useCallback((ms = 60) => {
    const el = wrapRef.current
    if (!el || prefersReducedMotion()) return Promise.resolve()

    el.classList.add('juice-frozen')
    clearTimeout(freezeRef.current)
    return new Promise((resolve) => {
      freezeRef.current = setTimeout(() => {
        el.classList.remove('juice-frozen')
        resolve()
      }, ms)
    })
  }, [])

  // Convenience: a solid hit = brief freeze, then snap into the shake.
  const impact = useCallback(
    (strength = 8) => {
      if (prefersReducedMotion()) return
      hitstop(50).then(() => shake(strength))
    },
    [hitstop, shake]
  )

  const value = useMemo(
    () => ({ shake, hitstop, impact }),
    [shake, hitstop, impact]
  )

  return (
    <JuiceContext.Provider value={value}>
      <div className="juice-root" ref={wrapRef}>
        {children}
      </div>
    </JuiceContext.Provider>
  )
}
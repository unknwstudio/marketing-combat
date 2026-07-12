'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useJuice } from '@/effects/juice/useJuice'
import { useSparks } from '@/effects/particles/HitSparks'
import { playSfx } from '@/effects/audio/arcadeAudio'
import './Announcer.css'

/**
 * Announcer — arcade "ROUND / FIGHT / FINISH HIM" call-outs. Watches elements
 * tagged `data-announce="TEXT"` (optional `data-sound="clip"`, optional
 * `data-announce-burst` for a center-screen HitSparks particle burst); when
 * one scrolls into view it slams a big pixel title center-screen, shakes the
 * stage, and — only after the user has interacted (autoplay policy) — plays
 * the VO clip. Each fires once.
 */
export default function Announcer() {
  const { shake } = useJuice()
  const { burst } = useSparks()
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const fired = new Set()
    let hideTimer = 0
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue
          const el = en.target
          const key = el.getAttribute('data-announce')
          if (!key || fired.has(key)) continue
          fired.add(key)
          setMsg(key)
          shake(7)
          const sound = el.getAttribute('data-sound')
          if (sound) playSfx(sound, 0.45)
          // opt-in: a handful of call-outs (the end-of-tour payoff) also want
          // a confetti-style particle burst, unlike mid-page ones ("FIGHT!",
          // "STAGE 0X") which don't set this attribute and are unaffected.
          if (el.hasAttribute('data-announce-burst')) {
            burst(window.innerWidth / 2, window.innerHeight / 2, { count: 40, power: 2.2 })
          }
          window.clearTimeout(hideTimer)
          hideTimer = window.setTimeout(() => setMsg(null), 1300)
          io.unobserve(el)
        }
      },
      { threshold: 0.55 }
    )
    document.querySelectorAll('[data-announce]').forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      window.clearTimeout(hideTimer)
    }
  }, [shake, burst])

  if (!msg || typeof document === 'undefined') return null

  // Portal to <body> so the fixed overlay escapes the JuiceProvider transform
  // wrapper (a `will-change: transform` ancestor would otherwise pin it to the
  // page top instead of the viewport).
  return createPortal(
    <div className="announce" aria-hidden="true">
      <span className="announce__text" data-text={msg}>
        {msg}
      </span>
    </div>,
    document.body
  )
}

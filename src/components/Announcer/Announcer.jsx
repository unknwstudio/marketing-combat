'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useJuice } from '@/effects/juice/useJuice'
import { playSfx } from '@/effects/audio/arcadeAudio'
import './Announcer.css'

/**
 * Announcer — arcade "ROUND / FIGHT / FINISH HIM" call-outs. Watches elements
 * tagged `data-announce="TEXT"` (optional `data-sound="clip"`); when one scrolls
 * into view it slams a big pixel title center-screen, shakes the stage, and —
 * only after the user has interacted (autoplay policy) — plays the VO clip.
 * Each fires once.
 */
export default function Announcer() {
  const { shake } = useJuice()
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
  }, [shake])

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

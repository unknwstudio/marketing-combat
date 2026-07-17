'use client'

import { useEffect, useState } from 'react'
import {
  initAudio,
  installUnlock,
  isMuted,
  toggleMuted,
  subscribeMuted,
  playSfx,
} from '@/effects/audio/arcadeAudio'
import './SoundToggle.css'

/**
 * SoundToggle — mute control + the audio-unlock installer. Mounting it arms the
 * "first gesture unlocks sound" behaviour and restores the saved mute state.
 */
// `inline` renders the same control as an in-flow pill (hero placement on
// touch/narrow — owner frame 77) instead of the fixed dock instance. Both may
// mount at once; the audio module is a singleton so they stay in sync, and the
// CSS media arms show exactly one of them.
export default function SoundToggle({ inline = false }) {
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    initAudio()
    const removeUnlock = installUnlock()
    setMuted(isMuted())
    const unsub = subscribeMuted(setMuted)
    return () => {
      removeUnlock()
      unsub()
    }
  }, [])

  return (
    <button
      className={
        'sndtoggle' + (inline ? ' sndtoggle--inline' : '') + (muted ? ' sndtoggle--off' : '')
      }
      type="button"
      /* No aria-label: the visible "SOUND ON/OFF" span is the accessible name
         (WCAG 2.5.3 Label in Name). No aria-pressed either — a state-swapping
         label PLUS a pressed state reads as "SOUND OFF, pressed", which is
         ambiguous (4.1.2, 2026-07-16 audit): the label alone carries state. */
      onClick={() => {
        toggleMuted()
        if (!isMuted()) playSfx('confirm', 0.5)
      }}
    >
      <span className="sndtoggle__bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="sndtoggle__label">{muted ? 'SOUND OFF' : 'SOUND ON'}</span>
    </button>
  )
}

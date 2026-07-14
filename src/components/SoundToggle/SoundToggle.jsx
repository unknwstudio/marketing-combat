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
export default function SoundToggle() {
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
      className={'sndtoggle' + (muted ? ' sndtoggle--off' : '')}
      type="button"
      aria-pressed={muted}
      /* No aria-label: the visible "SOUND ON/OFF" span is the accessible name
         (WCAG 2.5.3 Label in Name); aria-pressed carries the toggle state. */
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

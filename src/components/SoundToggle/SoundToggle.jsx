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
import PixelIcon from '@/components/PixelIcon/PixelIcon'
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
      /* No aria-label: the visible "SOUND ON/OFF" span is the accessible name
         (WCAG 2.5.3 Label in Name). No aria-pressed either — a state-swapping
         label PLUS a pressed state reads as "SOUND OFF, pressed", which is
         ambiguous (4.1.2, 2026-07-16 audit): the label alone carries state. */
      onClick={() => {
        toggleMuted()
        if (!isMuted()) playSfx('confirm', 0.5)
      }}
    >
      <PixelIcon className="sndtoggle__icon" name={muted ? 'soundOff' : 'soundOn'} size="1.3em" />
      <span className="sndtoggle__label">{muted ? 'SOUND OFF' : 'SOUND ON'}</span>
    </button>
  )
}

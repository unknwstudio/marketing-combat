'use client'

/**
 * arcadeAudio — a tiny gesture-gated SFX layer for /demo.
 *
 * Browsers block audio until the first user gesture, so nothing plays on load;
 * the first pointerdown/keydown "inserts the coin" and unlocks playback. A mute
 * state persists to localStorage. Short clips live in /public/game/audio.
 *
 * Not a React hook — a module singleton so any component (Announcer, CTAs, the
 * toggle) shares one state without prop-drilling.
 */

let muted = false
let unlocked = false
const listeners = new Set()

const KEY = 'amk-muted'

function notify() {
  listeners.forEach((fn) => fn(muted))
}

/** Read the persisted mute preference (default: unmuted). Call once on mount. */
export function initAudio() {
  if (typeof window === 'undefined') return
  try {
    muted = window.localStorage.getItem(KEY) === '1'
  } catch {}
  notify()
}

/** Attach a one-shot gesture listener that unlocks playback ("insert coin"). */
export function installUnlock() {
  if (typeof window === 'undefined' || unlocked) return () => {}
  const unlock = () => {
    unlocked = true
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
  window.addEventListener('pointerdown', unlock, { once: true })
  window.addEventListener('keydown', unlock, { once: true })
  return () => {
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
}

/** Play a clip by name (file stem in /game/audio) — no-op if muted or locked. */
export function playSfx(name, volume = 0.5) {
  if (muted || !unlocked || typeof Audio === 'undefined') return
  try {
    const a = new Audio(`/game/audio/${name}.mp3`)
    a.volume = volume
    a.play().catch(() => {})
  } catch {}
}

export function isMuted() {
  return muted
}

export function setMuted(v) {
  muted = !!v
  try {
    window.localStorage.setItem(KEY, muted ? '1' : '0')
  } catch {}
  notify()
}

export function toggleMuted() {
  setMuted(!muted)
}

/** Subscribe to mute changes; returns an unsubscribe fn. */
export function subscribeMuted(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

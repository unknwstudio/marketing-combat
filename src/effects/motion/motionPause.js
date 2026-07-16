// Shared "pause motion" state — the user-operable mechanism WCAG 2.2.2 requires
// for auto-starting, >5s, parallel motion (marquees/tickers/shimmer/hero video).
// prefers-reduced-motion alone does NOT satisfy 2.2.2 (it needs an OS setting),
// and the existing hover-pauses are unreachable by keyboard/touch — this toggle
// is the universal control (2026-07-16 a11y audit). Tiny pub/sub, mirrors
// arcadeAudio's mute pattern. The `motion-paused` class on <html> lets each
// component's CSS park its own keyframes (`animation-play-state: paused`);
// JS-driven motion (Marquee's rAF crawl, the hero <video>) subscribes instead.

const KEY = 'amk:motion-paused'
const CLASS = 'motion-paused'

let paused = false
let inited = false
const subs = new Set()

function applyClass() {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle(CLASS, paused)
}

// Idempotent — every consumer calls it, whichever mounts first wins the init.
export function initMotionPause() {
  if (inited || typeof window === 'undefined') return
  inited = true
  try {
    paused = window.localStorage.getItem(KEY) === '1'
  } catch {
    /* storage unavailable — session-only state still works */
  }
  applyClass()
}

export function isMotionPaused() {
  return paused
}

export function toggleMotionPaused() {
  paused = !paused
  applyClass()
  try {
    window.localStorage.setItem(KEY, paused ? '1' : '0')
  } catch {
    /* storage unavailable — session-only state still works */
  }
  subs.forEach((fn) => fn(paused))
}

// Returns the unsubscribe — usable directly as a useEffect cleanup.
export function subscribeMotionPaused(fn) {
  subs.add(fn)
  return () => subs.delete(fn)
}

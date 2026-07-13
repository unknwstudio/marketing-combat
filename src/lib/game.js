// Site-level game-entry contract, shared by the hero PLAY control, the finale
// cabinet, the VS splash interceptor, and the takeover overlay. Pure module —
// window access is guarded and only happens at call time, so it is safe under
// the static-export/SSR pass. (Distinct from src/game/fight/events.js, which is
// the React-chrome <-> Phaser-engine contract.)

// CustomEvent that opens the in-page game takeover.
export const TAKEOVER_OPEN = 'amk:takeover-open'

// Single source of truth for the new user-facing copy — imported everywhere so
// the hero, the cabinet CRT and the overlay can never drift (and so nothing is
// hardcoded at a call site).
export const GAME_COPY = {
  playLabel: 'PLAY',
  playGlyph: '▶',
  pressStart: 'PRESS START',
  youWin: 'YOU WIN!',
}

// The overlay sets this true while mounted (only on /demo). VsSplash reads it to
// decide: open the in-page overlay (/demo) vs hard-navigate to /play (/, no
// overlay mounted). A window flag — not React context — because the reader is a
// document-level delegated listener outside the React tree.
export function takeoverAvailable() {
  return typeof window !== 'undefined' && window.__AMK_TAKEOVER__ === true
}

export function setTakeoverAvailable(v) {
  if (typeof window !== 'undefined') window.__AMK_TAKEOVER__ = !!v
}

// Fire-and-forget open request. The sole listener is GameTakeover.
export function openGameTakeover() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(TAKEOVER_OPEN))
}

'use client'

import './PlayFab.css'

/**
 * Floating registration launcher pinned bottom-right, mirroring SoundToggle
 * (bottom-left). Same compact 8-bit gold pixel look as before — it used to
 * launch the game (PLAY), but it's now the always-visible ("sticky")
 * registration CTA: opens the register modal via the delegated [data-register]
 * listener, with the /#register fragment as the no-JS fallback. data-burst
 * fires the pixel-shard burst on activate.
 * (Component/class name kept as PlayFab/.playfab to avoid churn across imports.)
 */
export default function PlayFab() {
  return (
    <a
      className="playfab"
      href="/#register"
      data-burst
      data-register
      aria-label="Register for the tournament"
    >
      register
      <svg className="playfab__tri" viewBox="0 0 6 10" aria-hidden="true">
        <path d="M0 0h1v10H0zM1 1h1v8H1zM2 2h1v6H2zM3 3h1v4H3zM4 4h1v2H4z" />
      </svg>
    </a>
  )
}

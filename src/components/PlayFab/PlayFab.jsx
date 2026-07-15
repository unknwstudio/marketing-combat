'use client'

import CtaLabel from '@/components/CtaLabel/CtaLabel'
import './PlayFab.css'

/**
 * Floating registration launcher pinned bottom-right, mirroring SoundToggle
 * (bottom-left). Shares the site's one registration-CTA look — mono font + gold
 * "sticker" box + the ">>> registration <<<" motif (same as the hero badge and
 * the big central CTA), just compact for a corner. It used to launch the game
 * (PLAY); it's now the always-visible ("sticky") registration CTA: opens the
 * register modal via the delegated [data-register] listener, with the
 * /#register fragment as the no-JS fallback. data-burst fires the pixel burst.
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
      <CtaLabel>registration</CtaLabel>
    </a>
  )
}

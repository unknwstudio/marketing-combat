import Link from 'next/link'
import './ModeSwitcher.css'

/**
 * Fixed bottom-center switcher between the two site modes:
 * "/" — the pixel-art AI mode, "/classic" — the plain readable mode.
 * Each label wears its own mode's typography (pixel font vs Helvetica).
 */
export default function ModeSwitcher({ active }) {
  return (
    <nav className="mode-switch" aria-label="Site mode">
      <Link
        href="/"
        className={
          'mode-switch__opt mode-switch__opt--ai' +
          (active === 'ai' ? ' mode-switch__opt--active' : '')
        }
        aria-current={active === 'ai' ? 'page' : undefined}
      >
        AI mode
      </Link>
      <Link
        href="/classic"
        className={
          'mode-switch__opt mode-switch__opt--classic' +
          (active === 'classic' ? ' mode-switch__opt--active' : '')
        }
        aria-current={active === 'classic' ? 'page' : undefined}
      >
        Classic
      </Link>
    </nav>
  )
}

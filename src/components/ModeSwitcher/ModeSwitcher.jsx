import './ModeSwitcher.css'

/**
 * Fixed bottom-center switcher between the two site modes:
 * "/" — the pixel-art AI mode, "/classic" — the plain readable mode.
 * Each label wears its own mode's typography (pixel font vs Helvetica).
 * Plain <a> full-page navigation on purpose: the two modes are separate
 * static pages with their own global styling scopes, so a hard swap is
 * more robust than client-side routing between them.
 */
export default function ModeSwitcher({ active }) {
  return (
    <nav className="mode-switch" aria-label="Site mode">
      <a
        href="/"
        className={
          'mode-switch__opt mode-switch__opt--ai' +
          (active === 'ai' ? ' mode-switch__opt--active' : '')
        }
        aria-current={active === 'ai' ? 'page' : undefined}
      >
        AI mode
      </a>
      <a
        href="/classic"
        className={
          'mode-switch__opt mode-switch__opt--classic' +
          (active === 'classic' ? ' mode-switch__opt--active' : '')
        }
        aria-current={active === 'classic' ? 'page' : undefined}
      >
        Classic
      </a>
      <a
        href="/mcp"
        className={
          'mode-switch__opt mode-switch__opt--mcp' +
          (active === 'mcp' ? ' mode-switch__opt--active' : '')
        }
        aria-current={active === 'mcp' ? 'page' : undefined}
      >
        MCP
      </a>
    </nav>
  )
}

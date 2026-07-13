// @ts-check
'use client'

import { useEffect, useRef, useState } from 'react'
import './ModeSwitcher.css'

/**
 * Fixed bottom-center switcher between the site modes:
 * "/" — the pixel-art AI mode, "/classic" — the plain readable mode,
 * "/mcp" — the whole site as one agent prompt.
 * Each label wears its own mode's typography (pixel font vs Helvetica).
 * Plain <a> full-page navigation on purpose: the modes are separate static
 * pages with their own global styling scopes, so a hard swap is more robust
 * than client-side routing between them.
 *
 * Because the pill sits dead-centre at the bottom, an 88%-opaque box would
 * occlude reading copy that scrolls under it (seen on /demo's cards). It now
 * auto-hides while the reader scrolls down and slides back on scroll-up or when
 * scrolling stops, so it never covers content mid-read. Reduced-motion users
 * keep it always-visible (an abrupt hide/show would be worse than a brief
 * overlap), and keyboard focus always reveals it (see :focus-within in CSS).
 */
/**
 * @param {{ active?: 'ai' | 'classic' | 'mcp' }} props  which mode is current (styles its pill active)
 */
export default function ModeSwitcher({ active }) {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const idle = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    lastY.current = window.scrollY
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const y = window.scrollY
        const dy = y - lastY.current
        if (y > 240 && dy > 4) setHidden(true)
        else if (dy < -4) setHidden(false)
        lastY.current = y
        // always reachable at rest: reveal once scrolling stops
        clearTimeout(idle.current)
        idle.current = setTimeout(() => setHidden(false), 700)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
      clearTimeout(idle.current)
    }
  }, [])

  return (
    <nav className={'mode-switch' + (hidden ? ' mode-switch--hidden' : '')} aria-label="Site mode">
      <a
        href="/"
        className={
          'mode-switch__opt mode-switch__opt--ai' +
          (active === 'ai' ? ' mode-switch__opt--active' : '')
        }
        aria-current={active === 'ai' ? 'page' : undefined}
        title="AI mode — the pixel-art arcade experience"
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
        title="Classic mode — a plain, readable version of the same info"
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
        title="MCP mode — the whole site as one prompt for your AI agent"
      >
        MCP
      </a>
    </nav>
  )
}

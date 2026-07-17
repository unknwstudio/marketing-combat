// @ts-check
'use client'

import { useEffect, useRef } from 'react'
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
 * The pill is PERMANENTLY visible — it never hides on scroll (it's the primary
 * way to switch modes, so it must always be reachable). Keyboard focus is
 * covered by :focus-within in CSS.
 */
/**
 * @param {{ active?: 'ai' | 'classic' | 'mcp' }} props  which mode is current (styles its pill active)
 */
export default function ModeSwitcher({ active }) {
  const ref = useRef(/** @type {HTMLElement | null} */ (null))

  // Publish the pill's live width as --dock-menu-w on <html>: the frame-77
  // mobile registration launcher (PlayFab) sizes itself to exactly this width
  // ("по длине как меню", owner 2026-07-17). A CSS var + ResizeObserver keeps
  // the pair locked through font swaps and the <480px viewport cap without
  // hardcoding the menu's content-driven width anywhere.
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--dock-menu-w', `${el.offsetWidth}px`)
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
      document.documentElement.style.removeProperty('--dock-menu-w')
    }
  }, [])

  return (
    <nav className="mode-switch" aria-label="Site mode" ref={ref}>
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

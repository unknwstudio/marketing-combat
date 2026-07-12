'use client'

import { Component } from 'react'

/**
 * A class error boundary around the two client-only 3D islands (the arcade
 * cabinet, the hero CRT display). Both already degrade gracefully when WebGL
 * is simply absent (Cabinet3D's own `!supported` branch, HeroStage's flat
 * fallback) — but neither had a safety net for a THROWN error mid-render
 * (a failed/aborted GLB fetch, a texture decode error). Without this, one
 * broken asset request unmounted the whole /demo page. `fallback` should be
 * the same visual the component already shows for "3D not available" so a
 * crash and a graceful downgrade look identical to the visitor.
 */
export default class Error3DBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[Error3DBoundary] 3D island crashed, falling back:', error)
    }
    this.props.onError?.()
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}

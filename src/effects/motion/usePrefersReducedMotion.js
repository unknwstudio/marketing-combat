'use client'

// Shared prefers-reduced-motion check — was previously inlined (inconsistently,
// some with ?. some without) across ~17 components. One source of truth here.
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

'use client'

import dynamic from 'next/dynamic'

// three/R3F are client-only + heavy → load on the client, out of the static build
const Cabinet3D = dynamic(() => import('./Cabinet3D'), { ssr: false })

/**
 * Thin pass-through that keeps three/R3F out of the server bundle — forwards
 * props straight to the lazy-loaded scene. FinalCta mounts this statically
 * (no scroll-act wiring); props like `onSupported` and `screenVariant` ride
 * straight through untouched.
 */
export default function Cabinet3DMount(props) {
  return <Cabinet3D {...props} />
}

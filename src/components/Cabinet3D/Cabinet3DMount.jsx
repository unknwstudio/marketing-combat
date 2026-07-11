'use client'

import dynamic from 'next/dynamic'

// three/R3F are client-only + heavy → load on the client, out of the static build
const Cabinet3D = dynamic(() => import('./Cabinet3D'), { ssr: false })

/**
 * Thin pass-through so ArcadeCabinet can hand the scroll-act wiring
 * (`armed` / `pinned` / `actProgressRef` / `onSupported`) straight to the lazy
 * scene — the mount exists only to keep three out of the server bundle.
 */
export default function Cabinet3DMount(props) {
  return <Cabinet3D {...props} />
}

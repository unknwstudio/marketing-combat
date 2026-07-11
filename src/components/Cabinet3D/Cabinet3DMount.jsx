'use client'

import dynamic from 'next/dynamic'

// three/R3F are client-only + heavy → load on the client, out of the static build
const Cabinet3D = dynamic(() => import('./Cabinet3D'), { ssr: false })

export default function Cabinet3DMount() {
  return <Cabinet3D />
}

'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import Hero from '@/sections/Hero/Hero'
import Error3DBoundary from '@/components/Error3DBoundary/Error3DBoundary'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'
import './HeroStage.css'

// three/R3F are client-only + heavy → load on the client, out of the static build
const HeroDisplay3D = dynamic(() => import('./HeroDisplay3D'), { ssr: false })

/**
 * HeroStage — /demo only. Renders the flat pixel Hero as the SSR/LCP baseline
 * and the mobile / no-WebGL / reduced-motion fallback, then progressively
 * enhances (desktop + WebGL) to the live 3D arcade DISPLAY that shows the same
 * hero copy on the cabinet's real CRT.
 */
export default function HeroStage() {
  const [use3D, setUse3D] = useState(false)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)').matches
    const reduced = prefersReducedMotion()
    let webgl = false
    try {
      const c = document.createElement('canvas')
      webgl = !!(
        window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl'))
      )
    } catch {
      webgl = false
    }
    setUse3D(desktop && webgl && !reduced)
  }, [])

  return (
    <div className="herostage">
      <div className="herostage__flat">
        <Hero />
      </div>
      {/* the flat Hero above already renders everything — this is a purely
          additive 3D overlay, so a crash here just falls back to nothing
          (not to a broken page) */}
      {use3D && (
        <Error3DBoundary fallback={null}>
          <HeroDisplay3D />
        </Error3DBoundary>
      )}
    </div>
  )
}

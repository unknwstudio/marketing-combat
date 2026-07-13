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
    // Re-evaluate on every viewport crossing of the 1024px line — NOT just on
    // mount. The 3D DISPLAY is a fixed 1440px-wide canvas; if it stays mounted
    // when the viewport drops below the breakpoint (phone rotation, resize),
    // it forces ~1440px of horizontal overflow and the whole page — hero
    // included — stops fitting. Listening to the media query unmounts it the
    // moment we go narrow (and remounts it going wide again).
    const mq = window.matchMedia('(min-width: 1024px)')
    const evaluate = () => setUse3D(mq.matches && webgl && !reduced)
    evaluate()
    mq.addEventListener('change', evaluate)
    return () => mq.removeEventListener('change', evaluate)
  }, [])

  return (
    <div className="herostage">
      <div className="herostage__flat">
        <Hero centerPlay />
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

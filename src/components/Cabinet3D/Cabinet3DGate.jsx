'use client'

import { useEffect, useRef, useState } from 'react'
import Cabinet3DMount from './Cabinet3DMount'
import Error3DBoundary from '@/components/Error3DBoundary/Error3DBoundary'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'

/**
 * Cabinet3DGate — defers the finale's WebGL cabinet so it never loads where it
 * isn't rendered. The scene sits ~15,000px below the fold, yet the bare mount
 * pulled three.js + the GLB + Draco onto EVERY page load, phones included — the
 * `if (!supported)` check inside only skipped the *render*, not the dynamic
 * import (which fires the module-scope `useGLTF.preload`). This gate holds the
 * import behind two conditions:
 *   1. capability — desktop + WebGL + not reduced-motion (same test HeroStage
 *      uses), re-evaluated on the 1024px line so a resize/rotate unmounts it.
 *   2. proximity — an IntersectionObserver that only trips as the finale nears
 *      the viewport (~600px early), so desktop pays for three/GLB on approach.
 * Until both hold it shows the static webp — identical to the old fallback.
 */
function CabinetFallback() {
  return (
    <img
      className="cab3d__fallback"
      src="/assets/demo/arcade-machine-cutout.webp"
      alt="Arcade cabinet showing YOU WIN"
      loading="lazy"
      decoding="async"
    />
  )
}

export default function Cabinet3DGate(props) {
  const holderRef = useRef(null)
  const [capable, setCapable] = useState(false)
  const [near, setNear] = useState(false)

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
    const mq = window.matchMedia('(min-width: 1024px)')
    const evaluate = () => setCapable(mq.matches && webgl && !reduced)
    evaluate()
    mq.addEventListener('change', evaluate)
    return () => mq.removeEventListener('change', evaluate)
  }, [])

  useEffect(() => {
    const el = holderRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNear(true) // no IO support → don't strand the scene
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '600px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="finalcta__cabinet" ref={holderRef}>
      {capable && near ? (
        <Error3DBoundary fallback={<CabinetFallback />}>
          <Cabinet3DMount {...props} />
        </Error3DBoundary>
      ) : (
        <CabinetFallback />
      )}
    </div>
  )
}

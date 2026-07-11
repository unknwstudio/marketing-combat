'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import './HeroDisplay3D.css'

/**
 * HERO-UNDER-GLASS — the REAL flat hero (background art + all copy) stays put in
 * HeroStage; this overlays ONLY the convex CRT glass lifted out of the same GLB
 * the PLAY cabinet uses (every other mesh hidden), framed full-bleed so it caps
 * the whole hero. The canvas is transparent, so the hero shows THROUGH the glass;
 * the glass just adds a glossy convex sheen. A CSS vignette + neon rim + the
 * hero's own scanlines sell the "under curved glass" read.
 * Desktop / WebGL only — see HeroStage for the flat fallback.
 */

const MODEL_URL = '/assets/demo/arcade-machine.glb'
const DRACO_PATH = '/draco/'

const GLASS_H = 2.0 // normalized world height of the convex glass
const CAM_FOV = 26
const CAM_MARGIN = 0.97 // <1 => slight overscan so the glass fills the section

/* frame the camera so the glass COVERS the whole hero (full-bleed, edges cropped) */
function CoverCamera({ glassW }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const A = size.width / size.height
    const G = glassW / GLASS_H
    const halfH = A > G ? glassW / (2 * A) : GLASS_H / 2
    camera.position.z = (halfH * CAM_MARGIN) / Math.tan((CAM_FOV * Math.PI) / 180 / 2)
    camera.updateProjectionMatrix()
  }, [camera, size, glassW])
  return null
}

function Display({ pointerRef }) {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH)
  const group = useRef()

  const { model, glassW } = useMemo(() => {
    const root = scene.clone(true)
    const glassMeshes = []

    root.traverse((o) => {
      if (!o.isMesh) return
      const names = (Array.isArray(o.material) ? o.material : [o.material]).map(
        (m) => m && m.name
      )
      if (names.includes('GLASS')) {
        // convex glass shell — transparent + glossy so the hero reads THROUGH it,
        // with only a soft tint + specular highlights catching the curve
        glassMeshes.push(o)
        o.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#0b1c13'),
          transparent: true,
          opacity: 0.22,
          roughness: 0.06,
          metalness: 0.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.06,
          envMapIntensity: 0.0,
          depthWrite: false,
          toneMapped: false,
        })
      } else {
        // keep ONLY the convex glass — hide the whole cabinet
        o.visible = false
      }
    })

    const measure = () => {
      root.updateWorldMatrix(true, true)
      if (!glassMeshes.length) return new THREE.Box3().setFromObject(root)
      const b = new THREE.Box3()
      glassMeshes.forEach((m) => b.expandByObject(m))
      return b
    }

    let gb = measure()
    let size = gb.getSize(new THREE.Vector3())
    root.scale.setScalar(GLASS_H / (size.y || 1))
    gb = measure()
    size = gb.getSize(new THREE.Vector3())
    const center = gb.getCenter(new THREE.Vector3())
    root.position.sub(center) // glass centre -> origin

    return { model: root, glassW: GLASS_H * (size.x / size.y || 1.33) }
  }, [scene])

  useFrame((_, dt) => {
    if (!group.current) return
    const p = pointerRef.current
    const ty = p.x * 0.05
    const tx = -p.y * 0.03
    const k = Math.min(1, dt * 3.5)
    group.current.rotation.y += (ty - group.current.rotation.y) * k
    group.current.rotation.x += (tx - group.current.rotation.x) * k
  })

  return (
    <group ref={group}>
      <CoverCamera glassW={glassW} />
      <primitive object={model} />
      {/* bright moving speculars so a glass highlight visibly sweeps the curve */}
      <pointLight position={[-glassW * 0.5, GLASS_H * 0.5, 1.4]} intensity={5.5} distance={9} />
      <pointLight position={[glassW * 0.55, -GLASS_H * 0.3, 1.4]} color="#bfe0ff" intensity={2.6} distance={9} />
    </group>
  )
}

useGLTF.preload(MODEL_URL, DRACO_PATH)

export default function HeroDisplay3D() {
  const pointerRef = useRef({ x: 0, y: 0 })
  const wrapRef = useRef(null)
  const dist =
    (GLASS_H / 2) * CAM_MARGIN / Math.tan((CAM_FOV * Math.PI) / 180 / 2)

  useEffect(() => {
    const onMove = (e) => {
      const el = wrapRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      pointerRef.current = {
        x: ((e.clientX - r.left) / r.width) * 2 - 1,
        y: ((e.clientY - r.top) / r.height) * 2 - 1,
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div className="herodisp" ref={wrapRef} aria-hidden="true">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, dist], fov: CAM_FOV }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <Suspense fallback={null}>
          <Display pointerRef={pointerRef} />
        </Suspense>
      </Canvas>

      {/* convex vignette + fine glass grain over the hero */}
      <div className="herodisp__crt" />
    </div>
  )
}

'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import './Cabinet3D.css'

const MODEL_URL = '/assets/demo/arcade-machine.glb'
const DRACO_PATH = '/draco/'

/* ---------- CRT attract screen (our game + PLAY) ---------- */

function makeAttractTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 384
  const x = c.getContext('2d')
  const g = x.createLinearGradient(0, 0, 0, 384)
  g.addColorStop(0, '#123322')
  g.addColorStop(0.5, '#0b2015')
  g.addColorStop(1, '#08160d')
  x.fillStyle = g
  x.fillRect(0, 0, 512, 384)
  const rg = x.createRadialGradient(256, 180, 0, 256, 180, 300)
  rg.addColorStop(0, 'rgba(255,170,50,0.28)')
  rg.addColorStop(1, 'rgba(255,170,50,0)')
  x.fillStyle = rg
  x.fillRect(0, 0, 512, 384)
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.font = '700 96px Arial, sans-serif'
  x.lineJoin = 'round'
  x.lineWidth = 9
  x.strokeStyle = '#ff5000'
  x.strokeText('▶ PLAY', 256, 168)
  x.fillStyle = '#ffd000'
  x.fillText('▶ PLAY', 256, 168)
  x.font = '28px "GT Pressura Mono", monospace'
  x.fillStyle = '#3ad76f'
  x.fillText('PRESS START', 256, 246)
  const t = new THREE.CanvasTexture(c)
  t.anisotropy = 8
  return t
}

const SCREEN_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const SCREEN_FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uTime;
varying vec2 vUv;
void main() {
  vec2 cc = vUv * 2.0 - 1.0;
  vec2 uv = (cc * (1.0 + dot(cc, cc) * 0.03)) * 0.5 + 0.5;
  float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  vec2 s = clamp(uv, 0.0, 1.0);
  float ca = 0.002 * (0.4 + length(uv - 0.5));
  vec3 col;
  col.r = texture2D(uTex, s + vec2(ca, 0.0)).r;
  col.g = texture2D(uTex, s).g;
  col.b = texture2D(uTex, s - vec2(ca, 0.0)).b;
  float sl = sin(uv.y * uRes.y * 3.14159);
  col *= 0.82 + 0.18 * (0.5 + 0.5 * sl);
  float mx = mod(gl_FragCoord.x, 3.0);
  vec3 mask = vec3(0.9);
  mask.r += step(mx, 1.0) * 0.22;
  mask.g += step(1.0, mx) * step(mx, 2.0) * 0.22;
  mask.b += step(2.0, mx) * 0.22;
  col *= mask;
  float vig = pow(16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y), 0.2);
  col *= vig;
  col *= 0.97 + 0.03 * sin(uTime * 7.0 + uv.y * 8.0);
  gl_FragColor = vec4(col * inside, 1.0);
}`

/* ---------- the cabinet (downloaded model, restyled to our palette) ---------- */

const BODY_COLOR = new THREE.Color('#17121f') // near-black cabinet
const NEON_COLOR = new THREE.Color('#ff2e4d') // our --k-red neon

function CabinetModel() {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH)
  const uniformsRef = useRef(null)

  const model = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((o) => {
      if (!o.isMesh) return
      const mats = Array.isArray(o.material) ? o.material : [o.material]
      const set = (i, nm) => {
        if (Array.isArray(o.material)) o.material[i] = nm
        else o.material = nm
      }
      mats.forEach((mat, i) => {
        if (!mat) return
        if (mat.name === 'STEEL3') {
          const c = mat.clone()
          c.color = BODY_COLOR.clone()
          c.metalness = 0.3
          c.roughness = 0.5
          set(i, c)
        } else if (mat.name === 'NEON') {
          const c = mat.clone()
          c.color = NEON_COLOR.clone()
          c.emissive = NEON_COLOR.clone()
          c.emissiveIntensity = 1.4
          set(i, c)
        } else if (mat.name === 'SCREEN') {
          const uniforms = {
            uTex: { value: makeAttractTexture() },
            uRes: { value: new THREE.Vector2(512, 384) },
            uTime: { value: 0 },
          }
          uniformsRef.current = uniforms
          set(
            i,
            new THREE.ShaderMaterial({
              vertexShader: SCREEN_VERT,
              fragmentShader: SCREEN_FRAG,
              uniforms,
              toneMapped: false,
            })
          )
        } else if (mat.name === 'GLASS') {
          const c = mat.clone()
          c.transparent = true
          c.opacity = 0.12
          c.roughness = 0.08
          c.metalness = 0.0
          set(i, c)
        } else if (mat.name === 'ARCADE') {
          // keep the model's own baked marquee art (ARCADE_baseColor.png:
          // gold "ai-kombat" on red) and light it like a real lit marquee
          const c = mat.clone()
          c.color = new THREE.Color('#ffffff')
          if (c.map) {
            c.emissive = new THREE.Color('#ffffff')
            c.emissiveMap = c.map
            c.emissiveIntensity = 0.9
          }
          c.needsUpdate = true
          set(i, c)
        }
      })
    })
    // normalize: fit into ~3.2 units and center on the origin
    let box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    root.scale.setScalar(3.2 / (Math.max(size.x, size.y, size.z) || 1))
    box = new THREE.Box3().setFromObject(root)
    root.position.sub(box.getCenter(new THREE.Vector3()))
    return root
  }, [scene])

  useFrame((_, dt) => {
    if (uniformsRef.current) uniformsRef.current.uTime.value += dt
  })

  return <primitive object={model} />
}

function Cabinet() {
  const group = useRef()
  const { pointer } = useThree()
  useFrame((_, dt) => {
    if (!group.current) return
    // near-front so the CRT screen reads clearly; gentle parallax only
    const ty = 0.12 + pointer.x * 0.1
    const tx = -pointer.y * 0.05
    const k = Math.min(1, dt * 4)
    group.current.rotation.y += (ty - group.current.rotation.y) * k
    group.current.rotation.x += (tx - group.current.rotation.x) * k
  })
  return (
    <group ref={group} rotation={[0, 0.12, 0]}>
      <CabinetModel />
    </group>
  )
}

function StudioEnv() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture
    scene.environment = env
    return () => {
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

useGLTF.preload(MODEL_URL, DRACO_PATH)

export default function Cabinet3D() {
  const supported = useMemo(() => {
    if (typeof window === 'undefined') return false
    try {
      const c = document.createElement('canvas')
      return !!(
        window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl'))
      )
    } catch {
      return false
    }
  }, [])

  if (!supported) {
    return (
      <img
        className="cab3d__fallback"
        src="/assets/demo/arcade-machine.png"
        alt="Arcade cabinet — play AI Marketing Kombat"
      />
    )
  }

  return (
    <div className="cab3d">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 0.15, 7.4], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[2.5, 4, 5]} intensity={1.5} />
        <pointLight position={[-4, 1, 3]} color="#ff2e4d" intensity={55} distance={22} />
        <pointLight position={[4, 1, 3]} color="#3fe0ff" intensity={40} distance={22} />
        <Suspense fallback={null}>
          <StudioEnv />
          <Cabinet />
        </Suspense>
      </Canvas>
    </div>
  )
}

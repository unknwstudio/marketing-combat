'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import './Cabinet3D.css'

/* ---------- screen: a curved CRT plane showing an attract texture ---------- */

function makeAttractTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 384
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, c.height)
  g.addColorStop(0, '#123322')
  g.addColorStop(0.5, '#0b2015')
  g.addColorStop(1, '#08160d')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, c.width, c.height)
  const rg = ctx.createRadialGradient(256, 180, 0, 256, 180, 300)
  rg.addColorStop(0, 'rgba(255,170,50,0.28)')
  rg.addColorStop(1, 'rgba(255,170,50,0)')
  ctx.fillStyle = rg
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '700 92px Platform, Arial, sans-serif'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 8
  ctx.strokeStyle = '#ff5000'
  ctx.strokeText('▶ PLAY', 256, 176)
  ctx.fillStyle = '#ffd000'
  ctx.fillText('▶ PLAY', 256, 176)
  ctx.font = '28px "GT Pressura Mono", monospace'
  ctx.fillStyle = '#3ad76f'
  ctx.fillText('PRESS START', 256, 250)
  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 4
  return tex
}

const SCREEN_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  vec2 c = uv * 2.0 - 1.0;
  p.z += (1.0 - dot(c, c) * 0.12) * 0.16; // bulge the glass outward
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`

const SCREEN_FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uTime;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  vec2 cc = uv * 2.0 - 1.0;
  uv = (cc * (1.0 + dot(cc, cc) * 0.03)) * 0.5 + 0.5;
  float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  vec2 s2 = clamp(uv, 0.0, 1.0);
  float ca = 0.002 * (0.4 + length(uv - 0.5));
  vec3 col;
  col.r = texture2D(uTex, s2 + vec2(ca, 0.0)).r;
  col.g = texture2D(uTex, s2).g;
  col.b = texture2D(uTex, s2 - vec2(ca, 0.0)).b;
  float sl = sin(uv.y * uRes.y * 3.14159);
  col *= 0.8 + 0.2 * (0.5 + 0.5 * sl);
  float mx = mod(gl_FragCoord.x, 3.0);
  vec3 mask = vec3(0.88);
  mask.r += step(mx, 1.0) * 0.24;
  mask.g += step(1.0, mx) * step(mx, 2.0) * 0.24;
  mask.b += step(2.0, mx) * 0.24;
  col *= mask;
  float vig = pow(16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y), 0.2);
  col *= vig;
  col *= 0.97 + 0.03 * sin(uTime * 7.0 + uv.y * 8.0);
  gl_FragColor = vec4(col * inside, 1.0);
}`

function Screen() {
  const matRef = useRef()
  const tex = useMemo(() => makeAttractTexture(), [])
  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uRes: { value: new THREE.Vector2(512, 384) },
      uTime: { value: 0 },
    }),
    [tex]
  )
  useFrame((_, dt) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += dt
  })
  return (
    <mesh position={[0, 0.55, 0.72]}>
      <planeGeometry args={[1.62, 1.24, 32, 24]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={SCREEN_VERT}
        fragmentShader={SCREEN_FRAG}
        uniforms={uniforms}
      />
    </mesh>
  )
}

/* ---------- the cabinet (stylized low-poly, built from primitives) ---------- */

function Cabinet() {
  const group = useRef()
  const { pointer } = useThree()
  useFrame((_, dt) => {
    if (!group.current) return
    // parallax toward the pointer + gentle idle sway
    const ty = pointer.x * 0.28
    const tx = -pointer.y * 0.14
    group.current.rotation.y += (ty - group.current.rotation.y) * Math.min(1, dt * 4)
    group.current.rotation.x += (tx - group.current.rotation.x) * Math.min(1, dt * 4)
  })

  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#16131f', metalness: 0.45, roughness: 0.5 }),
    []
  )
  const darkMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#0a0810', metalness: 0.5, roughness: 0.4 }),
    []
  )

  return (
    <group ref={group} position={[0, -0.1, 0]}>
      {/* main body */}
      <mesh position={[0, 0.1, 0]} material={bodyMat} castShadow>
        <boxGeometry args={[2.0, 3.4, 1.2]} />
      </mesh>
      {/* screen bezel (recessed dark frame) */}
      <mesh position={[0, 0.55, 0.61]} material={darkMat}>
        <boxGeometry args={[1.86, 1.5, 0.16]} />
      </mesh>
      <Screen />
      {/* marquee (glowing) */}
      <mesh position={[0, 1.55, 0.55]}>
        <boxGeometry args={[1.9, 0.42, 0.16]} />
        <meshStandardMaterial
          color="#ffd23f"
          emissive="#ff8a00"
          emissiveIntensity={0.7}
          roughness={0.4}
        />
      </mesh>
      {/* control panel (angled) */}
      <group position={[0, -0.72, 0.66]} rotation={[-0.5, 0, 0]}>
        <mesh material={darkMat}>
          <boxGeometry args={[1.9, 0.62, 0.12]} />
        </mesh>
        {/* joystick */}
        <mesh position={[-0.55, 0.05, 0.14]}>
          <cylinderGeometry args={[0.03, 0.03, 0.22, 12]} />
          <meshStandardMaterial color="#222" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[-0.55, 0.17, 0.14]}>
          <sphereGeometry args={[0.09, 20, 16]} />
          <meshStandardMaterial color="#ff2e4d" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* buttons */}
        {[
          ['#ffd000', 0.2],
          ['#ff2e4d', 0.42],
          ['#3fe0ff', 0.64],
        ].map(([c, x], i) => (
          <mesh key={i} position={[x, 0.06, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.06, 20]} />
            <meshStandardMaterial color={c} roughness={0.25} metalness={0.1} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export default function Cabinet3D() {
  const supported = useMemo(() => {
    if (typeof window === 'undefined') return false
    try {
      const c = document.createElement('canvas')
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
    } catch {
      return false
    }
  }, [])

  if (!supported) {
    return (
      <img
        className="cab3d__fallback"
        src={`/assets/demo/cabinet.png`}
        alt="Arcade cabinet — play AI Marketing Kombat"
      />
    )
  }

  return (
    <div className="cab3d">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.15, 7.4], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[1.5, 3, 4]} intensity={1.1} />
        <pointLight position={[-3, 0.5, 2]} color="#ff2e9a" intensity={40} distance={12} />
        <pointLight position={[3, 0.5, 2]} color="#3fe0ff" intensity={40} distance={12} />
        <Cabinet />
      </Canvas>
    </div>
  )
}

'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, ContactShadows } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { playSfx } from '@/effects/audio/arcadeAudio'
import './Cabinet3D.css'

const MODEL_URL = '/assets/demo/arcade-machine.glb'
const DRACO_PATH = '/draco/'

/* ---------- scroll-act tuning (see ArcadeCabinet.jsx for the choreography) ----------
   The act is driven by `actProgressRef` (0..1 over the act's sticky hold). When
   the act is not armed (mobile / reduced-motion / no hold) the ref stays at 0
   and every formula below collapses to today's behavior exactly. */
const ACT_SCALE = 1.55 // phase A: the cabinet grows past its framing…
const ACT_SINK = -0.42 // …and sinks so its legs crop out of frame
const BASE_FOV = 30
const PUNCH_FOV = 25 // phase B: slight fov squeeze for punch-in drama
const PUNCH_FILL = 0.82 // CRT slightly overfills the frame at full punch
const SHADOW_OPACITY = 0.55
const PRESS_DEPTH = 0.012 // world units a cabinet button travels when pressed
const PRESS_MS = 80

/** clamped smoothstep — scroll phases ease without a lib on the hot path */
const smooth01 = (t) => {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

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
uniform float uPower;
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
  // power-on: the screen brightens as the cabinet scrolls into view
  col *= uPower;
  gl_FragColor = vec4(col * inside, 1.0);
}`

/* ---------- the cabinet (downloaded model, restyled to our palette) ---------- */

const BODY_COLOR = new THREE.Color('#17121f') // near-black cabinet
const NEON_COLOR = new THREE.Color('#ff2e4d') // our --k-red neon

const _pressScale = new THREE.Vector3() // scratch for button world-scale reads

function CabinetModel({ progressRef, actProgressRef, screenRef }) {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH)
  const { gl } = useThree()
  const uniformsRef = useRef(null)

  const rig = useMemo(() => {
    const root = scene.clone(true)
    const created = [] // every material WE clone/create — disposed on unmount
    let screenMesh = null
    root.traverse((o) => {
      if (!o.isMesh) return
      let interactive = false
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
          created.push(c)
        } else if (mat.name === 'NEON') {
          const c = mat.clone()
          c.color = NEON_COLOR.clone()
          c.emissive = NEON_COLOR.clone()
          c.emissiveIntensity = 1.4
          set(i, c)
          created.push(c)
        } else if (mat.name === 'SCREEN') {
          const uniforms = {
            uTex: { value: makeAttractTexture() },
            uRes: { value: new THREE.Vector2(512, 384) },
            uTime: { value: 0 },
            uPower: { value: 0.3 },
          }
          uniformsRef.current = uniforms
          const sm = new THREE.ShaderMaterial({
            vertexShader: SCREEN_VERT,
            fragmentShader: SCREEN_FRAG,
            uniforms,
            toneMapped: false,
          })
          set(i, sm)
          created.push(sm)
          // the CRT is both the act's phase-B camera target and a click-to-play
          // surface (the biggest, most obvious "button" on the whole cabinet)
          screenMesh = o
          o.userData.kScreen = true
          interactive = true
        } else if (mat.name === 'GLASS') {
          const c = mat.clone()
          c.transparent = true
          c.opacity = 0.12
          c.roughness = 0.08
          c.metalness = 0.0
          set(i, c)
          created.push(c)
          // glass stays raycastable but is "see-through" for picking (below),
          // so pointing at the CRT behind it still reads as pointing at the CRT
          o.userData.kGlass = true
          interactive = true
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
          created.push(c)
        } else if (mat.name === 'Controls' || mat.name === 'START') {
          // the physical buttons/joysticks (+ START). Clone per-mesh so a hover
          // tint lights up ONE control, not every sibling sharing the glTF material
          const c = mat.clone()
          set(i, c)
          created.push(c)
          o.userData.kControl = true
          o.userData.kStart = mat.name === 'START'
          o.userData.kMat = c
          o.userData.kBaseEmissive = c.emissive ? c.emissive.clone() : null
          o.userData.kBaseEmissiveIntensity = c.emissiveIntensity ?? 1
          o.userData.kRestZ = o.position.z
          interactive = true
        }
      })
      // Pointer events raycast the model on every pointermove; the sculpted body
      // meshes are heavy and never interactive, so drop them from the raycast.
      // Welcome side effect: rays reach the CRT through the bezel, so the whole
      // screen area reads as one big PLAY button (like the old full-unit link).
      if (!interactive) o.raycast = () => null
    })
    // normalize: fit into ~3.2 units and center on the origin
    let box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    root.scale.setScalar(3.2 / (Math.max(size.x, size.y, size.z) || 1))
    box = new THREE.Box3().setFromObject(root)
    root.position.sub(box.getCenter(new THREE.Vector3()))
    return { root, created, screenMesh }
  }, [scene])

  // publish the CRT mesh for the camera rig (phase-B punch-in target)
  useEffect(() => {
    if (screenRef) screenRef.current = rig.screenMesh
    return () => {
      if (screenRef) screenRef.current = null
    }
  }, [rig, screenRef])

  // our clones are NOT in useGLTF's cache → free programs/textures on unmount
  // (the attract CanvasTexture rides inside the screen shader's uniforms)
  useEffect(() => {
    const { created } = rig
    return () => {
      created.forEach((m) => {
        if (m.uniforms?.uTex?.value) m.uniforms.uTex.value.dispose()
        m.dispose()
      })
    }
  }, [rig])

  /* ---------- button hotspots (all pointer devices, no act required) ---------- */

  const hoveredRef = useRef(null)
  const timersRef = useRef(new Set())
  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach(clearTimeout)
  }, [])

  // glass is see-through for picking: the first non-glass hit is what the
  // player is really pointing at (the CRT sits right behind the pane)
  const pickTarget = (intersections) => {
    for (const hit of intersections) {
      const o = hit.object
      if (o.userData.kGlass) continue
      if (o.userData.kControl || o.userData.kScreen) return o
      return null
    }
    return null
  }

  const setHover = (mesh) => {
    const prev = hoveredRef.current
    if (prev === mesh) return
    if (prev?.userData.kMat?.emissive && prev.userData.kBaseEmissive) {
      prev.userData.kMat.emissive.copy(prev.userData.kBaseEmissive)
      prev.userData.kMat.emissiveIntensity = prev.userData.kBaseEmissiveIntensity
    }
    hoveredRef.current = mesh
    if (mesh?.userData.kControl && mesh.userData.kMat?.emissive) {
      // raise the emissive toward the site red so the control reads "live"
      mesh.userData.kMat.emissive.copy(NEON_COLOR)
      mesh.userData.kMat.emissiveIntensity = 0.85
    }
    // pointer cursor on the canvas: /demo's PixelCursor hides the OS cursor,
    // but this still carries the affordance wherever the native cursor shows
    gl.domElement.style.cursor = mesh ? 'pointer' : ''
  }

  // arcade-button depress: quick nudge into the panel, spring back ~80ms later.
  // Depth is specified in WORLD units and divided by the mesh's world scale so
  // the travel is visible regardless of what unit scale the GLB was authored in.
  const depress = (mesh) => {
    if (mesh.userData.kPressed) return
    mesh.userData.kPressed = true
    const s = mesh.getWorldScale(_pressScale).z || 1
    mesh.position.z = mesh.userData.kRestZ - PRESS_DEPTH / s
    const id = setTimeout(() => {
      mesh.position.z = mesh.userData.kRestZ
      mesh.userData.kPressed = false
      timersRef.current.delete(id)
    }, PRESS_MS)
    timersRef.current.add(id)
  }

  useFrame((_, dt) => {
    const u = uniformsRef.current
    if (!u) return
    u.uTime.value += dt
    // brighten the CRT from dim standby to full-on as the cabinet centers; the
    // scroll act slams it to full EARLY in phase A so the tube is already hot
    // when the camera dives in (act = 0 when the act isn't armed → no change)
    const act = actProgressRef?.current ?? 0
    const drive = Math.max(progressRef?.current ?? 1, Math.min(1, act / 0.35))
    const target = 0.3 + 0.7 * drive
    u.uPower.value += (target - u.uPower.value) * Math.min(1, dt * 3)
  })

  return (
    <primitive
      object={rig.root}
      onPointerMove={(e) => setHover(pickTarget(e.intersections))}
      onPointerOut={() => setHover(null)}
      onPointerDown={(e) => {
        const t = pickTarget(e.intersections)
        if (!t?.userData.kControl) return
        depress(t)
        playSfx('block', 0.35) // short thock — respects the global mute state
      }}
      onClick={(e) => {
        const t = pickTarget(e.intersections)
        if (!t) return
        if (t.userData.kStart || t.userData.kScreen) {
          playSfx('confirm', 0.5)
          // plain MPA nav — the site's View Transition CSS runs the pixel dissolve
          window.location.href = '/play'
        }
      }}
    />
  )
}

function Cabinet({ progressRef, actProgressRef, screenRef }) {
  const actGroup = useRef()
  const group = useRef()
  const { pointer } = useThree()
  useFrame((_, dt) => {
    const k = Math.min(1, dt * 4)
    if (group.current) {
      // near-front so the CRT screen reads clearly; gentle parallax only
      const ty = 0.12 + pointer.x * 0.1
      const tx = -pointer.y * 0.05
      group.current.rotation.y += (ty - group.current.rotation.y) * k
      group.current.rotation.x += (tx - group.current.rotation.x) * k
    }
    const o = actGroup.current
    if (o) {
      // act phase A (0 → .5): grow past the framing + sink so the legs crop out
      // of frame (the section's bottom CSS mask makes the crop read intentional)
      const a = smooth01((actProgressRef?.current ?? 0) / 0.5)
      o.scale.setScalar(1 + (ACT_SCALE - 1) * a)
      o.position.y = ACT_SINK * a
    }
  })
  return (
    <group ref={actGroup}>
      <group ref={group} rotation={[0, 0.12, 0]}>
        <CabinetModel
          progressRef={progressRef}
          actProgressRef={actProgressRef}
          screenRef={screenRef}
        />
      </group>
    </group>
  )
}

/* dolly the camera in as the PLAY section scrolls to centre (window scroll,
   not drei ScrollControls — that would hijack the page's own scroll). When the
   scroll act is armed, phase B (act .5 → ~.92) blends this base pose into a
   punch-in on the CRT until the warped screen fills the frame. */
const CAM_FAR = 8.0
const CAM_NEAR = 6.6

const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()
const _punch = new THREE.Vector3()
const _sBox = new THREE.Box3()
const _sSize = new THREE.Vector3()
const _sCenter = new THREE.Vector3()

function CameraRig({ progressRef, actProgressRef, screenRef }) {
  const { camera, gl } = useThree()
  const secRef = useRef(null)
  useFrame((_, dt) => {
    // measure the STAGE, not the section: armed, the section grows a scroll
    // runway below the stage, which would drag the "how centered are we"
    // midpoint far off the visible frame (un-armed the two boxes share a
    // center, so this is behavior-neutral everywhere else)
    if (!secRef.current)
      secRef.current =
        gl.domElement.closest('.cabinet__stage') || gl.domElement.closest('.cabinet')
    const sec = secRef.current
    if (sec && typeof window !== 'undefined') {
      const r = sec.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const center = r.top + r.height / 2
      // 0 when the section centre sits at the viewport bottom, 1 at the middle
      const p = Math.max(0, Math.min(1, (vh - center) / (vh / 2)))
      progressRef.current = p
    }
    const k = Math.min(1, dt * 3)

    // base pose — today's straight-on dolly (all that mobile/reduced-motion get)
    _pos.set(0, 0.15, CAM_FAR - (CAM_FAR - CAM_NEAR) * progressRef.current)
    _look.set(_pos.x, _pos.y, _pos.z - 4) // straight ahead = default orientation
    let fovT = BASE_FOV

    const act = actProgressRef?.current ?? 0
    const screen = screenRef?.current
    if (act > 0.5 && screen) {
      // act phase B: dolly INTO the CRT. The target is measured live from the
      // mesh (not precomputed) because phase-A growth + pointer parallax keep
      // moving the screen in world space — one cached-bbox read per frame.
      const b = smooth01((act - 0.5) / 0.42) // full punch by act ≈ .92
      _sBox.setFromObject(screen)
      _sBox.getCenter(_sCenter)
      _sBox.getSize(_sSize)
      fovT = BASE_FOV - (BASE_FOV - PUNCH_FOV) * b
      // self-calibrating stand-off: whatever the GLB's real screen size, park
      // the camera where the CRT slightly overfills the frame at full punch
      const halfH = Math.max(_sSize.y, _sSize.x / camera.aspect) * 0.5
      const dist = (halfH * PUNCH_FILL) / Math.tan((fovT * Math.PI) / 360)
      _punch.copy(_sCenter)
      _punch.z += dist
      _pos.lerp(_punch, b)
      _look.lerp(_sCenter, b)
    }

    camera.position.lerp(_pos, k)
    camera.lookAt(_look)
    if (Math.abs(camera.fov - fovT) > 0.001) {
      camera.fov += (fovT - camera.fov) * k
      camera.updateProjectionMatrix()
    }
  })
  return null
}

/* ContactShadows whose plane fades out during act phase A — a shadow pinned at
   floor level would give the "growing" cabinet away as a camera trick. */
function FadingContactShadows({ actProgressRef }) {
  const ref = useRef()
  const matRef = useRef(null)
  useFrame(() => {
    const g = ref.current
    if (!g) return
    if (!matRef.current) {
      // drei renders the blurred shadow as the group's single mesh child;
      // resolved lazily + defensively in case the internals ever shift
      g.traverse((o) => {
        if (!matRef.current && o.isMesh && o.material) matRef.current = o.material
      })
    }
    const a = smooth01((actProgressRef?.current ?? 0) / 0.5)
    if (matRef.current) matRef.current.opacity = SHADOW_OPACITY * (1 - a)
  })
  return (
    <ContactShadows
      ref={ref}
      position={[0, -1.62, 0]}
      opacity={SHADOW_OPACITY}
      scale={5.5}
      blur={2.6}
      far={3.2}
      resolution={512}
      color="#000000"
    />
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

/**
 * Cabinet3D — the R3F scene. Props (all optional, default to today's behavior):
 * - `actProgressRef`: 0..1 progress of the scroll act's sticky hold (owned by
 *   ArcadeCabinet); stays 0 when the act isn't armed.
 * - `armed`: the scroll act is wired up (desktop pointer + motion + WebGL).
 *   Arming alone must NOT hold the frameloop open — it flips true at page load
 *   and stays true, so gating on it alone kept the scene rendering at 60fps
 *   for the whole session, viewports away from the cabinet (GPU/battery drain
 *   the IntersectionObserver below exists to prevent).
 * - `pinned`: true only while the act's ScrollTrigger is actually mid-hold
 *   (its isActive, via onToggle). For exactly that span the loop stays
 *   'always' — the IO can lag a frame behind a fast scrub and a paused loop
 *   would freeze the choreography. Outside the hold the IO gate rules again.
 * - `onSupported(bool)`: reports whether the WebGL path rendered, so the act
 *   only ever arms on top of a live canvas (never the static fallback image).
 */
export default function Cabinet3D({
  armed = false,
  pinned = false,
  actProgressRef = null,
  onSupported,
}) {
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

  const wrapRef = useRef(null)
  const progressRef = useRef(0)
  const screenRef = useRef(null)
  const [active, setActive] = useState(true)

  useEffect(() => {
    onSupported?.(supported)
  }, [supported, onSupported])

  // pause the WebGL loop while the cabinet is off-screen (saves GPU); a 200px
  // margin wakes it just before it scrolls in so the dolly is ready
  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      rootMargin: '200px 0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [supported])

  if (!supported) {
    return (
      <img
        className="cab3d__fallback"
        src="/assets/demo/arcade-machine.webp"
        alt="Arcade cabinet — play AI Marketing Kombat"
        loading="lazy"
        decoding="async"
      />
    )
  }

  return (
    <div className="cab3d" ref={wrapRef}>
      <Canvas
        frameloop={(armed && pinned) || active ? 'always' : 'never'}
        dpr={[1, 1.8]}
        camera={{ position: [0, 0.15, CAM_FAR], fov: BASE_FOV }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[2.5, 4, 5]} intensity={1.5} />
        <pointLight position={[-4, 1, 3]} color="#ff2e4d" intensity={55} distance={22} />
        <pointLight position={[4, 1, 3]} color="#3fe0ff" intensity={40} distance={22} />
        <CameraRig
          progressRef={progressRef}
          actProgressRef={actProgressRef}
          screenRef={screenRef}
        />
        <Suspense fallback={null}>
          <StudioEnv />
          <Cabinet
            progressRef={progressRef}
            actProgressRef={actProgressRef}
            screenRef={screenRef}
          />
          <FadingContactShadows actProgressRef={actProgressRef} />
        </Suspense>
      </Canvas>
    </div>
  )
}

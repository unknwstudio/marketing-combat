'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, ContactShadows } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { playSfx } from '@/effects/audio/arcadeAudio'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'
import { GAME_COPY, openGameTakeover } from '@/lib/game'
import { K_WHITE, K_BLACK, K_RED, K_CYAN, K_ORANGE, K_TITLE_YELLOW, K_ACCENT_GREEN } from '@/game/palette'
import './Cabinet3D.css'

const MODEL_URL = '/assets/demo/arcade-machine.glb'
const DRACO_PATH = '/draco/'

/* ---------- cabinet tuning ---------- */
const BASE_FOV = 30
const SHADOW_OPACITY = 0.55
const PRESS_DEPTH = 0.012 // world units a cabinet button travels when pressed
const PRESS_MS = 80

/* ---------- CRT attract screen (our game + PLAY) ---------- */

// Chunky 8-bit trophy for the "YOU WIN!" screen, drawn as fillRect pixels so it
// reads like real CRT sprite art (not a smooth vector). One char per pixel:
// H = highlight (left-lit face), G = gold body, S = orange shade (right face).
// The palette matches the title's gold fill + orange stroke, so the cup reads
// as the same trophy the "YOU WIN!" wordmark is celebrating.
const TROPHY_ART = [
  '.HGGGGGGGGS.',
  'HHGGGGGGGGSS',
  'H.HGGGGGGS.S',
  'H..GGGGGG..S',
  'H..HGGGGS..S',
  '.H..GGGG..S.',
  '...HGGGS....',
  '....GGG.....',
  '....HGS.....',
  '.....G......',
  '....HGS.....',
  '...HGGGS....',
  '..HGGGGGS...',
  '.HGGGGGGGS..',
]
const TROPHY_PAL = { H: '#ffe98a', G: K_TITLE_YELLOW, S: K_ORANGE }

// Draw the trophy centred on `cx`, top edge at `top`, `p` px per pixel-cell.
function drawTrophy(ctx, cx, top, p) {
  const originX = Math.round(cx - (TROPHY_ART[0].length * p) / 2)
  TROPHY_ART.forEach((row, r) => {
    for (let cIdx = 0; cIdx < row.length; cIdx++) {
      const col = TROPHY_PAL[row[cIdx]]
      if (!col) continue
      ctx.fillStyle = col
      ctx.fillRect(originX + cIdx * p, top + r * p, p, p)
    }
  })
}

function makeAttractTexture(variant = 'play') {
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
  if (variant === 'youwin') {
    // title pulled up to make room for the trophy centred below it
    x.font = '700 62px Arial, sans-serif'
    x.lineJoin = 'round'
    x.lineWidth = 8
    x.strokeStyle = K_ORANGE // matches --k-orange
    x.strokeText(GAME_COPY.youWin, 256, 74)
    x.fillStyle = K_TITLE_YELLOW // matches --k-title-yellow
    x.fillText(GAME_COPY.youWin, 256, 74)
    drawTrophy(x, 256, 122, 10) // 12×14 cells → 120×140px, centred (~y192)
    x.font = '24px "GT Pressura Mono", monospace'
    x.fillStyle = K_ACCENT_GREEN // matches --k-accent-green
    x.fillText('CHAMPION', 256, 306)
  } else {
    x.font = '700 96px Arial, sans-serif'
    x.lineJoin = 'round'
    x.lineWidth = 9
    x.strokeStyle = K_ORANGE
    x.strokeText(`${GAME_COPY.playGlyph} ${GAME_COPY.playLabel}`, 256, 168)
    x.fillStyle = K_TITLE_YELLOW
    x.fillText(`${GAME_COPY.playGlyph} ${GAME_COPY.playLabel}`, 256, 168)
    x.font = '24px "GT Pressura Mono", monospace'
    x.fillStyle = K_ACCENT_GREEN
    x.fillText(GAME_COPY.pressStart, 256, 246)
  }
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
const NEON_COLOR = new THREE.Color(K_RED) // our --k-red neon

const _pressScale = new THREE.Vector3() // scratch for button world-scale reads

function CabinetModel({ progressRef, screenVariant, onPlay, screenPower }) {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH)
  const { gl } = useThree()
  const uniformsRef = useRef(null)

  const rig = useMemo(() => {
    const root = scene.clone(true)
    const created = [] // every material WE clone/create — disposed on unmount
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
            uTex: { value: makeAttractTexture(screenVariant) },
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
          // the CRT is the click-to-play surface (the biggest, most obvious
          // "button" on the whole cabinet)
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
          c.color = new THREE.Color(K_WHITE)
          if (c.map) {
            c.emissive = new THREE.Color(K_WHITE)
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
    return { root, created }
  }, [scene, screenVariant])

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
    // brighten the CRT from dim standby to full-on as the cabinet centers
    // fixed level when a mount pins it (the static finale); otherwise ramp from
    // dim standby to full-on with scroll progress
    const target = screenPower != null ? screenPower : 0.3 + 0.7 * (progressRef?.current ?? 1)
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
          onPlay() // default openGameTakeover; the finale plays in place
        }
      }}
    />
  )
}

function Cabinet({
  progressRef,
  screenVariant,
  onPlay,
  screenPower,
  restYaw,
  parallaxYaw,
  parallaxPitch,
  reduceMotion,
}) {
  const group = useRef()
  const { pointer } = useThree()
  useFrame((_, dt) => {
    const k = Math.min(1, dt * 4)
    if (group.current) {
      // resting pose + a little mouse parallax only (skipped entirely under
      // prefers-reduced-motion: reduce → static straight-on framing)
      const ty = restYaw + (reduceMotion ? 0 : pointer.x * parallaxYaw)
      const tx = reduceMotion ? 0 : -pointer.y * parallaxPitch
      group.current.rotation.y += (ty - group.current.rotation.y) * k
      group.current.rotation.x += (tx - group.current.rotation.x) * k
    }
  })
  return (
    <group ref={group} rotation={[0, restYaw, 0]}>
      <CabinetModel
        progressRef={progressRef}
        screenVariant={screenVariant}
        onPlay={onPlay}
        screenPower={screenPower}
      />
    </group>
  )
}

/* dolly the camera in as the PLAY section scrolls to centre (window scroll,
   not drei ScrollControls — that would hijack the page's own scroll). */
const CAM_FAR = 8.0
const CAM_NEAR = 6.6

const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()

function CameraRig({ progressRef, camFar, camNear, camY, fov }) {
  const { camera, gl } = useThree()
  const secRef = useRef(null)
  useFrame((_, dt) => {
    // Legacy scroll-position probe from the retired mid-page cabinet, which
    // lived in a `.cabinet__stage`/`.cabinet` wrapper and dollied as it scrolled
    // into view. The finale mount has neither wrapper, so secRef never resolves,
    // progress holds at 0, and the camera simply rests at the base pose
    // (camFar) — exactly the straight-on framing the finale wants.
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

    // straight-on dolly (all this static mount ever shows)
    _pos.set(0, camY, camFar - (camFar - camNear) * progressRef.current)
    _look.set(_pos.x, _pos.y, _pos.z - 4) // straight ahead = default orientation

    camera.position.lerp(_pos, k)
    camera.lookAt(_look)
    if (Math.abs(camera.fov - fov) > 0.001) {
      camera.fov += (fov - camera.fov) * k
      camera.updateProjectionMatrix()
    }
  })
  return null
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
 * Cabinet3D — the R3F scene behind the finale's "YOU WIN!" cabinet. Mounted
 * statically (no scroll-driven act); the WebGL frameloop just pauses/resumes
 * via the IntersectionObserver below, plus mouse-parallax and a click-to-play
 * screen. Props (all optional, default to today's behavior):
 * - `onSupported(bool)`: reports whether the WebGL path rendered, so callers
 *   can fall back to the static image when it doesn't.
 * - `screenVariant`: which CRT attract art to paint — `'play'` (▶ PLAY /
 *   PRESS START) or `'youwin'` (the finale's YOU WIN! screen).
 * - `onPlay()`: called when the START button or CRT screen is clicked —
 *   defaults to opening the in-page game takeover.
 * - `screenPower`: fixes the CRT brightness (0..1) for a static mount. Default
 *   `null` keeps the scroll-driven ramp (0.3 standby → 1.0 full). The finale is
 *   static, so its progress never advances — it pins this instead.
 * - `restYaw`: resting Y rotation of the cabinet group, in radians. Defaults
 *   to `0.12` (today's slight angle, showing a side panel). Pass `0` for a
 *   straight-on, screen-facing rest pose (the finale does).
 * - `parallaxYaw` / `parallaxPitch`: how far the cabinet yaws/pitches toward
 *   the pointer, in radians of amplitude. Default to today's `0.1` / `0.05`.
 *   Both are skipped under `prefers-reduced-motion: reduce`, which pins the
 *   cabinet to `restYaw` with zero pointer reaction.
 * - `camFar` / `camNear` / `camY` / `fov`: the camera pose — the dolly range,
 *   height, and vertical field of view. Default to today's framing (`8.0` /
 *   `6.6` / `0.15` / `30`), which frames the whole cabinet.
 */
export default function Cabinet3D({
  onSupported,
  screenVariant = 'play',
  onPlay = openGameTakeover,
  screenPower = null,
  restYaw = 0.12,
  parallaxYaw = 0.1,
  parallaxPitch = 0.05,
  camFar = CAM_FAR,
  camNear = CAM_NEAR,
  camY = 0.15,
  fov = BASE_FOV,
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

  // read once — a live media-query listener isn't worth it for a settings
  // check made at mount; matches the `supported` WebGL probe just above
  const reduceMotion = useMemo(() => prefersReducedMotion(), [])

  const wrapRef = useRef(null)
  const progressRef = useRef(0)
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
        alt="Arcade cabinet showing YOU WIN"
        loading="lazy"
        decoding="async"
      />
    )
  }

  return (
    <div className="cab3d" ref={wrapRef}>
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={[1, 1.8]}
        camera={{ position: [0, camY, camFar], fov }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.55} />
        {/* Key light lifted overhead and pulled off the front (z 5→1.5): the
            camera faces the CRT glass head-on, so a front-heavy light reflected
            straight back into the lens and washed out the screen. From above,
            that specular hotspot drops below the screen instead. */}
        <directionalLight position={[2.5, 6, 1.5]} intensity={1.3} />
        {/* Neon rims moved to the sides and slightly BEHIND (z 3→-0.5) so they
            graze the side panels as accents without glaring on the front glass. */}
        <pointLight position={[-5.5, 2, -0.5]} color={K_RED} intensity={48} distance={22} />
        <pointLight position={[5.5, 2, -0.5]} color={K_CYAN} intensity={36} distance={22} />
        <CameraRig
          progressRef={progressRef}
          camFar={camFar}
          camNear={camNear}
          camY={camY}
          fov={fov}
        />
        <Suspense fallback={null}>
          <StudioEnv />
          <Cabinet
            progressRef={progressRef}
            screenVariant={screenVariant}
            onPlay={onPlay}
            screenPower={screenPower}
            restYaw={restYaw}
            parallaxYaw={parallaxYaw}
            parallaxPitch={parallaxPitch}
            reduceMotion={reduceMotion}
          />
          <ContactShadows
            position={[0, -1.62, 0]}
            opacity={SHADOW_OPACITY}
            scale={5.5}
            blur={2.6}
            far={3.2}
            resolution={512}
            color={K_BLACK}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

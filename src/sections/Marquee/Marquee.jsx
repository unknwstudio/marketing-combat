'use client'

import { useEffect, useRef } from 'react'
import PixelIcon from '@/components/PixelIcon/PixelIcon'
import { prefersReducedMotion } from '@/effects/motion/usePrefersReducedMotion'
import './Marquee.css'

/**
 * FIGHT! marquee strip — the scrolling arcade ticker the original site runs
 * between the roster and the stats. Two copies of the track loop seamlessly.
 * A constant crawl (CSS keyframe) is the baseline; on the client it hands off
 * to a scroll-velocity-driven crawl (classic Awwwards ticker trick) so the
 * strip surges when the user scrolls fast and eases back to the base speed
 * at rest. Reduced-motion keeps the plain CSS version (no JS driver).
 */
const ITEMS = [
  'FIGHT!',
  'AI MARKETING KOMBAT',
  'ROUND 1 — QUALIFICATION OPEN',
  'JULY 2026',
  'FINAL IN BARCELONA',
  'FATALITY ON YOUR CAC',
  'FLAWLESS VICTORY',
  'FINISH HIM',
]

function Track() {
  return (
    <div className="marquee__track" aria-hidden="true">
      {ITEMS.map((t, i) => (
        <span key={i} className="marquee__item">
          {/* SVG pixel star — the ★ glyph rendered as a gold emoji on some
              platforms and broke the pixel look (see PixelIcon) */}
          <span className="marquee__star">
            <PixelIcon name="star" size="0.95em" />
          </span>{' '}
          {t}
        </span>
      ))}
    </div>
  )
}

const BASE_SPEED = 40 // px/s constant crawl at rest
const SCROLL_TO_VELOCITY = 0.7 // how hard a scroll delta kicks the crawl
const FRICTION_PER_SEC = 0.05 // velocity boost decay (lower = snappier settle)

export default function Marquee() {
  const viewportRef = useRef(null)

  useEffect(() => {
    const reduce = prefersReducedMotion()
    const track = viewportRef.current
    if (reduce || !track) return

    track.classList.add('marquee__viewport--driven')

    let dist = 0
    let velocity = 0
    let lastScrollY = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      velocity += (y - lastScrollY) * SCROLL_TO_VELOCITY
      lastScrollY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    let raf = 0
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      velocity *= Math.pow(FRICTION_PER_SEC, dt)
      dist += (BASE_SPEED + velocity) * dt
      const halfWidth = track.scrollWidth / 2
      if (halfWidth > 0) dist = ((dist % halfWidth) + halfWidth) % halfWidth
      track.style.transform = `translateX(${-dist}px)`
      raf = requestAnimationFrame(tick)
    }

    // the strip used to crawl at 60fps for the whole session even deep
    // into the page — pause the rAF loop off-screen (perf) and on hover
    // (WCAG 2.2.2 — a mechanism to pause auto-moving content), resyncing
    // `last` on resume so the paused time doesn't count as a jump in `dist`
    let intersecting = true
    let hovering = false
    const resume = () => {
      if (raf || !intersecting || hovering) return
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
    const pause = () => {
      if (!raf) return
      cancelAnimationFrame(raf)
      raf = 0
    }

    let io
    const section = track.closest('.marquee')
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        ([entry]) => {
          intersecting = entry.isIntersecting
          if (intersecting) resume()
          else pause()
        },
        { rootMargin: '200px 0px' }
      )
      io.observe(track)
    } else {
      raf = requestAnimationFrame(tick)
    }
    const onEnter = () => {
      hovering = true
      pause()
    }
    const onLeave = () => {
      hovering = false
      resume()
    }
    section?.addEventListener('mouseenter', onEnter)
    section?.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('scroll', onScroll)
      section?.removeEventListener('mouseenter', onEnter)
      section?.removeEventListener('mouseleave', onLeave)
      if (io) io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section
      className="marquee"
      aria-label="AI Marketing Kombat ticker"
      data-announce="FIGHT!"
      data-sound="fight"
    >
      <div className="marquee__viewport" ref={viewportRef}>
        <Track />
        <Track />
      </div>
    </section>
  )
}

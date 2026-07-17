import { typeset } from '@/lib/typeset'
import SoundToggle from '@/components/SoundToggle/SoundToggle'
import MotionToggle from '@/components/MotionToggle/MotionToggle'
import HeroBattery from '@/components/HeroBattery/HeroBattery'
import './Hero.css'

/**
 * HERO section — pixel-faithful port of Figma "Frame 29" (node 33:4045).
 * Fixed 1440x804 stage. Graphics are exported PNGs (public/assets/hero),
 * all text/layout is live code using the global pixel font + tokens.
 */
export default function Hero() {
  return (
    <section className="hero" aria-label="AI Marketing Kombat">
      {/* the real, styled title is the logo image below — this is the page's
          only h1 (there was none before), kept off-screen so the pixel
          wordmark stays the visual title */}
      <h1 className="sr-only">AI Marketing Kombat — hackathon for senior AI marketers</h1>
      <img
        className="hero__bg"
        src={`/assets/hero/hero-bg.webp`}
        alt="Two pixel-art ninja fighters facing off on a cliff before a giant sun"
        width={1440}
        height={804}
        fetchPriority="high"
      />

      {/* decorative flanking grid lines */}
      <div className="hero__grid hero__grid--left" aria-hidden="true" />
      <div className="hero__grid hero__grid--right" aria-hidden="true" />

      {/* glowing wordmark + underline. alt="" — the sr-only h1 above already
          announces the brand; a second identical announcement is noise (1.1.1) */}
      <img className="hero__logo" src={`/assets/hero/logo.webp`} alt="" />

      {/* top-left: intro lede. The registration badge that used to sit above it
          was removed — registration lives in the floating launcher and the CTAs
          further down the page — so the lede now sits at the top of the block. */}
      <div className="hero__intro">
        <p className="hero__lede">
          {typeset('The first international hackathon for senior marketers of the AI era.')}
          <br aria-hidden="true" />
          {typeset('Two days. Real cases. Use AI or get finished.')}
        </p>
      </div>

      {/* top-right: energy meter. On touch/narrow the battery itself is the
          game entry (HeroBattery renders it as a /play link with a discharge
          hover); SOUND + MOTION sit under it as icon-only pills. Desktop keeps
          the meter decorative and hides the pill column. */}
      <div className="hero__meter-wrap">
        <HeroBattery />
        <div className="hero__toggles">
          <SoundToggle inline />
          <MotionToggle inline />
        </div>
      </div>

      {/* bottom: tag pills */}
      <div className="hero__tags">
        <span className="hero__pill">ROUND 01</span>
        <span className="hero__pill">JULY 2026</span>
        <span className="hero__pill">300+ FIGHTERS</span>
        <span className="hero__pill">FINAL · BARCELONA</span>
      </div>

      {/* A small PLAY launcher at the bottom of the hero. VsSplash's
          delegated a[href="/play"] listener catches the click for the
          first-visit VS flash; data-burst + data-sfx match the site's
          other play affordances. (Was gated by a `centerPlay` prop whose
          only caller always passed true — prop removed, 2026-07-16 audit.) */}
      <a
        className="hero__playsmall"
        href="/play"
        data-sfx="confirm"
        data-burst
        aria-label="Play AI Marketing Kombat"
      >
        <svg className="hero__playsmall-tri" viewBox="0 0 6 10" aria-hidden="true">
          <path d="M0 0h1v10H0zM1 1h1v8H1zM2 2h1v6H2zM3 3h1v4H3zM4 4h1v2H4z" />
        </svg>
        play
      </a>
    </section>
  )
}

import './Hero.css'
import CRTOverlay from '@/effects/crt/CRTOverlay'
import { GAME_COPY } from '@/lib/game'

/**
 * HERO section — pixel-faithful port of Figma "Frame 29" (node 33:4045).
 * Fixed 1440x804 stage. Graphics are exported PNGs (public/assets/hero),
 * all text/layout is live code using the global pixel font + tokens.
 */
export default function Hero({ withPlay = false, centerPlay = false }) {
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

      {/* glowing wordmark + underline */}
      <img className="hero__logo" src={`/assets/hero/logo.webp`} alt="AI Marketing Kombat" />

      {/* top-left: registration badge + lede. The badge is a REAL link to the
          FinalCta section (#register on /demo): on /demo it's a same-page
          fragment scroll (smooth via the motion-gated rule in FinalCta.css);
          from / it's a cross-page nav that rides the site's @view-transition.
          data-sfx follows the MagneticCTA contract (see MagneticCTA.jsx) so a
          click SFX attaches if the badge is ever tagged data-magnetic. */}
      <div className="hero__intro">
        <a href="/demo#register" className="hero__badge" data-sfx="confirm" data-burst>
          {'>>> registration <<<'}
        </a>
        <p className="hero__lede">
          The first international hackathon for senior marketers of the AI era.
          <br aria-hidden="true" />
          Two days. Real cases. Use AI or get finished.
        </p>
      </div>

      {/* top-right: energy meter */}
      <div className="hero__meter-wrap">
        <div className="hero__meter">
          <div className="hero__bars" aria-hidden="true">
            <span className="hero__bar" />
            <span className="hero__bar" />
            <span className="hero__bar" />
            <span className="hero__bar" />
          </div>
          <span className="hero__meter-pct">15%</span>
        </div>
        <p className="hero__survive">will you survive?</p>
      </div>

      {/* bottom: tag pills */}
      <div className="hero__tags">
        <span className="hero__pill">ROUND 01</span>
        <span className="hero__pill">JULY 2026</span>
        <span className="hero__pill">300+ FIGHTERS</span>
        <span className="hero__pill">FINAL · BARCELONA</span>
      </div>

      {/* big central PLAY launcher (home hero) — a chunky arcade button over the
          scene that drops the visitor straight into /play. VsSplash's delegated
          a[href="/play"] listener catches the click for the first-visit VS
          flash; data-burst + data-sfx match the site's other play affordances. */}
      {centerPlay && (
        <a
          className="hero__playbig"
          href="/play"
          data-sfx="confirm"
          data-burst
          aria-label="Play AI Marketing Kombat"
        >
          <svg className="hero__playbig-tri" viewBox="0 0 6 10" aria-hidden="true">
            <path d="M0 0h1v10H0zM1 1h1v8H1zM2 2h1v6H2zM3 3h1v4H3zM4 4h1v2H4z" />
          </svg>
          PLAY
        </a>
      )}

      {withPlay && (
        <a
          className="hero__play"
          href="/play"
          data-sfx="confirm"
          data-burst
          aria-label="Play AI Marketing Kombat"
        >
          <span aria-hidden="true">{GAME_COPY.playGlyph} </span>
          {GAME_COPY.playLabel}
        </a>
      )}

      {/* CRT screen effect scoped to this section only (not global) */}
      <CRTOverlay scoped intensity={0.34} flicker powerOn={false} />
    </section>
  )
}

import './Hero.css'

/**
 * HERO section — pixel-faithful port of Figma "Frame 29" (node 33:4045).
 * Fixed 1440x804 stage. Graphics are exported PNGs (public/assets/hero),
 * all text/layout is live code using the global pixel font + tokens.
 */
export default function Hero() {
  return (
    <section className="hero" aria-label="AI Marketing Kombat">
      <img
        className="hero__bg"
        src={`${import.meta.env.BASE_URL}assets/hero/hero-bg.png`}
        alt="Two pixel-art ninja fighters facing off on a cliff before a giant sun"
      />

      {/* decorative flanking grid lines */}
      <div className="hero__grid hero__grid--left" aria-hidden="true" />
      <div className="hero__grid hero__grid--right" aria-hidden="true" />

      {/* glowing wordmark + underline */}
      <img className="hero__logo" src={`${import.meta.env.BASE_URL}assets/hero/logo.png`} alt="ai-kombat" />

      {/* top-left: registration badge + lede */}
      <div className="hero__intro">
        <div className="hero__badge">{'>>> regestration <<<'}</div>
        <p className="hero__lede">
          The first international hackathon for senior marketers of the AI era.
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
    </section>
  )
}

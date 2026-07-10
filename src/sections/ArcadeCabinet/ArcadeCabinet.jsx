import './ArcadeCabinet.css'

/**
 * PLAY THE GAME — an arcade cabinet whose screen is a big PLAY button that
 * links to the real Phaser game at /play. Pure CSS cabinet; the whole unit is
 * a link so it works under static export with no JS.
 */
export default function ArcadeCabinet() {
  return (
    <section className="dsec dsec--alt cabinet" aria-label="Play the game">
      <div className="dsec__head">
        <span className="dsec__round">Insert coin — enter the arena</span>
        <h2 className="dsec__title">play the game</h2>
      </div>

      <a className="cabinet__unit" href="/play" aria-label="Play AI Marketing Kombat">
        <span className="cabinet__marquee">AI · MARKETING KOMBAT</span>

        <span className="cabinet__screen">
          <img
            className="cabinet__screenImg pixelated"
            src={`/assets/fighters/bg.png`}
            alt=""
            aria-hidden="true"
          />
          <span className="cabinet__scan" aria-hidden="true" />
          <span className="cabinet__cta">
            <span className="cabinet__play">▶ PLAY</span>
            <span className="cabinet__blink">PRESS START</span>
          </span>
        </span>

        <span className="cabinet__panel">
          <span className="cabinet__joystick" aria-hidden="true" />
          <span className="cabinet__buttons" aria-hidden="true">
            <span className="cabinet__btn cabinet__btn--y" />
            <span className="cabinet__btn cabinet__btn--r" />
            <span className="cabinet__btn cabinet__btn--c" />
          </span>
          <span className="cabinet__coin">◉ INSERT COIN</span>
        </span>
      </a>
    </section>
  )
}

import './ArcadeCabinet.css'

/**
 * PLAY THE GAME — a photoreal arcade cabinet (render) whose empty CRT screen is
 * overlaid with a live "▶ PLAY / PRESS START" screen. The whole unit links to
 * the real Phaser game at /play. The screen rectangle is positioned in percent
 * over the render's glass; on hover the screen "powers on".
 */
export default function ArcadeCabinet() {
  return (
    <section className="dsec dsec--alt cabinet" aria-label="Play the game">
      <div className="dsec__head">
        <span className="dsec__round">Insert coin — enter the arena</span>
        <h2 className="dsec__title">play the game</h2>
      </div>

      <a className="cabinet__unit" href="/play" aria-label="Play AI Marketing Kombat">
        <img
          className="cabinet__frame"
          src={`/assets/demo/cabinet.png`}
          alt="Arcade cabinet — play AI Marketing Kombat"
        />

        <span className="cabinet__screen">
          {/* a real game scene on the tube */}
          <img
            className="cabinet__game pixelated"
            src={`/assets/hero/hero-bg.png`}
            alt=""
            aria-hidden="true"
          />
          <span className="cabinet__glass" aria-hidden="true" />
          <span className="cabinet__grille" aria-hidden="true" />
          <span className="cabinet__scan" aria-hidden="true" />
          <span className="cabinet__sheen" aria-hidden="true" />
          <span className="cabinet__cta">
            <span className="cabinet__play">▶ PLAY</span>
            <span className="cabinet__blink">PRESS START</span>
          </span>
        </span>
      </a>
    </section>
  )
}

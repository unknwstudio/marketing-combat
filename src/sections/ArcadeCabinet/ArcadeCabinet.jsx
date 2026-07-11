import './ArcadeCabinet.css'
import Cabinet3DMount from '@/components/Cabinet3D/Cabinet3DMount'

/**
 * PLAY THE GAME — an interactive 3D arcade cabinet (R3F). Parallax toward the
 * cursor; the screen is a curved CRT plane with a shader. The whole unit links
 * to the real Phaser game at /play.
 */
export default function ArcadeCabinet() {
  return (
    <section className="dsec dsec--alt cabinet" aria-label="Play the game">
      <div className="dsec__head">
        <span className="dsec__round">Insert coin — enter the arena</span>
        <h2 className="dsec__title">play the game</h2>
      </div>

      <a
        className="cabinet__unit cabinet__unit--3d"
        href="/play"
        aria-label="Play AI Marketing Kombat"
      >
        <Cabinet3DMount />
      </a>
    </section>
  )
}

import { GAME_COPY } from '@/lib/game'

/**
 * RotateHint — the "please rotate to landscape" prompt shown full-screen when
 * the game surface (/play, and the /demo in-page takeover) is too narrow to
 * play in portrait. Purely presentational: both mounts already import the
 * shared `@/styles/game-surface.css`, whose `.rotate-hint`/`.rot-*` rules
 * (display: none until the small-viewport-portrait media query) style
 * whichever host renders this markup.
 */
export default function RotateHint() {
  const [line1, line2] = GAME_COPY.rotateTitle
  return (
    <div className="rotate-hint" role="status">
      <div className="rot-phone" aria-hidden="true" />
      <div className="rot-big">
        {line1}
        <br />
        {line2}
      </div>
      <div className="rot-sm">{GAME_COPY.rotateSub}</div>
    </div>
  )
}

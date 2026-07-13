// @ts-check
import './PlayLink.css';
import PixelIcon from '@/components/PixelIcon/PixelIcon';

/**
 * Floating "PLAY" cabinet button that finally connects the landing to the game at
 * /play. Rendered outside ScaleCanvas (viewport-fixed, like ModeSwitcher) so it never
 * disturbs the pixel-faithful Figma sections. Plain <a> full-page nav: /play owns its
 * own full-screen layout, so a hard swap is more robust than client routing.
 *
 * On pages where VsSplash is mounted, its delegated a[href="/play"] listener
 * intercepts this link for the first-visit VS flash — no wiring needed here.
 *
 * `underHud`: /demo pins the ScrollHealth HP strip across the viewport top
 * (z-index 950), which would draw straight over a top:20px button once the
 * player scrolls past the hero — the flag drops PLAY just below the strip.
 */
/**
 * @param {{ underHud?: boolean }} props  drop PLAY below the fixed HP strip on /demo (z-index 950)
 */
export default function PlayLink({ underHud = false }) {
  return (
    <a
      href="/play"
      className={'play-link' + (underHud ? ' play-link--under-hud' : '')}
      aria-label="Play the game"
      data-burst
    >
      <span className="play-link__icon" aria-hidden="true">
        <PixelIcon name="play" size="0.9em" />
      </span>
      <span className="play-link__label">PLAY</span>
    </a>
  );
}

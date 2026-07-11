import './PlayLink.css';
import PixelIcon from '@/components/PixelIcon/PixelIcon';

/**
 * Floating "PLAY" cabinet button that finally connects the landing to the game at
 * /play. Rendered outside ScaleCanvas (viewport-fixed, like ModeSwitcher) so it never
 * disturbs the pixel-faithful Figma sections. Plain <a> full-page nav: /play owns its
 * own full-screen layout, so a hard swap is more robust than client routing.
 */
export default function PlayLink() {
  return (
    <a href="/play" className="play-link" aria-label="Play the game">
      <span className="play-link__icon" aria-hidden="true">
        <PixelIcon name="play" size="0.9em" />
      </span>
      <span className="play-link__label">PLAY</span>
    </a>
  );
}

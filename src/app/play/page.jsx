import '@/styles/game-surface.css';
import './play.css';
import FightGame from '../../components/FightGame/FightGame';
import MobileControls from '../../components/MobileControls/MobileControls';
import GameChrome from '../../components/GameChrome/GameChrome';

export const metadata = {
  title: 'Play — AI Marketing Kombat',
  description: 'Enter the arena. Pixel fighting for senior AI marketers.',
  alternates: { canonical: '/play' },
  robots: { index: false }, // WIP battle prototype
};

/**
 * /play — the pixel fighting game. Server component for metadata; the Phaser
 * stage lives in the client-only FightGame island (safe under static export).
 */
export default function PlayPage() {
  return (
    <main className="play-main">
      <FightGame />
      <MobileControls />
      <GameChrome />
      <div className="rotate-hint" aria-hidden="true">
        <div className="rot-phone" />
        <div className="rot-big">ROTATE YOUR<br />PHONE</div>
        <div className="rot-sm">the arena needs landscape</div>
      </div>
    </main>
  );
}

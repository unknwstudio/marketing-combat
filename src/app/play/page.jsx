import '@/styles/game-surface.css';
import './play.css';
import FightGame from '../../components/FightGame/FightGame';
import MobileControls from '../../components/MobileControls/MobileControls';
import GameChrome from '../../components/GameChrome/GameChrome';
import RotateHint from '../../components/RotateHint/RotateHint';
import RegisterModal from '../../components/RegisterModal/RegisterModal';

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
      <RotateHint />
      {/* funnel target for the result screen's "REGISTER FOR THE REAL ARENA"
          CTA — /play is standalone, so it needs its own modal (the /demo
          takeover reuses the home page's). */}
      <RegisterModal variant="ai" />
    </main>
  );
}

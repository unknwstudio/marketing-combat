'use client';

import { useEffect, useRef } from 'react';

/**
 * Client-only Phaser island. Phaser and the fight engine are dynamically
 * imported INSIDE the effect so nothing touches `window` during the static
 * export/SSG pass. The game is destroyed on unmount to avoid WebGL leaks.
 */
export default function FightGame() {
  const hostRef = useRef(null);

  useEffect(() => {
    let game = null;
    let cancelled = false;

    (async () => {
      const Phaser = (await import('phaser')).default;
      const { createFightGame, setGameFont } = await import('../../game/fight/createFight');
      // next/font emits a hashed family name in --font-ps; resolve it, make sure
      // it's loaded (canvas text can't reflow after a late font load), and hand
      // it to the game so all HUD text renders in Press Start 2P.
      const varFamily = getComputedStyle(document.documentElement).getPropertyValue('--font-ps').trim();
      const family = varFamily ? `${varFamily}, monospace` : "'Press Start 2P', monospace";
      const primary = (varFamily || "'Press Start 2P'").split(',')[0].trim();
      try { await document.fonts.load(`16px ${primary}`); await document.fonts.ready; } catch (e) { /* fallback: monospace */ }
      setGameFont(family);
      if (cancelled || !hostRef.current) return;
      game = createFightGame(Phaser, hostRef.current);
    })();

    return () => {
      cancelled = true;
      if (game) game.destroy(true);
    };
  }, []);

  return <div ref={hostRef} className="fight-canvas" aria-label="AI Marketing Kombat battle" />;
}

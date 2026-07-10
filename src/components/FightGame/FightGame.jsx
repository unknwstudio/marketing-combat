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
    let overlayOpen = false;

    // Bridge from the React chrome layer (GameChrome). Mute maps to the global sound
    // manager; while an overlay (title / pause / how-to) is open we disable the active
    // scene's keyboard so those keys never leak through to the live game underneath.
    const applyKb = () => {
      try { if (game) game.scene.getScenes(true).forEach((s) => { if (s.input && s.input.keyboard) s.input.keyboard.enabled = !overlayOpen; }); } catch (e) { /* scenes not ready */ }
    };
    const onOverlay = (e) => { overlayOpen = !!(e.detail && e.detail.open); applyKb(); };
    const onScene = () => applyKb();                                   // re-assert on every scene change
    const onMute = (e) => { try { if (game && game.sound) game.sound.mute = !!(e.detail && e.detail.muted); } catch (err) { /* no sound yet */ } };
    window.addEventListener('mk:overlay', onOverlay);
    window.addEventListener('mk:scene', onScene);
    window.addEventListener('mk:mute', onMute);

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
      // apply the saved mute preference once the sound manager exists, and honour any
      // overlay that opened before the game finished loading
      game.events.once('ready', () => {
        try { game.sound.mute = localStorage.getItem('mk_muted') === '1'; } catch (e) { /* no storage */ }
        applyKb();
      });
    })();

    return () => {
      cancelled = true;
      window.removeEventListener('mk:overlay', onOverlay);
      window.removeEventListener('mk:scene', onScene);
      window.removeEventListener('mk:mute', onMute);
      if (game) game.destroy(true);
    };
  }, []);

  return <div ref={hostRef} className="fight-canvas" aria-label="AI Marketing Kombat battle" />;
}

'use client';

import { useEffect, useState } from 'react';
import './GameChrome.css';

// One DOM "chrome" layer over the Phaser canvas: title / press-start, the always-on
// ✕ exit, the pause menu, the how-to card and the mute toggle. Rendering it in React
// (not inside Phaser) gives crisp text, real focusable buttons and identical behaviour
// on touch and desktop. It talks to the game only through window CustomEvents:
//   chrome -> game :  mk:pause | mk:resume | mk:restart | mk:menu | mk:mute | mk:overlay
//   game  -> chrome :  mk:scene  (which scene is live: boot | select | fight)
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, detail ? { detail } : undefined));

export default function GameChrome() {
  const [scene, setScene] = useState('boot');     // boot | select | fight
  const [started, setStarted] = useState(false);  // dismissed the title / press-start?
  const [paused, setPaused] = useState(false);
  const [howto, setHowto] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [muted, setMuted] = useState(false);

  // game -> chrome: track the live scene so the pause button only shows in a fight
  useEffect(() => {
    const onScene = (e) => setScene((e.detail && e.detail.key) || 'boot');
    window.addEventListener('mk:scene', onScene);
    return () => window.removeEventListener('mk:scene', onScene);
  }, []);

  // restore the saved mute preference and push it to the game once it exists
  useEffect(() => {
    try { const m = localStorage.getItem('mk_muted') === '1'; setMuted(m); emit('mk:mute', { muted: m }); } catch (e) { /* no storage */ }
  }, []);

  // show the how-to card once, automatically, the first time a player starts
  useEffect(() => {
    if (!started) return;
    try { if (localStorage.getItem('mk_seen_howto') !== '1') { setHowto(true); localStorage.setItem('mk_seen_howto', '1'); } } catch (e) { /* no storage */ }
  }, [started]);

  // while ANY overlay is up, tell the game to stop reading keys so title/pause keys
  // don't leak through to the live Select/Fight scene underneath. Re-assert on every
  // scene change too: the game boots async, so the first emit can land before it exists
  // — re-emitting when a scene reports in guarantees the gate is applied.
  const overlayOpen = !started || paused || howto || confirmExit;
  useEffect(() => { emit('mk:overlay', { open: overlayOpen }); }, [overlayOpen, scene]);

  const doStart = () => setStarted(true);
  const openPause = () => { setPaused(true); emit('mk:pause'); };
  const resume = () => { setPaused(false); emit('mk:resume'); };
  const restart = () => { setPaused(false); emit('mk:restart'); };
  const toMenu = () => { setPaused(false); emit('mk:menu'); };
  const exitToSite = () => { window.location.href = '/'; };
  const requestExit = () => { if (scene === 'fight') setConfirmExit(true); else exitToSite(); };
  const toggleMute = () => setMuted((m) => {
    const nm = !m; emit('mk:mute', { muted: nm });
    try { localStorage.setItem('mk_muted', nm ? '1' : '0'); } catch (e) { /* no storage */ }
    return nm;
  });

  // ESC = pause toggle in a fight (and a universal "close this overlay"); ENTER/SPACE
  // dismiss the title. Owned entirely here — the game no longer binds ESC.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (confirmExit) { setConfirmExit(false); return; }
        if (howto) { setHowto(false); return; }
        if (!started) return;
        if (paused) { resume(); return; }
        if (scene === 'fight') { e.preventDefault(); openPause(); }
        return;
      }
      if (!started && (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar')) { e.preventDefault(); doStart(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, scene, paused, howto, confirmExit]);

  return (
    <div className="gc-root">
      {/* persistent escape hatches — hidden only while the title is up */}
      {started && (
        <>
          <button className="gc-corner gc-exit" onClick={requestExit} aria-label="Exit to site" title="Exit to site">✕</button>
          <div className="gc-topright">
            <button className="gc-corner" onClick={() => setHowto(true)} aria-label="How to play" title="How to play">?</button>
            {scene === 'fight' && !paused && (
              <button className="gc-corner" onClick={openPause} aria-label="Pause" title="Pause">❚❚</button>
            )}
          </div>
        </>
      )}

      {/* TITLE / PRESS START — also the audio-unlock gesture */}
      {!started && (
        <div className="gc-overlay gc-title" onClick={doStart} role="button" tabIndex={0}
             onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') doStart(); }}>
          <div className="gc-kicker">SENIOR AI MARKETERS ONLY</div>
          <h1 className="gc-logo">AI MARKETING<br /><span>KOMBAT</span></h1>
          <div className="gc-legend"><span>WASD move</span><span>J K L attack</span><span>S block</span></div>
          <div className="gc-start">PRESS START</div>
          <button className="gc-howtolink" onClick={(e) => { e.stopPropagation(); setHowto(true); }}>HOW TO PLAY ▸</button>
          <div className="gc-hint">tap the screen · or press any key</div>
        </div>
      )}

      {/* PAUSE */}
      {paused && (
        <div className="gc-overlay gc-menu">
          <div className="gc-menu-title">PAUSED</div>
          <button className="gc-item" onClick={resume}>RESUME</button>
          <button className="gc-item" onClick={restart}>RESTART FIGHT</button>
          <button className="gc-item" onClick={toMenu}>CHANGE FIGHTER</button>
          <button className="gc-item" onClick={() => setHowto(true)}>HOW TO PLAY</button>
          <button className="gc-item gc-danger" onClick={requestExit}>EXIT TO SITE</button>
          <button className="gc-item gc-toggle" onClick={toggleMute}>SOUND&nbsp;&nbsp;{muted ? 'OFF' : 'ON'}</button>
        </div>
      )}

      {/* HOW TO PLAY */}
      {howto && (
        <div className="gc-overlay gc-menu gc-howto">
          <div className="gc-menu-title">HOW TO PLAY</div>
          <p className="gc-lead">Pick a marketer. Fight to the KO. Best of three.</p>
          <div className="gc-keys">
            <div><b>MOVE</b><span>A D&nbsp;&nbsp;/&nbsp;&nbsp;← →</span></div>
            <div><b>JUMP</b><span>W&nbsp;&nbsp;/&nbsp;&nbsp;↑</span></div>
            <div><b>BLOCK</b><span>S&nbsp;&nbsp;/&nbsp;&nbsp;↓</span></div>
            <div><b>PUNCH</b><span>J</span></div>
            <div><b>KICK</b><span>K</span></div>
            <div><b>SPECIAL</b><span>L</span></div>
          </div>
          <p className="gc-note">Chain clean hits to climb the funnel — LEAD → MQL → SQL → CLOSED-WON. On a phone, use the on-screen buttons. Pause any time with the ❚❚ button or ESC.</p>
          <button className="gc-item" onClick={() => setHowto(false)}>GOT IT</button>
        </div>
      )}

      {/* EXIT CONFIRM (only mid-fight, where there's progress to lose) */}
      {confirmExit && (
        <div className="gc-overlay gc-menu">
          <div className="gc-menu-title">LEAVE THE ARENA?</div>
          <p className="gc-lead">You'll go back to the site. Match progress is lost.</p>
          <button className="gc-item gc-danger" onClick={exitToSite}>LEAVE</button>
          <button className="gc-item" onClick={() => setConfirmExit(false)}>STAY IN THE FIGHT</button>
        </div>
      )}
    </div>
  );
}

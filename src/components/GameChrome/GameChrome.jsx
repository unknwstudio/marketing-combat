'use client';

import { useEffect, useState } from 'react';
import { MK } from '../../game/fight/events';
import PixelIcon from '@/components/PixelIcon/PixelIcon';
import './GameChrome.css';

// One DOM "chrome" layer over the Phaser canvas: title / press-start, the always-on
// ✕ exit, the pause menu, the how-to card and the mute toggle. Rendering it in React
// (not inside Phaser) gives crisp text, real focusable buttons and identical behaviour
// on touch and desktop. It talks to the game only through window CustomEvents:
//   chrome -> game :  mk:pause | mk:resume | mk:restart | mk:menu | mk:mute | mk:overlay
//   game  -> chrome :  mk:scene  (which scene is live: boot | select | fight)
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, detail ? { detail } : undefined));

// Result-screen button sets, keyed by the game's matchAction. The primary button
// fires mk:confirm (the game does the right thing: rematch / next rung / roster).
const RESULT_ACTIONS = {
  rematch: { primary: 'REMATCH', changeFighter: true },
  advance: { primary: 'NEXT CHALLENGER', changeFighter: true },
  victory: { primary: 'BACK TO ROSTER', changeFighter: false },
  gameover: { primary: 'BACK TO ROSTER', changeFighter: false },
};

// Brag card per outcome — the viral loop: a player shares their result and pulls the
// next marketer into the arena. line() omits the URL, which is appended at share time.
const BRAG = {
  victory: { badge: '🏆', head: 'BEAT THE ALGORITHM', line: (f) => `I DEFEATED THE ALGORITHM as ${f} in AI Marketing Kombat.` },
  advance: { badge: '📊', head: 'CLIMBING THE GAUNTLET', line: (f) => `Climbing the gauntlet as ${f} in AI Marketing Kombat.` },
  won: { badge: '📈', head: 'PROMOTED', line: (f) => `I got PROMOTED as ${f} in AI Marketing Kombat — the pixel fighter for senior AI marketers.` },
  lost: { badge: '💼', head: 'PIVOT TO CONSULTING', line: (f) => `I pivoted to consulting in AI Marketing Kombat (${f}).` },
};
const bragKey = (r) => (r.action === 'victory' ? 'victory' : r.action === 'advance' ? 'advance' : r.won ? 'won' : 'lost');

export default function GameChrome() {
  const [scene, setScene] = useState('boot');     // boot | select | fight
  const [started, setStarted] = useState(false);  // dismissed the title / press-start?
  const [paused, setPaused] = useState(false);
  const [howto, setHowto] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [muted, setMuted] = useState(false);
  const [result, setResult] = useState(null);   // matchend { action, fighter, won } or null
  const [share, setShare] = useState(false);     // brag/share card open?
  const [copied, setCopied] = useState(false);
  const [copyMsg, setCopyMsg] = useState('');    // manual-copy fallback text when clipboard is unavailable
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  // game -> chrome: track the live scene (pause shows only in a fight) and the result
  // screen (shows the matched action bar). A new scene always clears any stale result.
  useEffect(() => {
    const onScene = (e) => { setScene((e.detail && e.detail.key) || 'boot'); setResult(null); };
    // score/initials arrive only at the end of a GAUNTLET run (the game's initials entry)
    const onResult = (e) => setResult(e.detail && e.detail.show ? { action: e.detail.action, fighter: e.detail.fighter, won: e.detail.won, score: e.detail.score, initials: e.detail.initials } : null);
    window.addEventListener(MK.SCENE, onScene);
    window.addEventListener(MK.RESULT, onResult);
    return () => { window.removeEventListener(MK.SCENE, onScene); window.removeEventListener(MK.RESULT, onResult); };
  }, []);

  // the share card belongs to a result; close it whenever the result clears
  useEffect(() => { if (!result) { setShare(false); setCopyMsg(''); } }, [result]);

  // restore the saved mute preference and push it to the game once it exists
  useEffect(() => {
    try { const m = localStorage.getItem('mk_muted') === '1'; setMuted(m); emit(MK.MUTE, { muted: m }); } catch (e) { /* no storage */ }
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
  const overlayOpen = !started || paused || howto || confirmExit || share;
  useEffect(() => { emit(MK.OVERLAY, { open: overlayOpen }); }, [overlayOpen, scene]);

  // the result bar's buttons replace the D-pad's role at matchend, so hide the pad
  useEffect(() => { document.body.classList.toggle('mk-in-result', !!result); return () => document.body.classList.remove('mk-in-result'); }, [result]);

  const doStart = () => setStarted(true);
  const openPause = () => { setPaused(true); emit(MK.PAUSE); };
  const resume = () => { setPaused(false); emit(MK.RESUME); };
  const restart = () => { setPaused(false); emit(MK.RESTART); };
  const toMenu = () => { setPaused(false); emit(MK.MENU); };
  const exitToSite = () => { window.location.href = '/'; };
  const requestExit = () => { if (result || scene !== 'fight') exitToSite(); else setConfirmExit(true); };  // match over or in a menu -> no confirm needed
  const toggleMute = () => setMuted((m) => {
    const nm = !m; emit(MK.MUTE, { muted: nm });
    try { localStorage.setItem('mk_muted', nm ? '1' : '0'); } catch (e) { /* no storage */ }
    return nm;
  });
  // native share sheet where available (mobile), clipboard fallback, manual-copy field if both fail
  const doShare = async () => {
    if (!result) return;
    setCopyMsg('');
    const b = BRAG[bragKey(result)];
    const f = result.fighter || 'a top marketer';
    const url = window.location.origin + '/play';
    // a gauntlet run carries a score — the number is the brag, so it leads the challenge
    const scorePart = result.score != null ? ` Gauntlet score: ${result.score}.` : '';
    const text = `${b.badge} ${b.line(f)}${scorePart} Think you can out-market me?`;
    const full = `${text} ${url}`;
    if (canShare) {
      try { await navigator.share({ title: 'AI Marketing Kombat', text, url }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; /* user cancelled -> don't silently copy */ }
    }
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('no clipboard');
      await navigator.clipboard.writeText(full); setCopied(true); setTimeout(() => setCopied(false), 2200);
    } catch (e) { setCopyMsg(full); } // clipboard blocked (e.g. embedded webview) -> show a selectable field
  };

  // ESC = pause toggle in a fight (and a universal "close this overlay"); ENTER/SPACE
  // dismiss the title. Owned entirely here — the game no longer binds ESC.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (share) { setShare(false); setCopyMsg(''); return; }
        if (confirmExit) { setConfirmExit(false); return; }
        if (howto) { setHowto(false); return; }
        if (!started) return;
        if (paused) { resume(); return; }
        if (scene === 'fight' && !result) { e.preventDefault(); openPause(); } // not over the result screen (matches the ⏸ button's guard)
        return;
      }
      // "press any key" to start — honour the title's promise: any real key except Tab (focus nav),
      // Escape and bare modifiers. NOT while the how-to card is open over the title, and not for
      // browser shortcuts (Ctrl/Cmd/Alt combos) — those must stay cancelable and not boot the game.
      if (!started && !howto && !(e.ctrlKey || e.metaKey || e.altKey) && !['Tab', 'Escape', 'Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) { e.preventDefault(); doStart(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, scene, paused, howto, confirmExit, share, result]);

  // a11y: treat pause/how-to/confirm/share as modal dialogs — focus the topmost one on open,
  // trap Tab inside it, and restore focus on close (corner buttons behind are made inert below).
  const anyModal = paused || howto || confirmExit || share;
  useEffect(() => {
    if (!anyModal) return;
    const dialogs = document.querySelectorAll('.gc-root [role="dialog"]');
    const el = dialogs[dialogs.length - 1];
    if (!el) return;
    const prev = document.activeElement;
    const focusables = () => [...el.querySelectorAll('button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])')];
    const first = focusables()[0];
    if (first) first.focus();
    const onTab = (e) => {
      if (e.key !== 'Tab') return;
      const f = focusables(); if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    document.addEventListener('keydown', onTab, true);
    return () => { document.removeEventListener('keydown', onTab, true); try { if (prev && prev.focus) prev.focus(); } catch (e) { /* gone */ } };
  }, [anyModal, paused, howto, confirmExit, share]);

  return (
    <div className="gc-root">
      {/* persistent escape hatches — hidden only while the title is up */}
      {started && (
        <>
          <button className="gc-corner gc-exit" onClick={requestExit} aria-label="Exit to site" title="Exit to site" aria-hidden={overlayOpen || undefined} tabIndex={overlayOpen ? -1 : 0}><PixelIcon name="cross" size="0.9em" /></button>
          <div className="gc-topright">
            <button className="gc-corner" onClick={() => setHowto(true)} aria-label="How to play" title="How to play" aria-hidden={overlayOpen || undefined} tabIndex={overlayOpen ? -1 : 0}>?</button>
            {scene === 'fight' && !paused && !result && (
              <button className="gc-corner" onClick={openPause} aria-label="Pause" title="Pause" tabIndex={overlayOpen ? -1 : 0}><PixelIcon name="pause" size="0.8em" /></button>
            )}
          </div>
        </>
      )}

      {/* TITLE / PRESS START — also the audio-unlock gesture. The start affordance is its own
          full-bleed transparent <button> BEHIND the content (no role=button wrapping a heading /
          nested button); the content is pointer-transparent so a tap anywhere starts. */}
      {!started && (
        <div className="gc-overlay gc-title">
          <button className="gc-startbtn" aria-label="Press start" onClick={doStart} />
          <div className="gc-kicker">SENIOR AI MARKETERS ONLY</div>
          <h1 className="gc-logo">AI MARKETING<br /><span>KOMBAT</span></h1>
          <div className="gc-legend"><span>WASD move</span><span>J K L attack</span><span>S block</span></div>
          <div className="gc-start">PRESS START</div>
          <button className="gc-howtolink" onClick={() => setHowto(true)}>HOW TO PLAY <PixelIcon name="play" size="0.7em" /></button>
          <div className="gc-hint">tap the screen · or press any key</div>
        </div>
      )}

      {/* PAUSE */}
      {paused && (
        <div className="gc-overlay gc-menu" role="dialog" aria-modal="true" aria-label="Paused">
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
        <div className="gc-overlay gc-menu gc-howto" role="dialog" aria-modal="true" aria-label="How to play">
          <div className="gc-menu-title">HOW TO PLAY</div>
          <p className="gc-lead">Pick a marketer. Fight to the KO. Best of three.</p>
          <div className="gc-keys">
            {/* arrow KEYS as PixelIcons, not ← → ↑ ↓ text — the pixel font has
                no arrow glyphs, so unicode arrows fell back to a thin system
                font and clashed with the pixel type around them (the exact
                font-lottery PixelIcon exists to end). Labeled: they NAME keys. */}
            <div><b>MOVE</b><span>A D&nbsp;&nbsp;/&nbsp;&nbsp;<PixelIcon name="triLeft" size="0.9em" label="left arrow" /> <PixelIcon name="triRight" size="0.9em" label="right arrow" /></span></div>
            <div><b>JUMP</b><span>W&nbsp;&nbsp;/&nbsp;&nbsp;<PixelIcon name="triUp" size="0.9em" label="up arrow" /></span></div>
            <div><b>BLOCK</b><span>S&nbsp;&nbsp;/&nbsp;&nbsp;<PixelIcon name="triDown" size="0.9em" label="down arrow" /></span></div>
            <div><b>PUNCH</b><span>J</span></div>
            <div><b>KICK</b><span>K</span></div>
            <div><b>SPECIAL</b><span>L</span></div>
          </div>
          {/* funnel steps chain with the same pixel triangle (decorative here —
              the sequence still reads without them for screen readers) */}
          <p className="gc-note">Chain clean hits to climb the funnel — LEAD <PixelIcon name="triRight" size="0.6em" /> MQL <PixelIcon name="triRight" size="0.6em" /> SQL <PixelIcon name="triRight" size="0.6em" /> CLOSED-WON. On a phone, use the on-screen buttons. Pause any time with the <PixelIcon name="pause" size="0.75em" label="pause" /> button or ESC.</p>
          <button className="gc-item" onClick={() => setHowto(false)}>GOT IT</button>
        </div>
      )}

      {/* EXIT CONFIRM (only mid-fight, where there's progress to lose) */}
      {confirmExit && (
        <div className="gc-overlay gc-menu" role="dialog" aria-modal="true" aria-label="Leave the arena?">
          <div className="gc-menu-title">LEAVE THE ARENA?</div>
          <p className="gc-lead">You'll go back to the site. Match progress is lost.</p>
          <button className="gc-item gc-danger" onClick={exitToSite}>LEAVE</button>
          <button className="gc-item" onClick={() => setConfirmExit(false)}>STAY IN THE FIGHT</button>
        </div>
      )}

      {/* RESULT ACTION BAR — real buttons under the Phaser result text (touch + desktop) */}
      {result && !share && (
        <div className="gc-resultbar">
          <button className="gc-item gc-result-primary" onClick={() => { setResult(null); emit(MK.CONFIRM); }}>
            {(RESULT_ACTIONS[result.action] || RESULT_ACTIONS.rematch).primary}
          </button>
          <button className="gc-item gc-share-btn" onClick={() => setShare(true)}>SHARE</button>
          {(RESULT_ACTIONS[result.action] || RESULT_ACTIONS.rematch).changeFighter && (
            <button className="gc-item" onClick={() => { setResult(null); emit(MK.MENU); }}>CHANGE FIGHTER</button>
          )}
          <button className="gc-item gc-danger" onClick={exitToSite}>EXIT</button>
        </div>
      )}

      {/* SHARE / BRAG CARD — the viral hook off the result screen */}
      {share && result && (
        <div className="gc-overlay gc-menu gc-share" role="dialog" aria-modal="true" aria-label="Share your result">
          <div className="gc-menu-title">SHARE YOUR RESULT</div>
          <div className="gc-bragcard">
            <div className="gc-brag-badge" aria-hidden="true">{BRAG[bragKey(result)].badge}</div>
            <div className="gc-brag-head">{BRAG[bragKey(result)].head}</div>
            {result.fighter && <div className="gc-brag-fighter">{result.fighter}</div>}
            {/* gauntlet runs show the arcade-board line: the entered initials + the score */}
            {result.score != null && (
              <div className="gc-brag-score">{result.initials ? `${result.initials} · ` : ''}SCORE {result.score}</div>
            )}
            <div className="gc-brag-game">AI MARKETING KOMBAT</div>
          </div>
          <button className="gc-item gc-result-primary" onClick={doShare}>{copied ? 'COPIED!' : canShare ? 'SHARE' : 'COPY LINK'}</button>
          {copyMsg && (
            <input className="gc-copyfield" readOnly value={copyMsg} aria-label="Shareable link — select to copy"
                   onFocus={(e) => e.target.select()} onClick={(e) => e.target.select()} />
          )}
          <button className="gc-item" onClick={() => { setShare(false); setCopyMsg(''); }}>BACK</button>
        </div>
      )}
    </div>
  );
}

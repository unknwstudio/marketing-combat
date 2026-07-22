/* AI Marketing Kombat — fight engine.
 * Boot (load all) -> Select (fighter + stage) -> Fight (best-of-3, juice).
 * SSR-safe: Phaser is injected from the client island (no top-level import).
 * Combat runs on a fixed 60Hz tick; rendering happens after. */
import { MK } from './events';
import {
  K_WHITE, K_WHITE_HEX, K_BLACK, K_BLACK_HEX,
  K_CYAN_HEX, K_GOLD, K_GOLD_HEX, K_ORANGE, K_STAGE, K_STAGE_HEX,
  K_HUD_INK, K_HUD_FROST, K_HUD_STEEL, K_HUD_CYAN,
  K_HUD_RED, K_HUD_RED_HEX, K_HUD_GREEN, K_HUD_GREEN_HEX,
} from '../palette';

export const GAME_W = 480;
export const GAME_H = 270;
export const FLOOR_Y = 240;

const CELL_W = 150;
const CELL_H = 153;
export const POSE = {
  idle: 0, walk: 1, jump: 2, punch: 3, kick: 4,
  block: 5, hit: 6, ko: 7, special: 8, victory: 9,
};

const STEP = 1000 / 60;
const GRAVITY = 950;
const JUMP_V = -330;
const X_MIN = 34;
const X_MAX = GAME_W - 34;

const BLOCKSTUN = 150;
const KNOCKBACK = 120;
const PUSHBACK = 42;
const BUFFER_MS = 133; // input-buffer window (~8 frames) so a press just before you
                       // become actionable still fires — kills the "ate my input" feel
const ROUNDS_TO_WIN = 2; // best-of-3
const ROUND_TIME = 60; // seconds/round; on time-over the higher-HP fighter wins (anti-stall, MK-style)

// Per-move hitstun is deliberately SHORTER than each move's own re-hit interval, so a
// single mashed move can't true-loop the opponent (the old flat 340ms > the 250ms punch
// re-hit interval was a touch-of-death infinite). The defender always regains a tick to
// block/jump; combos come from cancels (later), not from stun outlasting recovery.
// `cost` = STAMINA (see STAMINA_PROFILES below) — the real rate limiter. Recovery frames
// alone let a player throw a fresh punch every ~280ms forever; stamina means that pace
// runs out after a few hits, same as it now costs the CPU nothing (its own tempo is
// already gated by aiTimer) — so the fix is symmetric, not a player-only nerf.
// `jumpkick` reuses the KICK sprite frame on purpose (no new art for 6 rosters+boss) —
// see control()'s airborne branch for how it's triggered.
const ATTACK = {
  punch:    { pose: POSE.punch,   startup: 55,  active: 75,  recovery: 150, dmg: 7,  reach: 60,  hy: [95, 150], hitstun: 200, cost: 18 },
  kick:     { pose: POSE.kick,    startup: 85,  active: 95,  recovery: 205, dmg: 11, reach: 80,  hy: [95, 162], hitstun: 280, cost: 26 },
  special:  { pose: POSE.special, startup: 130, active: 170, recovery: 260, dmg: 17, reach: 104, hy: [100, 168], hitstun: 360, cost: 42 },
  jumpkick: { pose: POSE.kick,    startup: 60,  active: 90,  recovery: 160, dmg: 9,  reach: 66,  hy: [90, 160], hitstun: 240, cost: 22 },
};
for (const k in ATTACK) ATTACK[k].total = ATTACK[k].startup + ATTACK[k].active + ATTACK[k].recovery;

const HURT = { dx: 22, top: 130, bottom: 6 };

// Per-archetype identity: hp, walk speed, damage mult, reach mult, attack-speed
// mult. Makes "choose your fighter" actually matter.
export const ROSTER = [
  { key: 'fighter1', name: 'CMOs',                 color: K_CYAN_HEX, style: 'ZONER',     hp: 95,  speed: 100, dmg: 0.95, reach: 1.15, atkSpeed: 1.00 },
  { key: 'fighter2', name: 'HEADS OF GROWTH',      color: K_HUD_RED_HEX, style: 'RUSHDOWN',  hp: 98,  speed: 114, dmg: 1.00, reach: 0.98, atkSpeed: 1.10 },
  { key: 'fighter3', name: 'PERFORMANCE MARKETER', color: K_HUD_GREEN_HEX, style: 'ALL-ROUND', hp: 110, speed: 96,  dmg: 1.05, reach: 1.02, atkSpeed: 1.00 },
  { key: 'fighter4', name: 'AI CREATORS',          color: 0xffcf3f, style: 'HEAVY',     hp: 124, speed: 80,  dmg: 1.32, reach: 1.08, atkSpeed: 0.80 },
  { key: 'fighter5', name: 'FUTURE LEGENDS',       color: 0xb08bff, style: 'ASSASSIN',  hp: 84,  speed: 126, dmg: 0.85, reach: 0.98, atkSpeed: 1.22 },
];
// Stamina pool per archetype — same identity axis as the ROSTER stat block above,
// just spent on ATTACK.*.cost instead of dmg/reach/speed. max/regen (stamina per
// second) both echo the style: HEAVY carries a big tank that refills slowly (a wall
// that can still out-mash you if you don't respect it); ASSASSIN is the opposite
// (small pool, fast refill — hit-and-run, not sustained pressure); RUSHDOWN gets a
// bigger pool since its whole identity is throwing a lot of hits.
const STAMINA_PROFILES = {
  ZONER:       { max: 100, regen: 20 },
  RUSHDOWN:    { max: 120, regen: 24 },
  'ALL-ROUND': { max: 100, regen: 22 },
  HEAVY:       { max: 130, regen: 14 },
  ASSASSIN:    { max: 80,  regen: 30 },
};
const BOSS_STAMINA = { max: 150, regen: 26 }; // THE ALGORITHM doesn't get winded like the fighters do
function staminaProfileFor(style) {
  return STAMINA_PROFILES[style] || STAMINA_PROFILES['ALL-ROUND'];
}
// The four BATTLE ARENAS from the landing's ROUND 04 section (same art,
// downscaled to the game's 480x270) — you fight IN the case tracks the site
// promises, not in generic fantasy sets. Keys mirror the landing image names.
export const STAGES = [
  { key: 'healthcare', name: 'HEALTHCARE' },
  { key: 'b2b-saas', name: 'B2B SAAS' },
  { key: 'e-commerce', name: 'E-COMMERCE' },
  { key: 'enterprise', name: 'ENTERPRISE' },
];
// Arena mission one-liners for the ROUND intro card — each round restates the case
// promise the landing's ROUND 04 section makes for that track, as the fight's stakes.
const MISSIONS = {
  healthcare: 'MISSION: CUT CAC, SPEED UP CONVERSION',
  'b2b-saas': 'MISSION: TURN PQLs INTO PIPELINE',
  'e-commerce': 'MISSION: SCALE CREATIVE, SQUEEZE CAC',
  enterprise: 'MISSION: LAND TARGET ACCOUNTS',
};
const INTRO_T = 1900; // intro card ~1.2s (1900->700) + the existing 700ms FIGHT! beat

// Per-archetype move names — the marketing-satire joke floats off the defender on
// every clean hit. Keyed by atlas key (the boss reuses fighter3's).
const MOVE_NAMES = {
  fighter1: { punch: 'BRAND SLAP', kick: 'REBRAND ROUNDHOUSE', special: 'BRAND AWARENESS' },
  fighter2: { punch: 'GROWTH HACK JAB', kick: 'A/B TESTED KICK', special: 'VIRAL LOOP' },
  fighter3: { punch: 'COLD EMAIL JAB', kick: 'CPC LOW KICK', special: 'RETARGETING UPPERCUT' },
  fighter4: { punch: 'PROMPT INJECTION', kick: 'RENDER FARM STOMP', special: 'HALLUCINATION BLADE' },
  fighter5: { punch: 'DISRUPTOR JAB', kick: 'THOUGHT LEADERSHIP', special: 'LOOKALIKE AUDIENCE' },
};
// The combo counter names the B2B funnel as an escalating violence scale.
function funnelTier(n) {
  if (n >= 8) return { label: 'CLOSED-WON!!', color: K_GOLD };
  if (n >= 5) return { label: 'SQL!', color: K_HUD_GREEN };
  if (n >= 3) return { label: 'MQL!', color: K_HUD_CYAN };
  return { label: 'LEAD', color: '#c8d0dc' };
}

// GAUNTLET (arcade ladder): the 4 non-player archetypes easy->hard, then the boss.
const DIFFICULTY_ORDER = ['ASSASSIN', 'RUSHDOWN', 'ALL-ROUND', 'ZONER', 'HEAVY'];
function gauntletSequence(playerKey) {
  return ROSTER.filter((r) => r.key !== playerKey)
    .sort((a, b) => DIFFICULTY_ORDER.indexOf(a.style) - DIFFICULTY_ORDER.indexOf(b.style))
    .map((r) => r.key);
}
// THE ALGORITHM — the deliberately-unfair final boss (a green-flickering palette-swap
// with buffed stats + a periodic "shadowban" that halves the player's damage).
const BOSS = { atlas: 'fighter3', name: 'THE ALGORITHM', color: 0x00ff88, hp: 155, speed: 110, dmg: 1.2, reach: 1.1, atkSpeed: 1.05 };

// Selectable modes. p2/sudden are local 2-player (booth superpower); sudden = one clean
// hit ends the round. Cycle on the select screen with ▲▼.
const MODES = [
  { key: 'vs', label: 'VS CPU' },
  { key: 'p2', label: '2 PLAYER' },
  { key: 'sudden', label: 'SUDDEN DEATH' },
  { key: 'gauntlet', label: 'GAUNTLET' },
];
// Two disjoint keyboard clusters so two people can share one keyboard. Solo play keeps
// the roomy combined mapping; in 2P, P1 takes the left cluster and P2 the arrows/JKL.
const KEYSET_SOLO = { left: ['LEFT', 'A'], right: ['RIGHT', 'D'], jump: ['UP', 'W', 'SPACE'], block: ['S', 'DOWN'], punch: 'J', kick: 'K', special: 'L' };
const KEYSET_P1 = { left: ['A'], right: ['D'], jump: ['W'], block: ['S'], punch: 'F', kick: 'G', special: 'H' };
const KEYSET_P2 = { left: ['LEFT'], right: ['RIGHT'], jump: ['UP'], block: ['DOWN'], punch: 'J', kick: 'K', special: 'L' };

// The pixel font family is resolved on the client (next/font emits a hashed
// family name, not the literal "Press Start 2P") and injected before boot.
let FONT_FAMILY = "'Press Start 2P', monospace";
export function setGameFont(f) { if (f) FONT_FAMILY = f; }
const txt = (scene, x, y, s, size, color, ax = 0.5, ay = 0.5) =>
  scene.add.text(x, y, s, { fontFamily: FONT_FAMILY, fontSize: `${size}px`, color, stroke: K_BLACK, strokeThickness: 3 })
    .setOrigin(ax, ay).setResolution(3);

const SOUNDS = ['round1', 'round2', 'round3', 'fight', 'ko', 'win', 'lose', 'flawless', 'closethedeal', 'budgetcut', 'unsubscribed', 'gdprd', 'hit', 'kick', 'block', 'special', 'kothud', 'confirm'];
const snd = (scene, key, vol = 1) => { try { if (scene.cache.audio.exists(key)) scene.sound.play(key, { volume: vol }); } catch (e) { /* audio not unlocked yet */ } };
// Tell the React chrome layer (GameChrome) which scene is live, so it shows the
// right escape hatches: ✕ exit is always available; the ⏸ pause menu only in a fight.
const emitScene = (key) => { if (typeof window !== 'undefined') { try { window.dispatchEvent(new CustomEvent(MK.SCENE, { detail: { key } })); } catch (e) { /* no DOM */ } } };
// Result screen -> GameChrome: it renders the matched action bar (Rematch / Next /
// Roster + Change Fighter + Exit). Pass null to clear it when the match screen leaves.
const emitResult = (action, meta) => { if (typeof window !== 'undefined') { try { window.dispatchEvent(new CustomEvent(MK.RESULT, { detail: action ? { show: true, action, ...(meta || {}) } : { show: false } })); } catch (e) { /* no DOM */ } } };
// Honour OS "Reduce Motion" for the heavy full-screen juice (camera flash/shake/punch-zoom — a
// photosensitivity hazard). Checked live per use so a mid-session toggle is respected. Hitstop and
// slow-mo timing are NOT motion and stay; the site's other components already guard the same way.
// Cached MediaQueryList: this is polled from per-tick paths (arena fx, intro card,
// initials blink), and matchMedia() allocates a fresh MQL on every call — 60/sec of
// garbage. A retained MQL's .matches stays live, so mid-session toggles still apply.
let _rmq = null;
const reducedMotion = () => {
  if (!_rmq && typeof window !== 'undefined' && window.matchMedia) _rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
  return !!_rmq && _rmq.matches;
};
// HAPTICS: a physical tick on phones when the PLAYER lands a clean hit / a heavier buzz
// when they get KO'd. Shaking the device IS motion, so Reduce Motion silences it too.
// Guarded twice (feature check + try) so it can never throw on browsers without vibrate.
const buzz = (ms) => { try { if (!reducedMotion() && typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(ms); } catch (e) { /* blocked (e.g. iframe permission) */ } };
// GAUNTLET leaderboard, persisted like a real cabinet's battery-backed RAM. Top 10 of
// { initials, score, date }; score = rungs cleared * 1000 + remaining HP on the final win.
const SCORES_KEY = 'kombat_scores';
function loadScores() {
  // Sanitize here so EVERY consumer (idle table, Leaderboard section, share) gets
  // well-formed rows — a corrupt '[null]' or numeric initials in storage would
  // otherwise throw inside per-frame code (selectUpdate's row template).
  try {
    const a = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
    return Array.isArray(a) ? a.filter((e) => e && typeof e === 'object' && typeof e.initials === 'string' && Number.isFinite(e.score)) : [];
  }
  catch (e) { return []; }
}
function saveScore(entry) {
  try {
    const a = loadScores(); a.push(entry);
    a.sort((x, y) => (y.score || 0) - (x.score || 0));
    localStorage.setItem(SCORES_KEY, JSON.stringify(a.slice(0, 10)));
  } catch (e) { /* no storage (private mode) — the run still ends normally */ }
}
// single source of truth for touch detection (select hints, control hints, finisher wording, zoom-fill)
const isCoarsePointer = () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
// select-screen bottom hint — touch uses the on-screen D-pad (◀▶▲▼ + OK), not a keyboard's arrows/ENTER
const SELECT_HINT = (scene, fighterPhase) => scene.isTouch
  ? (fighterPhase ? '◀ ▶ select   ▲▼ mode   OK confirm' : '◀ ▶ stage   OK fight')
  : (fighterPhase ? '<  >  select      ENTER  confirm' : '<  >  stage      ENTER  fight');

/* =========================================================================
   BOOT — load every fighter atlas + every stage once, then go to Select.
   ========================================================================= */
function bootPreload() {
  for (const f of ROSTER) this.load.spritesheet(f.key, `/game/sprites/${f.key}_atlas.png`, { frameWidth: CELL_W, frameHeight: CELL_H });
  for (const s of STAGES) this.load.image(`stage_${s.key}`, `/game/stages/${s.key}.png`);
  for (const a of SOUNDS) this.load.audio(`snd_${a}`, `/game/audio/${a}.mp3`);
}
function bootCreate() { this.scene.start('select'); }

/* =========================================================================
   SELECT — pick a fighter, then a stage; opponent is a random other fighter.
   ========================================================================= */
function selectCreate() {
  this.add.rectangle(0, 0, GAME_W, GAME_H, K_STAGE_HEX).setOrigin(0, 0);
  this.add.image(GAME_W / 2, GAME_H / 2, 'stage_b2b-saas').setDisplaySize(GAME_W, GAME_H).setAlpha(0.18);

  this.phase = 'fighter';
  this.fi = 2; // default: the highlighted landing fighter
  this.fi2 = 3; // P2's pick (2P modes)
  this.si = 3;
  this.mi = 0; // mode index into MODES
  this.isTouch = isCoarsePointer();

  this.title = txt(this, GAME_W / 2, 22, 'CHOOSE YOUR FIGHTER', 15, K_GOLD);
  this.modeLabel = txt(this, GAME_W / 2, 8, '', 7, K_HUD_CYAN);
  this.sub = txt(this, GAME_W / 2, GAME_H - 16, SELECT_HINT(this, true), 8, K_HUD_CYAN);

  // fighter row
  this.picks = ROSTER.map((f, i) => {
    const x = 60 + i * 90;
    const s = this.add.sprite(x, 186, f.key, POSE.idle).setOrigin(0.5, 1).setScale(0.8);
    const box = this.add.rectangle(x, 130, 78, 128, f.color, 0).setStrokeStyle(2, f.color, 0).setOrigin(0.5, 0.5);
    return { s, box, x };
  });
  this.nameLabel = txt(this, GAME_W / 2, 208, '', 11, K_WHITE);
  this.styleLabel = txt(this, GAME_W / 2, 219, '', 9, K_GOLD);
  this.statG = this.add.graphics().setDepth(6);
  this.statLabels = [
    txt(this, 150, 232, 'PWR', 7, K_HUD_STEEL, 1, 0.5),
    txt(this, 224, 232, 'SPD', 7, K_HUD_STEEL, 1, 0.5),
    txt(this, 296, 232, 'HP', 7, K_HUD_STEEL, 1, 0.5),
  ];

  // stage strip (hidden until fighter chosen)
  this.stageImgs = STAGES.map((st, i) => {
    const x = 66 + i * 116;
    const img = this.add.image(x, 150, `stage_${st.key}`).setDisplaySize(104, 58).setVisible(false);
    const box = this.add.rectangle(x, 150, 104, 58, K_WHITE_HEX, 0).setStrokeStyle(2, K_GOLD_HEX, 0).setVisible(false);
    return { img, box, x };
  });

  const navProp = () => (this.phase === 'fighter' ? 'fi' : this.phase === 'fighter2' ? 'fi2' : 'si');
  const navMax = () => (this.phase === 'stage' ? 4 : 5);
  const move = (d) => { const p = navProp(); this[p] = (this[p] + d + navMax()) % navMax(); refresh(this); };
  this.input.keyboard.on('keydown-LEFT', () => move(-1));
  this.input.keyboard.on('keydown-RIGHT', () => move(1));
  this.input.keyboard.on('keydown-A', () => { if (this.phase !== 'fighter2') move(-1); }); // A/D are P1's move keys in 2P select
  this.input.keyboard.on('keydown-D', () => { if (this.phase !== 'fighter2') move(1); });
  // cycle modes; on touch skip 2P + SUDDEN DEATH (one on-screen pad can't drive two fighters, so
  // they're literally unplayable on a phone). vs + gauntlet always remain, so this never loops forever.
  const playableMode = (i) => !this.isTouch || (MODES[i].key !== 'p2' && MODES[i].key !== 'sudden');
  const toggleMode = (d) => {
    if (this.phase !== 'fighter') return;
    do { this.mi = (this.mi + d + MODES.length) % MODES.length; } while (!playableMode(this.mi));
    snd(this, 'snd_confirm', 0.4); refresh(this);
  };
  this.input.keyboard.on('keydown-UP', () => toggleMode(-1));
  this.input.keyboard.on('keydown-DOWN', () => toggleMode(1));
  this.input.keyboard.on('keydown-W', () => toggleMode(-1));
  this.input.keyboard.on('keydown-S', () => toggleMode(1));
  const confirm = () => {
    snd(this, 'snd_confirm', 0.5);
    const mode = MODES[this.mi].key, twoP = mode === 'p2' || mode === 'sudden';
    if (this.phase === 'fighter') { this.phase = twoP ? 'fighter2' : 'stage'; refresh(this); }
    else if (this.phase === 'fighter2') { this.phase = 'stage'; refresh(this); }
    else if (mode === 'gauntlet') {
      this.scene.start('fight', { playerKey: ROSTER[this.fi].key, stageKey: STAGES[this.si].key, mode: 'gauntlet', rung: 0, gauntletOpps: gauntletSequence(ROSTER[this.fi].key) });
    } else if (twoP) {
      this.scene.start('fight', { playerKey: ROSTER[this.fi].key, oppKey: ROSTER[this.fi2].key, stageKey: STAGES[this.si].key, mode });
    } else {
      const opp = ROSTER[(this.fi + 1 + Math.floor(Math.random() * (ROSTER.length - 1))) % ROSTER.length].key;
      this.scene.start('fight', { playerKey: ROSTER[this.fi].key, oppKey: opp, stageKey: STAGES[this.si].key });
    }
  };
  this.input.keyboard.on('keydown-ENTER', confirm);
  this.input.keyboard.on('keydown-SPACE', confirm);

  // idle attract: leave the select screen untouched for ~9s and the GAUNTLET high-score
  // table surfaces over it (classic cabinet attract loop). ANY input clears it — the same
  // press also acts on the select screen underneath, which is exactly how arcades behave.
  this.idleT = 0; this.hs = null;
  const resetIdle = () => { this.idleT = 0; if (this.hs) { this.hs.forEach((o) => o.destroy()); this.hs = null; } };
  this.input.keyboard.on('keydown', resetIdle);
  this.input.on('pointerdown', resetIdle);

  refresh(this);
  emitScene('select');
}
// select-scene update exists ONLY for the idle timer — everything else is event-driven.
function selectUpdate(time, delta) {
  if (this.hs) return;                       // table is up; resetIdle tears it down on input
  // While GameChrome has an overlay up it disables Phaser's keyboard AND eats all
  // pointer events — resetIdle can never fire, so idling here would arm the HIGH
  // SCORES wall behind the title screen and ambush the player's first ENTER.
  if (!this.input.keyboard.enabled) { this.idleT = 0; return; }
  this.idleT += delta;
  if (this.idleT < 9000) return;
  const scores = loadScores();
  if (!scores.length) { this.idleT = 0; return; } // nothing to brag about yet — re-arm and wait
  const rows = scores.map((s, i) => `${String(i + 1).padStart(2, ' ')}  ${(s.initials || '???').slice(0, 3).padEnd(3, ' ')}  ${String(s.score || 0).padStart(6, ' ')}`);
  this.hs = [
    this.add.rectangle(0, 0, GAME_W, GAME_H, K_STAGE_HEX, 0.88).setOrigin(0, 0).setDepth(90),
    txt(this, GAME_W / 2, 34, 'HIGH SCORES', 15, K_GOLD).setDepth(91),
    // one text object for all rows — Press Start 2P is monospaced, so padStart columns align
    this.add.text(GAME_W / 2, 58, rows.join('\n'), { fontFamily: FONT_FAMILY, fontSize: '8px', color: K_HUD_FROST, align: 'center', lineSpacing: 6, stroke: K_BLACK, strokeThickness: 3 })
      .setOrigin(0.5, 0).setResolution(3).setDepth(91),
    txt(this, GAME_W / 2, GAME_H - 14, 'SURVIVE THE GAUNTLET TO ENTER', 7, K_HUD_CYAN).setDepth(91),
  ];
}
function refresh(scene) {
  const p1 = scene.phase === 'fighter', p2 = scene.phase === 'fighter2', fighterPhase = p1 || p2;
  const idx = p2 ? scene.fi2 : scene.fi;
  const modeKey = MODES[scene.mi].key;
  scene.title.setText(p1 ? 'CHOOSE YOUR FIGHTER' : p2 ? 'PLAYER 2  CHOOSE' : 'CHOOSE STAGE');
  scene.modeLabel.setText(p1 ? `MODE:  ${MODES[scene.mi].label}   ▲▼` : '')
    .setColor(modeKey === 'gauntlet' ? K_HUD_GREEN : modeKey === 'vs' ? K_HUD_CYAN : K_GOLD);
  scene.picks.forEach((p, i) => {
    const on = fighterPhase && i === idx;
    p.s.setVisible(fighterPhase).setAlpha(on ? 1 : 0.45).setScale(on ? 0.92 : 0.8);
    p.box.setVisible(fighterPhase).setStrokeStyle(2, p2 ? K_HUD_RED_HEX : ROSTER[i].color, on ? 1 : 0);
  });
  scene.stageImgs.forEach((s, i) => {
    s.img.setVisible(!fighterPhase).setAlpha(i === scene.si ? 1 : 0.5);
    s.box.setVisible(!fighterPhase).setStrokeStyle(2, K_GOLD_HEX, i === scene.si ? 1 : 0);
  });
  scene.nameLabel.setText(fighterPhase ? ROSTER[idx].name : STAGES[scene.si].name)
    .setColor(p2 ? '#ff8fa3' : fighterPhase ? K_WHITE : K_GOLD);
  scene.sub.setText(SELECT_HINT(scene, fighterPhase));
  drawStats(scene, idx);
}
function drawStats(scene, idx) {
  const g = scene.statG; g.clear();
  const show = scene.phase === 'fighter' || scene.phase === 'fighter2';
  scene.styleLabel.setVisible(show);
  scene.statLabels.forEach((l) => l.setVisible(show));
  if (!show) return;
  const f = ROSTER[idx];
  scene.styleLabel.setText(f.style).setColor('#' + f.color.toString(16).padStart(6, '0'));
  const clamp = (v) => Math.max(0.06, Math.min(1, v));
  const vals = [
    clamp((f.dmg - 0.82) / 0.52),                                   // PWR
    clamp(((f.speed - 78) / 50 + (f.atkSpeed - 0.78) / 0.46) / 2),  // SPD
    clamp((f.hp - 82) / 44),                                        // HP
  ];
  const barX = [154, 228, 300], bw = 40, bh = 6, y = 229;
  vals.forEach((v, i) => {
    g.fillStyle(K_BLACK_HEX, 0.5); g.fillRect(barX[i] - 1, y - 1, bw + 2, bh + 2);
    g.fillStyle(0x2a2a34, 1); g.fillRect(barX[i], y, bw, bh);
    g.fillStyle(f.color, 1); g.fillRect(barX[i], y, Math.round(bw * v), bh);
  });
}

/* =========================================================================
   FIGHT
   ========================================================================= */
function makeFighter(scene, key, x, faceRight, isPlayer) {
  const st = ROSTER.find((r) => r.key === key);
  const spr = scene.add.sprite(x, FLOOR_Y, key, POSE.idle).setOrigin(0.5, 1).setDepth(10);
  const stam = staminaProfileFor(st.style);
  return {
    spr, isPlayer, key, stats: st, startX: x, startFace: faceRight,
    kin: { x, y: FLOOR_Y, vx: 0, vy: 0, grounded: true },
    dir: faceRight ? 1 : -1,
    action: null, hp: st.hp, hpMax: st.hp, ghostHp: st.hp, ghostDelay: 0, tookDamage: false,
    hitstun: 0, blockstun: 0, wakeBlock: 0, blocking: false, koed: false, dazed: false, pose: POSE.idle, flash: 0,
    stamina: stam.max, staminaMax: stam.max, staminaRegen: stam.regen, denyFlash: 0,
  };
}
function resetFighter(f) {
  f.kin = { x: f.startX, y: FLOOR_Y, vx: 0, vy: 0, grounded: true };
  f.dir = f.startFace ? 1 : -1;
  f.action = null; f.hp = f.hpMax; f.ghostHp = f.hpMax; f.ghostDelay = 0; f.tookDamage = false;
  f.hitstun = 0; f.blockstun = 0; f.wakeBlock = 0; f.blocking = false; f.koed = false; f.dazed = false; f.pose = POSE.idle; f.flash = 0;
  f.stamina = f.staminaMax; f.denyFlash = 0; // full stamina every round, same as a fresh HP bar
  // restore render state — a fatality (e.g. UNSUBSCRIBED fades the sprite to alpha 0) must not
  // bleed into the next round, since rematch/restart reuse the same sprite (never scene.start).
  if (f.spr) { f.spr.setAlpha(1); f.spr.clearTint(); f.spr.setScale(1); }
}

// Procedural life on the single-frame poses using INTEGER-pixel offsets only
// (never scale/rotate pixel sprites -> that reintroduces the sub-pixel mush).
function animOffset(f, clock) {
  if (f.koed) return { dx: 0, dy: 0 };
  if (f.dazed) return { dx: Math.round(Math.sin(clock * 0.006) * 2), dy: 0 };            // finish-him sway

  if (f.hitstun > 0) return { dx: Math.round(Math.sin(clock * 0.05) * 2), dy: 0 };       // shake
  if (f.action) {
    const ph = phase(ATTACK[f.action.type], f.action.e);
    return { dx: f.dir * (ph === 'active' ? 3 : ph === 'recovery' ? 1 : 0), dy: 0 };     // lunge
  }
  if (f.blocking || f.blockstun > 0) return { dx: -f.dir, dy: 0 };                        // brace
  if (!f.kin.grounded) return { dx: 0, dy: 0 };
  if (f.kin.vx !== 0) return { dx: 0, dy: -Math.round(Math.abs(Math.sin(clock * 0.014)) * 2) }; // walk bob
  return { dx: 0, dy: -Math.round(Math.sin(clock * 0.003) * 0.5 + 0.5) };                 // idle breathe
}

function fightInit(data) {
  data = data || {};
  this.playerKey = data.playerKey || 'fighter3';
  this.stageKey = data.stageKey || 'enterprise';
  this.mode = data.mode || 'vs';
  this.rung = data.rung || 0;
  this.gauntletOpps = data.gauntletOpps || [];
  this.boss = this.mode === 'gauntlet' && this.rung >= this.gauntletOpps.length;
  this.oppKey = data.oppKey || (this.mode === 'gauntlet' ? (this.boss ? BOSS.atlas : this.gauntletOpps[this.rung]) : 'fighter5');
  this.versus = this.mode === 'p2' || this.mode === 'sudden'; // local 2-player (P2 controls the opponent)
  this.suddenDeath = this.mode === 'sudden';                  // one clean hit ends the round
  this.roundsToWin = this.suddenDeath ? 3 : ROUNDS_TO_WIN;
}
function fightCreate() {
  this.add.image(0, 0, `stage_${this.stageKey}`).setOrigin(0, 0).setDisplaySize(GAME_W, GAME_H).setDepth(0);
  setupArenaFx(this); // ambient per-arena gimmick layer (between the backdrop and the fighters)

  this.p = makeFighter(this, this.playerKey, 150, true, true);
  this.o = makeFighter(this, this.oppKey, 330, false, false);
  if (this.boss) { // THE ALGORITHM: buffed stats over the base atlas
    this.o.stats = { key: BOSS.atlas, name: BOSS.name, color: BOSS.color, style: 'HEAVY', hp: BOSS.hp, speed: BOSS.speed, dmg: BOSS.dmg, reach: BOSS.reach, atkSpeed: BOSS.atkSpeed };
    this.o.hp = this.o.hpMax = BOSS.hp;
    this.o.stamina = this.o.staminaMax = BOSS_STAMINA.max; this.o.staminaRegen = BOSS_STAMINA.regen;
  }

  this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,A,D,W,SPACE,J,K,L,S,DOWN,R,ESC,ENTER,F,G,H');
  // Un-capture ENTER/SPACE: addKeys preventDefaults them window-wide, which silently
  // kills keyboard activation of the focused DOM buttons in GameChrome's result bar
  // (SHARE, CHANGE FIGHTER). The game still reads both keys fine without capture,
  // and /play's layout is fixed-viewport so SPACE has no page to scroll.
  this.input.keyboard.removeCapture('ENTER,SPACE');
  // one input per human: solo = the roomy combined mapping; 2P = P1 left cluster, P2 arrows/JKL
  this.humanInputs = this.versus
    ? [{ f: this.p, ks: KEYSET_P1, buf: null, down: {} }, { f: this.o, ks: KEYSET_P2, buf: null, down: {} }]
    : [{ f: this.p, ks: KEYSET_SOLO, buf: null, down: {} }];
  this.isTouch = isCoarsePointer();
  this._acc = 0;
  this.paused = false;
  this.hitstop = 0;
  this.slowmoT = 0;
  this._frozenDef = null;
  this.animClock = 0;
  // aiProfile is set by startRound (round 1, always true on a fresh create) — its single source of
  // truth; nothing reads it before then, so don't compute a second one here.
  this.aiTimer = 700; this.aiBlock = 0; this.aiJumpTimer = 900;
  this.pWins = 0; this.oWins = 0; this.round = 1;
  this.playerDmgMult = 1; this.shadowbanT = this.boss ? 9000 : 0; this.shadowbanActive = 0;
  this.combo = { owner: null, n: 0, t: 0 };
  this.lastWinBlow = null; // how the player's match-deciding blow landed (feeds the "-ALITY" title)
  this._advLock = 0;       // ms lock so the ENTER that confirms initials can't also fire matchendAdvance
  this._initials = null;   // live initials-entry UI (see startInitials)

  this.ui = this.add.graphics().setDepth(40);
  const pName = ROSTER.find((r) => r.key === this.playerKey).name;
  const oName = this.boss ? BOSS.name : ROSTER.find((r) => r.key === this.oppKey).name;
  txt(this, 12, 28, pName, 8, K_HUD_FROST, 0, 0);
  txt(this, GAME_W - 12, 28, oName, 8, this.boss ? K_HUD_GREEN : K_HUD_FROST, 1, 0);
  if (this.mode === 'gauntlet') txt(this, GAME_W / 2, 40, this.boss ? 'FINAL BOSS' : `GAUNTLET  ${this.rung + 1} / 5`, 7, K_HUD_GREEN, 0.5, 0);
  txt(this, GAME_W / 2, GAME_H - 4,
    this.versus ? 'P1  WASD + FGH          P2  ARROWS + JKL'
      : this.isTouch ? 'J K L  attack     DOWN  block     UP  jump'
      : 'WASD move   J punch   K kick   L special   S block',
    8, '#5f93aa', 0.5, 1);

  this.banner = txt(this, GAME_W / 2, 108, '', 24, K_GOLD).setDepth(60).setVisible(false);
  this.result = txt(this, GAME_W / 2, 104, '', 20, K_GOLD).setDepth(60).setVisible(false);
  this.comboText = txt(this, GAME_W / 2, 62, '', 12, K_GOLD).setDepth(58).setVisible(false);
  this.timerText = txt(this, GAME_W / 2, 19, '', 13, K_GOLD).setDepth(41).setVisible(false); // round clock, centered between the HP bars

  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') window.__fight = this; // dev debug handle

  // GameChrome (React overlay) drives the escape hatches via window events so touch
  // and desktop share one set. Pause is a bare early-return in fightUpdate; the delta
  // clamps there already stop any resume fast-forward.
  // Real pause: freeze the Clock (this.time.paused stops the KO-cinematic delayedCalls that would
  // auto-advance the round behind the menu), the TweenManager and the SoundManager — done via direct
  // scene APIs, NOT this.scene.pause()/resume(), whose no-key ScenePlugin form silently no-ops here.
  // fightUpdate also early-returns on this.paused, and applyKb resetKeys on resume (no stuck keys).
  // Key resume off our own flag: restart/menu can fire from the result screen where we never paused.
  const unpause = () => { if (this.paused) { this.time.paused = false; this.tweens.resumeAll(); this.sound.resumeAll(); } this.paused = false; this._acc = 0; };
  const chrome = {
    [MK.PAUSE]: () => { this.paused = true; this.time.paused = true; this.tweens.pauseAll(); this.sound.pauseAll(); },
    [MK.RESUME]: () => { unpause(); },
    [MK.RESTART]: () => { unpause(); this.pWins = this.oWins = 0; this.round = 1; startRound(this); },
    [MK.MENU]: () => { unpause(); emitResult(null); this.scene.start('select'); },
    [MK.CONFIRM]: () => matchendAdvance(this),   // result-screen primary button (Rematch / Next / Roster)
  };
  for (const ev in chrome) window.addEventListener(ev, chrome[ev]);
  // Clean up on BOTH events: scene transitions emit 'shutdown', but game.destroy(true) on unmount
  // emits only 'destroy' (never 'shutdown') — binding only to shutdown would leak all five window
  // listeners (each pinning the destroyed scene) on every unmount / Fast-Refresh.
  const cleanupChrome = () => { for (const ev in chrome) window.removeEventListener(ev, chrome[ev]); };
  this.events.once('shutdown', cleanupChrome);
  this.events.once('destroy', cleanupChrome);
  emitScene('fight');

  startRound(this);
}

function startRound(scene) {
  // purge match/round-boundary state that the reused scene would otherwise carry over:
  // stale KO-cinematic timers (a pending round++ would double-fire), a lingering fatality
  // fade tween (would re-hide the sprite), and any leaked G.D.P.R. consent cards.
  scene.time.removeAllEvents();
  scene.tweens.killTweensOf([scene.p.spr, scene.o.spr]);
  if (scene._gdprCards) { scene._gdprCards.forEach((o) => o.destroy()); scene._gdprCards = null; }
  // a RESTART can land mid-intro or over the initials entry — tear both down cleanly
  destroyIntroCard(scene);
  if (scene._initials) { scene._initials.off(); scene._initials.objs.forEach((o) => o.destroy()); scene._initials = null; }
  resetFighter(scene.p); resetFighter(scene.o);
  // fresh match (round 1, incl. after a rematch) -> restore the baseline CPU difficulty
  // the per-round rubber band adapts away from.
  if (scene.round === 1) scene.aiProfile = baseAiProfile(scene); // fresh match -> baseline archetype/boss behaviour
  scene.aiTimer = 700; scene.aiBlock = 0; scene.aiJumpTimer = 900; scene.hitstop = 0; scene.slowmoT = 0; scene._frozenDef = null;
  scene.playerDmgMult = 1; scene.shadowbanActive = 0; scene.shadowbanT = scene.boss ? 9000 : 0;
  scene.hideLoserBar = null;
  scene.roundClock = ROUND_TIME * 1000;
  scene.suddenDeath = scene.mode === 'sudden'; // reset the tie-break flag to the mode default each round
  scene.combo = { owner: null, n: 0, t: 0 };
  if (scene.comboText) scene.comboText.setVisible(false);
  if (scene.darken) { scene.darken.destroy(); scene.darken = null; }
  if (scene.finPrompt) { scene.finPrompt.destroy(); scene.finPrompt = null; }
  const cam = scene.cameras.main; cam.setZoom(1); cam.centerOn(GAME_W / 2, GAME_H / 2); // undo any KO punch-in
  scene.result.setVisible(false);
  emitResult(null);
  // ENTERPRISE gimmick: the ambient light warms a notch every round (a static per-round
  // tint, not an animation, so it needs no Reduce Motion branch).
  if (scene.arenaFx && scene.arenaFx.warm) scene.arenaFx.warm.setAlpha(Math.min(0.11, (scene.round - 1) * 0.045));
  scene.phase = 'intro'; scene.introT = INTRO_T; scene.fightSaid = false;
  scene._introSkipHeld = true; // assume ENTER/SPACE is held from the previous screen until seen released
  // arena-branded ROUND intro: arena name + its case mission slide in (steps(), integer x)
  // above the ROUND N banner; any attack/confirm press skips straight to the FIGHT! beat.
  buildIntroCard(scene);
  // reset text AND color/y: the banner object is shared, and the previous user (FIGHT! /
  // SHADOWBANNED / an "-ALITY" title) may have left it red/green or vertically displaced.
  scene.banner.setText(`ROUND ${scene.round}`).setColor(K_GOLD).setY(108).setVisible(true);
  snd(scene, `snd_round${Math.min(scene.round, 3)}`, 0.9);
}

/* ---- ROUND intro card — the arena + mission, pixel-typeset, quantized slide-in ---- */
function buildIntroCard(scene) {
  destroyIntroCard(scene);
  const st = STAGES.find((s) => s.key === scene.stageKey);
  scene.introCard = {
    name: txt(scene, GAME_W / 2, 64, (st ? st.name : '').toUpperCase() + ' ARENA', 13, K_WHITE).setDepth(60),
    mission: txt(scene, GAME_W / 2, 86, MISSIONS[scene.stageKey] || '', 7, K_HUD_CYAN).setDepth(60),
  };
  positionIntroCard(scene); // place immediately (off-screen, or centered under Reduce Motion)
}
function destroyIntroCard(scene) {
  if (!scene.introCard) return;
  scene.introCard.name.destroy(); scene.introCard.mission.destroy(); scene.introCard = null;
}
// steps() slide: 6 discrete 40ms hops from off-screen to center — never a smooth glide
// (sub-pixel motion reads as mush at 480x270). Reduce Motion pins both lines in place.
function positionIntroCard(scene) {
  const c = scene.introCard; if (!c) return;
  const q = reducedMotion() ? 1 : Math.min(6, Math.floor((INTRO_T - scene.introT) / 40)) / 6;
  c.name.x = Math.round(-160 + (GAME_W / 2 + 160) * q);              // arena name from the left
  c.mission.x = Math.round(GAME_W + 160 - (GAME_W / 2 + 160) * q);   // mission from the right
}

/* boxes */
function hurtbox(f) { const { x, y } = f.kin; return { x0: x - HURT.dx, x1: x + HURT.dx, y0: y - HURT.top, y1: y - HURT.bottom }; }
function hitbox(f) {
  const a = ATTACK[f.action.type];
  const front = f.kin.x + f.dir * HURT.dx, tip = front + f.dir * a.reach * f.stats.reach;
  return { x0: Math.min(front, tip), x1: Math.max(front, tip), y0: f.kin.y - a.hy[1], y1: f.kin.y - a.hy[0] };
}
const overlap = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
function phase(a, e) { return e < a.startup ? 'startup' : e < a.startup + a.active ? 'active' : 'recovery'; }

function integrate(f, dt) {
  const k = f.kin;
  k.vy += GRAVITY * dt; k.x += k.vx * dt; k.y += k.vy * dt;
  if (k.x < X_MIN) k.x = X_MIN;
  if (k.x > X_MAX) k.x = X_MAX;
  if (k.y >= FLOOR_Y) { k.y = FLOOR_Y; k.vy = 0; k.grounded = true; }
  // sprite position is owned solely by the render loop in tick() (kin + animOffset); it runs the
  // same frame and overwrites any spr.x/y set here, and collision reads kin — so don't touch spr.
}

// keep the fighters' bodies from walking through each other (they'd overlap and
// look like one vanished). Push apart to a minimum separation.
const BODY_SEP = 56;
function separate(a, b) {
  if (a.koed || b.koed) return; // leave the KO tableau as it fell (no standing on the corpse)
  if (!a.kin.grounded || !b.kin.grounded) return; // airborne fighters pass over each other -> jump is a real corner escape / cross-up
  const dx = b.kin.x - a.kin.x, gap = Math.abs(dx);
  if (gap >= BODY_SEP) return;
  const push = (BODY_SEP - gap) / 2, sign = dx >= 0 ? 1 : -1;
  a.kin.x = Math.max(X_MIN, Math.min(X_MAX, a.kin.x - sign * push));
  b.kin.x = Math.max(X_MIN, Math.min(X_MAX, b.kin.x + sign * push));
  // (no spr writes — the render loop owns sprite position; see integrate)
}

function control(f, intent, dtMs) {
  f.blocking = false;
  // stamina regen pauses only while an attack is actually playing out — mid-swing you're
  // spending the pool you already committed, not refilling it. Runs even in hitstun/blockstun
  // (getting hit doesn't tire you out further) so a defensive beat is also a recovery beat.
  if (!f.action) f.stamina = Math.min(f.staminaMax, f.stamina + f.staminaRegen * dtMs / 1000);
  if (f.denyFlash > 0) f.denyFlash -= dtMs;
  if (f.koed) { f.pose = POSE.ko; f.kin.vx *= 0.90; return; } // decay (not zero) so the KO launch arc plays out
  if (f.dazed) { f.pose = POSE.hit; f.kin.vx = 0; return; }    // finish-him: standing but defenceless
  if (f.hitstun > 0) { f.hitstun -= dtMs; if (f.hitstun <= 0 && !f.isPlayer) f.wakeBlock = 200; f.kin.vx *= 0.82; f.pose = POSE.hit; return; } // wakeBlock is read only by aiIntent (the CPU), so seed it only there
  if (f.action) {
    // telegraphed wind-up (readable big move): hold the pose without advancing the
    // attack so a watchful player can react/block/punish before it goes active.
    if (f.action.windup > 0) { f.action.windup -= dtMs; f.kin.vx = 0; f.pose = ATTACK[f.action.type].pose; return; }
    f.action.e += dtMs * f.stats.atkSpeed; f.kin.vx = 0; f.pose = ATTACK[f.action.type].pose;
    if (f.action.e >= ATTACK[f.action.type].total) f.action = null;
    return;
  }
  if (f.blockstun > 0) { f.blockstun -= dtMs; f.kin.vx *= 0.82; f.pose = POSE.block; f.blocking = true; return; }
  if (f.kin.grounded && intent.atk) {
    const a = ATTACK[intent.atk];
    if (f.stamina >= a.cost) {
      f.stamina -= a.cost;
      f.action = { type: intent.atk, e: 0, hasHit: false, windup: intent.telegraph || 0 };
      f.kin.vx = 0; f.pose = a.pose;
      return;
    }
    f.denyFlash = 220; // gassed — no swing this tick, falls through to block/movement below
  } else if (!f.kin.grounded && intent.atk) {
    const a = ATTACK.jumpkick; // reuses the KICK sprite frame — no new art for 6 rosters + boss
    if (f.stamina >= a.cost) {
      f.stamina -= a.cost;
      f.action = { type: 'jumpkick', e: 0, hasHit: false, windup: 0 };
      f.pose = a.pose; // vx untouched: a jump attack keeps the jump's own horizontal drift
      return;
    }
    f.denyFlash = 220;
  }
  if (intent.block && f.kin.grounded) { f.blocking = true; f.kin.vx = 0; f.pose = POSE.block; return; }
  f.kin.vx = (intent.right ? f.stats.speed : 0) - (intent.left ? f.stats.speed : 0);
  if (intent.jump && f.kin.grounded) { f.kin.vy = JUMP_V; f.kin.grounded = false; }
  f.pose = !f.kin.grounded ? POSE.jump : (f.kin.vx !== 0 ? POSE.walk : POSE.idle);
}

function keyDown(scene, spec) {
  if (Array.isArray(spec)) { for (const kn of spec) { const k = scene.keys[kn]; if (k && k.isDown) return true; } return false; }
  const k = scene.keys[spec]; return !!(k && k.isDown);
}
// Edge-detect EACH human's attack keys into that input's own buffer every frame (incl.
// during hitstop, when the tick loop is paused) so a press made a few frames early — or
// right after a hit — still fires on the first actionable tick instead of being eaten.
function sampleAttackBuffer(scene, dtMs) {
  if (!scene.keys || !scene.humanInputs) return;
  for (const inp of scene.humanInputs) {
    const edge = (n, keyName) => { const k = scene.keys[keyName]; const d = !!(k && k.isDown); const jp = d && !inp.down[n]; inp.down[n] = d; return jp; };
    const jP = edge('p', inp.ks.punch), jK = edge('k', inp.ks.kick), jL = edge('s', inp.ks.special);
    const fresh = jP ? 'punch' : jK ? 'kick' : jL ? 'special' : null;
    if (fresh) inp.buf = { type: fresh, t: BUFFER_MS };
    else if (inp.buf) { inp.buf.t -= dtMs; if (inp.buf.t <= 0) inp.buf = null; }
  }
}
function intentFrom(scene, inp) {
  const ks = inp.ks;
  return {
    left: keyDown(scene, ks.left), right: keyDown(scene, ks.right),
    jump: keyDown(scene, ks.jump), block: keyDown(scene, ks.block),
    atk: inp.buf ? inp.buf.type : null,
  };
}
// Punch-Out-school AI: each archetype is a distinct, readable personality with its
// own exploit, instead of one RNG-timer brain in five costumes. rubber band mutates a
// per-fight CLONE of these (see endRound), reset to baseline each match in startRound.
//   wantDist>0 = a spacer that retreats to that gap; tell>0 = special has a visible
//   charge-up (gold blink + pause) you can react to / punish.
// Moderate difficulty pass over every profile (tighter timers, better blocking, a
// touch more aggression) plus a new jumpChance — how often the CPU throws in a
// forward hop while approaching (see aiIntent's maybeJump). HEAVY barely leaves the
// ground on purpose; ASSASSIN/RUSHDOWN use it as their mobility identity.
const AI_PROFILES = {
  //           block  wake  minDly maxDly aggr  wantDist retreat specialBias tell  jump
  ZONER:       { blockChance: 0.33, wake: 0.24, minDelay: 380, maxDelay: 860,  aggression: 0.61, wantDist: 132, retreat: 0.6,  specialBias: 0.7,  tell: 0,   jumpChance: 0.07 },   // keeps range, pokes special; corner it to win
  RUSHDOWN:    { blockChance: 0.17, wake: 0.18, minDelay: 270, maxDelay: 600,  aggression: 0.98, wantDist: 0,   retreat: 0.0,  specialBias: 0.12, tell: 0,   jumpChance: 0.16 },   // never retreats, barely blocks; block + punish its over-commit
  'ALL-ROUND': { blockChance: 0.32, wake: 0.26, minDelay: 450, maxDelay: 940,  aggression: 0.72, wantDist: 0,   retreat: 0.05, specialBias: 0.40, tell: 0,   jumpChance: 0.11 },   // the fair fight
  HEAVY:       { blockChance: 0.50, wake: 0.32, minDelay: 540, maxDelay: 1080, aggression: 0.66, wantDist: 0,   retreat: 0.0,  specialBias: 0.50, tell: 260, jumpChance: 0.04 },   // tanky wall + telegraphed big special; bait it, punish recovery
  ASSASSIN:    { blockChance: 0.23, wake: 0.20, minDelay: 240, maxDelay: 550,  aggression: 0.95, wantDist: 70,  retreat: 0.4,  specialBias: 0.28, tell: 0,   jumpChance: 0.18 },   // fast hit-and-run, 84hp; one counter melts it
};
function aiProfileFor(key) {
  const st = ROSTER.find((r) => r.key === key);
  return { ...(AI_PROFILES[st && st.style] || AI_PROFILES['ALL-ROUND']) };
}
// The base CPU profile for a fight: boss brain for THE ALGORITHM, else the archetype
// profile bumped a little per gauntlet rung so the ladder escalates.
function baseAiProfile(scene) {
  if (scene.boss) return { blockChance: 0.5, wake: 0.32, minDelay: 360, maxDelay: 760, aggression: 0.95, wantDist: 0, retreat: 0.0, specialBias: 0.5, tell: 240, jumpChance: 0.14 };
  const p = aiProfileFor(scene.oppKey);
  if (scene.mode === 'gauntlet') {
    p.aggression = Math.min(1, p.aggression + scene.rung * 0.05);
    p.blockChance = Math.min(0.6, p.blockChance + scene.rung * 0.03);
    p.minDelay = Math.max(280, p.minDelay - scene.rung * 25);
    p.jumpChance = Math.min(0.3, p.jumpChance + scene.rung * 0.02);
  }
  return p;
}
function aiIntent(scene, o, p, dtMs) {
  const intent = { left: false, right: false, jump: false, block: false, atk: null };
  if (o.koed || o.hitstun > 0 || o.action) return intent;
  const P = scene.aiProfile, dist = Math.abs(p.kin.x - o.kin.x);
  const toward = p.kin.x < o.kin.x ? 'left' : 'right', away = toward === 'left' ? 'right' : 'left';
  const punchR = 44 + ATTACK.punch.reach * o.stats.reach;      // ~103-113px
  const specR = 44 + ATTACK.special.reach * o.stats.reach;     // ~146-164px
  const setAtk = (t) => {
    scene.aiTimer = P.minDelay + Math.random() * (P.maxDelay - P.minDelay);
    intent.atk = t; if (t === 'special' && P.tell) intent.telegraph = P.tell;
  };

  // wake-up guard: briefly defend right after eating a hit so point-blank / corner
  // loops aren't a free, skill-less win against the CPU.
  if (o.wakeBlock > 0) {
    o.wakeBlock -= dtMs;
    if (p.action && dist < 130 && Math.random() < P.wake) { intent.block = true; return intent; }
  }
  // reactive block vs a committed player attack (rolled once per attack)
  if (scene.aiBlock > 0) { scene.aiBlock -= dtMs; intent.block = true; return intent; }
  if (p.action && !p.action.aiSaw && dist < 130) {
    p.action.aiSaw = true;
    if (Math.random() < P.blockChance) { scene.aiBlock = 240; intent.block = true; return intent; }
  }
  // whiff-punish: the player's move already missed its window (blocked, or simply never
  // reached anyone) and is just sitting in recovery, still in range — a free counter, the
  // same lesson a human opponent would teach. Bypasses the normal aiTimer cooldown (this
  // is a reaction, not a scheduled decision); stamina still gates it same as any attack.
  if (p.action && !p.action.aiPunished && dist <= punchR && phase(ATTACK[p.action.type], p.action.e) === 'recovery') {
    p.action.aiPunished = true;
    if (Math.random() < P.aggression) { setAtk(Math.random() < 0.6 ? 'punch' : 'kick'); return intent; }
  }

  scene.aiTimer -= dtMs;
  scene.aiJumpTimer -= dtMs;
  const ready = scene.aiTimer <= 0;
  // forward hop while approaching: gated by its own cooldown (900-1800ms between hops)
  // so a low jumpChance reads as "rare", not a per-tick coin flip. On a miss the retry is
  // quick (150ms) rather than instant, so it still resolves within roughly one cooldown
  // window on average instead of firing the very instant the cooldown clears.
  const maybeJump = () => {
    if (scene.aiJumpTimer > 0) return;
    if (Math.random() < P.jumpChance) { intent.jump = true; scene.aiJumpTimer = 900 + Math.random() * 900; }
    else scene.aiJumpTimer = 150;
  };

  // spacer: if the player is inside my comfort gap and I'm not cornered, back off
  // (poking special while I retreat) to re-establish the distance
  if (P.wantDist > punchR && dist < P.wantDist && Math.random() < P.retreat) {
    const atWall = away === 'left' ? o.kin.x <= X_MIN + 6 : o.kin.x >= X_MAX - 6;
    if (!atWall) {
      intent[away] = true;
      if (ready && dist <= specR && Math.random() < P.specialBias) setAtk('special');
      return intent;
    }
  }

  if (dist <= punchR) {                                          // close: punch/kick pressure
    if (ready && Math.random() < P.aggression) { setAtk(Math.random() < 0.6 ? 'punch' : 'kick'); return intent; }
    if (dist < 40 && Math.random() < P.retreat * 0.4) intent[away] = true;
    return intent;
  }
  if (dist <= specR) {                                           // mid: poke special or close in
    if (ready && Math.random() < P.specialBias) { setAtk('special'); return intent; }
    intent[toward] = true;
    maybeJump();
    return intent;
  }
  intent[toward] = true;                                         // far: approach
  maybeJump();
  return intent;
}

/* juice — 2x2/3x3 rect shards (never anti-aliased circles: those break the pixel grid
   at 480x270) fanning out from the contact point, plus a chunky white starburst core. */
function spawnSpark(scene, x, y, color, big) {
  const n = big ? 16 : 7, sz = big ? 3 : 2, rx = Math.round(x), ry = Math.round(y);
  for (let i = 0; i < n; i++) {
    const g = scene.add.rectangle(rx, ry, sz, sz, color).setDepth(30);
    const ang = (Math.PI * 2 * i) / n + Math.random(), d = (big ? 20 : 12) + Math.random() * 16;
    scene.tweens.add({ targets: g, x: Math.round(rx + Math.cos(ang) * d), y: Math.round(ry + Math.sin(ang) * d), alpha: 0, duration: 150 + Math.random() * 150, onComplete: () => g.destroy() });
  }
  const s = big ? 12 : 8;
  const core = scene.add.rectangle(rx, ry, s, s, K_WHITE_HEX, 0.95).setDepth(29);
  scene.time.delayedCall(big ? 70 : 45, () => core.active && core.setSize(Math.round(s * 0.55), Math.round(s * 0.55)));
  scene.tweens.add({ targets: core, alpha: 0, duration: big ? 180 : 120, onComplete: () => core.destroy() });
}
// Impact weight scales with the move: a jab taps (~5 frames), a special detonates (~11).
// `wt` (the attacker's damage multiplier, 0.85–1.32) stretches the HITSTOP further, so a
// HEAVY's special genuinely freezes longer than an ASSASSIN's — damage IS felt time.
// Both fighters and the round clock freeze for the duration: fightUpdate early-returns
// while hitstop > 0, so tick (movement, AI, clock) simply doesn't run.
function juiceHit(scene, x, y, blocked, ko, type, color, wt = 1) {
  const cam = scene.cameras.main, rm = reducedMotion();
  const base = ko ? 500 : blocked ? 50 : type === 'special' ? 180 : type === 'kick' ? 120 : 85; // timing (kept)
  scene.hitstop = ko ? base : Math.round(base * wt);
  if (!rm) { // camera shake/flash is motion — skipped under Reduce Motion
    if (ko) { cam.shake(320, 0.012); cam.flash(140, 255, 255, 255); }
    else if (blocked) cam.shake(80, 0.003);
    else if (type === 'special') cam.shake(200, 0.010);
    else if (type === 'kick') cam.shake(150, 0.007);
    else cam.shake(110, 0.005);
  }
  const c = blocked ? 0x9fd8ff : ko ? 0xffe08a : type === 'special' ? (color || K_WHITE_HEX) : K_WHITE_HEX;
  spawnSpark(scene, x, y, c, ko || type === 'special');
}

/* =========================================================================
   ARENA GIMMICKS — one cheap ambient effect per stage, pure Phaser shapes
   (no assets). Every object is created ONCE here and mutated per tick in
   updateArenaFx (no per-frame allocations); depth 4-5 sits between the
   backdrop (0) and the fighters (10). Under Reduce Motion each reduces to a
   static treatment (frozen trace / steady LEDs / constant glow) — the flavour
   stays, the flicker goes.
   ========================================================================= */
function setupArenaFx(scene) {
  const fx = scene.arenaFx = { ledT: 0 };
  if (scene.stageKey === 'healthcare') {
    fx.ekg = scene.add.graphics().setDepth(5);                 // vitals trace along the top
  } else if (scene.stageKey === 'b2b-saas') {
    // a little 2x2 rack of server LEDs; they light up when a combo connects (applyHit)
    fx.leds = [0, 1, 2, 3].map((i) => scene.add.rectangle(432 + (i % 2) * 7, 56 + Math.floor(i / 2) * 7, 3, 3, K_HUD_GREEN_HEX).setDepth(5).setAlpha(0.15));
  } else if (scene.stageKey === 'e-commerce') {
    fx.glow = scene.add.rectangle(GAME_W / 2, 124, 150, 104, 0xb08bff).setDepth(4).setAlpha(0.05).setBlendMode('ADD'); // the portal's breath
  } else if (scene.stageKey === 'enterprise') {
    fx.warm = scene.add.rectangle(0, 0, GAME_W, GAME_H, 0xff7a26).setOrigin(0, 0).setDepth(4).setAlpha(0).setBlendMode('ADD'); // per-round warming (set in startRound)
  }
}
function updateArenaFx(scene, dtMs) {
  const fx = scene.arenaFx; if (!fx) return;
  const rm = reducedMotion(), t = scene.animClock;
  if (fx.ekg) {
    // HEALTHCARE: a scrolling EKG blip that beats ~2x faster once either fighter is
    // critical (<25% HP) — the arena itself panics. Quantized y offsets on a 4px x grid.
    const low = scene.p.hp < scene.p.hpMax * 0.25 || scene.o.hp < scene.o.hpMax * 0.25;
    // scroll quantized to the same 4px grid as the sample step: the trace only
    // MOVES every ~3-4 frames, so we skip clear+rebuild on the frames in between —
    // Phaser re-tessellates a stroked Graphics path (with per-point allocations in
    // the WebGL renderer) on every redraw, and a 121-point path at 60fps is pure
    // GC churn for pixels that haven't changed. Chunkier steps also read MORE
    // arcade, not less.
    const period = low ? 56 : 104, scroll = rm ? 0 : Math.round(t * (low ? 0.16 : 0.07) / 4) * 4;
    const ekgKey = scroll * 2 + (low ? 1 : 0);
    if (fx.ekgKey !== ekgKey) {
      fx.ekgKey = ekgKey;
      const g = fx.ekg; g.clear();
      g.lineStyle(1, low ? 0xff3b30 : 0x2fe08a, low ? 0.7 : 0.45);
      g.beginPath(); g.moveTo(0, 62); // y 62: below the HUD rows (bars/pips/GAUNTLET label), above the action
      for (let x = 0; x <= GAME_W; x += 4) {
        const u = (x + scroll) % period;
        g.lineTo(x, 62 + (u < 4 ? -10 : u < 8 ? 5 : u < 12 ? -2 : 0)); // the QRS spike
      }
      g.strokePath();
    }
  }
  if (fx.leds) {
    // B2B SAAS: LEDs strobe alternately while a combo is hot, else sit dim. rm: steady glow.
    if (fx.ledT > 0) fx.ledT -= dtMs;
    const hot = fx.ledT > 0;
    for (let i = 0; i < fx.leds.length; i++) {
      fx.leds[i].setAlpha(hot ? (rm ? 0.85 : ((Math.floor(t / 70) + i) % 2 ? 1 : 0.25)) : 0.15);
    }
  }
  if (fx.glow) {
    // E-COMMERCE: the portal glow breathes in 5 quantized alpha steps (never a smooth fade)
    fx.glow.setAlpha(rm ? 0.07 : 0.03 + Math.round((Math.sin(t * 0.0011) + 1) * 2) * 0.02);
  }
  // enterprise warm tint is static per round — startRound owns it, nothing to animate here
}

function applyHit(att, def, scene) {
  const a = ATTACK[att.action.type], blocked = def.blocking;
  const dmg = a.dmg * att.stats.dmg * (att.isPlayer ? scene.playerDmgMult : 1); // shadowban halves player dmg

  if (blocked) { def.hp = Math.max(0, def.hp - Math.max(1, Math.round(dmg * 0.2))); def.blockstun = BLOCKSTUN; def.kin.vx = att.dir * PUSHBACK; }
  else { def.hp = Math.max(0, def.hp - Math.round(dmg)); def.hitstun = a.hitstun; def.action = null; def.kin.vx = att.dir * KNOCKBACK; def.flash = 90; }
  def.ghostDelay = 350;                 // ghost HP segment lingers, then melts to the new value
  def.tookDamage = true;                // flawless-round tracking
  if (scene.suddenDeath && !blocked) def.hp = 0; // one clean hit ends the round
  const ko = def.hp <= 0 && !def.koed;
  scene._frozenDef = def;               // this body buzzes ±1px during the freeze
  juiceHit(scene, (att.kin.x + def.kin.x) / 2 + att.dir * 6, def.kin.y - 92, blocked, ko, att.action.type, att.stats.color, att.stats.dmg);
  if (!blocked && att.isPlayer) buzz(25);      // haptic tick: the PLAYER landed clean
  if (ko && def.isPlayer) buzz(60);            // heavier buzz: the player just got KO'd
  if (blocked) snd(scene, 'snd_block', 0.55);
  else if (!ko) snd(scene, att.action.type === 'special' ? 'snd_special' : att.action.type === 'kick' ? 'snd_kick' : 'snd_hit', 0.6);
  if (!blocked) {
    // the marketing-satire move name floats up off the defender on every clean hit
    const nm = MOVE_NAMES[att.key] && MOVE_NAMES[att.key][att.action.type];
    if (nm) {
      const t = txt(scene, Math.round(def.kin.x), Math.round(def.kin.y - 150), nm, 6, '#ffe08a', 0.5, 1).setDepth(46);
      scene.tweens.add({ targets: t, y: t.y - 12, alpha: 0, duration: 620, delay: 130, onComplete: () => t.destroy() });
    }
    // FUNNEL combo: a hit streak owned by whoever last connected
    const owner = att.isPlayer ? 'p' : 'o';
    if (scene.combo.owner === owner && scene.combo.t > 0) scene.combo.n++;
    else { scene.combo.owner = owner; scene.combo.n = 1; }
    scene.combo.t = 1300;
    // B2B SAAS gimmick: the rack LEDs light up whenever a combo (2+) connects
    if (scene.arenaFx && scene.arenaFx.leds && scene.combo.n >= 2) scene.arenaFx.ledT = 520;
  }
  if (ko) {
    if (att.isPlayer) scene.lastWinBlow = att.action.type; // remember HOW the player closed it (feeds the "-ALITY" title)
    // Match-deciding PLAYER blow -> don't kill; leave the loser dazed and open the
    // "CLOSE THE DEAL!" finisher window (MK's FINISH HIM). Only the player gets it.
    const willWinMatch = ((att.isPlayer ? scene.pWins : scene.oWins) + 1) >= scene.roundsToWin;
    if (willWinMatch && att.isPlayer && scene.phase === 'fight' && !scene.versus) { // no finisher in 2P
      def.hp = 1;                        // survive on a sliver
      snd(scene, 'snd_kothud', 0.7);
      startFinisher(scene, att, def);
      return;
    }
    def.koed = true;
    // launch the loser instead of freezing them dead — gravity draws the arc, control()'s
    // koed branch now decays vx (no longer zeroes it) so the body flies back and flops.
    def.kin.vx = att.dir * 250; def.kin.vy = -210; def.kin.grounded = false;
    // KO cinematic: hard 500ms freeze -> slow-mo -> camera punch-in on the fallen body.
    scene.slowmoT = 850; // slow-mo is timing (kept under Reduce Motion); the camera punch-in is motion
    const cam = scene.cameras.main;
    if (!reducedMotion()) {
      cam.zoomTo(1.3, 340, 'Sine.easeOut');
      cam.pan(Math.round((att.kin.x + def.kin.x) / 2), Math.round(def.kin.y - 40), 340, 'Sine.easeOut');
    }
    snd(scene, 'snd_kothud', 0.7); // the announcer call is scheduled in endRound (it knows round-vs-match + flawless)
    endRound(scene, att.isPlayer);
  }
}

/* =========================================================================
   FINISHER — "CLOSE THE DEAL!" window + marketing FATALITY cards.
   ========================================================================= */
function startFinisher(scene, winner, loser) {
  scene.phase = 'finisher';
  scene.finWinner = winner; scene.finLoser = loser; scene.finisherT = 4200;
  winner.action = null; loser.action = null; loser.hitstun = 0; loser.dazed = true;
  scene.humanInputs[0].buf = null; // ignore the finishing press; require a fresh one to finish
  scene.darken = scene.add.rectangle(0, 0, GAME_W, GAME_H, K_BLACK_HEX, 0.55).setOrigin(0, 0).setDepth(35);
  scene.banner.setText('CLOSE THE DEAL!').setColor(K_ORANGE).setVisible(true);
  scene.finPrompt = txt(scene, GAME_W / 2, 134, scene.isTouch ? 'tap  J  K  L' : 'press  J  K  L', 8, K_GOLD).setDepth(60);
  scene.time.delayedCall(140, () => snd(scene, 'snd_closethedeal', 1));
}
function finisherTimeout(scene) {
  const loser = scene.finLoser, winner = scene.finWinner;
  loser.dazed = false; loser.koed = true;
  loser.kin.vx = winner.dir * 200; loser.kin.vy = -180; loser.kin.grounded = false;
  finishMatch(scene, winner.isPlayer);
}
function triggerFatality(scene) {
  scene.phase = 'fatality';
  const loser = scene.finLoser;
  if (scene.finPrompt) { scene.finPrompt.destroy(); scene.finPrompt = null; }
  scene.hitstop = 220;
  if (!reducedMotion()) { scene.cameras.main.flash(160, 255, 40, 20); scene.cameras.main.shake(220, 0.011); } // fatality red flash/shake — motion
  const cards = [fatalityBudgetCut, fatalityUnsubscribed, fatalityGdprd];
  cards[Math.floor(Math.random() * cards.length)](scene, loser, () => finishMatch(scene, scene.finWinner.isPlayer));
}
// each card owns its visuals via tweens (tick early-returns during 'fatality') and calls done() when finished
function fatalityBudgetCut(scene, loser, done) {
  scene.banner.setText('BUDGET... CUT.').setColor('#ff3020');
  scene.time.delayedCall(200, () => snd(scene, 'snd_budgetcut', 1));
  const bw = 196, bx = loser.isPlayer ? 12 : GAME_W - 12 - bw;
  scene.hideLoserBar = loser.isPlayer ? 'p' : 'o';            // stop drawUI drawing the real bar
  const barRect = scene.add.rectangle(bx, 12, bw, 11, K_GOLD_HEX).setOrigin(0, 0).setDepth(50);
  loser.spr.setFrame(POSE.hit);
  scene.tweens.add({
    targets: barRect, y: FLOOR_Y - 10, duration: 720, ease: 'Bounce.easeOut',
    onComplete: () => { spawnSpark(scene, bx + bw / 2, FLOOR_Y - 8, K_GOLD_HEX, true); barRect.destroy(); },
  });
  scene.time.delayedCall(1700, done);
}
function fatalityUnsubscribed(scene, loser, done) {
  scene.banner.setText('UNSUBSCRIBED!').setColor('#ff3020');
  scene.time.delayedCall(200, () => snd(scene, 'snd_unsubscribed', 1));
  const box = txt(scene, Math.round(loser.kin.x), Math.round(loser.kin.y - 152), '[x] unsubscribe from all', 6, K_HUD_FROST).setDepth(60);
  scene.tweens.add({ targets: box, y: box.y - 16, alpha: 0, duration: 1400, delay: 300, onComplete: () => box.destroy() });
  scene.tweens.add({ targets: loser.spr, alpha: 0, duration: 1100, delay: 250 });
  scene.time.delayedCall(1700, done);
}
function fatalityGdprd(scene, loser, done) {
  scene.banner.setText("G.D.P.R.'D!").setColor('#ff3020');
  scene.time.delayedCall(200, () => snd(scene, 'snd_gdprd', 1));
  const cx = Math.round(loser.kin.x), labels = ['We value your privacy', 'Manage cookies', 'Necessary only', 'Analytics? sure', 'ACCEPT ALL'];
  const cards = scene._gdprCards = [];   // tracked so they get destroyed (not left frozen across the rematch)
  for (let i = 0; i < 5; i++) {
    scene.time.delayedCall(150 * i, () => {
      cards.push(scene.add.rectangle(cx + (i % 2 ? 5 : -5), Math.round(loser.kin.y - 34 - i * 20), 96, 20, 0xdedede).setDepth(56));
      cards.push(txt(scene, cx + (i % 2 ? 5 : -5), Math.round(loser.kin.y - 34 - i * 20), labels[i], 5, '#333').setDepth(57));
      snd(scene, 'snd_confirm', 0.3);
    });
  }
  scene.time.delayedCall(1750, () => {
    if (cards.length) scene.tweens.add({ targets: cards, alpha: 0, duration: 300, onComplete: () => { cards.forEach((o) => o.destroy()); scene._gdprCards = null; } });
    done();
  });
}
// VICTORY "-ALITY" (MK's Fatality board, funnel-skinned): name the match win by HOW it
// happened. Priority: a no-damage final round beats everything, then the clock, then the
// closing move. Solo only — in 2P this would spam the loser sitting next to you.
function alityTitle(scene) {
  if (!scene.p.tookDamage) return { text: 'FLAWLESS FUNNEL', color: K_HUD_GREEN };
  if (scene.lastWinBlow === 'timeover') return { text: 'PIPELINE VICTORY', color: K_HUD_CYAN };
  if (scene.lastWinBlow === 'special') return { text: 'MQL-ALITY', color: K_GOLD };
  return { text: 'CLOSED-WON', color: K_GOLD };
}
function finishMatch(scene, playerWon) {
  if (playerWon) scene.pWins++; else scene.oWins++;
  scene.finLoser.koed = true; scene.finLoser.dazed = false;
  scene.phase = 'matchend';
  if (scene.darken) { scene.darken.destroy(); scene.darken = null; }
  if (scene.finPrompt) { scene.finPrompt.destroy(); scene.finPrompt = null; }
  const cam = scene.cameras.main; cam.setZoom(1); cam.centerOn(GAME_W / 2, GAME_H / 2);
  const gaunt = scene.mode === 'gauntlet' && playerWon;
  scene.matchAction = gaunt ? (scene.boss ? 'victory' : 'advance') : 'rematch';
  scene.time.delayedCall(700, () => {
    snd(scene, playerWon ? 'snd_win' : 'snd_lose', 1);
    const text = scene.matchAction === 'victory' ? 'YOU BEAT THE ALGORITHM'
      : scene.matchAction === 'advance' ? `RUNG ${scene.rung + 1}/5 CLEARED`
      : 'PROMOTED!';                          // the GameChrome buttons are the CTA now
    // shared tail: initials entry (gauntlet run end) may defer this behind the A-Z wheel
    const showResult = (score, initials) => {
      scene.phase = 'matchend';
      if (playerWon && !scene.versus) {       // big center "-ALITY" title, riding the win sfx
        const t = alityTitle(scene);
        scene.banner.setText(t.text).setColor(t.color).setY(74).setVisible(true);
      } else scene.banner.setVisible(false);
      scene.result.setText(text).setVisible(true);
      emitResult(scene.matchAction, { fighter: scene.p.stats.name, won: true, ...(score != null ? { score, initials } : {}) });
    };
    // beating THE ALGORITHM ends the gauntlet run -> classic initials entry first
    if (scene.matchAction === 'victory') { scene.banner.setVisible(false); startInitials(scene, true, showResult); }
    else showResult();
  });
}

function endRound(scene, playerWon) {
  if (scene.phase === 'roundend' || scene.phase === 'matchend') return; // never process a round-end twice (e.g. a same-tick double-KO)
  scene.phase = 'roundend';
  if (playerWon) scene.pWins++; else scene.oWins++;
  const matchOver = scene.pWins >= scene.roundsToWin || scene.oWins >= scene.roundsToWin;
  // Invisible per-round rubber band (round boundaries only, so it never feels like
  // mid-fight cheating): a struggling first-timer who drops a round gets a gentler CPU
  // next round; a player who's steamrolling meets a tougher one. Bounded + reset each match.
  const ai = scene.aiProfile;
  if (playerWon) { ai.blockChance = Math.min(0.62, ai.blockChance + 0.08); ai.aggression = Math.min(1.0, ai.aggression + 0.08); ai.minDelay = Math.max(300, ai.minDelay - 60); }
  else { ai.blockChance = Math.max(0.10, ai.blockChance - 0.12); ai.aggression = Math.max(0.45, ai.aggression - 0.12); ai.minDelay = Math.min(900, ai.minDelay + 110); }

  // ONE announcer call per KO, 430ms after the thud (real-time timer, survives the
  // freeze/slow-mo). Marketing-skinned MK canon: round KO -> "K.P.I.!" (or "FLAWLESS
  // ATTRIBUTION!" for a no-damage round), match end -> "PROMOTED!" / "PIVOT TO CONSULTING".
  const winner = playerWon ? scene.p : scene.o;
  const flawless = !winner.tookDamage;
  scene.time.delayedCall(430, () => {
    if (matchOver) snd(scene, playerWon ? 'snd_win' : 'snd_lose', 1);
    else snd(scene, flawless ? 'snd_flawless' : 'snd_ko', 1);
  });
  // let the KO cinematic (freeze + punch-in) play, THEN ease the camera back to normal
  // BEFORE revealing the result — the whole scene incl. the HUD is camera-space, so a
  // still-zoomed camera would blow up and clip the result/HP text.
  scene.time.delayedCall(650, () => {
    scene.slowmoT = 0;
    const cam = scene.cameras.main;
    cam.zoomTo(1, 260, 'Sine.easeOut'); cam.pan(GAME_W / 2, GAME_H / 2, 260, 'Sine.easeOut');
    if (matchOver) {
      // endRound only reaches matchOver when the AI won the match (the player's own
      // match-deciding blow is intercepted into the finisher), so this is a player loss.
      scene.phase = 'matchend';
      const gaunt = scene.mode === 'gauntlet';
      scene.matchAction = gaunt ? 'gameover' : 'rematch';
      const text = scene.versus ? `${playerWon ? 'P1' : 'P2'}  WINS`   // 2P: P1/P2 win (finisher is off)
        : gaunt ? `GAME OVER\nreached ${scene.boss ? 'THE ALGORITHM' : 'rung ' + (scene.rung + 1)}`
        : 'PIVOT TO CONSULTING';               // the GameChrome buttons are the CTA now
      const showResult = (score, initials) => {
        scene.phase = 'matchend';
        scene.result.setText(text).setVisible(true);
        emitResult(scene.matchAction, { fighter: scene.p.stats.name, won: playerWon, ...(score != null ? { score, initials } : {}) });
      };
      // a gauntlet DEATH past the first rung still earns a board entry (score = rungs cleared)
      if (gaunt && scene.rung >= 1) startInitials(scene, false, showResult);
      else showResult();
    } else {
      scene.result.setText(flawless ? 'FLAWLESS!' : 'K.P.I.').setVisible(true);
      scene.time.delayedCall(900, () => { if (scene.phase === 'roundend') { scene.round++; startRound(scene); } }); // guard: never double-advance if a restart already re-entered
    }
  });
}

// The matchend "continue" action, shared by the R/ENTER keys and the GameChrome
// result buttons: gauntlet advances a rung, a decisive win/loss returns to roster,
// everything else rematches the same fight.
function matchendAdvance(scene) {
  // require the result to actually be on screen: finishMatch sets phase='matchend' but defers the
  // result 700ms, and R/ENTER is live in that window — advancing early would fire a stale result
  // timer over the fresh round. Gating on result.visible closes that race.
  if (scene.phase !== 'matchend' || !scene.result.visible) return;
  emitResult(null);
  if (scene.matchAction === 'advance') scene.scene.start('fight', { playerKey: scene.playerKey, stageKey: scene.stageKey, mode: 'gauntlet', rung: scene.rung + 1, gauntletOpps: scene.gauntletOpps });
  else if (scene.matchAction === 'victory' || scene.matchAction === 'gameover') scene.scene.start('select');
  else { scene.pWins = scene.oWins = 0; scene.round = 1; startRound(scene); }
}

/* =========================================================================
   INITIALS — classic 3-letter arcade entry when a GAUNTLET run ends.
   ▲▼ (W/S) spin the A-Z wheel, ◀▶ (A/D) change slot, J/ENTER confirm the
   slot (the last confirm saves). The touch D-pad + J + OK drive the exact
   same keys, so phones need zero extra wiring. `after(score, initials)` is
   the deferred result screen (emitResult waits until the entry is done).
   ========================================================================= */
function startInitials(scene, playerWon, after) {
  scene.phase = 'initials';
  const cleared = playerWon ? scene.gauntletOpps.length + 1 : scene.rung; // rung index == rungs already cleared
  const score = cleared * 1000 + (playerWon ? Math.max(0, Math.round(scene.p.hp)) : 0);
  const cx = GAME_W / 2, letters = [0, 0, 0];
  let slot = 0;
  const slotX = (i) => cx + (i - 1) * 36;
  const glyphs = letters.map((_, i) => txt(scene, slotX(i), 138, 'A', 20, K_HUD_INK).setDepth(71));
  const unders = letters.map((_, i) => scene.add.rectangle(slotX(i), 156, 24, 3, K_GOLD_HEX).setDepth(71));
  const objs = [
    scene.add.rectangle(0, 0, GAME_W, GAME_H, K_STAGE_HEX, 0.8).setOrigin(0, 0).setDepth(70),
    txt(scene, cx, 52, playerWon ? 'GAUNTLET CHAMPION' : 'GAME OVER', 14, playerWon ? K_HUD_GREEN : K_HUD_RED).setDepth(71),
    txt(scene, cx, 78, `SCORE  ${score}`, 10, K_GOLD).setDepth(71),
    txt(scene, cx, 102, 'ENTER YOUR INITIALS', 8, K_HUD_CYAN).setDepth(71),
    txt(scene, cx, 182, scene.isTouch ? '▲▼ letter   ◀▶ slot   OK save' : '▲▼ letter   ◀▶ slot   ENTER save', 7, K_HUD_STEEL).setDepth(71),
    ...glyphs, ...unders,
  ];
  const paint = () => {
    for (let i = 0; i < 3; i++) {
      glyphs[i].setText(String.fromCharCode(65 + letters[i])).setColor(i === slot ? K_GOLD : K_HUD_INK);
      unders[i].setFillStyle(i === slot ? K_GOLD_HEX : 0x4a5560);
    }
  };
  const spin = (d) => { letters[slot] = (letters[slot] + d + 26) % 26; snd(scene, 'snd_confirm', 0.2); paint(); };
  const move = (d) => { slot = Math.max(0, Math.min(2, slot + d)); paint(); };
  const done = () => {
    off();
    const initials = letters.map((li) => String.fromCharCode(65 + li)).join('');
    saveScore({ initials, score, date: new Date().toISOString().slice(0, 10) });
    objs.forEach((o) => o.destroy());
    scene._initials = null;
    scene._advLock = 350; // the ENTER that just saved must not ALSO advance the fresh result screen
    after(score, initials);
  };
  const confirm = () => { snd(scene, 'snd_confirm', 0.5); if (slot < 2) { slot++; paint(); } else done(); };
  // scene-level key handlers (not this.keys polling): they need edge semantics and they're
  // gated by GameChrome's overlay lock (keyboard.enabled=false) exactly like every other key.
  const H = {
    'keydown-UP': () => spin(1), 'keydown-W': () => spin(1),
    'keydown-DOWN': () => spin(-1), 'keydown-S': () => spin(-1),
    'keydown-LEFT': () => move(-1), 'keydown-A': () => move(-1),
    'keydown-RIGHT': () => move(1), 'keydown-D': () => move(1),
    'keydown-J': confirm, 'keydown-ENTER': confirm,
  };
  const kb = scene.input.keyboard;
  for (const ev in H) kb.on(ev, H[ev]);
  const off = () => { for (const ev in H) kb.off(ev, H[ev]); };
  // blink is driven from tick (quantized, and pinned solid under Reduce Motion)
  const blink = (t) => {
    const on = reducedMotion() || Math.floor(t / 280) % 2 === 0;
    for (let i = 0; i < 3; i++) unders[i].setAlpha(i === slot ? (on ? 1 : 0.25) : 0.6);
  };
  scene._initials = { objs, off, blink };
  paint();
}

// Time-over (round clock hit 0): the higher-HP fighter wins the round like a KO; a dead heat drops
// into sudden death (first clean hit decides). Routes through the SAME finisher/endRound/finishMatch
// paths a real KO uses, so match flow, the finisher and 2P all stay correct.
function resolveTimeOver(scene) {
  const p = scene.p, o = scene.o;
  if (p.hp === o.hp) {
    scene.suddenDeath = true;
    scene.banner.setText('SUDDEN DEATH').setColor(K_ORANGE).setVisible(true);
    scene.time.delayedCall(1400, () => { if (scene.phase === 'fight') scene.banner.setVisible(false); });
    return;
  }
  const pWon = p.hp > o.hp, loser = pWon ? o : p;
  loser.koed = true; loser.dazed = false; loser.action = null; loser.pose = POSE.ko;
  scene._frozenDef = loser; scene.slowmoT = 500;
  juiceHit(scene, loser.kin.x, loser.kin.y - 92, false, true, 'punch', loser.stats.color);
  snd(scene, 'snd_kothud', 0.7);
  scene.banner.setText('TIME OVER').setColor(K_GOLD).setVisible(true);
  scene.time.delayedCall(600, () => scene.banner.setVisible(false));
  scene.finLoser = loser; // finishMatch reads this
  if (pWon) scene.lastWinBlow = 'timeover'; // a clock-out win earns the PIPELINE VICTORY title
  const willWinMatch = ((pWon ? scene.pWins : scene.oWins) + 1) >= scene.roundsToWin;
  if (willWinMatch && pWon && !scene.versus) finishMatch(scene, true); // solo player match-win -> PROMOTED (no finisher on a clock-out)
  else endRound(scene, pWon);
}

function tick(scene, dtMs) {
  if (scene.phase === 'fatality') return; // the fatality card's tweens own every visual
  if (scene._advLock > 0) scene._advLock -= dtMs;
  const dt = dtMs / 1000, p = scene.p, o = scene.o;
  p.dir = o.kin.x >= p.kin.x ? 1 : -1;
  o.dir = p.kin.x >= o.kin.x ? 1 : -1;

  const live = scene.phase === 'fight';
  for (const f of [p, o]) {
    const inp = scene.humanInputs.find((i) => i.f === f);        // human input, or the AI drives it
    const intent = live ? (inp ? intentFrom(scene, inp) : aiIntent(scene, o, p, dtMs)) : {};
    control(f, intent, dtMs);
    if (inp && f.action && f.action.e === 0) inp.buf = null;     // buffered attack was just consumed
  }
  integrate(p, dt); integrate(o, dt);
  separate(p, o);

  // "CLOSE THE DEAL!" window: a fresh attack press from the player finishes; timeout -> plain win
  if (scene.phase === 'finisher') {
    scene.finisherT -= dtMs;
    const pbuf = scene.humanInputs[0];
    if (pbuf.buf) { pbuf.buf = null; triggerFatality(scene); return; }
    if (scene.finisherT <= 0) { finisherTimeout(scene); return; }
  }

  if (live) {
    // Resolve BOTH attackers from pre-hit state so a same-frame exchange is a true trade — the old
    // fixed p-then-o order let applyHit null o's action before o's own hit was ever tested, so P1
    // won every simultaneous trade and took no damage.
    const pAct = p.action, oAct = o.action;
    const canHit = (a, act, d) => act && !act.hasHit && phase(ATTACK[act.type], act.e) === 'active' && overlap(hitbox(a), hurtbox(d));
    const pHit = canHit(p, pAct, o), oHit = canHit(o, oAct, p);
    if (pHit) { pAct.hasHit = true; applyHit(p, o, scene); }
    // apply o's counter only if o SURVIVED p's hit and the round is still live: p's hit may have KO'd
    // o or opened the finisher (phase left 'fight'), and a posthumous counter would double-KO (crediting
    // both wins) or clobber the finisher/round-end flow. A genuine both-survive trade still lands both.
    if (oHit && !o.koed && scene.phase === 'fight') { oAct.hasHit = true; o.action = oAct; applyHit(o, p, scene); }
    if (pHit && oHit) { p.action = null; o.action = null; scene.combo = { owner: null, n: 0, t: 0 }; } // a trade cancels both attacks + both combos
  }
  // FUNNEL counter: the streak decays when no fresh hit lands; label climbs the B2B funnel
  if (live && scene.combo.n > 0) { scene.combo.t -= dtMs; if (scene.combo.t <= 0) { scene.combo.n = 0; scene.combo.owner = null; } }
  if (live && scene.combo.n >= 2) {
    const tr = funnelTier(scene.combo.n);
    scene.comboText.setText(`${tr.label}  x${scene.combo.n}`).setColor(tr.color).setVisible(true);
  } else if (scene.comboText.visible) scene.comboText.setVisible(false);
  // round clock: ticks only in a live fight (naturally frozen during hitstop/pause since tick doesn't
  // run then), skipped in sudden death; on expiry the higher-HP fighter takes the round.
  if (scene.phase === 'fight' && !scene.suddenDeath) {
    scene.roundClock -= dtMs;
    if (scene.roundClock <= 0) { scene.roundClock = 0; resolveTimeOver(scene); }
  }
  if (scene.phase === 'fight' && !scene.suddenDeath) {
    const secs = Math.max(0, Math.ceil(scene.roundClock / 1000));
    scene.timerText.setText(String(secs)).setColor(secs <= 10 ? '#ff3b30' : K_GOLD).setVisible(true);
  } else if (scene.timerText.visible) scene.timerText.setVisible(false);
  // the standing fighter strikes the victory pose once a round/match is decided
  // ('initials' included: the tableau holds behind the letter wheel)
  if (scene.phase === 'roundend' || scene.phase === 'matchend' || scene.phase === 'initials') {
    for (const f of [p, o]) if (!f.koed) f.pose = POSE.victory;
  }
  scene.animClock += dtMs;
  updateArenaFx(scene, dtMs);
  if (scene._initials) scene._initials.blink(scene.animClock);
  for (const f of [p, o]) {
    f.spr.flipX = f.dir < 0;
    f.spr.setFrame(f.pose);
    const off = animOffset(f, scene.animClock);
    f.spr.x = Math.round(f.kin.x) + off.dx;
    f.spr.y = Math.round(f.kin.y) + off.dy;
    if (f.flash > 0) { f.flash -= dtMs; f.spr.setTintFill(K_WHITE_HEX); }
    else if (f.action && f.action.windup > 0) { if (Math.floor(scene.animClock / 80) % 2) f.spr.setTintFill(0xff3020); else f.spr.clearTint(); } // "big move charging" red-silhouette blink
    else if (scene.boss && f === scene.o) { f.spr.setTint((Math.floor(scene.animClock / 110) % 2) ? 0x88ffcc : 0x33cc77); } // THE ALGORITHM's digital-green flicker
    else f.spr.clearTint();
  }

  if (live && scene.boss) { // THE ALGORITHM periodically shadowbans the player (halves their damage)
    if (scene.shadowbanActive > 0) { scene.shadowbanActive -= dtMs; if (scene.shadowbanActive <= 0) scene.playerDmgMult = 1; }
    else { scene.shadowbanT -= dtMs; if (scene.shadowbanT <= 0) {
      scene.shadowbanActive = 4000; scene.playerDmgMult = 0.5; scene.shadowbanT = 11000;
      scene.banner.setText('SHADOWBANNED').setColor('#00ff88').setVisible(true);
      // key the hide on the banner's own text, not phase — if the round ends inside the 1.5s the
      // banner must still clear (a phase check would leave it lingering over the K.P.I. result).
      scene.time.delayedCall(1500, () => { if (scene.banner.text === 'SHADOWBANNED') scene.banner.setVisible(false); });
    } }
  }

  if (scene.phase === 'intro') {
    scene.introT -= dtMs;
    // any attack press (already edge-buffered) or ENTER/SPACE skips the arena card and
    // jumps straight to the FIGHT! beat — the intro never holds an impatient player
    if (scene.introT > 700) {
      // ENTER/SPACE need edge semantics here: the ENTER that advanced the result screen is
      // often still held when the next intro starts, and must not auto-skip the fresh card.
      const dn = scene.keys.ENTER.isDown || scene.keys.SPACE.isDown;
      let skip = dn && !scene._introSkipHeld;
      if (!dn) scene._introSkipHeld = false;
      for (const inp of scene.humanInputs) if (inp.buf) skip = true; // attack buffer is already edge-detected
      if (skip) { scene.introT = 700; for (const inp of scene.humanInputs) inp.buf = null; } // the press was "skip", not an attack
    }
    positionIntroCard(scene); // quantized steps() slide-in
    if (scene.introT <= 700) {
      destroyIntroCard(scene);
      scene.banner.setText('FIGHT!').setColor(K_ORANGE);
      if (!scene.fightSaid) { scene.fightSaid = true; snd(scene, 'snd_fight', 0.9); }
    }
    if (scene.introT <= 0) { scene.phase = 'fight'; scene.banner.setVisible(false); }
  }
  // R or ENTER (the mobile OK button dispatches Enter) advances: gauntlet -> next rung,
  // else rematch. Without ENTER, touch players were softlocked at the result screen.
  // _advLock keeps the ENTER that just confirmed the initials from double-firing here.
  // DOM-focus guard: when the player has Tabbed onto a GameChrome result button
  // (SHARE etc.), ENTER belongs to THAT button — advancing here would destroy the
  // result screen out from under the click the browser is about to deliver.
  const focusEl = typeof document !== 'undefined' ? document.activeElement : null;
  const chromeFocus = !!focusEl && ['BUTTON', 'A', 'INPUT', 'TEXTAREA'].includes(focusEl.tagName);
  if (scene.phase === 'matchend' && scene._advLock <= 0 && !chromeFocus && (scene.keys.R.isDown || scene.keys.ENTER.isDown)) matchendAdvance(scene);
}

function drawUI(scene) {
  const g = scene.ui; g.clear();
  const dtr = scene.game.loop.delta;
  const bw = 196, bh = 11, y = 12;
  const bar = (f, x, leftAnchor, wins) => {
    // ghost trail: hold the old value for a beat after a hit, then melt it down to the real HP
    if (f.ghostHp < f.hp) f.ghostHp = f.hp;                       // healed on reset -> snap up
    else if (f.ghostDelay > 0) f.ghostDelay -= dtr;
    else if (f.ghostHp > f.hp) f.ghostHp = Math.max(f.hp, f.ghostHp - f.hpMax * 0.0011 * dtr);
    const frac = f.hp / f.hpMax, gfrac = f.ghostHp / f.hpMax;
    g.fillStyle(K_BLACK_HEX, 0.55); g.fillRect(x - 2, y - 2, bw + 4, bh + 4);
    g.fillStyle(0x360a0a, 1); g.fillRect(x, y, bw, bh);
    const fw = Math.max(0, Math.round(bw * frac)), gw = Math.max(0, Math.round(bw * gfrac));
    g.fillStyle(0xff8a5c, 0.85);                                  // the melting chunk = damage just taken
    if (leftAnchor) g.fillRect(x + fw, y, gw - fw, bh);
    else g.fillRect(x + bw - gw, y, gw - fw, bh);
    g.fillStyle(frac > 0.3 ? K_GOLD_HEX : 0xff3b30, 1);            // live fill on top
    g.fillRect(leftAnchor ? x : x + bw - fw, y, fw, bh);
    g.lineStyle(1, K_WHITE_HEX, 0.85); g.strokeRect(x, y, bw, bh);
    // round pips at the INNER end of each bar (toward centre) so they never touch the names
    for (let i = 0; i < scene.roundsToWin; i++) {
      const px = leftAnchor ? x + bw - 6 - i * 9 : x + 1 + i * 9;
      g.fillStyle(i < wins ? K_HUD_GREEN_HEX : 0x2a2a2a, 1); g.fillRect(px, y + bh + 3, 5, 5);
    }
  };
  // stamina strip: a slim second bar sitting just under the name-label row (44px down —
  // clear of the round pips at 26-31 and, narrower than the HP bar, clear of the centred
  // GAUNTLET-rung label at 40-48 too). Flush with the HP bar's OUTER edge, shorter on the
  // inner side, so it still reads as belonging to that fighter's corner.
  const sw = 150, sh = 4, sy = 44;
  const staminaBar = (f, outerX, leftAnchor) => {
    const x = leftAnchor ? outerX : outerX + bw - sw;
    const frac = Math.max(0, Math.min(1, f.stamina / f.staminaMax));
    const fw = Math.round(sw * frac);
    // hard on/off blink (never a fade) on a failed swing — same "strike, don't ease" rule as
    // every other flash cue in this file (juiceHit, the wind-up tint, the fighters bolt).
    const denied = f.denyFlash > 0 && Math.floor(scene.animClock / 60) % 2 === 0;
    g.fillStyle(K_BLACK_HEX, 0.5); g.fillRect(x - 1, sy - 1, sw + 2, sh + 2);
    g.fillStyle(0x0a2430, 1); g.fillRect(x, sy, sw, sh);
    g.fillStyle(denied ? 0xff3b30 : K_CYAN_HEX, 1);
    g.fillRect(leftAnchor ? x : x + sw - fw, sy, fw, sh);
    g.lineStyle(1, denied ? 0xff3b30 : 0x1a6b80, 0.9); g.strokeRect(x, sy, sw, sh);
  };
  if (scene.hideLoserBar !== 'p') bar(scene.p, 12, true, scene.pWins);            // hidden while a BUDGET CUT bar is falling
  if (scene.hideLoserBar !== 'o') bar(scene.o, GAME_W - 12 - bw, false, scene.oWins);
  if (scene.hideLoserBar !== 'p') staminaBar(scene.p, 12, true);
  if (scene.hideLoserBar !== 'o') staminaBar(scene.o, GAME_W - 12 - bw, false);
}

function fightUpdate(time, delta) {
  if (this.paused) return; // frozen by the pause overlay — the last rendered frame persists
  sampleAttackBuffer(this, delta); // keep the input buffer alive every frame, even in hitstop
  if (this.hitstop > 0) {
    this.hitstop -= delta;
    if (this._frozenDef && !this._frozenDef.koed) { // ±1px buzz on the struck body during the freeze (Sakurai hit-shake)
      const v = (Math.floor(this.hitstop / STEP) % 2) ? 1 : -1;
      this._frozenDef.spr.x = Math.round(this._frozenDef.kin.x) + v;
    }
    drawUI(this);
    return;
  }
  let scale = 1;
  if (this.slowmoT > 0) { this.slowmoT -= delta; scale = 0.3; } // KO slow-motion (real-time timer)
  this._acc += Math.min(delta, 100) * scale;
  if (this._acc > STEP * 5) this._acc = STEP * 5; // drop unpayable backlog so we never fast-forward after a stall
  let n = 0;
  while (this._acc >= STEP && n < 5) { tick(this, STEP); this._acc -= STEP; n++; }
  drawUI(this);
}

export function createFightGame(Phaser, parent) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent, width: GAME_W, height: GAME_H,
    pixelArt: true, roundPixels: true, backgroundColor: K_STAGE,
    // NONE + a whole-number zoom => every source pixel maps to exactly N screen
    // pixels (crisp grid, no shimmer). FIT's fractional scale is what made the
    // sprites/text look "mushy". Letterboxes on non-multiple viewports; on 1080p
    // it lands on an exact 4x fill.
    // NO_CENTER: the .fight-canvas flex container centers the canvas. Phaser's own
    // autoCenter would ALSO set margins, and the two stacked -> the canvas drifted
    // off-screen (left HP bar clipped) on portrait phones.
    scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.NO_CENTER, width: GAME_W, height: GAME_H },
    scene: [
      { key: 'boot', preload: bootPreload, create: bootCreate },
      { key: 'select', create: selectCreate, update: selectUpdate },
      { key: 'fight', init: fightInit, create: fightCreate, update: fightUpdate },
    ],
  });
  const fit = () => {
    const w = (parent && parent.clientWidth) || window.innerWidth;
    const h = (parent && parent.clientHeight) || window.innerHeight;
    const z = Math.min(w / GAME_W, h / GAME_H);
    const coarse = isCoarsePointer();
    // Desktop: whole-number zoom => a crisp integer pixel grid. Touch: fill the space
    // with a fractional zoom instead — on a phone a big arena (image-rendering:pixelated
    // keeps it blocky, just an uneven grid) beats a tiny 1x stage lost in black bars.
    game.scale.setZoom(coarse ? Math.max(0.5, z) : (z >= 1 ? Math.floor(z) : Math.max(0.5, z)));
  };
  game.events.once('ready', fit);
  window.addEventListener('resize', fit);
  game.events.once('destroy', () => window.removeEventListener('resize', fit));
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') window.__game = game; // dev debug handle
  return game;
}

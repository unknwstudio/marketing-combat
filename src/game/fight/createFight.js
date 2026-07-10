/* AI Marketing Kombat — fight engine.
 * Boot (load all) -> Select (fighter + stage) -> Fight (best-of-3, juice).
 * SSR-safe: Phaser is injected from the client island (no top-level import).
 * Combat runs on a fixed 60Hz tick; rendering happens after. */

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

// Per-move hitstun is deliberately SHORTER than each move's own re-hit interval, so a
// single mashed move can't true-loop the opponent (the old flat 340ms > the 250ms punch
// re-hit interval was a touch-of-death infinite). The defender always regains a tick to
// block/jump; combos come from cancels (later), not from stun outlasting recovery.
const ATTACK = {
  punch:   { pose: POSE.punch,   startup: 55,  active: 75,  recovery: 150, dmg: 7,  reach: 60,  hy: [95, 150], hitstun: 200 },
  kick:    { pose: POSE.kick,    startup: 85,  active: 95,  recovery: 205, dmg: 11, reach: 80,  hy: [95, 162], hitstun: 280 },
  special: { pose: POSE.special, startup: 130, active: 170, recovery: 260, dmg: 17, reach: 104, hy: [100, 168], hitstun: 360 },
};
for (const k in ATTACK) ATTACK[k].total = ATTACK[k].startup + ATTACK[k].active + ATTACK[k].recovery;

const HURT = { dx: 22, top: 130, bottom: 6 };

// Per-archetype identity: hp, walk speed, damage mult, reach mult, attack-speed
// mult. Makes "choose your fighter" actually matter.
export const ROSTER = [
  { key: 'fighter1', name: 'CMOs',                 color: 0x3fe0ff, style: 'ZONER',     hp: 95,  speed: 100, dmg: 0.95, reach: 1.15, atkSpeed: 1.00 },
  { key: 'fighter2', name: 'HEADS OF GROWTH',      color: 0xff4d6d, style: 'RUSHDOWN',  hp: 98,  speed: 114, dmg: 1.00, reach: 0.98, atkSpeed: 1.10 },
  { key: 'fighter3', name: 'PERFORMANCE LEAD GEN', color: 0x8bffa0, style: 'ALL-ROUND', hp: 110, speed: 96,  dmg: 1.05, reach: 1.02, atkSpeed: 1.00 },
  { key: 'fighter4', name: 'AI CREATORS',          color: 0xffcf3f, style: 'HEAVY',     hp: 124, speed: 80,  dmg: 1.32, reach: 1.08, atkSpeed: 0.80 },
  { key: 'fighter5', name: 'FUTURE LEGENDS',       color: 0xb08bff, style: 'ASSASSIN',  hp: 84,  speed: 126, dmg: 0.85, reach: 0.98, atkSpeed: 1.22 },
];
export const STAGES = [
  { key: 'server', name: 'SERVER ROOM' },
  { key: 'rooftop', name: 'NEON ROOFTOP' },
  { key: 'stadium', name: 'VIRAL STADIUM' },
  { key: 'dungeon', name: 'THE DUNGEON' },
];

// The pixel font family is resolved on the client (next/font emits a hashed
// family name, not the literal "Press Start 2P") and injected before boot.
let FONT_FAMILY = "'Press Start 2P', monospace";
export function setGameFont(f) { if (f) FONT_FAMILY = f; }
const txt = (scene, x, y, s, size, color, ax = 0.5, ay = 0.5) =>
  scene.add.text(x, y, s, { fontFamily: FONT_FAMILY, fontSize: `${size}px`, color, stroke: '#000', strokeThickness: 3 })
    .setOrigin(ax, ay).setResolution(3);

const SOUNDS = ['round1', 'round2', 'round3', 'fight', 'ko', 'win', 'lose', 'flawless', 'hit', 'kick', 'block', 'special', 'kothud', 'confirm'];
const snd = (scene, key, vol = 1) => { try { if (scene.cache.audio.exists(key)) scene.sound.play(key, { volume: vol }); } catch (e) { /* audio not unlocked yet */ } };

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
  this.add.rectangle(0, 0, GAME_W, GAME_H, 0x05010c).setOrigin(0, 0);
  this.add.image(GAME_W / 2, GAME_H / 2, 'stage_dungeon').setDisplaySize(GAME_W, GAME_H).setAlpha(0.18);

  this.phase = 'fighter';
  this.fi = 2; // default: the highlighted landing fighter
  this.si = 3;

  this.title = txt(this, GAME_W / 2, 24, 'CHOOSE YOUR FIGHTER', 15, '#ffd23f');
  this.sub = txt(this, GAME_W / 2, GAME_H - 16, '<  >  select      ENTER  confirm', 8, '#8fe8ff');

  // fighter row
  this.picks = ROSTER.map((f, i) => {
    const x = 60 + i * 90;
    const s = this.add.sprite(x, 186, f.key, POSE.idle).setOrigin(0.5, 1).setScale(0.8);
    const box = this.add.rectangle(x, 130, 78, 128, f.color, 0).setStrokeStyle(2, f.color, 0).setOrigin(0.5, 0.5);
    return { s, box, x };
  });
  this.nameLabel = txt(this, GAME_W / 2, 208, '', 11, '#fff');
  this.styleLabel = txt(this, GAME_W / 2, 219, '', 9, '#ffd23f');
  this.statG = this.add.graphics().setDepth(6);
  this.statLabels = [
    txt(this, 150, 232, 'PWR', 7, '#9fb8c8', 1, 0.5),
    txt(this, 224, 232, 'SPD', 7, '#9fb8c8', 1, 0.5),
    txt(this, 296, 232, 'HP', 7, '#9fb8c8', 1, 0.5),
  ];

  // stage strip (hidden until fighter chosen)
  this.stageImgs = STAGES.map((st, i) => {
    const x = 66 + i * 116;
    const img = this.add.image(x, 150, `stage_${st.key}`).setDisplaySize(104, 58).setVisible(false);
    const box = this.add.rectangle(x, 150, 104, 58, 0xffffff, 0).setStrokeStyle(2, 0xffd23f, 0).setVisible(false);
    return { img, box, x };
  });

  const move = (d, max, prop) => { this[prop] = (this[prop] + d + max) % max; refresh(this); };
  this.input.keyboard.on('keydown-LEFT', () => move(-1, this.phase === 'fighter' ? 5 : 4, this.phase === 'fighter' ? 'fi' : 'si'));
  this.input.keyboard.on('keydown-RIGHT', () => move(1, this.phase === 'fighter' ? 5 : 4, this.phase === 'fighter' ? 'fi' : 'si'));
  this.input.keyboard.on('keydown-A', () => move(-1, this.phase === 'fighter' ? 5 : 4, this.phase === 'fighter' ? 'fi' : 'si'));
  this.input.keyboard.on('keydown-D', () => move(1, this.phase === 'fighter' ? 5 : 4, this.phase === 'fighter' ? 'fi' : 'si'));
  const confirm = () => {
    snd(this, 'snd_confirm', 0.5);
    if (this.phase === 'fighter') { this.phase = 'stage'; refresh(this); }
    else {
      const opp = ROSTER[(this.fi + 1 + Math.floor(Math.random() * (ROSTER.length - 1))) % ROSTER.length].key;
      this.scene.start('fight', { playerKey: ROSTER[this.fi].key, oppKey: opp, stageKey: STAGES[this.si].key });
    }
  };
  this.input.keyboard.on('keydown-ENTER', confirm);
  this.input.keyboard.on('keydown-SPACE', confirm);

  refresh(this);
}
function refresh(scene) {
  const fighterPhase = scene.phase === 'fighter';
  scene.title.setText(fighterPhase ? 'CHOOSE YOUR FIGHTER' : 'CHOOSE STAGE');
  scene.picks.forEach((p, i) => {
    const on = fighterPhase && i === scene.fi;
    p.s.setVisible(fighterPhase).setAlpha(on ? 1 : 0.45).setScale(on ? 0.92 : 0.8);
    p.box.setVisible(fighterPhase).setStrokeStyle(2, ROSTER[i].color, on ? 1 : 0);
  });
  scene.stageImgs.forEach((s, i) => {
    s.img.setVisible(!fighterPhase).setAlpha(i === scene.si ? 1 : 0.5);
    s.box.setVisible(!fighterPhase).setStrokeStyle(2, 0xffd23f, i === scene.si ? 1 : 0);
  });
  scene.nameLabel.setText(fighterPhase ? ROSTER[scene.fi].name : STAGES[scene.si].name)
    .setColor(fighterPhase ? '#fff' : '#ffd23f');
  scene.sub.setText(fighterPhase ? '<  >  select      ENTER  confirm' : '<  >  stage      ENTER  fight');
  drawStats(scene);
}
function drawStats(scene) {
  const g = scene.statG; g.clear();
  const show = scene.phase === 'fighter';
  scene.styleLabel.setVisible(show);
  scene.statLabels.forEach((l) => l.setVisible(show));
  if (!show) return;
  const f = ROSTER[scene.fi];
  scene.styleLabel.setText(f.style).setColor('#' + f.color.toString(16).padStart(6, '0'));
  const clamp = (v) => Math.max(0.06, Math.min(1, v));
  const vals = [
    clamp((f.dmg - 0.82) / 0.52),                                   // PWR
    clamp(((f.speed - 78) / 50 + (f.atkSpeed - 0.78) / 0.46) / 2),  // SPD
    clamp((f.hp - 82) / 44),                                        // HP
  ];
  const barX = [154, 228, 300], bw = 40, bh = 6, y = 229;
  vals.forEach((v, i) => {
    g.fillStyle(0x000000, 0.5); g.fillRect(barX[i] - 1, y - 1, bw + 2, bh + 2);
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
  return {
    spr, isPlayer, key, stats: st, startX: x, startFace: faceRight,
    kin: { x, y: FLOOR_Y, vx: 0, vy: 0, grounded: true },
    dir: faceRight ? 1 : -1,
    action: null, hp: st.hp, hpMax: st.hp, ghostHp: st.hp, ghostDelay: 0, tookDamage: false,
    hitstun: 0, blockstun: 0, wakeBlock: 0, blocking: false, koed: false, pose: POSE.idle, flash: 0,
  };
}
function resetFighter(f) {
  f.kin = { x: f.startX, y: FLOOR_Y, vx: 0, vy: 0, grounded: true };
  f.dir = f.startFace ? 1 : -1;
  f.action = null; f.hp = f.hpMax; f.ghostHp = f.hpMax; f.ghostDelay = 0; f.tookDamage = false;
  f.hitstun = 0; f.blockstun = 0; f.wakeBlock = 0; f.blocking = false; f.koed = false; f.pose = POSE.idle; f.flash = 0;
}

// Procedural life on the single-frame poses using INTEGER-pixel offsets only
// (never scale/rotate pixel sprites -> that reintroduces the sub-pixel mush).
function animOffset(f, clock) {
  if (f.koed) return { dx: 0, dy: 0 };
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
  this.playerKey = (data && data.playerKey) || 'fighter3';
  this.oppKey = (data && data.oppKey) || 'fighter5';
  this.stageKey = (data && data.stageKey) || 'dungeon';
}
function fightCreate() {
  this.add.image(0, 0, `stage_${this.stageKey}`).setOrigin(0, 0).setDisplaySize(GAME_W, GAME_H).setDepth(0);

  this.p = makeFighter(this, this.playerKey, 150, true, true);
  this.o = makeFighter(this, this.oppKey, 330, false, false);

  this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,A,D,W,SPACE,J,K,L,S,DOWN,R,ESC,ENTER');
  this._down = { punch: false, kick: false, special: false };
  this.atkBuf = null;
  this.isTouch = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
  this._acc = 0;
  this.hitstop = 0;
  this.slowmoT = 0;
  this._frozenDef = null;
  this.animClock = 0;
  this.ai = { blockChance: 0.26, minDelay: 540, maxDelay: 1120, aggression: 0.62 };
  this.aiTimer = 700; this.aiBlock = 0;
  this.pWins = 0; this.oWins = 0; this.round = 1;

  this.ui = this.add.graphics().setDepth(40);
  const pName = ROSTER.find((r) => r.key === this.playerKey).name;
  const oName = ROSTER.find((r) => r.key === this.oppKey).name;
  txt(this, 12, 28, pName, 8, '#cfeaff', 0, 0);
  txt(this, GAME_W - 12, 28, oName, 8, '#cfeaff', 1, 0);
  txt(this, GAME_W / 2, GAME_H - 4,
    this.isTouch ? 'J K L  attack     DOWN  block     UP  jump' : 'J punch   K kick   L special   S block',
    8, '#5f93aa', 0.5, 1);

  this.banner = txt(this, GAME_W / 2, 108, '', 24, '#ffd23f').setDepth(60).setVisible(false);
  this.result = txt(this, GAME_W / 2, 104, '', 20, '#ffd23f').setDepth(60).setVisible(false);

  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') window.__fight = this; // dev debug handle
  startRound(this);
}

function startRound(scene) {
  resetFighter(scene.p); resetFighter(scene.o);
  // fresh match (round 1, incl. after a rematch) -> restore the baseline CPU difficulty
  // the per-round rubber band adapts away from.
  if (scene.round === 1) scene.ai = { blockChance: 0.26, minDelay: 540, maxDelay: 1120, aggression: 0.62 };
  scene.aiTimer = 700; scene.aiBlock = 0; scene.hitstop = 0; scene.slowmoT = 0; scene._frozenDef = null;
  const cam = scene.cameras.main; cam.setZoom(1); cam.centerOn(GAME_W / 2, GAME_H / 2); // undo any KO punch-in
  scene.result.setVisible(false);
  scene.phase = 'intro'; scene.introT = 1500; scene.fightSaid = false;
  scene.banner.setText(`ROUND ${scene.round}`).setVisible(true);
  snd(scene, `snd_round${Math.min(scene.round, 3)}`, 0.9);
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
  f.spr.x = Math.round(k.x); f.spr.y = Math.round(k.y);
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
  a.spr.x = Math.round(a.kin.x); b.spr.x = Math.round(b.kin.x);
}

function control(f, intent, dtMs) {
  f.blocking = false;
  if (f.koed) { f.pose = POSE.ko; f.kin.vx *= 0.90; return; } // decay (not zero) so the KO launch arc plays out
  if (f.hitstun > 0) { f.hitstun -= dtMs; if (f.hitstun <= 0) f.wakeBlock = 200; f.kin.vx *= 0.82; f.pose = POSE.hit; return; }
  if (f.action) {
    f.action.e += dtMs * f.stats.atkSpeed; f.kin.vx = 0; f.pose = ATTACK[f.action.type].pose;
    if (f.action.e >= ATTACK[f.action.type].total) f.action = null;
    return;
  }
  if (f.blockstun > 0) { f.blockstun -= dtMs; f.kin.vx *= 0.82; f.pose = POSE.block; f.blocking = true; return; }
  if (f.kin.grounded && intent.atk) { f.action = { type: intent.atk, e: 0, hasHit: false }; f.kin.vx = 0; f.pose = ATTACK[intent.atk].pose; return; }
  if (intent.block && f.kin.grounded) { f.blocking = true; f.kin.vx = 0; f.pose = POSE.block; return; }
  f.kin.vx = (intent.right ? f.stats.speed : 0) - (intent.left ? f.stats.speed : 0);
  if (intent.jump && f.kin.grounded) { f.kin.vy = JUMP_V; f.kin.grounded = false; }
  f.pose = !f.kin.grounded ? POSE.jump : (f.kin.vx !== 0 ? POSE.walk : POSE.idle);
}

// Edge-detect the attack keys into a short-lived buffer EVERY frame (including during
// hitstop, when the tick loop is paused) so a press made a few frames early — or right
// after landing a hit — still fires on the first actionable tick instead of being eaten.
function sampleAttackBuffer(scene, dtMs) {
  const k = scene.keys;
  if (!k) return;
  const edge = (n, key) => { const jp = key.isDown && !scene._down[n]; scene._down[n] = key.isDown; return jp; };
  const jP = edge('punch', k.J), jK = edge('kick', k.K), jL = edge('special', k.L);
  const fresh = jP ? 'punch' : jK ? 'kick' : jL ? 'special' : null;
  if (fresh) scene.atkBuf = { type: fresh, t: BUFFER_MS };
  else if (scene.atkBuf) { scene.atkBuf.t -= dtMs; if (scene.atkBuf.t <= 0) scene.atkBuf = null; }
}
function playerIntent(scene) {
  const k = scene.keys;
  return {
    left: k.LEFT.isDown || k.A.isDown, right: k.RIGHT.isDown || k.D.isDown,
    jump: k.UP.isDown || k.W.isDown || k.SPACE.isDown, block: k.S.isDown || k.DOWN.isDown,
    atk: scene.atkBuf ? scene.atkBuf.type : null,
  };
}
function aiIntent(scene, o, p, dtMs) {
  const intent = { left: false, right: false, jump: false, block: false, atk: null };
  if (o.koed || o.hitstun > 0 || o.action) return intent;
  const ai = scene.ai, dist = Math.abs(p.kin.x - o.kin.x);
  const toward = p.kin.x < o.kin.x ? 'left' : 'right', away = toward === 'left' ? 'right' : 'left';

  // wake-up guard: briefly defend right after eating a hit so point-blank / corner
  // loops aren't a free, skill-less win against the CPU.
  if (o.wakeBlock > 0) {
    o.wakeBlock -= dtMs;
    if (p.action && dist < 130 && Math.random() < 0.22) { intent.block = true; return intent; }
  }
  // reactive block vs a committed player attack (rolled once per attack)
  if (scene.aiBlock > 0) { scene.aiBlock -= dtMs; intent.block = true; return intent; }
  if (p.action && !p.action.aiSaw && dist < 130) {
    p.action.aiSaw = true;
    if (Math.random() < ai.blockChance) { scene.aiBlock = 240; intent.block = true; return intent; }
  }

  // Engage from the AI's OWN reach so it is no longer blind past 104px while every
  // special reaches ~150px — walk-back special zoning used to be a risk-free 100% win.
  const punchR = 44 + ATTACK.punch.reach * o.stats.reach;      // ~103-113px
  const specR = 44 + ATTACK.special.reach * o.stats.reach;     // ~146-164px
  scene.aiTimer -= dtMs;
  const ready = scene.aiTimer <= 0;
  const arm = () => { scene.aiTimer = ai.minDelay + Math.random() * (ai.maxDelay - ai.minDelay); };

  if (dist <= punchR) {                                          // close: punch/kick pressure
    if (ready && Math.random() < ai.aggression) { arm(); intent.atk = Math.random() < 0.6 ? 'punch' : 'kick'; return intent; }
    if (dist < 40 && Math.random() < 0.04) intent[away] = true;  // occasional spacing reset
    return intent;
  }
  if (dist <= specR) {                                           // mid: poke special or close in
    if (ready && Math.random() < 0.55) { arm(); intent.atk = 'special'; return intent; }
    intent[toward] = true;
    return intent;
  }
  intent[toward] = true;                                         // far: approach
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
  const core = scene.add.rectangle(rx, ry, s, s, 0xffffff, 0.95).setDepth(29);
  scene.time.delayedCall(big ? 70 : 45, () => core.active && core.setSize(Math.round(s * 0.55), Math.round(s * 0.55)));
  scene.tweens.add({ targets: core, alpha: 0, duration: big ? 180 : 120, onComplete: () => core.destroy() });
}
// Impact weight scales with the move: a jab taps (~5 frames), a special detonates (~11).
function juiceHit(scene, x, y, blocked, ko, type, color) {
  const cam = scene.cameras.main;
  if (ko) { scene.hitstop = 500; cam.shake(320, 0.012); cam.flash(140, 255, 255, 255); }
  else if (blocked) { scene.hitstop = 50; cam.shake(80, 0.003); }
  else if (type === 'special') { scene.hitstop = 180; cam.shake(200, 0.010); }
  else if (type === 'kick') { scene.hitstop = 120; cam.shake(150, 0.007); }
  else { scene.hitstop = 85; cam.shake(110, 0.005); }
  const c = blocked ? 0x9fd8ff : ko ? 0xffe08a : type === 'special' ? (color || 0xffffff) : 0xffffff;
  spawnSpark(scene, x, y, c, ko || type === 'special');
}

function applyHit(att, def, scene) {
  const a = ATTACK[att.action.type], blocked = def.blocking;
  const dmg = a.dmg * att.stats.dmg;
  if (blocked) { def.hp = Math.max(0, def.hp - Math.max(1, Math.round(dmg * 0.2))); def.blockstun = BLOCKSTUN; def.kin.vx = att.dir * PUSHBACK; }
  else { def.hp = Math.max(0, def.hp - Math.round(dmg)); def.hitstun = a.hitstun; def.action = null; def.kin.vx = att.dir * KNOCKBACK; def.flash = 90; }
  def.ghostDelay = 350;                 // ghost HP segment lingers, then melts to the new value
  def.tookDamage = true;                // flawless-round tracking
  const ko = def.hp <= 0 && !def.koed;
  scene._frozenDef = def;               // this body buzzes ±1px during the freeze
  juiceHit(scene, (att.kin.x + def.kin.x) / 2 + att.dir * 6, def.kin.y - 92, blocked, ko, att.action.type, att.stats.color);
  if (blocked) snd(scene, 'snd_block', 0.55);
  else if (!ko) snd(scene, att.action.type === 'special' ? 'snd_special' : att.action.type === 'kick' ? 'snd_kick' : 'snd_hit', 0.6);
  if (ko) {
    def.koed = true;
    // launch the loser instead of freezing them dead — gravity draws the arc, control()'s
    // koed branch now decays vx (no longer zeroes it) so the body flies back and flops.
    def.kin.vx = att.dir * 250; def.kin.vy = -210; def.kin.grounded = false;
    // KO cinematic: hard 500ms freeze -> slow-mo -> camera punch-in on the fallen body.
    scene.slowmoT = 850;
    const cam = scene.cameras.main;
    cam.zoomTo(1.3, 340, 'Sine.easeOut');
    cam.pan(Math.round((att.kin.x + def.kin.x) / 2), Math.round(def.kin.y - 40), 340, 'Sine.easeOut');
    snd(scene, 'snd_kothud', 0.7); // the announcer call is scheduled in endRound (it knows round-vs-match + flawless)
    endRound(scene, att.isPlayer);
  }
}

function endRound(scene, playerWon) {
  scene.phase = 'roundend';
  if (playerWon) scene.pWins++; else scene.oWins++;
  const matchOver = scene.pWins >= ROUNDS_TO_WIN || scene.oWins >= ROUNDS_TO_WIN;
  // Invisible per-round rubber band (round boundaries only, so it never feels like
  // mid-fight cheating): a struggling first-timer who drops a round gets a gentler CPU
  // next round; a player who's steamrolling meets a tougher one. Bounded + reset each match.
  const ai = scene.ai;
  if (playerWon) { ai.blockChance = Math.min(0.6, ai.blockChance + 0.08); ai.aggression = Math.min(1.0, ai.aggression + 0.08); ai.minDelay = Math.max(340, ai.minDelay - 60); }
  else { ai.blockChance = Math.max(0.12, ai.blockChance - 0.12); ai.aggression = Math.max(0.5, ai.aggression - 0.12); ai.minDelay = Math.min(820, ai.minDelay + 110); }

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
      scene.phase = 'matchend';
      scene.result.setText(`${playerWon ? 'PROMOTED!' : 'PIVOT TO CONSULTING'}\n${scene.isTouch ? 'OK  rematch' : 'R rematch    ESC roster'}`).setVisible(true);
    } else {
      scene.result.setText(flawless ? 'FLAWLESS!' : 'K.P.I.').setVisible(true);
      scene.time.delayedCall(900, () => { scene.round++; startRound(scene); });
    }
  });
}

function tick(scene, dtMs) {
  const dt = dtMs / 1000, p = scene.p, o = scene.o;
  p.dir = o.kin.x >= p.kin.x ? 1 : -1;
  o.dir = p.kin.x >= o.kin.x ? 1 : -1;

  const live = scene.phase === 'fight';
  control(p, live ? playerIntent(scene) : {}, dtMs);
  if (p.action && p.action.e === 0) scene.atkBuf = null; // buffered attack was just consumed
  control(o, live ? aiIntent(scene, o, p, dtMs) : {}, dtMs);
  integrate(p, dt); integrate(o, dt);
  separate(p, o);

  if (live) {
    for (const [att, def] of [[p, o], [o, p]]) {
      if (att.action && !att.action.hasHit && phase(ATTACK[att.action.type], att.action.e) === 'active') {
        if (overlap(hitbox(att), hurtbox(def))) { att.action.hasHit = true; applyHit(att, def, scene); }
      }
    }
  }
  // the standing fighter strikes the victory pose once a round/match is decided
  if (scene.phase === 'roundend' || scene.phase === 'matchend') {
    for (const f of [p, o]) if (!f.koed) f.pose = POSE.victory;
  }
  scene.animClock += dtMs;
  for (const f of [p, o]) {
    f.spr.flipX = f.dir < 0;
    f.spr.setFrame(f.pose);
    const off = animOffset(f, scene.animClock);
    f.spr.x = Math.round(f.kin.x) + off.dx;
    f.spr.y = Math.round(f.kin.y) + off.dy;
    if (f.flash > 0) { f.flash -= dtMs; f.spr.setTintFill(0xffffff); } else f.spr.clearTint();
  }

  if (scene.phase === 'intro') {
    scene.introT -= dtMs;
    if (scene.introT <= 700) {
      scene.banner.setText('FIGHT!').setColor('#ff5000');
      if (!scene.fightSaid) { scene.fightSaid = true; snd(scene, 'snd_fight', 0.9); }
    }
    if (scene.introT <= 0) { scene.phase = 'fight'; scene.banner.setVisible(false); }
  }
  // R or ENTER (the mobile OK button dispatches Enter) rematches — without ENTER, touch
  // players were softlocked on the result screen with no reachable exit.
  if (scene.phase === 'matchend' && (scene.keys.R.isDown || scene.keys.ENTER.isDown)) { scene.pWins = scene.oWins = 0; scene.round = 1; startRound(scene); }
  if (scene.phase === 'matchend' && scene.keys.ESC.isDown) scene.scene.start('select');
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
    g.fillStyle(0x000000, 0.55); g.fillRect(x - 2, y - 2, bw + 4, bh + 4);
    g.fillStyle(0x360a0a, 1); g.fillRect(x, y, bw, bh);
    const fw = Math.max(0, Math.round(bw * frac)), gw = Math.max(0, Math.round(bw * gfrac));
    g.fillStyle(0xff8a5c, 0.85);                                  // the melting chunk = damage just taken
    if (leftAnchor) g.fillRect(x + fw, y, gw - fw, bh);
    else g.fillRect(x + bw - gw, y, gw - fw, bh);
    g.fillStyle(frac > 0.3 ? 0xffd23f : 0xff3b30, 1);            // live fill on top
    g.fillRect(leftAnchor ? x : x + bw - fw, y, fw, bh);
    g.lineStyle(1, 0xffffff, 0.85); g.strokeRect(x, y, bw, bh);
    // round pips at the INNER end of each bar (toward centre) so they never touch the names
    for (let i = 0; i < ROUNDS_TO_WIN; i++) {
      const px = leftAnchor ? x + bw - 6 - i * 9 : x + 1 + i * 9;
      g.fillStyle(i < wins ? 0x8bffa0 : 0x2a2a2a, 1); g.fillRect(px, y + bh + 3, 5, 5);
    }
  };
  bar(scene.p, 12, true, scene.pWins);
  bar(scene.o, GAME_W - 12 - bw, false, scene.oWins);
}

function fightUpdate(time, delta) {
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
    pixelArt: true, roundPixels: true, backgroundColor: '#05010c',
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
      { key: 'select', create: selectCreate },
      { key: 'fight', init: fightInit, create: fightCreate, update: fightUpdate },
    ],
  });
  const fit = () => {
    const w = (parent && parent.clientWidth) || window.innerWidth;
    const h = (parent && parent.clientHeight) || window.innerHeight;
    const z = Math.min(w / GAME_W, h / GAME_H);
    // whole-number zoom when the viewport can afford it (crisp integer pixel grid);
    // a fractional zoom below 1 so narrow / portrait phones still fit the whole 480px
    // stage instead of clipping the HUD off the sides.
    game.scale.setZoom(z >= 1 ? Math.floor(z) : Math.max(0.5, z));
  };
  game.events.once('ready', fit);
  window.addEventListener('resize', fit);
  game.events.once('destroy', () => window.removeEventListener('resize', fit));
  return game;
}

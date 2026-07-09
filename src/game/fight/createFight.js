/* AI Marketing Kombat — fight engine.
 * Boot (load all) -> Select (fighter + stage) -> Fight (best-of-3, juice).
 * SSR-safe: Phaser is injected from the client island (no top-level import).
 * Combat runs on a fixed 60Hz tick; rendering happens after. */

export const GAME_W = 480;
export const GAME_H = 270;
export const FLOOR_Y = 240;

const CELL_W = 238;
const CELL_H = 155;
export const POSE = {
  idle: 0, walk: 1, jump: 2, punch: 3, kick: 4,
  block: 5, hit: 6, ko: 7, special: 8, victory: 9,
};

const STEP = 1000 / 60;
const WALK_SPEED = 95;
const GRAVITY = 950;
const JUMP_V = -330;
const X_MIN = 34;
const X_MAX = GAME_W - 34;

const HP_MAX = 100;
const HITSTUN = 340;
const BLOCKSTUN = 150;
const KNOCKBACK = 95;
const PUSHBACK = 42;
const ROUNDS_TO_WIN = 2; // best-of-3

const ATTACK = {
  punch:   { pose: POSE.punch,   startup: 55,  active: 75,  recovery: 150, dmg: 7,  reach: 60,  hy: [95, 150] },
  kick:    { pose: POSE.kick,    startup: 85,  active: 95,  recovery: 205, dmg: 11, reach: 80,  hy: [95, 162] },
  special: { pose: POSE.special, startup: 130, active: 170, recovery: 260, dmg: 17, reach: 104, hy: [100, 168] },
};
for (const k in ATTACK) ATTACK[k].total = ATTACK[k].startup + ATTACK[k].active + ATTACK[k].recovery;

const HURT = { dx: 22, top: 130, bottom: 6 };

export const ROSTER = [
  { key: 'fighter1', name: 'CMOs', color: 0x3fe0ff },
  { key: 'fighter2', name: 'HEADS OF GROWTH', color: 0xff4d6d },
  { key: 'fighter3', name: 'PERFORMANCE LEAD GEN', color: 0x8bffa0 },
  { key: 'fighter4', name: 'AI CREATORS', color: 0xffcf3f },
  { key: 'fighter5', name: 'FUTURE LEGENDS', color: 0xb08bff },
];
export const STAGES = [
  { key: 'server', name: 'SERVER ROOM' },
  { key: 'rooftop', name: 'NEON ROOFTOP' },
  { key: 'stadium', name: 'VIRAL STADIUM' },
  { key: 'dungeon', name: 'THE DUNGEON' },
];

const txt = (scene, x, y, s, size, color, ax = 0.5, ay = 0.5) =>
  scene.add.text(x, y, s, { fontFamily: 'monospace', fontSize: `${size}px`, color, stroke: '#000', strokeThickness: 3 })
    .setOrigin(ax, ay).setResolution(3);

/* =========================================================================
   BOOT — load every fighter atlas + every stage once, then go to Select.
   ========================================================================= */
function bootPreload() {
  for (const f of ROSTER) this.load.spritesheet(f.key, `/game/sprites/${f.key}_atlas.png`, { frameWidth: CELL_W, frameHeight: CELL_H });
  for (const s of STAGES) this.load.image(`stage_${s.key}`, `/game/stages/${s.key}.png`);
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
  this.nameLabel = txt(this, GAME_W / 2, 214, '', 11, '#fff');

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
}

/* =========================================================================
   FIGHT
   ========================================================================= */
function makeFighter(scene, key, x, faceRight, isPlayer) {
  const spr = scene.add.sprite(x, FLOOR_Y, key, POSE.idle).setOrigin(0.5, 1).setDepth(10);
  return {
    spr, isPlayer, key, startX: x, startFace: faceRight,
    kin: { x, y: FLOOR_Y, vx: 0, vy: 0, grounded: true },
    dir: faceRight ? 1 : -1,
    action: null, hp: HP_MAX,
    hitstun: 0, blockstun: 0, blocking: false, koed: false, pose: POSE.idle,
  };
}
function resetFighter(f) {
  f.kin = { x: f.startX, y: FLOOR_Y, vx: 0, vy: 0, grounded: true };
  f.dir = f.startFace ? 1 : -1;
  f.action = null; f.hp = HP_MAX;
  f.hitstun = 0; f.blockstun = 0; f.blocking = false; f.koed = false; f.pose = POSE.idle;
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

  this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,A,D,W,SPACE,J,K,L,S,DOWN,R,ESC');
  this._down = { punch: false, kick: false, special: false };
  this._acc = 0;
  this.hitstop = 0;
  this.ai = { blockChance: 0.4, minDelay: 480, maxDelay: 1050, aggression: 0.85 };
  this.aiTimer = 700; this.aiBlock = 0;
  this.pWins = 0; this.oWins = 0; this.round = 1;

  this.ui = this.add.graphics().setDepth(40);
  const pName = ROSTER.find((r) => r.key === this.playerKey).name;
  const oName = ROSTER.find((r) => r.key === this.oppKey).name;
  txt(this, 12, 30, pName, 8, '#cfeaff', 0, 0);
  txt(this, GAME_W - 12, 30, oName, 8, '#cfeaff', 1, 0);
  txt(this, GAME_W / 2, 6, 'J punch   K kick   L special   S block', 8, '#7fb8cf', 0.5, 0);

  this.banner = txt(this, GAME_W / 2, 108, '', 24, '#ffd23f').setDepth(60).setVisible(false);
  this.result = txt(this, GAME_W / 2, 104, '', 20, '#ffd23f').setDepth(60).setVisible(false);

  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') window.__fight = this; // dev debug handle
  startRound(this);
}

function startRound(scene) {
  resetFighter(scene.p); resetFighter(scene.o);
  scene.aiTimer = 700; scene.aiBlock = 0; scene.hitstop = 0;
  scene.result.setVisible(false);
  scene.phase = 'intro'; scene.introT = 1500;
  scene.banner.setText(`ROUND ${scene.round}`).setVisible(true);
}

/* boxes */
function hurtbox(f) { const { x, y } = f.kin; return { x0: x - HURT.dx, x1: x + HURT.dx, y0: y - HURT.top, y1: y - HURT.bottom }; }
function hitbox(f) {
  const a = ATTACK[f.action.type];
  const front = f.kin.x + f.dir * HURT.dx, tip = front + f.dir * a.reach;
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
const BODY_SEP = 40;
function separate(a, b) {
  const dx = b.kin.x - a.kin.x, gap = Math.abs(dx);
  if (gap >= BODY_SEP) return;
  const push = (BODY_SEP - gap) / 2, sign = dx >= 0 ? 1 : -1;
  a.kin.x = Math.max(X_MIN, Math.min(X_MAX, a.kin.x - sign * push));
  b.kin.x = Math.max(X_MIN, Math.min(X_MAX, b.kin.x + sign * push));
  a.spr.x = Math.round(a.kin.x); b.spr.x = Math.round(b.kin.x);
}

function control(f, intent, dtMs) {
  f.blocking = false;
  if (f.koed) { f.pose = POSE.ko; f.kin.vx = 0; return; }
  if (f.hitstun > 0) { f.hitstun -= dtMs; f.kin.vx *= 0.82; f.pose = POSE.hit; return; }
  if (f.action) {
    f.action.e += dtMs; f.kin.vx = 0; f.pose = ATTACK[f.action.type].pose;
    if (f.action.e >= ATTACK[f.action.type].total) f.action = null;
    return;
  }
  if (f.blockstun > 0) { f.blockstun -= dtMs; f.kin.vx *= 0.82; f.pose = POSE.block; f.blocking = true; return; }
  if (f.kin.grounded && intent.atk) { f.action = { type: intent.atk, e: 0, hasHit: false }; f.kin.vx = 0; f.pose = ATTACK[intent.atk].pose; return; }
  if (intent.block && f.kin.grounded) { f.blocking = true; f.kin.vx = 0; f.pose = POSE.block; return; }
  f.kin.vx = (intent.right ? WALK_SPEED : 0) - (intent.left ? WALK_SPEED : 0);
  if (intent.jump && f.kin.grounded) { f.kin.vy = JUMP_V; f.kin.grounded = false; }
  f.pose = !f.kin.grounded ? POSE.jump : (f.kin.vx !== 0 ? POSE.walk : POSE.idle);
}

function playerIntent(scene) {
  const k = scene.keys;
  const edge = (n, key) => { const jp = key.isDown && !scene._down[n]; scene._down[n] = key.isDown; return jp; };
  const jP = edge('punch', k.J), jK = edge('kick', k.K), jL = edge('special', k.L);
  return {
    left: k.LEFT.isDown || k.A.isDown, right: k.RIGHT.isDown || k.D.isDown,
    jump: k.UP.isDown || k.W.isDown || k.SPACE.isDown, block: k.S.isDown || k.DOWN.isDown,
    atk: jP ? 'punch' : jK ? 'kick' : jL ? 'special' : null,
  };
}
function aiIntent(scene, o, p, dtMs) {
  const intent = { left: false, right: false, jump: false, block: false, atk: null };
  if (o.koed || o.hitstun > 0 || o.action) return intent;
  const ai = scene.ai, dist = Math.abs(p.kin.x - o.kin.x);
  const toward = p.kin.x < o.kin.x ? 'left' : 'right', away = toward === 'left' ? 'right' : 'left';
  if (scene.aiBlock > 0) { scene.aiBlock -= dtMs; intent.block = true; return intent; }
  if (p.action && !p.action.aiSaw && dist < 100) {
    p.action.aiSaw = true;
    if (Math.random() < ai.blockChance) { scene.aiBlock = 260; intent.block = true; return intent; }
  }
  scene.aiTimer -= dtMs;
  if (dist > 104) { intent[toward] = true; return intent; }
  if (dist < 42) {
    if (scene.aiTimer <= 0) { scene.aiTimer = ai.minDelay + Math.random() * (ai.maxDelay - ai.minDelay); intent.atk = Math.random() < 0.6 ? 'punch' : 'kick'; return intent; }
    if (Math.random() < 0.03) intent[away] = true;
    return intent;
  }
  if (scene.aiTimer <= 0 && Math.random() < ai.aggression) {
    scene.aiTimer = ai.minDelay + Math.random() * (ai.maxDelay - ai.minDelay);
    const r = Math.random(); intent.atk = r < 0.44 ? 'kick' : r < 0.78 ? 'punch' : 'special'; return intent;
  }
  if (dist > 82) intent[toward] = true;
  return intent;
}

/* juice */
function spawnSpark(scene, x, y, color, big) {
  const n = big ? 10 : 6;
  for (let i = 0; i < n; i++) {
    const g = scene.add.circle(x, y, 1 + Math.random() * 2.5, color).setDepth(30);
    const ang = (Math.PI * 2 * i) / n + Math.random(), d = (big ? 18 : 11) + Math.random() * 16;
    scene.tweens.add({ targets: g, x: x + Math.cos(ang) * d, y: y + Math.sin(ang) * d, alpha: 0, duration: 150 + Math.random() * 140, onComplete: () => g.destroy() });
  }
  const flash = scene.add.circle(x, y, big ? 16 : 9, 0xffffff, 0.9).setDepth(29);
  scene.tweens.add({ targets: flash, scale: big ? 2.8 : 2, alpha: 0, duration: big ? 200 : 130, onComplete: () => flash.destroy() });
}
function juiceHit(scene, x, y, blocked, ko) {
  const cam = scene.cameras.main;
  if (ko) { scene.hitstop = 250; cam.shake(360, 0.013); cam.flash(120, 255, 255, 255); }
  else if (blocked) { scene.hitstop = 55; cam.shake(90, 0.0035); }
  else { scene.hitstop = 95; cam.shake(150, 0.0075); }
  spawnSpark(scene, x, y, blocked ? 0x9fd8ff : ko ? 0xffe08a : 0xffffff, ko);
}

function applyHit(att, def, scene) {
  const a = ATTACK[att.action.type], blocked = def.blocking;
  if (blocked) { def.hp = Math.max(0, def.hp - Math.max(1, Math.round(a.dmg * 0.2))); def.blockstun = BLOCKSTUN; def.kin.vx = att.dir * PUSHBACK; }
  else { def.hp = Math.max(0, def.hp - a.dmg); def.hitstun = HITSTUN; def.action = null; def.kin.vx = att.dir * KNOCKBACK; }
  const ko = def.hp <= 0 && !def.koed;
  juiceHit(scene, (att.kin.x + def.kin.x) / 2 + att.dir * 6, def.kin.y - 92, blocked, ko);
  if (ko) { def.koed = true; endRound(scene, att.isPlayer); }
}

function endRound(scene, playerWon) {
  scene.phase = 'roundend';
  if (playerWon) scene.pWins++; else scene.oWins++;
  const matchOver = scene.pWins >= ROUNDS_TO_WIN || scene.oWins >= ROUNDS_TO_WIN;
  scene.time.delayedCall(480, () => {
    if (matchOver) {
      scene.phase = 'matchend';
      scene.result.setText(`${scene.pWins > scene.oWins ? 'YOU WIN' : 'YOU LOSE'}\nR rematch    ESC roster`).setVisible(true);
    } else {
      scene.result.setText('K.O.').setVisible(true);
      scene.time.delayedCall(1100, () => { scene.round++; startRound(scene); });
    }
  });
}

function tick(scene, dtMs) {
  const dt = dtMs / 1000, p = scene.p, o = scene.o;
  p.dir = o.kin.x >= p.kin.x ? 1 : -1;
  o.dir = p.kin.x >= o.kin.x ? 1 : -1;

  const live = scene.phase === 'fight';
  control(p, live ? playerIntent(scene) : {}, dtMs);
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
  for (const f of [p, o]) { f.spr.flipX = f.dir < 0; f.spr.setFrame(f.pose); }

  if (scene.phase === 'intro') {
    scene.introT -= dtMs;
    if (scene.introT <= 700) scene.banner.setText('FIGHT!').setColor('#ff5000');
    if (scene.introT <= 0) { scene.phase = 'fight'; scene.banner.setVisible(false); }
  }
  if (scene.phase === 'matchend' && scene.keys.R.isDown) { scene.pWins = scene.oWins = 0; scene.round = 1; startRound(scene); }
  if (scene.phase === 'matchend' && scene.keys.ESC.isDown) scene.scene.start('select');
}

function drawUI(scene) {
  const g = scene.ui; g.clear();
  const bw = 196, bh = 12, y = 15;
  const bar = (x, frac, leftAnchor, wins) => {
    g.fillStyle(0x000000, 0.55); g.fillRect(x - 2, y - 2, bw + 4, bh + 4);
    g.fillStyle(0x360a0a, 1); g.fillRect(x, y, bw, bh);
    const fw = Math.max(0, Math.round(bw * frac));
    g.fillStyle(frac > 0.3 ? 0xffd23f : 0xff3b30, 1);
    g.fillRect(leftAnchor ? x : x + bw - fw, y, fw, bh);
    g.lineStyle(1, 0xffffff, 0.85); g.strokeRect(x, y, bw, bh);
    for (let i = 0; i < ROUNDS_TO_WIN; i++) {
      const px = leftAnchor ? x + 4 + i * 10 : x + bw - 8 - i * 10;
      g.fillStyle(i < wins ? 0x8bffa0 : 0x222222, 1); g.fillRect(px, y + bh + 4, 6, 6);
    }
  };
  bar(12, scene.p.hp / HP_MAX, true, scene.pWins);
  bar(GAME_W - 12 - bw, scene.o.hp / HP_MAX, false, scene.oWins);
}

function fightUpdate(time, delta) {
  if (this.hitstop > 0) { this.hitstop -= delta; drawUI(this); return; }
  this._acc += Math.min(delta, 100);
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
    scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.CENTER_BOTH, width: GAME_W, height: GAME_H },
    scene: [
      { key: 'boot', preload: bootPreload, create: bootCreate },
      { key: 'select', create: selectCreate },
      { key: 'fight', init: fightInit, create: fightCreate, update: fightUpdate },
    ],
  });
  const fit = () => {
    const w = (parent && parent.clientWidth) || window.innerWidth;
    const h = (parent && parent.clientHeight) || window.innerHeight;
    game.scale.setZoom(Math.max(1, Math.floor(Math.min(w / GAME_W, h / GAME_H))));
  };
  game.events.once('ready', fit);
  window.addEventListener('resize', fit);
  game.events.once('destroy', () => window.removeEventListener('resize', fit));
  return game;
}

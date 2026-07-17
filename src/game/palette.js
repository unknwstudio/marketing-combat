/* Mirrors src/styles/index.css tokens — canvas/WebGL can't read CSS custom
 * properties; update both together.
 *
 * Each color exists as the CSS token's hex STRING (canvas2D fillStyle, Phaser
 * text color, three.js Color strings) and — where a call site needs it — as a
 * 0x NUMBER (Phaser rectangle/graphics fills, tints). The two formats are NOT
 * interchangeable in Phaser: keep each call site's original format.
 * Only tokens actually consumed by canvas/WebGL code live here. */

/* --- core arcade palette --- */
export const K_WHITE = '#ffffff'; // --k-white
export const K_WHITE_HEX = 0xffffff;
export const K_BLACK = '#000000'; // --k-black
export const K_BLACK_HEX = 0x000000;
export const K_RED = '#ff2e4d'; // --k-red
export const K_CYAN = '#3fe0ff'; // --k-cyan
export const K_CYAN_HEX = 0x3fe0ff;
export const K_GOLD = '#ffd23f'; // --k-gold (the ONE interactive-gold role)
export const K_GOLD_HEX = 0xffd23f;
export const K_TITLE_YELLOW = '#ffd000'; // --k-title-yellow (decorative title glow)
export const K_ORANGE = '#ff5000'; // --k-orange
export const K_ACCENT_GREEN = '#3ad76f'; // --k-accent-green
export const K_STAGE = '#05010c'; // --k-stage (/play fixed stage backdrop)
export const K_STAGE_HEX = 0x05010c;

/* --- /play game-HUD blue-white readout ramp + status accents --- */
export const K_HUD_INK = '#eaf4ff'; // --k-hud-ink
export const K_HUD_FROST = '#cfe6f2'; // --k-hud-frost (absorbed the near-duplicate #cfeaff, 2026-07-14)
export const K_HUD_STEEL = '#9fb6c8'; // --k-hud-steel (absorbed the near-duplicate #9fb8c8, 2026-07-14)
export const K_HUD_CYAN = '#8fe8ff'; // --k-hud-cyan
export const K_HUD_RED = '#ff4d6d'; // --k-hud-red
export const K_HUD_RED_HEX = 0xff4d6d;
export const K_HUD_GREEN = '#8bffa0'; // --k-hud-green
export const K_HUD_GREEN_HEX = 0x8bffa0;

/* --- Cabinet3D scene set --- decorative WebGL-scene colors that exist ONLY in
 * the 3D cabinet — no CSS-ledger counterpart, hence no `// --k-*` annotation
 * (scripts/check-css-vars.js asserts only the annotated mirrors above).
 * Centralized here so no component carries bare hex literals (2026-07-16 audit). */
export const CAB_TROPHY_HIGHLIGHT = '#ffe98a'; // trophy rim-light
export const CAB_SCREEN_GREEN_TOP = '#123322'; // attract-screen gradient: top
export const CAB_SCREEN_GREEN_MID = '#0b2015'; // attract-screen gradient: mid
export const CAB_SCREEN_GREEN_BOTTOM = '#08160d'; // attract-screen gradient: bottom
export const CAB_BODY = '#17121f'; // near-black cabinet shell

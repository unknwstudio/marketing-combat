#!/usr/bin/env node
/* Design-token integrity gate.
 *
 * Check 1 — undefined var(): every `var(--name)` used anywhere in src must
 * resolve to a DEFINED custom property (a `--name:` declaration in CSS, or a
 * `'--name':` inline style / setProperty('--name') in JS/JSX). A typoed token
 * name silently falls back to nothing — the browser shows no error, the style
 * just vanishes — so stylelint can't catch it. This does.
 *
 * Check 2 — palette mirror sync: src/game/palette.js hand-mirrors CSS ledger
 * hexes for canvas/WebGL ("update both together" was honor-system — 2026-07-16
 * audit). Every palette constant annotated `// --k-name` must hold exactly the
 * hex that src/styles/index.css declares for that token; 0x…_HEX twins must
 * match their string sibling. Scene-only constants (no annotation) are skipped.
 *
 * Run: `npm run lint:vars` (also part of the pre-ship gate alongside lint:css).
 * Exit 1 (with the offending names + sites) on any violation.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src');
const used = new Map(); // name -> [file:line, …]
const defined = new Set();

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(css|jsx|js|tsx|ts)$/.test(e.name)) scan(p);
  }
}

function scan(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const isCss = file.endsWith('.css');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)/g)) {
      const name = m[1];
      if (!used.has(name)) used.set(name, []);
      used.get(name).push(`${path.relative(ROOT, file)}:${i + 1}`);
    }
    if (isCss) {
      for (const m of line.matchAll(/(^|[\s;{])(--[A-Za-z0-9_-]+)\s*:/g)) defined.add(m[2]);
    } else {
      for (const m of line.matchAll(/['"](--[A-Za-z0-9_-]+)['"]\s*:/g)) defined.add(m[1]);
      for (const m of line.matchAll(/setProperty\(\s*['"](--[A-Za-z0-9_-]+)['"]/g)) defined.add(m[1]);
      for (const m of line.matchAll(/(^|[\s;{`])(--[A-Za-z0-9_-]+)\s*:/g)) defined.add(m[2]);
    }
  });
}

walk(ROOT);

let fail = 0;
for (const [name, sites] of [...used.entries()].sort()) {
  if (!defined.has(name)) {
    fail++;
    console.log(`UNDEFINED ${name}`);
    sites.slice(0, 5).forEach((s) => console.log(`   used at ${s}`));
  }
}
console.log(fail ? `\nFAIL: ${fail} undefined custom propert${fail === 1 ? 'y' : 'ies'}` : 'OK: all var() names are defined');

/* --- Check 2: palette.js mirrors the ledger ---------------------------- */
const LEDGER = path.join(ROOT, 'styles', 'index.css');
const PALETTE = path.join(ROOT, 'game', 'palette.js');
let mirrorFail = 0;
if (fs.existsSync(LEDGER) && fs.existsSync(PALETTE)) {
  const ledgerHex = new Map(); // --k-name -> #hex (lowercased)
  for (const m of fs
    .readFileSync(LEDGER, 'utf8')
    .matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g)) {
    ledgerHex.set(m[1], m[2].toLowerCase());
  }
  const palLines = fs.readFileSync(PALETTE, 'utf8').split('\n');
  const stringConsts = new Map(); // CONST_NAME -> #hex
  palLines.forEach((line, i) => {
    // annotated string mirror: export const K_X = '#hex'; // --k-x …
    const s = line.match(
      /export const ([A-Z0-9_]+)\s*=\s*'(#[0-9a-fA-F]{3,8})'\s*;?\s*\/\/\s*(--[A-Za-z0-9_-]+)/
    );
    if (s) {
      stringConsts.set(s[1], s[2].toLowerCase());
      const want = ledgerHex.get(s[3]);
      if (!want) {
        mirrorFail++;
        console.log(`PALETTE DRIFT ${s[1]} at palette.js:${i + 1} — ${s[3]} not found in the ledger`);
      } else if (want !== s[2].toLowerCase()) {
        mirrorFail++;
        console.log(
          `PALETTE DRIFT ${s[1]} at palette.js:${i + 1} — is ${s[2]}, ledger ${s[3]} = ${want}`
        );
      }
      return;
    }
    // un-annotated string const (scene-only) — record for the _HEX twin check
    const bare = line.match(/export const ([A-Z0-9_]+)\s*=\s*'(#[0-9a-fA-F]{3,8})'/);
    if (bare) stringConsts.set(bare[1], bare[2].toLowerCase());
  });
  // 0x…_HEX twins must equal their string sibling
  palLines.forEach((line, i) => {
    const h = line.match(/export const ([A-Z0-9_]+)_HEX\s*=\s*0x([0-9a-fA-F]{6})/);
    if (!h) return;
    const sibling = stringConsts.get(h[1]);
    if (sibling && sibling !== `#${h[2].toLowerCase()}`) {
      mirrorFail++;
      console.log(
        `PALETTE DRIFT ${h[1]}_HEX at palette.js:${i + 1} — 0x${h[2]} != string sibling ${sibling}`
      );
    }
  });
  console.log(
    mirrorFail
      ? `FAIL: ${mirrorFail} palette.js mirror drift${mirrorFail === 1 ? '' : 's'}`
      : 'OK: game/palette.js mirrors the ledger'
  );
}

process.exit(fail || mirrorFail ? 1 : 0);

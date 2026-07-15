#!/usr/bin/env node
/* Design-token integrity gate.
 *
 * Every `var(--name)` used anywhere in src must resolve to a DEFINED custom
 * property (a `--name:` declaration in CSS, or a `'--name':` inline style /
 * setProperty('--name') in JS/JSX). A typoed token name silently falls back to
 * nothing — the browser shows no error, the style just vanishes — so stylelint
 * can't catch it. This does.
 *
 * Run: `npm run lint:vars` (also part of the pre-ship gate alongside lint:css).
 * Exit 1 (with the offending names + first use sites) if any var() is undefined.
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
process.exit(fail ? 1 : 0);

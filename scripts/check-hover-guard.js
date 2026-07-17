// Design-system gate: every :hover rule must live inside @media (hover: hover)
// so touch devices (hover: none) never get sticky hover states (owner rule,
// 2026-07-17). Runs as part of lint:ds (prebuild). Exits 1 listing offenders.
const postcss = require('postcss')
const fs = require('fs')
const path = require('path')

const SRC = path.join(__dirname, '..', 'src')
const files = []
;(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name.endsWith('.css')) files.push(p)
  }
})(SRC)

const offenders = []
for (const file of files) {
  const root = postcss.parse(fs.readFileSync(file, 'utf8'), { from: file })
  root.walkRules((rule) => {
    if (!rule.selector.includes(':hover')) return
    for (let p = rule.parent; p; p = p.parent) {
      if (p.type === 'atrule' && p.name === 'media' && /hover:\s*hover/.test(p.params)) return
    }
    offenders.push(
      `${path.relative(process.cwd(), file)}:${rule.source.start.line} ${rule.selector.split('\n').join(' ')}`
    )
  })
}

if (offenders.length) {
  console.error('Naked :hover outside @media (hover: hover) — sticky on touch:')
  for (const o of offenders) console.error('  ' + o)
  process.exit(1)
}
console.log(`hover-guard OK (${files.length} css files)`)

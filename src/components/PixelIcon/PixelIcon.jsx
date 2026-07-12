/**
 * PixelIcon — the site's shared inline-SVG icon set, drawn on a coarse pixel
 * grid so every icon reads as sprite art. Replaces unicode/emoji glyphs
 * (★ ► ▶ ↗ ↘ …) whose rendering is font/OS lottery — Windows and some font
 * stacks swap them for full-color emoji that break the pixel aesthetic (the
 * marquee's gold ⭐ was exactly that). SVG gives us: deterministic shape on
 * every platform, `currentColor` fill (icons inherit the text color like a
 * glyph would), crisp edges at any size, zero network requests.
 *
 * Usage: <PixelIcon name="star" />  — sizes to 1em by default so it drops
 * into text. Decorative by contract (aria-hidden); pass a `label` only when
 * the icon CARRIES meaning the surrounding text doesn't — the sole content of
 * an interactive element, or a glyph read mid-sentence ("the ❚❚ button").
 *
 * Adding icons: append rows to GRIDS below. Each string is one pixel row;
 * 'X' = filled cell. Keep grids odd-width where symmetry matters.
 */

const GRIDS = {
  // classic arcade star (11x9)
  star: [
    '.....X.....',
    '....XXX....',
    '....XXX....',
    'XXXXXXXXXXX',
    '.XXXXXXXXX.',
    '..XXXXXXX..',
    '...XXXXX...',
    '..XXX.XXX..',
    '.XX.....XX.',
  ],
  // solid play/select triangle ► (6x9)
  play: [
    'X.....',
    'XX....',
    'XXX...',
    'XXXX..',
    'XXXXX.',
    'XXXX..',
    'XXX...',
    'XX....',
    'X.....',
  ],
  // ↗ arrow (9x9)
  arrowNE: [
    '...XXXXXX',
    '.....XXXX',
    '....XXXXX',
    '...XXX.XX',
    '..XXX...X',
    '.XXX.....',
    'XXX......',
    'XX.......',
    'X........',
  ],
  // ↘ arrow (9x9)
  arrowSE: [
    'X........',
    'XX.......',
    'XXX......',
    '.XXX.....',
    '..XXX...X',
    '...XXX.XX',
    '....XXXXX',
    '.....XXXX',
    '...XXXXXX',
  ],
  // crown ♛ (11x9)
  crown: [
    '.X...X...X.',
    'XXX.XXX.XXX',
    '.X...X...X.',
    'X.X.X.X.X.X',
    'XX.XX.XX.XX',
    'XXXXXXXXXXX',
    '.XXXXXXXXX.',
    '.XXXXXXXXX.',
    '.XXXXXXXXX.',
  ],
  // ◀ triangle (5x9) — directional, perfectly centered (unlike `play`, whose
  // 6th empty column gives it breathing room next to text but off-centers it
  // half a cell inside a square button — noticeable on the game D-pad)
  triLeft: [
    '....X',
    '...XX',
    '..XXX',
    '.XXXX',
    'XXXXX',
    '.XXXX',
    '..XXX',
    '...XX',
    '....X',
  ],
  // ▶ triangle (5x9) — mirror of triLeft. Use for DIRECTION (D-pad, key
  // hints, step chains); keep `play` for play/select affordances.
  triRight: [
    'X....',
    'XX...',
    'XXX..',
    'XXXX.',
    'XXXXX',
    'XXXX.',
    'XXX..',
    'XX...',
    'X....',
  ],
  // ▲ triangle (9x5)
  triUp: [
    '....X....',
    '...XXX...',
    '..XXXXX..',
    '.XXXXXXX.',
    'XXXXXXXXX',
  ],
  // ▼ triangle (9x5)
  triDown: [
    'XXXXXXXXX',
    '.XXXXXXX.',
    '..XXXXX..',
    '...XXX...',
    '....X....',
  ],
  // ✕ close (9x9)
  cross: [
    'XX.....XX',
    'XXX...XXX',
    '.XXX.XXX.',
    '..XXXXX..',
    '...XXX...',
    '..XXXXX..',
    '.XXX.XXX.',
    'XXX...XXX',
    'XX.....XX',
  ],
  // ❚❚ pause (5x9)
  pause: [
    'XX.XX',
    'XX.XX',
    'XX.XX',
    'XX.XX',
    'XX.XX',
    'XX.XX',
    'XX.XX',
    'XX.XX',
    'XX.XX',
  ],
  // ? question mark (8x8) — classic bitmap-font shape (hook + separated dot)
  question: [
    '.XXXXX..',
    'XX..XXX.',
    '....XXX.',
    '...XXX..',
    '..XXX...',
    '........',
    '..XXX...',
    '..XXX...',
  ],
  // ◆ diamond (9x9)
  diamond: [
    '....X....',
    '...XXX...',
    '..XXXXX..',
    '.XXXXXXX.',
    'XXXXXXXXX',
    '.XXXXXXX.',
    '..XXXXX..',
    '...XXX...',
    '....X....',
  ],
}

export default function PixelIcon({ name, size = '1em', className = '', label }) {
  const grid = GRIDS[name]
  if (!grid) return null
  const h = grid.length
  const w = grid[0].length
  const rects = []
  for (let y = 0; y < h; y++) {
    // merge horizontal runs so the DOM stays light (one rect per run, not per cell)
    let x = 0
    while (x < w) {
      if (grid[y][x] === 'X') {
        let x2 = x
        while (x2 < w && grid[y][x2] === 'X') x2++
        rects.push(<rect key={`${y}-${x}`} x={x} y={y} width={x2 - x} height={1} />)
        x = x2
      } else {
        x++
      }
    }
  }
  return (
    <svg
      className={`pixel-icon${className ? ` ${className}` : ''}`}
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={size}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
      style={{ display: 'inline-block', verticalAlign: '-0.08em' }}
    >
      {rects}
    </svg>
  )
}

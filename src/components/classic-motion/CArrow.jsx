/**
 * CArrow — the one editorial arrow mark for the classic (Swiss) skin.
 * Replaces the hand-typed "→" glyphs so every arrow is a single, aligned
 * SVG that inherits its colour (currentColor) and is sized by CSS per use.
 * Square caps + mitered head to match the neo-brutalist type treatment.
 * Decorative: aria-hidden + focusable={false} so it never lands in the a11y
 * tree or the tab order (the surrounding control carries the real label).
 */
export default function CArrow({ className = '' }) {
  return (
    <svg
      className={['c-arrow', className].filter(Boolean).join(' ')}
      viewBox="0 0 40 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1 8h36M30 1.5 37 8l-7 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  )
}

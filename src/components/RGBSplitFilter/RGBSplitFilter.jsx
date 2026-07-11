/**
 * RGBSplitFilter — a single reusable SVG chromatic-aberration filter, mounted
 * once. Any element can apply it with `filter: url(#k-rgb-split)` (see the
 * Fighters/Judges/Organizers portrait hover effect). Zero-size + aria-hidden;
 * <defs> alone render nothing.
 */
export default function RGBSplitFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="k-rgb-split" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="r"
          />
          <feOffset in="r" dx="-3" dy="0" result="rOff" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="g"
          />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="b"
          />
          <feOffset in="b" dx="3" dy="0" result="bOff" />
          <feBlend in="rOff" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="bOff" mode="screen" />
        </filter>
      </defs>
    </svg>
  )
}

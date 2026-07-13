/**
 * MaskHead — a heading whose lines rise into place from behind their own
 * baseline (the line-mask reveal). Pass `lines` as an array of strings (one
 * per visual line); each is wrapped in the overflow-clipped .c-mask / .c-line
 * structure that classic.css animates. ClassicReveal flips `.is-in` on view.
 *
 * Static markup only — safe in server components.
 */
export default function MaskHead({ lines, className = '', id }) {
  return (
    <h2 className={`c-h2 c-mask-head ${className}`.trim()} id={id}>
      {lines.map((line, i) => (
        <span className="c-mask" key={i}>
          <span className="c-line cap-trim" style={{ '--i': i }}>
            {line}
          </span>
        </span>
      ))}
    </h2>
  )
}

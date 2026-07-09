import { useEffect, useRef, useState } from 'react';
import './HealthBar.css';

/**
 * HealthBar — 8-bit segmented depleting bar for any metric (score, quota, usage).
 * The color fill drops instantly block-by-block; on a decrease the lost segments
 * show a white "ghost" layer that drains down to meet the fill over ~400ms.
 * Reduced-motion: ghost snaps instantly.
 */
export default function HealthBar({
  value,
  max = 100,
  segments = 20,
  color = 'var(--k-green)',
  label,
  showGhost = true,
}) {
  const clamped = Math.max(0, Math.min(value, max));
  const filled = Math.round((clamped / max) * segments);
  const [ghost, setGhost] = useState(filled);
  const prevFilled = useRef(filled);

  useEffect(() => {
    const from = prevFilled.current;
    prevFilled.current = filled;

    // Not a decrease (or ghost disabled): snap the ghost to the fill.
    if (!showGhost || filled >= from) {
      setGhost(filled);
      return undefined;
    }

    const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setGhost(from);
    if (reduce) {
      setGhost(filled);
      return undefined;
    }

    // Drain the ghost one segment at a time so the whole fall takes ~400ms.
    const lost = from - filled;
    const stepMs = Math.max(40, Math.round(400 / lost));
    let current = from;
    const id = setInterval(() => {
      current -= 1;
      setGhost(current);
      if (current <= filled) clearInterval(id);
    }, stepMs);

    return () => clearInterval(id);
  }, [filled, showGhost]);

  const blocks = [];
  for (let i = 0; i < segments; i += 1) {
    let state = 'empty';
    if (i < filled) state = 'filled';
    else if (i < ghost) state = 'ghost';
    blocks.push(
      <span key={i} className={`k-health__seg k-health__seg--${state}`} />
    );
  }

  return (
    <div className="k-health" style={{ '--k-health-color': color }}>
      {label && (
        <div className="k-health__label">
          <span>{label}</span>
          <span className="k-health__value">
            {clamped}/{max}
          </span>
        </div>
      )}
      <div
        className="k-health__track pixelated"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'health'}
      >
        {blocks}
      </div>
    </div>
  );
}

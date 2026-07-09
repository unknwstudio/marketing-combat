'use client'

import { useRef } from 'react';
import './PixelButton.css';

/**
 * PixelButton — arcade key. A hard 1px-style offset bottom edge (box-shadow)
 * that collapses on :active (translateY key-travel), plus a quick invert(1)
 * flash on click via WAAPI (~60ms). Reduced-motion: press travel kept, no flash.
 *
 * variant: 'primary' (red) | 'secondary' (yellow) | 'ghost' (cyan outline)
 */
export default function PixelButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}) {
  const ref = useRef(null);

  const handleClick = (e) => {
    const el = ref.current;
    const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (el && el.animate && !reduce) {
      el.animate(
        [{ filter: 'invert(1)' }, { filter: 'invert(0)' }],
        { duration: 60, easing: 'steps(1)' }
      );
    }

    if (onClick) onClick(e);
  };

  return (
    <button
      ref={ref}
      type="button"
      className={`k-btn k-btn--${variant} pixelated`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
'use client'

import './GlitchText.css';

/**
 * GlitchText — RGB channel-split glitch. Duplicates the string into ::before
 * (cyan) and ::after (magenta) pseudo-elements via a data-text attribute and
 * jitters them with clip-path. Pure CSS animation; reduced-motion: static split.
 */
export default function GlitchText({ children, as = 'span', intense = false }) {
  const Tag = as;
  const text = typeof children === 'string' ? children : String(children ?? '');

  return (
    <Tag
      className={`k-glitch${intense ? ' k-glitch--intense' : ''}`}
      data-text={text}
    >
      {text}
    </Tag>
  );
}
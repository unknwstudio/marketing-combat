'use client';

import { useEffect, useRef } from 'react';
import './MobileControls.css';

// Touch buttons dispatch the SAME key events the Phaser game already listens for,
// so movement, attacks and menu navigation all work with zero engine changes.
const KEYS = {
  left:  { key: 'ArrowLeft',  code: 'ArrowLeft',  keyCode: 37 },
  right: { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
  up:    { key: 'ArrowUp',    code: 'ArrowUp',    keyCode: 38 },
  down:  { key: 'ArrowDown',  code: 'ArrowDown',  keyCode: 40 },
  j:     { key: 'j', code: 'KeyJ', keyCode: 74 },
  k:     { key: 'k', code: 'KeyK', keyCode: 75 },
  l:     { key: 'l', code: 'KeyL', keyCode: 76 },
  enter: { key: 'Enter', code: 'Enter', keyCode: 13 },
};
const fire = (type, s) => window.dispatchEvent(new KeyboardEvent(type, { ...s, which: s.keyCode, bubbles: true }));

export default function MobileControls() {
  const held = useRef(new Set());

  // safety: release everything if the page loses focus / a pointer is lost
  useEffect(() => {
    const releaseAll = () => { held.current.forEach((n) => fire('keyup', KEYS[n])); held.current.clear(); };
    window.addEventListener('blur', releaseAll);
    window.addEventListener('pointercancel', releaseAll);
    return () => { window.removeEventListener('blur', releaseAll); window.removeEventListener('pointercancel', releaseAll); };
  }, []);

  const press = (name) => (e) => { e.preventDefault(); if (!held.current.has(name)) { held.current.add(name); fire('keydown', KEYS[name]); } };
  const lift = (name) => (e) => { e.preventDefault(); if (held.current.has(name)) { held.current.delete(name); fire('keyup', KEYS[name]); } };
  const bind = (name) => ({
    onPointerDown: press(name),
    onPointerUp: lift(name),
    onPointerLeave: lift(name),
    onContextMenu: (e) => e.preventDefault(),
  });

  return (
    <div className="mc-root" aria-hidden="true">
      <div className="mc-pad">
        <button className="mc-btn mc-up" {...bind('up')}>▲</button>
        <button className="mc-btn mc-left" {...bind('left')}>‹</button>
        <button className="mc-btn mc-right" {...bind('right')}>›</button>
        <button className="mc-btn mc-down" {...bind('down')}>▼</button>
      </div>
      <div className="mc-actions">
        <button className="mc-btn mc-j" {...bind('j')}>J</button>
        <button className="mc-btn mc-k" {...bind('k')}>K</button>
        <button className="mc-btn mc-l" {...bind('l')}>L</button>
        <button className="mc-btn mc-ok" {...bind('enter')}>OK</button>
      </div>
    </div>
  );
}

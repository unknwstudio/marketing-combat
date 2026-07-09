import { useEffect, useRef, useState } from 'react';
import './Typewriter.css';

/**
 * Typewriter — types text character-by-character with a blinking block caret.
 * JS-driven (setInterval slicing) so it works on dynamic text; restarts when
 * `text` changes. Reduced-motion: reveals the full string instantly.
 */
export default function Typewriter({
  text = '',
  speed = 45,
  startDelay = 0,
  caret = true,
  onDone,
}) {
  const [shown, setShown] = useState('');
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || !text) {
      setShown(text);
      if (onDoneRef.current) onDoneRef.current();
      return undefined;
    }

    setShown('');
    let i = 0;
    let intervalId;
    const startId = setTimeout(() => {
      intervalId = setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(intervalId);
          if (onDoneRef.current) onDoneRef.current();
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startId);
      clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return (
    <span className="k-typewriter">
      <span className="k-typewriter__text">{shown}</span>
      {caret && <span className="k-typewriter__caret" aria-hidden="true" />}
    </span>
  );
}

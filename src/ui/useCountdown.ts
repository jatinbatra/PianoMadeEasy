import { useEffect, useRef, useState } from 'react';

/**
 * A simple block timer. Counts down `seconds` and calls `onDone` once when it
 * hits zero. Pausing isn't needed in Phase 0 — a block just runs its length.
 */
export function useCountdown(seconds: number, onDone: () => void): number {
  const [remaining, setRemaining] = useState(seconds);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    setRemaining(seconds);
    const started = Date.now();
    const id = setInterval(() => {
      const left = Math.max(0, seconds - Math.floor((Date.now() - started) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        doneRef.current();
      }
    }, 250);
    return () => clearInterval(id);
  }, [seconds]);

  return remaining;
}

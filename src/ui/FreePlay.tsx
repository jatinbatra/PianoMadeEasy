import { useState } from 'react';
import { Keyboard } from './Keyboard';
import { noteName } from '../midi/notes';
import type { Input } from '../input/useInput';

/** Just a piano. No lesson, no timer — noodle, hear it, get comfortable. */
export function FreePlay({ input, onBack }: { input: Input; onBack: () => void }) {
  const [last, setLast] = useState<number | null>(null);

  function tap(midi: number) {
    input.tapNote(midi);
    setLast(midi);
  }

  return (
    <div className="free-play">
      <header className="lib-head">
        <button className="link-btn" onClick={onBack}>
          ← Back
        </button>
        <h1>Free play</h1>
      </header>

      <p className="hint">Tap the keys. No pressure, no score — just make some sound.</p>

      <div className="free-note">{last != null ? noteName(last) : ' '}</div>

      <div className="free-keys">
        <Keyboard octaves={2} startOctave={3} played={last} onTap={tap} />
      </div>
    </div>
  );
}

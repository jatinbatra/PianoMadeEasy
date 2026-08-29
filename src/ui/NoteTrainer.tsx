import { useCallback, useEffect, useRef, useState } from 'react';
import { Staff } from './Staff';
import { Keyboard } from './Keyboard';
import { playNote } from '../audio/synth';
import { pitchClass, parsePitch, solfege, type PitchClass } from '../midi/notes';
import type { Input } from '../input/useInput';

// Treble-clef reading range for a beginner: middle C up to the C above.
const POOL = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'];
const LETTERS: PitchClass[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function randomPitch(not?: string): string {
  let p = POOL[Math.floor(Math.random() * POOL.length)];
  while (p === not) p = POOL[Math.floor(Math.random() * POOL.length)];
  return p;
}

type Mark = { letter: PitchClass; correct: boolean } | null;

/**
 * Read-the-note practice, in the spirit of musictheory.net's note trainer but
 * in this app's voice: a note appears on the staff, you name it — by tapping
 * the key, playing it on your piano, or picking a letter. Objective, never
 * "did you get it right?", and a hint is one tap away so it never feels like a
 * wall.
 */
export function NoteTrainer({ input, onBack }: { input: Input; onBack: () => void }) {
  const [target, setTarget] = useState(() => randomPitch());
  const [mark, setMark] = useState<Mark>(null);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hint, setHint] = useState(false);
  const locked = useRef(false);
  const targetPc = pitchClass(parsePitch(target));

  const answer = useCallback(
    (letter: PitchClass) => {
      if (locked.current) return;
      locked.current = true;
      const ok = letter === targetPc;
      setMark({ letter, correct: ok });
      setTotal((t) => t + 1);
      if (ok) {
        setCorrect((c) => c + 1);
        setStreak((s) => s + 1);
        playNote(parsePitch(target), 320);
      } else {
        setStreak(0);
      }
      setHint(false);
      setTimeout(
        () => {
          setTarget((prev) => randomPitch(prev));
          setMark(null);
          locked.current = false;
        },
        ok ? 650 : 1300,
      );
    },
    [targetPc, target],
  );

  // Real input (MIDI / mic / tapped key) answers too — see, then play it.
  useEffect(() => {
    const unsub = input.subscribe((n) => {
      if (n.on) answer(pitchClass(n.note) as PitchClass);
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.subscribe, answer]);

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="trainer">
      <header className="lib-head">
        <button className="link-btn" onClick={onBack}>
          ← Back
        </button>
        <h1>Read the notes</h1>
      </header>

      <div className="trainer-stats">
        <span>
          <strong>{correct}</strong>/{total} right
        </span>
        <span>{pct}%</span>
        <span>🔥 {streak}</span>
      </div>

      <div className="trainer-staff">
        <Staff pitch={target} showHint={hint} />
      </div>

      <div className="trainer-feedback">
        {mark ? (
          mark.correct ? (
            <span className="tf-ok">✓ {targetPc} — {solfege(parsePitch(target))}</span>
          ) : (
            <span className="tf-no">
              That was <strong>{mark.letter}</strong> — this note is <strong>{targetPc}</strong>
            </span>
          )
        ) : (
          <button className="link-btn" onClick={() => setHint((h) => !h)}>
            {hint ? 'hide hint' : 'need a hint?'}
          </button>
        )}
      </div>

      <div className="letter-row">
        {LETTERS.map((l) => (
          <button
            key={l}
            className={
              'letter-btn' +
              (mark && l === targetPc ? ' right' : '') +
              (mark && !mark.correct && l === mark.letter ? ' wrong' : '')
            }
            onClick={() => answer(l)}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="trainer-keys">
        <div className="trainer-keys-cap">…or find it on the piano</div>
        <Keyboard highlight={mark ? [targetPc] : []} onTap={(m) => input.tapNote(m)} />
      </div>
    </div>
  );
}

import { pitchClass, type PitchClass } from '../midi/notes';

interface KeyboardProps {
  /** Pitch class to highlight as the target (e.g. "F"). */
  target?: PitchClass;
  /** The last note the user actually played, to flash on the key. */
  played?: number | null;
  /** Show the letter on each white key — a beginner aid, on by default. */
  showLabels?: boolean;
}

// One octave, C through the next C. Beginner-friendly: labelled, high contrast.
const WHITE: PitchClass[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
// Black keys sit after these white indices (C#, D#, then gap, F#, G#, A#).
const BLACK_AFTER: Record<number, PitchClass> = {
  0: 'C#',
  1: 'D#',
  3: 'F#',
  4: 'G#',
  5: 'A#',
};

export function Keyboard({ target, played, showLabels = true }: KeyboardProps) {
  const playedPc = played != null ? pitchClass(played) : null;

  return (
    <div className="keyboard" role="img" aria-label={target ? `Keyboard, find ${target}` : 'Keyboard'}>
      {WHITE.map((pc, i) => {
        const isTarget = target === pc;
        const isPlayed = playedPc === pc;
        const black = BLACK_AFTER[i];
        const blackIsTarget = target === black;
        const blackIsPlayed = playedPc === black;
        return (
          <div key={pc} className="key-slot">
            <div
              className={
                'white-key' +
                (isTarget ? ' target' : '') +
                (isPlayed ? ' played' : '')
              }
            >
              {showLabels && <span className="key-label">{pc}</span>}
            </div>
            {black && (
              <div
                className={
                  'black-key' +
                  (blackIsTarget ? ' target' : '') +
                  (blackIsPlayed ? ' played' : '')
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

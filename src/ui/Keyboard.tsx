import { pitchClass, midiFor, type PitchClass } from '../midi/notes';

interface KeyboardProps {
  /** Pitch classes to highlight as targets (e.g. ["C","E","G"] for a chord). */
  highlight?: PitchClass[];
  /** The last note the user actually played, to flash on the key. */
  played?: number | null;
  /** Show the letter on each white key — a beginner aid, on by default. */
  showLabels?: boolean;
  /** When set, keys are playable: tapping calls this with the MIDI note. */
  onTap?: (midi: number) => void;
}

// One octave, C through B. Beginner-friendly: labelled, high contrast.
const WHITE: PitchClass[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_AFTER: Record<number, PitchClass> = { 0: 'C#', 1: 'D#', 3: 'F#', 4: 'G#', 5: 'A#' };
const OCT = 4;

export function Keyboard({ highlight = [], played, showLabels = true, onTap }: KeyboardProps) {
  const playedPc = played != null ? pitchClass(played) : null;
  const targets = new Set<PitchClass>(highlight);
  const playable = !!onTap;

  const press = (pc: PitchClass) => (e: React.PointerEvent) => {
    if (!onTap) return;
    e.preventDefault();
    onTap(midiFor(pc, OCT));
  };

  return (
    <div className={'keyboard' + (playable ? ' playable' : '')} role="group" aria-label="Piano keyboard">
      {WHITE.map((pc, i) => {
        const isTarget = targets.has(pc);
        const isPlayed = playedPc === pc;
        const black = BLACK_AFTER[i];
        const blackIsTarget = black && targets.has(black);
        const blackIsPlayed = playedPc === black;
        return (
          <div key={pc} className="key-slot">
            <div
              className={'white-key' + (isTarget ? ' target' : '') + (isPlayed ? ' played' : '')}
              onPointerDown={press(pc)}
              role={playable ? 'button' : undefined}
              aria-label={playable ? `Play ${pc}` : undefined}
            >
              {showLabels && <span className="key-label">{pc}</span>}
            </div>
            {black && (
              <div
                className={'black-key' + (blackIsTarget ? ' target' : '') + (blackIsPlayed ? ' played' : '')}
                onPointerDown={press(black)}
                role={playable ? 'button' : undefined}
                aria-label={playable ? `Play ${black}` : undefined}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

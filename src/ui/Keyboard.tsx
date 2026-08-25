import { pitchClass, midiFor, type PitchClass } from '../midi/notes';

interface KeyboardProps {
  /** Pitch classes to highlight as targets (e.g. ["C","E","G"] for a chord). */
  highlight?: PitchClass[];
  /** Faint landmark hints (e.g. the two/three black keys a lesson refers to). */
  hints?: PitchClass[];
  /** The last note the user actually played, to flash on the key. */
  played?: number | null;
  /** Show the letter on each white key — a beginner aid, on by default. */
  showLabels?: boolean;
  /** When set, keys are playable: tapping calls this with the MIDI note. */
  onTap?: (midi: number) => void;
  /** How many octaves to draw (default 1). */
  octaves?: number;
  /** Octave of the leftmost C (default 4). */
  startOctave?: number;
}

const WHITE: PitchClass[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_AFTER: Record<number, PitchClass> = { 0: 'C#', 1: 'D#', 3: 'F#', 4: 'G#', 5: 'A#' };

export function Keyboard({
  highlight = [],
  hints = [],
  played,
  showLabels = true,
  onTap,
  octaves = 1,
  startOctave = 4,
}: KeyboardProps) {
  const playedPc = played != null ? pitchClass(played) : null;
  const targets = new Set<PitchClass>(highlight);
  const hintSet = new Set<PitchClass>(hints);
  const playable = !!onTap;

  const press = (midi: number) => (e: React.PointerEvent) => {
    if (!onTap) return;
    e.preventDefault();
    onTap(midi);
  };

  // Flatten octaves into a single row of white-key slots.
  const slots = Array.from({ length: octaves }, (_, o) => o).flatMap((o) =>
    WHITE.map((pc, i) => ({ pc, i, oct: startOctave + o })),
  );

  return (
    <div className={'keyboard' + (playable ? ' playable' : '')} role="group" aria-label="Piano keyboard">
      {slots.map(({ pc, i, oct }) => {
        const isTarget = targets.has(pc);
        const isPlayed = playedPc === pc && (played == null || Math.floor(played / 12) - 1 === oct);
        const isHint = !isTarget && hintSet.has(pc);
        const black = BLACK_AFTER[i];
        const blackIsTarget = black && targets.has(black);
        const blackIsPlayed = black && playedPc === black;
        const blackIsHint = black && !blackIsTarget && hintSet.has(black);
        return (
          <div key={`${pc}${oct}`} className="key-slot">
            <div
              className={
                'white-key' + (isTarget ? ' target' : '') + (isPlayed ? ' played' : '') + (isHint ? ' hint' : '')
              }
              onPointerDown={press(midiFor(pc, oct))}
              role={playable ? 'button' : undefined}
              aria-label={playable ? `Play ${pc}` : undefined}
            >
              {showLabels && <span className="key-label">{pc}</span>}
            </div>
            {black && (
              <div
                className={
                  'black-key' +
                  (blackIsTarget ? ' target' : '') +
                  (blackIsPlayed ? ' played' : '') +
                  (blackIsHint ? ' hint' : '')
                }
                onPointerDown={press(midiFor(black, oct))}
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

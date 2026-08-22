import { parsePitch, pitchClass, octave } from '../midi/notes';

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

/** Diatonic staff step relative to the treble bottom line (E4 = 0). */
function staffStep(pitch: string): number {
  const midi = parsePitch(pitch);
  const letter = pitchClass(midi).replace('#', '');
  const oct = octave(midi);
  const abs = oct * 7 + LETTERS.indexOf(letter);
  return abs - (4 * 7 + LETTERS.indexOf('E')); // E4 reference
}

/**
 * A small, honest treble staff showing one note. Reading is kept gentle — a
 * faint letter hint sits beside the note so it never feels like a test he
 * can't pass.
 */
export function Staff({ pitch, showHint = true }: { pitch: string; showHint?: boolean }) {
  const W = 220;
  const H = 120;
  const lineGap = 13;
  const topLineY = 34; // y of the top staff line (F5)
  const bottomLineY = topLineY + lineGap * 4; // E4
  const step = staffStep(pitch);
  const noteY = bottomLineY - step * (lineGap / 2);
  const noteX = 150;

  const lines = [0, 1, 2, 3, 4].map((i) => topLineY + i * lineGap);

  // Ledger lines for notes sitting below the staff (e.g. middle C).
  const ledgers: number[] = [];
  for (let s = -2; s >= step; s -= 2) ledgers.push(bottomLineY - s * (lineGap / 2));

  return (
    <svg className="staff" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Note ${pitchClass(parsePitch(pitch))} on the staff`}>
      {lines.map((y) => (
        <line key={y} x1="12" y1={y} x2={W - 12} y2={y} stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
      ))}
      {/* Simple treble-clef mark. */}
      <text x="20" y={bottomLineY + 6} className="clef">𝄞</text>

      {ledgers.map((y) => (
        <line key={`l${y}`} x1={noteX - 14} y1={y} x2={noteX + 14} y2={y} stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
      ))}

      <ellipse cx={noteX} cy={noteY} rx="9" ry="7" fill="var(--target)" transform={`rotate(-20 ${noteX} ${noteY})`} />
      <line x1={noteX + 8.5} y1={noteY - 2} x2={noteX + 8.5} y2={noteY - 34} stroke="var(--target)" strokeWidth="2" />

      {showHint && (
        <text x={noteX + 26} y={noteY + 5} className="staff-hint">
          {pitchClass(parsePitch(pitch))}
        </text>
      )}
    </svg>
  );
}

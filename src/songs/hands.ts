import { parsePitch, pitchClass, solfege } from '../midi/notes';
import type { SongNote, LeftHandNote, SongChunk } from '../types/song';

/** Beat offset of the melody at a given note index. */
function beatAt(notes: SongNote[], cursor: number): number {
  let b = 0;
  for (let i = 0; i < cursor && i < notes.length; i++) b += notes[i].beats;
  return b;
}

/** The left-hand note sounding while the melody sits on `cursor` (by beats). */
export function activeLeftHand(
  notes: SongNote[],
  cursor: number,
  leftHand?: LeftHandNote[],
): LeftHandNote | null {
  if (!leftHand || leftHand.length === 0) return null;
  const beat = beatAt(notes, cursor % Math.max(1, notes.length));
  let acc = 0;
  for (const lh of leftHand) {
    if (beat < acc + lh.beats) return lh;
    acc += lh.beats;
  }
  return leftHand[leftHand.length - 1];
}

export interface SheetCell {
  letter: string; // "E", "F#"
  solfege: string; // "MI"
  finger?: number;
  lyric?: string;
  index: number; // position in the flat notes array (-1 for a hold "-" cell)
  hold?: boolean; // a "-" continuation of the previous note
}
export interface SheetBar {
  chord?: string;
  bass?: string;
  bassFinger?: number;
  cells: SheetCell[];
}

/**
 * Lay a chunk out exactly like the teacher's sheet: bars separated by lines,
 * a left-hand chord (with its finger) over each bar, a finger number over each
 * right-hand note, the note letters in a row, and a "-" for every held beat —
 * e.g. `| E E E - |`. Bars follow the left-hand spans when present, else 4 beats.
 */
export function toSheet(chunk: SongChunk, beatsPerBar = 4): SheetBar[] {
  const { notes, leftHand } = chunk;
  const spans = leftHand?.length
    ? leftHand.map((lh) => lh.beats)
    : Array.from({ length: Math.ceil(totalBeats(notes) / beatsPerBar) }, () => beatsPerBar);

  const cellFor = (n: SongNote, ni: number): SheetCell => {
    const midi = parsePitch(n.pitch);
    return { letter: pitchClass(midi) + tick(n.pitch), solfege: solfege(midi), finger: n.finger, lyric: n.lyric, index: ni };
  };
  const holdCell = (): SheetCell => ({ letter: '-', solfege: '', index: -1, hold: true });

  const bars: SheetBar[] = [];
  let ni = 0;
  let acc = 0;
  for (let s = 0; s < spans.length; s++) {
    const end = acc + spans[s];
    const cells: SheetCell[] = [];
    while (ni < notes.length && beatAt(notes, ni) < end - 1e-6) {
      const n = notes[ni];
      cells.push(cellFor(n, ni));
      for (let h = 0; h < Math.max(0, Math.round(n.beats) - 1); h++) cells.push(holdCell());
      ni += 1;
    }
    const lh = leftHand?.[s];
    bars.push({ chord: lh?.chord, bass: lh ? pitchClass(parsePitch(lh.pitch)) : undefined, bassFinger: lh?.finger, cells });
    acc = end;
  }
  // Any leftover notes (safety) go in a final bar.
  if (ni < notes.length) {
    const cells: SheetCell[] = [];
    for (; ni < notes.length; ni++) {
      cells.push(cellFor(notes[ni], ni));
      for (let h = 0; h < Math.max(0, Math.round(notes[ni].beats) - 1); h++) cells.push(holdCell());
    }
    bars.push({ cells });
  }
  return bars;
}

function totalBeats(notes: SongNote[]): number {
  return notes.reduce((s, n) => s + n.beats, 0);
}

/** An octave marker like the teacher's ' (up) — shown after high notes. */
function tick(pitch: string): string {
  const m = /(-?\d+)$/.exec(pitch);
  if (!m) return '';
  return Number(m[1]) >= 5 ? '’' : '';
}

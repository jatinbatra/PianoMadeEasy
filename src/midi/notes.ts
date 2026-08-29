// Note number <-> name helpers. MIDI middle C (C4) = 60.

const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export type PitchClass = (typeof PITCH_CLASSES)[number];

/** Pitch class letter for a MIDI note, ignoring octave. e.g. 65 -> "F". */
export function pitchClass(note: number): PitchClass {
  return PITCH_CLASSES[note % 12];
}

/** Octave number for a MIDI note. C4 (60) -> 4. */
export function octave(note: number): number {
  return Math.floor(note / 12) - 1;
}

/** Full note name including octave. e.g. 60 -> "C4", 66 -> "F#4". */
export function noteName(note: number): string {
  return `${pitchClass(note)}${octave(note)}`;
}

/** True for the seven white keys (naturals). */
export function isWhiteKey(note: number): boolean {
  return !pitchClass(note).includes('#');
}

/**
 * Does a played note match a target, ignoring octave?
 * A beginner "finds F" whether he plays F3, F4, or F5.
 */
export function matchesPitchClass(played: number, target: PitchClass): boolean {
  return pitchClass(played) === target;
}

/** The MIDI number for a pitch class in a given octave. ("F", 4) -> 65. */
export function midiFor(pc: PitchClass, oct: number): number {
  return PITCH_CLASSES.indexOf(pc) + (oct + 1) * 12;
}

const SOLFEGE: Record<string, string> = { C: 'DO', D: 'RE', E: 'MI', F: 'FA', G: 'SOL', A: 'LA', B: 'SI' };

/** Movable-do-ish solfège label the teacher uses: C→DO, D→RE … B→SI.
 *  Sharps/flats get the neighbour's syllable with the accidental appended. */
export function solfege(note: number): string {
  const pc = pitchClass(note);
  if (SOLFEGE[pc]) return SOLFEGE[pc];
  // e.g. C# → DO#
  const base = pc[0];
  return (SOLFEGE[base] ?? base) + pc.slice(1);
}

/** Parse scientific pitch notation ("E4", "F#3", "Bb4") to a MIDI number. */
export function parsePitch(name: string): number {
  const m = /^([A-Ga-g])([#b]?)(-?\d+)$/.exec(name.trim());
  if (!m) throw new Error(`Bad pitch: ${name}`);
  const letter = m[1].toUpperCase();
  const accidental = m[2];
  const oct = Number(m[3]);
  let pc = PITCH_CLASSES.indexOf(letter as PitchClass);
  if (accidental === '#') pc += 1;
  if (accidental === 'b') pc -= 1;
  return pc + (oct + 1) * 12;
}

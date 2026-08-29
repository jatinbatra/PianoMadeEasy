// Song format. The app is the engine; the user loads songs in this shape.
// Do NOT commit copyrighted arrangements — ship only public-domain examples.

export interface SongNote {
  /** Scientific pitch name, e.g. "E4", "F#3". Middle C is "C4". */
  pitch: string;
  /** Duration in beats (1 = one beat at the song's bpm). */
  beats: number;
  /** Right-hand finger for this note (1 = thumb … 5 = pinky), teacher-style. */
  finger?: number;
  /** Lyric syllable that lands on this note, e.g. "MA-". */
  lyric?: string;
}

export interface Chord {
  /** e.g. "C", "Am", "G7" — display label. */
  symbol: string;
  /** Pitches sounded together. */
  pitches: string[];
  beats: number;
}

/**
 * One left-hand move in the teacher's beginner method: a single bass note (the
 * chord's root, an octave or two down) held for a bar or so, played with the
 * named finger. This is what makes a song "both hands" without overwhelming a
 * beginner.
 */
export interface LeftHandNote {
  /** Bass pitch, e.g. "C3". */
  pitch: string;
  /** Chord label shown above the bar, e.g. "C", "G". */
  chord: string;
  /** How many beats it's held (usually a whole bar). */
  beats: number;
  /** Left-hand finger (5 = pinky on the low note in C-position). */
  finger?: number;
}

/** An ordered piece of a song (4–8 bars). Unlocks when its atoms are strong. */
export interface SongChunk {
  id: string;
  label: string;
  /** Bar range for display, e.g. "1-2". */
  bars: string;
  /** Atom IDs this chunk needs before it's worth practicing (Phase 2 gating). */
  requiresAtoms: string[];
  notes: SongNote[];
  chords?: Chord[];
  /** Optional left-hand accompaniment, aligned to the melody by beats. */
  leftHand?: LeftHandNote[];
}

export interface Song {
  id: string;
  title: string;
  /** Provenance — used to keep the repo copyright-clean. */
  attribution: string;
  bpm: number;
  chunks: SongChunk[];
  /** Optional link to a YouTube video/tutorial for the song. */
  youtube?: string;
}

// Song format. The app is the engine; the user loads songs in this shape.
// Do NOT commit copyrighted arrangements — ship only public-domain examples.

export interface SongNote {
  /** Scientific pitch name, e.g. "E4", "F#3". Middle C is "C4". */
  pitch: string;
  /** Duration in beats (1 = one beat at the song's bpm). */
  beats: number;
}

export interface Chord {
  /** e.g. "C", "Am", "G7" — display label. */
  symbol: string;
  /** Pitches sounded together. */
  pitches: string[];
  beats: number;
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

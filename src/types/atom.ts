import type { Threshold } from '../scoring/score';
import type { PitchClass } from '../midi/notes';

/** One way to explain an atom. Double-failure rotates to the next angle. */
export interface TeachAngle {
  title: string;
  /** Plain-language explanation. Kept short — readable from three feet. */
  body: string;
}

/** Locate a note within a few seconds. Octave-agnostic. */
export interface FindNoteTest {
  kind: 'find-note';
  target: PitchClass;
  /** How many times to ask, to prove it wasn't luck. */
  reps: number;
  threshold: Threshold;
}

/** Play a short ordered sequence (intervals, riffs, rhythm patterns). */
export interface SequenceTest {
  kind: 'sequence';
  /** Scientific pitch names, e.g. ["C4", "E4"]. */
  pitches: string[];
  ignoreOctave?: boolean;
  /** Beats per note, aligned to `pitches`; enables timing scoring when present. */
  beats?: number[];
  bpm?: number;
  threshold: Threshold;
}

/** Play several notes together as one chord. */
export interface ChordTest {
  kind: 'chord';
  pitches: string[];
  ignoreOctave?: boolean;
  windowMs?: number;
  threshold: Threshold;
}

export type AtomTest = FindNoteTest | SequenceTest | ChordTest;

/** One small, testable skill. The curriculum is a graph of these, not lessons. */
export interface Atom {
  id: string;
  label: string;
  /** Atom IDs that must be learned first. */
  prerequisites: string[];
  /** Introduction copy; index chosen by how many times he's failed. */
  teach: TeachAngle[];
  /** The prompt shown during the test portion. */
  prompt: string;
  test: AtomTest;
}

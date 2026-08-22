import type { NoteEvent } from '../types';
import { pitchClass } from '../midi/notes';

/** Pass condition for an atom test. */
export interface Threshold {
  /** Minimum fraction of expected notes hit, 0–1. */
  noteAccuracy: number;
  /** Minimum fraction of hit notes within timing tolerance, 0–1. Omit to skip timing. */
  timingAccuracy?: number;
}

export interface ScoreResult {
  /** 0–1: expected notes correctly played, in order. */
  noteAccuracy: number;
  /** 0–1: of the notes hit, how many landed within timing tolerance. 1 when timing isn't scored. */
  timingAccuracy: number;
  /** Meets the threshold. */
  pass: boolean;
  matched: number;
  expected: number;
  /** Note-ons played that weren't part of the expected sequence. */
  extraNotes: number;
  /** Onset time (ms) of each matched note, in order — used for tempo estimation. */
  matchedOnsets: number[];
}

/** Just the real key-presses (note-on with velocity > 0). */
export function noteOns(events: NoteEvent[]): NoteEvent[] {
  return events.filter((e) => e.on && e.velocity > 0);
}

function sameNote(a: number, b: number, ignoreOctave: boolean): boolean {
  return ignoreOctave ? pitchClass(a) === pitchClass(b) : a === b;
}

export interface SequenceOptions {
  ignoreOctave?: boolean;
  /** Ideal onset time (ms) for each expected note; enables timing scoring. */
  expectedOnsets?: number[];
  timingToleranceMs?: number;
  threshold: Threshold;
}

/**
 * Score a played sequence against an expected one.
 *
 * Order-preserving but forgiving: wrong notes between correct ones are allowed
 * (a beginner fumbles), so we walk the expected list and advance on each correct
 * hit. This is the core of every atom test, so it's covered heavily by tests.
 */
export function scoreSequence(
  expected: number[],
  recorded: NoteEvent[],
  opts: SequenceOptions,
): ScoreResult {
  const ignoreOctave = opts.ignoreOctave ?? false;
  const tolerance = opts.timingToleranceMs ?? 250;
  const played = noteOns(recorded);

  let p = 0;
  let extras = 0;
  const matchedOnsets: number[] = [];

  for (const ev of played) {
    if (p < expected.length && sameNote(ev.note, expected[p], ignoreOctave)) {
      matchedOnsets.push(ev.time);
      p += 1;
    } else {
      extras += 1;
    }
  }

  const matched = p;
  const noteAccuracy = expected.length === 0 ? 1 : matched / expected.length;

  let timingAccuracy = 1;
  if (opts.expectedOnsets && matched > 0) {
    let within = 0;
    for (let i = 0; i < matched; i++) {
      if (Math.abs(matchedOnsets[i] - opts.expectedOnsets[i]) <= tolerance) within += 1;
    }
    timingAccuracy = within / matched;
  }

  const pass =
    noteAccuracy >= opts.threshold.noteAccuracy &&
    (opts.threshold.timingAccuracy == null || timingAccuracy >= opts.threshold.timingAccuracy);

  return { noteAccuracy, timingAccuracy, pass, matched, expected: expected.length, extraNotes: extras, matchedOnsets };
}

export interface ChordOptions {
  ignoreOctave?: boolean;
  /** All notes must be pressed within this window (ms) to count as "together". */
  windowMs?: number;
  threshold: Threshold;
}

/**
 * Score a chord: every expected pitch pressed, all within a short window so it
 * reads as one gesture rather than an arpeggio.
 */
export function scoreChord(expected: number[], recorded: NoteEvent[], opts: ChordOptions): ScoreResult {
  const ignoreOctave = opts.ignoreOctave ?? false;
  const windowMs = opts.windowMs ?? 150;
  const played = noteOns(recorded);

  // First onset time for each expected pitch.
  const firstOnset: (number | null)[] = expected.map(() => null);
  let extras = 0;
  for (const ev of played) {
    const idx = expected.findIndex((e, i) => firstOnset[i] === null && sameNote(ev.note, e, ignoreOctave));
    if (idx >= 0) firstOnset[idx] = ev.time;
    else extras += 1;
  }

  const hits = firstOnset.filter((t) => t !== null) as number[];
  const matched = hits.length;
  const allPresent = matched === expected.length;
  const together = allPresent && Math.max(...hits) - Math.min(...hits) <= windowMs;

  const noteAccuracy = expected.length === 0 ? 1 : matched / expected.length;
  const timingAccuracy = together ? 1 : 0;
  const pass =
    noteAccuracy >= opts.threshold.noteAccuracy &&
    (opts.threshold.timingAccuracy == null || together);

  return { noteAccuracy, timingAccuracy, pass, matched, expected: expected.length, extraNotes: extras, matchedOnsets: hits };
}

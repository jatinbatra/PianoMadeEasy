import { parsePitch } from '../midi/notes';
import { scoreSequence } from '../scoring/score';
import type { SongChunk } from '../types/song';
import type { NoteEvent } from '../types';
import type { ChunkAttempt } from './ladder';

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * Score a chunk attempt: note accuracy from the sequence scorer, plus a tempo
 * estimate from the spacing of correctly-played notes (compared to each note's
 * beat length). Untethered recordings yield accuracy 0 / tempo 0 — unscored.
 */
export function scoreChunk(chunk: SongChunk, recorded: NoteEvent[]): ChunkAttempt {
  const expected = chunk.notes.map((n) => parsePitch(n.pitch));
  // Octave-agnostic: playing the right notes in order counts, even on the
  // one-octave on-screen piano where higher-octave notes can't be reached.
  const res = scoreSequence(expected, recorded, { ignoreOctave: true, threshold: { noteAccuracy: 0 } });

  const onsets = res.matchedOnsets;
  const bpms: number[] = [];
  for (let i = 1; i < onsets.length; i++) {
    const gap = onsets[i] - onsets[i - 1];
    const beats = chunk.notes[i - 1].beats;
    if (gap > 0 && beats > 0) bpms.push((60000 * beats) / gap);
  }

  return { accuracy: res.noteAccuracy, tempo: median(bpms) };
}

import { parsePitch, midiFor } from '../midi/notes';
import { scoreSequence, scoreChord, type ScoreResult } from '../scoring/score';
import type { AtomTest } from '../types/atom';
import type { NoteEvent } from '../types';

/** The MIDI notes an atom test expects, in order (used to drive the UI cursor). */
export function expectedNotes(test: AtomTest): number[] {
  switch (test.kind) {
    case 'find-note':
      return Array<number>(test.reps).fill(midiFor(test.target, 4));
    case 'sequence':
      return test.pitches.map(parsePitch);
    case 'chord':
      return test.pitches.map(parsePitch);
  }
}

/** Turn a captured MIDI recording into a pass/fail score for an atom test. */
export function evaluateTest(test: AtomTest, recorded: NoteEvent[]): ScoreResult {
  switch (test.kind) {
    case 'find-note':
      return scoreSequence(expectedNotes(test), recorded, {
        ignoreOctave: true,
        threshold: test.threshold,
      });
    case 'sequence': {
      let expectedOnsets: number[] | undefined;
      if (test.beats && test.bpm) {
        const beatMs = (60 / test.bpm) * 1000;
        let acc = 0;
        expectedOnsets = test.beats.map((b) => {
          const t = acc;
          acc += b * beatMs;
          return t;
        });
      }
      return scoreSequence(expectedNotes(test), recorded, {
        ignoreOctave: test.ignoreOctave ?? false,
        expectedOnsets,
        threshold: test.threshold,
      });
    }
    case 'chord':
      return scoreChord(expectedNotes(test), recorded, {
        ignoreOctave: test.ignoreOctave ?? false,
        windowMs: test.windowMs,
        threshold: test.threshold,
      });
  }
}

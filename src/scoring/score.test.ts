import { describe, it, expect } from 'vitest';
import { scoreSequence, scoreChord } from './score';
import type { NoteEvent } from '../types';

/** Build a note-on/note-off pair helper — tests only care about the on events. */
function on(note: number, time = 0, velocity = 80): NoteEvent {
  return { note, velocity, on: true, time };
}

const t = { noteAccuracy: 0.9 };

describe('scoreSequence', () => {
  it('scores a perfect run as 100% and passes', () => {
    const r = scoreSequence([60, 62, 64], [on(60, 0), on(62, 500), on(64, 1000)], { threshold: t });
    expect(r.noteAccuracy).toBe(1);
    expect(r.pass).toBe(true);
    expect(r.extraNotes).toBe(0);
  });

  it('gives partial credit and fails below threshold', () => {
    const r = scoreSequence([60, 62, 64, 65], [on(60, 0), on(62, 100)], { threshold: t });
    expect(r.matched).toBe(2);
    expect(r.noteAccuracy).toBe(0.5);
    expect(r.pass).toBe(false);
  });

  it('forgives wrong notes between correct ones but counts them as extras', () => {
    const r = scoreSequence([60, 62], [on(60, 0), on(61, 50), on(62, 100)], { threshold: t });
    expect(r.matched).toBe(2);
    expect(r.noteAccuracy).toBe(1);
    expect(r.extraNotes).toBe(1);
    expect(r.pass).toBe(true);
  });

  it('ignores octave when asked (find-note: any F counts)', () => {
    const r = scoreSequence([65], [on(53)], { ignoreOctave: true, threshold: { noteAccuracy: 1 } });
    expect(r.pass).toBe(true);
    const strict = scoreSequence([65], [on(53)], { ignoreOctave: false, threshold: { noteAccuracy: 1 } });
    expect(strict.pass).toBe(false);
  });

  it('scores timing and can fail on it while notes are perfect', () => {
    const opts = {
      threshold: { noteAccuracy: 0.9, timingAccuracy: 0.9 },
      expectedOnsets: [0, 500, 1000],
      timingToleranceMs: 100,
    };
    const good = scoreSequence([60, 62, 64], [on(60, 10), on(62, 480), on(64, 1050)], opts);
    expect(good.pass).toBe(true);

    // Evenly spaced but started late = good rhythm (relative timing) → passes.
    const late = scoreSequence([60, 62, 64], [on(60, 400), on(62, 900), on(64, 1400)], opts);
    expect(late.pass).toBe(true);

    // Uneven spacing = bad rhythm → fails on timing.
    const uneven = scoreSequence([60, 62, 64], [on(60, 0), on(62, 750), on(64, 1000)], opts);
    expect(uneven.noteAccuracy).toBe(1);
    expect(uneven.timingAccuracy).toBeLessThan(0.9);
    expect(uneven.pass).toBe(false);
  });

  it('treats an empty expected sequence as trivially correct', () => {
    expect(scoreSequence([], [], { threshold: t }).noteAccuracy).toBe(1);
  });
});

describe('scoreChord', () => {
  it('passes when all notes land together', () => {
    const r = scoreChord([60, 64, 67], [on(60, 0), on(64, 20), on(67, 40)], {
      windowMs: 150,
      threshold: { noteAccuracy: 1, timingAccuracy: 1 },
    });
    expect(r.pass).toBe(true);
    expect(r.timingAccuracy).toBe(1);
  });

  it('fails when notes are spread out like an arpeggio', () => {
    const r = scoreChord([60, 64, 67], [on(60, 0), on(64, 300), on(67, 700)], {
      windowMs: 150,
      threshold: { noteAccuracy: 1, timingAccuracy: 1 },
    });
    expect(r.noteAccuracy).toBe(1);
    expect(r.timingAccuracy).toBe(0);
    expect(r.pass).toBe(false);
  });

  it('fails when a chord tone is missing', () => {
    const r = scoreChord([60, 64, 67], [on(60, 0), on(64, 20)], {
      threshold: { noteAccuracy: 1 },
    });
    expect(r.matched).toBe(2);
    expect(r.pass).toBe(false);
  });

  it('matches chords ignoring octave', () => {
    const r = scoreChord([60, 64, 67], [on(48, 0), on(52, 20), on(55, 30)], {
      ignoreOctave: true,
      threshold: { noteAccuracy: 1, timingAccuracy: 1 },
    });
    expect(r.pass).toBe(true);
  });
});

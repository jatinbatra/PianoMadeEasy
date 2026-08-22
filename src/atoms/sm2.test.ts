import { describe, it, expect } from 'vitest';
import {
  newAtomProgress,
  review,
  qualityFromScore,
  isDecayed,
  isDue,
  needsReteach,
} from './sm2';
import type { ScoreResult } from '../scoring/score';

const TODAY = '2026-08-22';

function result(partial: Partial<ScoreResult>): ScoreResult {
  return { noteAccuracy: 1, timingAccuracy: 1, pass: true, matched: 1, expected: 1, extraNotes: 0, matchedOnsets: [], ...partial };
}

describe('qualityFromScore', () => {
  it('grades a clean pass high and a total miss zero', () => {
    expect(qualityFromScore(result({}))).toBe(5);
    expect(qualityFromScore(result({ pass: true, noteAccuracy: 0.95, timingAccuracy: 0.5 }))).toBe(4);
    expect(qualityFromScore(result({ pass: false, noteAccuracy: 0 }))).toBe(0);
    expect(qualityFromScore(result({ pass: false, noteAccuracy: 0.6 }))).toBe(2);
  });
});

describe('review', () => {
  it('walks the short-seeded interval ladder 1 → 3 → 7 on repeated passes', () => {
    let p = newAtomProgress('find-note:F', TODAY);
    p = review(p, 5, TODAY);
    expect(p.intervalDays).toBe(1);
    expect(p.introduced).toBe(true);
    p = review(p, 5, TODAY);
    expect(p.intervalDays).toBe(3);
    p = review(p, 5, TODAY);
    expect(p.intervalDays).toBe(7);
  });

  it('resets the interval and counts the failure on a lapse', () => {
    let p = newAtomProgress('a', TODAY);
    p = review(p, 5, TODAY);
    p = review(p, 5, TODAY);
    expect(p.intervalDays).toBe(3);
    p = review(p, 1, TODAY);
    expect(p.intervalDays).toBe(1);
    expect(p.repetitions).toBe(0);
    expect(p.consecutiveFailures).toBe(1);
  });

  it('floors the easiness factor at 1.3', () => {
    let p = newAtomProgress('a', TODAY);
    for (let i = 0; i < 10; i++) p = review(p, 0, TODAY);
    expect(p.ef).toBeGreaterThanOrEqual(1.3);
  });

  it('clears the failure streak on the next pass', () => {
    let p = newAtomProgress('a', TODAY);
    p = review(p, 1, TODAY);
    p = review(p, 1, TODAY);
    expect(needsReteach(p)).toBe(true);
    p = review(p, 4, TODAY);
    expect(p.consecutiveFailures).toBe(0);
    expect(needsReteach(p)).toBe(false);
  });
});

describe('decay detection', () => {
  it('is not decayed the day it was reviewed, but is once overdue', () => {
    let p = newAtomProgress('a', TODAY);
    p = review(p, 5, TODAY); // due tomorrow
    expect(isDecayed(p, TODAY)).toBe(false);
    expect(isDue(p, TODAY)).toBe(false);
    expect(isDecayed(p, '2026-08-24')).toBe(true);
    expect(isDue(p, '2026-08-24')).toBe(true);
  });

  it('never flags an un-introduced atom as decayed', () => {
    const p = newAtomProgress('a', TODAY);
    expect(isDecayed(p, '2027-01-01')).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { computeStreak, shiftDay } from './streak';
import type { PracticeDay } from '../types';

function day(date: string): PracticeDay {
  return { date, verified: true, minutes: 5, completedAt: 0 };
}

describe('shiftDay', () => {
  it('moves across month boundaries', () => {
    expect(shiftDay('2026-03-01', -1)).toBe('2026-02-28');
    expect(shiftDay('2026-08-31', 1)).toBe('2026-09-01');
  });
});

describe('computeStreak', () => {
  it('is zero with no days', () => {
    expect(computeStreak([], '2026-08-22').current).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    const days = ['2026-08-20', '2026-08-21', '2026-08-22'].map(day);
    const s = computeStreak(days, '2026-08-22');
    expect(s.current).toBe(3);
    expect(s.practicedToday).toBe(true);
  });

  it('keeps the streak alive before today is practiced', () => {
    const days = ['2026-08-20', '2026-08-21'].map(day);
    const s = computeStreak(days, '2026-08-22');
    expect(s.current).toBe(2);
    expect(s.practicedToday).toBe(false);
    expect(s.missedYesterday).toBe(false);
  });

  it('flags a missed yesterday and resets the count', () => {
    const days = ['2026-08-18', '2026-08-19'].map(day);
    const s = computeStreak(days, '2026-08-22');
    expect(s.current).toBe(0);
    expect(s.missedYesterday).toBe(true);
  });

  it('ignores gaps further back', () => {
    const days = ['2026-08-10', '2026-08-21', '2026-08-22'].map(day);
    expect(computeStreak(days, '2026-08-22').current).toBe(2);
  });
});

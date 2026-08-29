import { describe, it, expect } from 'vitest';
import { computeStreak, shiftDay, streakMilestone } from './streak';
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

  it('bridges a single missed day with the weekly freeze', () => {
    // 21st missed, everything else present.
    const days = ['2026-08-18', '2026-08-19', '2026-08-20', '2026-08-22'].map(day);
    const s = computeStreak(days, '2026-08-22');
    expect(s.current).toBe(4);
    expect(s.freezeActive).toBe(true);
    expect(s.missedYesterday).toBe(false);
  });

  it('only allows one freeze per 7 days', () => {
    // Two gaps (21st and 19th missed) close together — only the first bridges.
    const days = ['2026-08-18', '2026-08-20', '2026-08-22'].map(day);
    expect(computeStreak(days, '2026-08-22').current).toBe(2);
  });
});

describe('streakMilestone', () => {
  it('celebrates named milestones and nothing else', () => {
    expect(streakMilestone(3)).toBeTruthy();
    expect(streakMilestone(7)).toBeTruthy();
    expect(streakMilestone(30)).toBeTruthy();
    expect(streakMilestone(1)).toBeNull();
    expect(streakMilestone(4)).toBeNull();
    expect(streakMilestone(0)).toBeNull();
  });

  it('celebrates every 100 days past a hundred', () => {
    expect(streakMilestone(200)).toBeTruthy();
    expect(streakMilestone(150)).toBeNull();
  });
});

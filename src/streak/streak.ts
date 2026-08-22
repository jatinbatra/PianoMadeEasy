import { localDateKey } from '../db/repo';
import type { PracticeDay } from '../types';

/** Shift a YYYY-MM-DD key by n days (local calendar). */
export function shiftDay(dateKey: string, n: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return localDateKey(dt);
}

export interface StreakInfo {
  /** Consecutive practiced days ending today or yesterday. */
  current: number;
  practicedToday: boolean;
  /** True when yesterday was missed but earlier days were practiced. */
  missedYesterday: boolean;
}

/**
 * Current streak, tolerant of "haven't practiced yet today": a streak that ran
 * up to yesterday is still alive today until the day ends. This is pure and
 * takes `today` explicitly so it's unit-testable without mocking the clock.
 */
export function computeStreak(days: PracticeDay[], today: string = localDateKey()): StreakInfo {
  const set = new Set(days.map((d) => d.date));
  const practicedToday = set.has(today);
  const yesterday = shiftDay(today, -1);

  // Anchor: start counting from today if practiced, else from yesterday.
  let cursor = practicedToday ? today : yesterday;
  let current = 0;
  while (set.has(cursor)) {
    current += 1;
    cursor = shiftDay(cursor, -1);
  }

  const missedYesterday = !practicedToday && !set.has(yesterday) && days.length > 0;
  return { current, practicedToday, missedYesterday };
}

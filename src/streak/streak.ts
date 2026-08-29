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
  /** Consecutive practiced days ending today or yesterday, freezes included. */
  current: number;
  practicedToday: boolean;
  /** True when yesterday was missed but earlier days were practiced. */
  missedYesterday: boolean;
  /** True when a missed day inside the streak is being covered by a freeze. */
  freezeActive: boolean;
}

/** One automatic streak freeze is allowed per rolling 7 days. */
const FREEZE_WINDOW = 7;

/**
 * Current streak with a forgiving weekly freeze: a single missed day is bridged
 * automatically, at most once per 7 days, so missing a day never feels like
 * failure. Pure and takes `today` explicitly so it's unit-testable.
 */
export function computeStreak(days: PracticeDay[], today: string = localDateKey()): StreakInfo {
  const set = new Set(days.map((d) => d.date));
  const practicedToday = set.has(today);
  const yesterday = shiftDay(today, -1);

  let cursor = practicedToday ? today : yesterday;
  let current = 0;
  let lastFreezeDay: string | null = null;
  let freezeActive = false;

  while (true) {
    if (set.has(cursor)) {
      current += 1;
      cursor = shiftDay(cursor, -1);
      continue;
    }
    // Missing day: bridge it with a freeze if none used in the last 7 days.
    const freezeAvailable =
      current > 0 && (lastFreezeDay === null || daysBetween(cursor, lastFreezeDay) >= FREEZE_WINDOW);
    if (freezeAvailable && set.has(shiftDay(cursor, -1))) {
      lastFreezeDay = cursor;
      if (cursor === yesterday) freezeActive = true;
      cursor = shiftDay(cursor, -1); // skip the frozen day, keep counting
      continue;
    }
    break;
  }

  const missedYesterday = !practicedToday && !set.has(yesterday) && !freezeActive && days.length > 0;
  return { current, practicedToday, missedYesterday, freezeActive };
}

/**
 * A short congratulation when the streak lands on a meaningful number — shown
 * once, on the summary after that session. Never a guilt trip, only a nod:
 * showing up is the whole game. Returns null on non-milestone days.
 */
export function streakMilestone(current: number): string | null {
  const named: Record<number, string> = {
    3: 'Three days. That’s a habit taking hold.',
    7: 'A full week. You keep showing up.',
    14: 'Two weeks straight — this is who you are now.',
    30: 'Thirty days. A month at the keys.',
    50: 'Fifty days. Quietly remarkable.',
    100: 'One hundred days. Look what showing up built.',
  };
  if (named[current]) return named[current];
  if (current > 100 && current % 100 === 0) return `${current} days. Extraordinary.`;
  return null;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const da = new Date(ay, am - 1, ad).getTime();
  const db = new Date(by, bm - 1, bd).getTime();
  return Math.abs(Math.round((da - db) / 86400000));
}

import { db } from './db';
import type { InputMode, PracticeDay, SessionResult } from '../types';

/** Local calendar date as YYYY-MM-DD (not UTC — the streak is about *his* days). */
export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Record that today was practiced. Idempotent per day. A day already logged as
 * verified stays verified even if a later untethered session lands on it — MIDI
 * evidence never gets downgraded.
 */
export async function logPracticeDay(mode: InputMode, minutes: number): Promise<void> {
  const date = localDateKey();
  const existing = await db.days.get(date);
  const verified = mode === 'connected' || (existing?.verified ?? false);
  const day: PracticeDay = {
    date,
    verified,
    minutes: Math.max(minutes, existing?.minutes ?? 0),
    completedAt: Date.now(),
  };
  await db.days.put(day);
}

export async function saveSession(result: SessionResult): Promise<void> {
  await db.sessions.add(result);
}

export async function getAllDays(): Promise<PracticeDay[]> {
  return db.days.orderBy('date').toArray();
}

export async function hasPracticedToday(): Promise<boolean> {
  return (await db.days.get(localDateKey())) != null;
}

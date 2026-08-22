import { localDateKey } from '../db/repo';
import { shiftDay } from '../streak/streak';
import type { ScoreResult } from '../scoring/score';

/**
 * Per-atom learning state, persisted. SM-2 style, but seeded SHORT (1d, 3d, 7d)
 * because this user's decay rate is high — long first intervals would let
 * everything reset to zero between sessions.
 */
export interface AtomProgress {
  atomId: string;
  /** Successful reviews in a row. */
  repetitions: number;
  /** SM-2 easiness factor, floored at 1.3. */
  ef: number;
  /** Days until next due. */
  intervalDays: number;
  /** YYYY-MM-DD the atom is next due for review. */
  dueDate: string;
  lastReviewed: string | null;
  /** Failures in a row — 2+ triggers a re-teach instead of another test. */
  consecutiveFailures: number;
  /** Has it ever been passed? Distinguishes "new" from "learned". */
  introduced: boolean;
  /** ms epoch of the last write — for last-write-wins sync (Phase 3). */
  updatedAt: number;
}

/** Fresh state for an atom that has never been practiced. */
export function newAtomProgress(atomId: string, today = localDateKey()): AtomProgress {
  return {
    atomId,
    repetitions: 0,
    ef: 2.5,
    intervalDays: 0,
    dueDate: today,
    lastReviewed: null,
    consecutiveFailures: 0,
    introduced: false,
    updatedAt: 0,
  };
}

/** Short-seeded interval ladder, then EF-driven. */
function nextInterval(repetitions: number, prevInterval: number, ef: number): number {
  if (repetitions <= 1) return 1;
  if (repetitions === 2) return 3;
  if (repetitions === 3) return 7;
  return Math.round(prevInterval * ef);
}

/** Map a scoring result to an SM-2 quality grade 0–5. No self-assessment — measured. */
export function qualityFromScore(result: ScoreResult): number {
  if (result.pass) {
    if (result.noteAccuracy >= 0.99 && result.timingAccuracy >= 0.99) return 5;
    if (result.noteAccuracy >= 0.9) return 4;
    return 3;
  }
  if (result.noteAccuracy >= 0.5) return 2;
  if (result.noteAccuracy > 0) return 1;
  return 0;
}

/** A quality < 3 is a lapse. */
export const PASS_QUALITY = 3;

/**
 * Apply one review outcome. Pure and takes `today` explicitly so it's testable
 * without touching the clock.
 */
export function review(prev: AtomProgress, quality: number, today = localDateKey()): AtomProgress {
  const passed = quality >= PASS_QUALITY;

  // EF update (standard SM-2), floored.
  const ef = Math.max(1.3, prev.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  if (!passed) {
    return {
      ...prev,
      ef,
      repetitions: 0,
      intervalDays: 1,
      dueDate: shiftDay(today, 1),
      lastReviewed: today,
      consecutiveFailures: prev.consecutiveFailures + 1,
      introduced: prev.introduced,
      updatedAt: Date.now(),
    };
  }

  const repetitions = prev.repetitions + 1;
  const intervalDays = nextInterval(repetitions, prev.intervalDays || 1, ef);
  return {
    ...prev,
    ef,
    repetitions,
    intervalDays,
    dueDate: shiftDay(today, intervalDays),
    lastReviewed: today,
    consecutiveFailures: 0,
    introduced: true,
    updatedAt: Date.now(),
  };
}

/** Overdue = past its due date; this is the "decayed" signal. */
export function isDecayed(p: AtomProgress, today = localDateKey()): boolean {
  return p.introduced && p.dueDate < today;
}

/** Due today or overdue, and already introduced (i.e. eligible for recall). */
export function isDue(p: AtomProgress, today = localDateKey()): boolean {
  return p.introduced && p.dueDate <= today;
}

/** 2+ failures in a row: stop re-testing, re-teach with a different angle. */
export function needsReteach(p: AtomProgress): boolean {
  return p.consecutiveFailures >= 2;
}

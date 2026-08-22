import Dexie, { type EntityTable } from 'dexie';
import type { PracticeDay, SessionResult } from '../types';
import type { AtomProgress } from '../atoms/sm2';

/**
 * IndexedDB is the source of truth. Everything a session produces is written
 * here first, synchronously with the user's progress, so a reload, a crash, or
 * a dead network never loses a practiced day. (Supabase sync arrives in Phase 3;
 * this schema is deliberately sync-friendly — stable keys, no autoinc on days.)
 */
export class PianoDB extends Dexie {
  days!: EntityTable<PracticeDay, 'date'>;
  sessions!: EntityTable<SessionResult, 'id'>;
  meta!: EntityTable<{ key: string; value: unknown }, 'key'>;
  atomProgress!: EntityTable<AtomProgress, 'atomId'>;

  constructor() {
    super('piano-made-easy');
    this.version(1).stores({
      days: 'date, verified',
      sessions: '++id, date, mode',
      meta: 'key',
    });
    // v2 adds per-atom spaced-repetition state (Phase 1).
    this.version(2).stores({
      days: 'date, verified',
      sessions: '++id, date, mode',
      meta: 'key',
      atomProgress: 'atomId, dueDate, introduced',
    });
  }
}

export const db = new PianoDB();

export async function getMeta<T>(key: string, fallback: T): Promise<T> {
  const row = await db.meta.get(key);
  return row ? (row.value as T) : fallback;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await db.meta.put({ key, value });
}

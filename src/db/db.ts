import Dexie, { type EntityTable } from 'dexie';
import type { PracticeDay, SessionResult } from '../types';

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

  constructor() {
    super('piano-made-easy');
    this.version(1).stores({
      days: 'date, verified',
      sessions: '++id, date, mode',
      meta: 'key',
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

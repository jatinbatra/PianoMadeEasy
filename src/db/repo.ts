import { db, getMeta, setMeta } from './db';
import type { InputMode, PracticeDay, SessionResult } from '../types';
import type { AtomProgress } from '../atoms/sm2';
import type { Song } from '../types/song';
import type { ChunkProgress } from '../types/chunk';

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
  // MIDI and mic are both measured ("verified"); untethered just counts the day.
  const verified = mode !== 'untethered' || (existing?.verified ?? false);
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

// ----- Atom spaced-repetition state (Phase 1) -----

/** Load all atom progress keyed by atom id. */
export async function loadProgressMap(): Promise<Record<string, AtomProgress>> {
  const rows = await db.atomProgress.toArray();
  return Object.fromEntries(rows.map((r) => [r.atomId, r]));
}

/** Persist one atom's updated progress. */
export async function saveProgress(p: AtomProgress): Promise<void> {
  await db.atomProgress.put(p);
}

// ----- Song library + chunk mastery (Phase 2) -----

export async function loadSongs(): Promise<Song[]> {
  return db.songs.toArray();
}

export async function saveSong(song: Song): Promise<void> {
  await db.songs.put(song);
}

export async function deleteSong(id: string): Promise<void> {
  await db.songs.delete(id);
}

export async function getActiveSongId(): Promise<string | null> {
  return getMeta<string | null>('activeSongId', null);
}

export async function setActiveSongId(id: string): Promise<void> {
  await setMeta('activeSongId', id);
}

export async function loadChunkProgressMap(): Promise<Record<string, ChunkProgress>> {
  const rows = await db.chunkProgress.toArray();
  return Object.fromEntries(rows.map((r) => [r.key, r]));
}

export async function saveChunkProgress(cp: ChunkProgress): Promise<void> {
  await db.chunkProgress.put(cp);
}

// ----- Backup & restore (local-first safety net) -----

export interface Backup {
  app: 'jatinsitdown';
  version: number;
  exportedAt: number;
  days: PracticeDay[];
  sessions: SessionResult[];
  atomProgress: AtomProgress[];
  songs: Song[];
  chunkProgress: ChunkProgress[];
  meta: { key: string; value: unknown }[];
}

/** Everything on this device, as one portable object. */
export async function exportAll(): Promise<Backup> {
  const [days, sessions, atomProgress, songs, chunkProgress, meta] = await Promise.all([
    db.days.toArray(),
    db.sessions.toArray(),
    db.atomProgress.toArray(),
    db.songs.toArray(),
    db.chunkProgress.toArray(),
    db.meta.toArray(),
  ]);
  return { app: 'jatinsitdown', version: 1, exportedAt: Date.now(), days, sessions, atomProgress, songs, chunkProgress, meta };
}

/** Merge a backup back in (bulkPut = restore without wiping newer local data). */
export async function importAll(data: Partial<Backup>): Promise<void> {
  if (data.app && data.app !== 'jatinsitdown') throw new Error('That file is not a JatinSitDown backup.');
  await db.transaction(
    'rw',
    [db.days, db.sessions, db.atomProgress, db.songs, db.chunkProgress, db.meta],
    async () => {
      if (data.days?.length) await db.days.bulkPut(data.days);
      if (data.sessions?.length) await db.sessions.bulkPut(data.sessions);
      if (data.atomProgress?.length) await db.atomProgress.bulkPut(data.atomProgress);
      if (data.songs?.length) await db.songs.bulkPut(data.songs);
      if (data.chunkProgress?.length) await db.chunkProgress.bulkPut(data.chunkProgress);
      if (data.meta?.length) await db.meta.bulkPut(data.meta);
    },
  );
}

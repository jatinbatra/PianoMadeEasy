import { supabase } from './supabase';
import { db } from '../db/db';
import type { PracticeDay } from '../types';
import type { AtomProgress } from '../atoms/sm2';
import type { ChunkProgress } from '../types/chunk';

/**
 * Two-device sync (single user). Conflict rules per the brief:
 *  - streak days UNION (a day practiced on either device is a practiced day),
 *  - everything else last-write-wins per record (by updatedAt).
 *
 * A no-op when Supabase isn't configured or nobody is signed in — the app stays
 * happily local-first.
 */
export async function syncNow(): Promise<{ synced: boolean; reason?: string }> {
  if (!supabase) return { synced: false, reason: 'not-configured' };
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return { synced: false, reason: 'signed-out' };

  await syncDays(uid);
  await syncAtoms(uid);
  await syncChunks(uid);
  return { synced: true };
}

// ---- Days: union ----
async function syncDays(uid: string): Promise<void> {
  const local = await db.days.toArray();
  const { data: remoteRows } = await supabase!.from('days').select('*').eq('user_id', uid);
  const remote: PracticeDay[] = (remoteRows ?? []).map((r) => ({
    date: r.date,
    verified: r.verified,
    minutes: r.minutes,
    completedAt: r.completed_at,
  }));

  const merged = new Map<string, PracticeDay>();
  for (const d of [...local, ...remote]) {
    const prev = merged.get(d.date);
    merged.set(d.date, {
      date: d.date,
      verified: (prev?.verified ?? false) || d.verified, // union: either counts
      minutes: Math.max(prev?.minutes ?? 0, d.minutes),
      completedAt: Math.max(prev?.completedAt ?? 0, d.completedAt),
    });
  }
  const all = [...merged.values()];
  await db.days.bulkPut(all);
  await supabase!
    .from('days')
    .upsert(all.map((d) => ({ user_id: uid, date: d.date, verified: d.verified, minutes: d.minutes, completed_at: d.completedAt })));
}

// ---- Atom progress: last-write-wins ----
async function syncAtoms(uid: string): Promise<void> {
  const local = await db.atomProgress.toArray();
  const { data: remoteRows } = await supabase!.from('atom_progress').select('*').eq('user_id', uid);
  const remote: AtomProgress[] = (remoteRows ?? []).map(rowToAtom);

  const { toLocal, toRemote } = mergeLWW(local, remote, (a) => a.atomId, (a) => a.updatedAt);
  if (toLocal.length) await db.atomProgress.bulkPut(toLocal);
  if (toRemote.length) await supabase!.from('atom_progress').upsert(toRemote.map((a) => atomToRow(a, uid)));
}

// ---- Chunk progress: last-write-wins ----
async function syncChunks(uid: string): Promise<void> {
  const local = await db.chunkProgress.toArray();
  const { data: remoteRows } = await supabase!.from('chunk_progress').select('*').eq('user_id', uid);
  const remote: ChunkProgress[] = (remoteRows ?? []).map(rowToChunk);

  const { toLocal, toRemote } = mergeLWW(local, remote, (c) => c.key, (c) => c.updatedAt);
  if (toLocal.length) await db.chunkProgress.bulkPut(toLocal);
  if (toRemote.length) await supabase!.from('chunk_progress').upsert(toRemote.map((c) => chunkToRow(c, uid)));
}

/** Generic last-write-wins merge; returns records to write to each side. */
function mergeLWW<T>(local: T[], remote: T[], id: (t: T) => string, ts: (t: T) => number) {
  const localMap = new Map(local.map((x) => [id(x), x]));
  const remoteMap = new Map(remote.map((x) => [id(x), x]));
  const keys = new Set([...localMap.keys(), ...remoteMap.keys()]);
  const toLocal: T[] = [];
  const toRemote: T[] = [];
  for (const k of keys) {
    const l = localMap.get(k);
    const r = remoteMap.get(k);
    if (l && !r) toRemote.push(l);
    else if (r && !l) toLocal.push(r);
    else if (l && r) {
      if (ts(l) >= ts(r)) toRemote.push(l);
      else toLocal.push(r);
    }
  }
  return { toLocal, toRemote };
}

function rowToAtom(r: Record<string, unknown>): AtomProgress {
  return {
    atomId: r.atom_id as string,
    repetitions: r.repetitions as number,
    ef: r.ef as number,
    intervalDays: r.interval_days as number,
    dueDate: r.due_date as string,
    lastReviewed: (r.last_reviewed as string) ?? null,
    consecutiveFailures: r.consecutive_failures as number,
    introduced: r.introduced as boolean,
    updatedAt: r.updated_at as number,
  };
}
function atomToRow(a: AtomProgress, uid: string) {
  return {
    user_id: uid,
    atom_id: a.atomId,
    repetitions: a.repetitions,
    ef: a.ef,
    interval_days: a.intervalDays,
    due_date: a.dueDate,
    last_reviewed: a.lastReviewed,
    consecutive_failures: a.consecutiveFailures,
    introduced: a.introduced,
    updated_at: a.updatedAt,
  };
}
function rowToChunk(r: Record<string, unknown>): ChunkProgress {
  return {
    key: r.key as string,
    songId: r.song_id as string,
    chunkId: r.chunk_id as string,
    reps: r.reps as number,
    bestAccuracy: r.best_accuracy as number,
    maxCleanTempo: r.max_clean_tempo as number,
    cleanDays: (r.clean_days as string[]) ?? [],
    owned: r.owned as boolean,
    updatedAt: r.updated_at as number,
  };
}
function chunkToRow(c: ChunkProgress, uid: string) {
  return {
    user_id: uid,
    key: c.key,
    song_id: c.songId,
    chunk_id: c.chunkId,
    reps: c.reps,
    best_accuracy: c.bestAccuracy,
    max_clean_tempo: c.maxCleanTempo,
    clean_days: c.cleanDays,
    owned: c.owned,
    updated_at: c.updatedAt,
  };
}

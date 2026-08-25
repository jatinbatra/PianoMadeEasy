import { localDateKey } from '../db/repo';
import type { Song, SongChunk } from '../types/song';
import type { ChunkProgress } from '../types/chunk';
import type { ProgressMap } from '../atoms/scheduler';

export type ChunkProgressMap = Record<string, ChunkProgress>;

/** Clean = this fraction of notes correct. */
export const CLEAN_ACCURACY = 0.95;
/** "At tempo" allows a little slack below the song's target bpm. */
export const TEMPO_TOLERANCE = 0.85;

export function chunkKey(songId: string, chunkId: string): string {
  return `${songId}:${chunkId}`;
}

export function newChunkProgress(songId: string, chunkId: string): ChunkProgress {
  return {
    key: chunkKey(songId, chunkId),
    songId,
    chunkId,
    reps: 0,
    bestAccuracy: 0,
    maxCleanTempo: 0,
    cleanDays: [],
    owned: false,
    updatedAt: 0,
  };
}

/** A prerequisite atom counts as strong once passed at least once. */
function atomStrong(id: string, atoms: ProgressMap): boolean {
  const p = atoms[id];
  return !!p && p.introduced && p.repetitions >= 1;
}

/** A chunk unlocks when every atom it requires is strong. */
export function chunkUnlocked(chunk: SongChunk, atoms: ProgressMap): boolean {
  return chunk.requiresAtoms.every((id) => atomStrong(id, atoms));
}

export interface ChunkAttempt {
  accuracy: number;
  /** Achieved tempo in bpm (0 if unknown / untethered). */
  tempo: number;
}

/** Fold one attempt into a chunk's progress. Pure; `today` injectable for tests. */
export function updateChunkProgress(
  prev: ChunkProgress,
  attempt: ChunkAttempt,
  targetBpm: number,
  today: string = localDateKey(),
): ChunkProgress {
  const clean = attempt.accuracy >= CLEAN_ACCURACY && attempt.tempo >= targetBpm * TEMPO_TOLERANCE;
  const cleanDays = clean && !prev.cleanDays.includes(today) ? [...prev.cleanDays, today] : prev.cleanDays;
  return {
    ...prev,
    reps: prev.reps + 1,
    bestAccuracy: Math.max(prev.bestAccuracy, attempt.accuracy),
    maxCleanTempo: clean ? Math.max(prev.maxCleanTempo, attempt.tempo) : prev.maxCleanTempo,
    cleanDays,
    owned: cleanDays.length >= 2,
    updatedAt: Date.now(),
  };
}

export function ownedCount(song: Song, map: ChunkProgressMap): number {
  return song.chunks.filter((c) => map[chunkKey(song.id, c.id)]?.owned).length;
}

/**
 * The chunk to practice this session: the first unlocked, un-owned chunk (work
 * the frontier). If everything unlocked is owned, revisit the last unlocked one
 * so song time always has something real to play.
 */
export function pickChunk(song: Song, chunks: ChunkProgressMap, atoms: ProgressMap): SongChunk {
  const unlocked = song.chunks.filter((c) => chunkUnlocked(c, atoms));
  const frontier = unlocked.find((c) => !chunks[chunkKey(song.id, c.id)]?.owned);
  return frontier ?? unlocked[unlocked.length - 1] ?? song.chunks[0];
}

/**
 * Consecutive chunks to practice this session, starting at the frontier — so a
 * longer session works through more of the song (and eventually the whole thing),
 * not the same phrase over and over.
 */
export function pickChunks(song: Song, chunks: ChunkProgressMap, atoms: ProgressMap, count: number): SongChunk[] {
  const start = pickChunk(song, chunks, atoms);
  const startIdx = Math.max(0, song.chunks.findIndex((c) => c.id === start.id));
  const out: SongChunk[] = [];
  for (let i = 0; i < count && i < song.chunks.length; i++) {
    out.push(song.chunks[(startIdx + i) % song.chunks.length]);
  }
  return out.length ? out : [song.chunks[0]];
}

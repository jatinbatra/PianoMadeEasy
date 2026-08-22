import { describe, it, expect } from 'vitest';
import { updateChunkProgress, newChunkProgress, chunkUnlocked, pickChunk, ownedCount } from './ladder';
import type { Song } from '../types/song';
import type { ProgressMap } from '../atoms/scheduler';
import { newAtomProgress, review } from '../atoms/sm2';

const song: Song = {
  id: 's',
  title: 'Test',
  attribution: 'test',
  bpm: 100,
  chunks: [
    { id: 'c1', label: 'One', bars: '1', requiresAtoms: ['find-note:C'], notes: [{ pitch: 'C4', beats: 1 }] },
    { id: 'c2', label: 'Two', bars: '2', requiresAtoms: ['find-note:D'], notes: [{ pitch: 'D4', beats: 1 }] },
  ],
};

function atoms(ids: string[]): ProgressMap {
  const m: ProgressMap = {};
  for (const id of ids) m[id] = review(newAtomProgress(id, '2026-01-01'), 5, '2026-01-01');
  return m;
}

describe('chunkUnlocked', () => {
  it('locks until required atoms are strong', () => {
    expect(chunkUnlocked(song.chunks[0], {})).toBe(false);
    expect(chunkUnlocked(song.chunks[0], atoms(['find-note:C']))).toBe(true);
  });
});

describe('updateChunkProgress -> ownership', () => {
  it('needs two clean-at-tempo days to own a chunk', () => {
    let p = newChunkProgress('s', 'c1');
    p = updateChunkProgress(p, { accuracy: 1, tempo: 100 }, 100, '2026-01-01');
    expect(p.owned).toBe(false); // one clean day
    p = updateChunkProgress(p, { accuracy: 1, tempo: 100 }, 100, '2026-01-01'); // same day
    expect(p.owned).toBe(false); // still one distinct day
    p = updateChunkProgress(p, { accuracy: 1, tempo: 100 }, 100, '2026-01-02');
    expect(p.owned).toBe(true);
    expect(p.maxCleanTempo).toBe(100);
  });

  it('does not count sloppy or slow takes as clean', () => {
    let p = newChunkProgress('s', 'c1');
    p = updateChunkProgress(p, { accuracy: 0.7, tempo: 100 }, 100, '2026-01-01'); // sloppy
    p = updateChunkProgress(p, { accuracy: 1, tempo: 50 }, 100, '2026-01-02'); // too slow
    expect(p.cleanDays).toHaveLength(0);
    expect(p.owned).toBe(false);
    expect(p.bestAccuracy).toBe(1);
    expect(p.reps).toBe(2);
  });
});

describe('pickChunk + ownedCount', () => {
  it('works the frontier: first unlocked, un-owned chunk', () => {
    const a = atoms(['find-note:C', 'find-note:D']);
    expect(pickChunk(song, {}, a).id).toBe('c1');
    let c1 = newChunkProgress('s', 'c1');
    c1 = updateChunkProgress(c1, { accuracy: 1, tempo: 100 }, 100, '2026-01-01');
    c1 = updateChunkProgress(c1, { accuracy: 1, tempo: 100 }, 100, '2026-01-02');
    const map = { [c1.key]: c1 };
    expect(ownedCount(song, map)).toBe(1);
    expect(pickChunk(song, map, a).id).toBe('c2');
  });
});

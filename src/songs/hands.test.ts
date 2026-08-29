import { describe, it, expect } from 'vitest';
import { activeLeftHand, toSheet } from './hands';
import type { SongChunk } from '../types/song';

const chunk: SongChunk = {
  id: 'c',
  label: 'test',
  bars: '1-2',
  requiresAtoms: [],
  notes: [
    { pitch: 'E4', beats: 1, finger: 3, lyric: 'MA-' },
    { pitch: 'D4', beats: 1, finger: 2, lyric: 'RY' },
    { pitch: 'C4', beats: 1, finger: 1, lyric: 'HAD' },
    { pitch: 'D4', beats: 1, finger: 2, lyric: 'A' },
    { pitch: 'E4', beats: 1, finger: 3 },
    { pitch: 'E4', beats: 1, finger: 3 },
    { pitch: 'E4', beats: 2, finger: 3 },
  ],
  leftHand: [
    { pitch: 'C3', chord: 'C', beats: 4, finger: 5 },
    { pitch: 'G2', chord: 'G', beats: 4, finger: 1 },
  ],
};

describe('activeLeftHand', () => {
  it('tracks which bass note is under the melody cursor', () => {
    expect(activeLeftHand(chunk.notes, 0, chunk.leftHand)?.chord).toBe('C'); // beat 0
    expect(activeLeftHand(chunk.notes, 3, chunk.leftHand)?.chord).toBe('C'); // beat 3
    expect(activeLeftHand(chunk.notes, 4, chunk.leftHand)?.chord).toBe('G'); // beat 4
  });

  it('returns null when the chunk has no left hand', () => {
    expect(activeLeftHand(chunk.notes, 0, undefined)).toBeNull();
  });
});

describe('toSheet', () => {
  it('groups notes into bars under their chord, with solfège and fingers', () => {
    const bars = toSheet(chunk);
    expect(bars).toHaveLength(2);
    expect(bars[0].chord).toBe('C');
    expect(bars[0].cells).toHaveLength(4); // first four beats
    expect(bars[0].cells[0].solfege).toBe('MI'); // E
    expect(bars[0].cells[0].finger).toBe(3);
    expect(bars[1].chord).toBe('G');
    expect(bars[1].cells[0].solfege).toBe('MI');
  });
});

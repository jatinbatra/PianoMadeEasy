import { parsePitch } from '../midi/notes';
import { playMelody, playNote } from './synth';
import type { Song, SongChunk } from '../types/song';

/** Play one chunk with both hands — melody on top, chord bass underneath, in
 *  time. Returns the chunk's length in ms so callers can chain chunks. */
export function playHands(chunk: SongChunk, bpm: number): number {
  const beatMs = (60 / bpm) * 1000;
  playMelody(chunk.notes.map((n) => ({ midi: parsePitch(n.pitch), durMs: n.beats * beatMs })));
  if (chunk.leftHand?.length) {
    let t = 0;
    for (const b of chunk.leftHand) {
      const at = t;
      const midi = parsePitch(b.pitch);
      setTimeout(() => playNote(midi, b.beats * beatMs * 0.95), at);
      t += b.beats * beatMs;
    }
  }
  return chunk.notes.reduce((s, n) => s + n.beats, 0) * beatMs;
}

/** Play the whole song, chunk after chunk, both hands. Returns a stop fn. */
export function playSong(song: Song, bpm = song.bpm): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  let at = 0;
  for (const chunk of song.chunks) {
    const start = at;
    timers.push(setTimeout(() => playHands(chunk, bpm), start));
    at += chunk.notes.reduce((s, n) => s + n.beats, 0) * (60 / bpm) * 1000 + 300;
  }
  return () => timers.forEach(clearTimeout);
}

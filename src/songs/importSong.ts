import { parsePitch } from '../midi/notes';
import type { Song } from '../types/song';

/**
 * Parse and validate a user-supplied song JSON string. Throws Error with a
 * plain-language message on any problem (shown directly to the user).
 */
export function parseSong(text: string): Song {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That doesn't look like valid JSON — check for a missing comma or quote.");
  }

  const d = data as Record<string, unknown>;
  if (typeof d.id !== 'string' || !d.id) throw new Error('The song needs an "id" (a short name with no spaces).');
  if (typeof d.title !== 'string' || !d.title) throw new Error('The song needs a "title".');
  if (!Array.isArray(d.chunks) || d.chunks.length === 0) throw new Error('The song needs at least one chunk.');

  for (const rawChunk of d.chunks) {
    const c = rawChunk as Record<string, unknown>;
    if (typeof c.id !== 'string' || !c.id) throw new Error('Every chunk needs an "id".');
    if (!Array.isArray(c.notes) || c.notes.length === 0) throw new Error(`Chunk "${c.id}" needs a "notes" list.`);
    for (const rawNote of c.notes) {
      const n = rawNote as Record<string, unknown>;
      if (typeof n.pitch !== 'string') throw new Error(`Chunk "${c.id}" has a note with no "pitch".`);
      try {
        parsePitch(n.pitch);
      } catch {
        throw new Error(`"${n.pitch}" in chunk "${c.id}" isn't a valid note. Use names like C4, F#3.`);
      }
      if (typeof n.beats !== 'number' || n.beats <= 0) throw new Error(`A note in chunk "${c.id}" needs a positive "beats".`);
    }
    if (c.requiresAtoms == null) c.requiresAtoms = [];
    if (typeof c.label !== 'string') c.label = c.id;
    if (typeof c.bars !== 'string') c.bars = '';
  }

  if (typeof d.bpm !== 'number') d.bpm = 100;
  if (typeof d.attribution !== 'string') d.attribution = 'User-provided';
  if (d.youtube != null && typeof d.youtube !== 'string') delete d.youtube;

  return d as unknown as Song;
}

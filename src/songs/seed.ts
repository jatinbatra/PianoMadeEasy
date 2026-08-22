import mary from '../../songs/mary-had-a-little-lamb.json';
import ode from '../../songs/ode-to-joy.json';
import { loadSongs, saveSong, getActiveSongId, setActiveSongId } from '../db/repo';
import type { Song } from '../types/song';

/** Load the shipped public-domain songs on first run and pick a default. */
export async function seedSongsIfEmpty(): Promise<void> {
  const existing = await loadSongs();
  if (existing.length === 0) {
    await saveSong(mary as Song);
    await saveSong(ode as Song);
  }
  const active = await getActiveSongId();
  if (!active) await setActiveSongId('ode-to-joy');
}

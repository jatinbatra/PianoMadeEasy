import mary from '../../songs/mary-had-a-little-lamb.json';
import ode from '../../songs/ode-to-joy.json';
import sargam from '../../songs/sargam.json';
import machhli from '../../songs/machhli-jal-ki-rani.json';
import { loadSongs, saveSong, getActiveSongId, setActiveSongId } from '../db/repo';
import type { Song } from '../types/song';

const SHIPPED: Song[] = [ode as Song, mary as Song, sargam as Song, machhli as Song];

/**
 * Ensure the shipped public-domain songs are present. Adds any that are missing
 * (so existing installs pick up newly-added songs too) without touching songs
 * the user imported or edited. Picks a sensible default on first run.
 */
export async function seedSongsIfEmpty(): Promise<void> {
  const existing = await loadSongs();
  const haveIds = new Set(existing.map((s) => s.id));
  for (const song of SHIPPED) {
    if (!haveIds.has(song.id)) await saveSong(song);
  }
  const active = await getActiveSongId();
  if (!active) await setActiveSongId('ode-to-joy');
}

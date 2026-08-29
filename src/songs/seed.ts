import mary from '../../songs/mary-had-a-little-lamb.json';
import ode from '../../songs/ode-to-joy.json';
import sargam from '../../songs/sargam.json';
import machhli from '../../songs/machhli-jal-ki-rani.json';
import twinkle from '../../songs/twinkle-twinkle.json';
import happy from '../../songs/happy-birthday.json';
import alankar from '../../songs/alankar.json';
import jingle from '../../songs/jingle-bells.json';
import saints from '../../songs/when-the-saints.json';
import grace from '../../songs/amazing-grace.json';
import elise from '../../songs/fur-elise.json';
import lightlyRow from '../../songs/lightly-row.json';
import londonBridge from '../../songs/london-bridge.json';
import { loadSongs, saveSong, getActiveSongId, setActiveSongId } from '../db/repo';
import { getMeta, setMeta } from '../db/db';
import type { Song } from '../types/song';

/** Bump when shipped songs change (e.g. two-hand arrangements) so existing
 *  installs refresh them. */
const SEED_VERSION = 2;

const SHIPPED: Song[] = [
  ode as Song,
  twinkle as Song,
  mary as Song,
  lightlyRow as Song,
  londonBridge as Song,
  happy as Song,
  jingle as Song,
  saints as Song,
  grace as Song,
  sargam as Song,
  alankar as Song,
  machhli as Song,
  elise as Song,
];

/**
 * Ensure the shipped public-domain songs are present. Adds any that are missing
 * (so existing installs pick up newly-added songs too) without touching songs
 * the user imported or edited. Picks a sensible default on first run.
 */
export async function seedSongsIfEmpty(): Promise<void> {
  const existing = await loadSongs();
  const haveIds = new Set(existing.map((s) => s.id));
  const seededVersion = await getMeta<number>('seedVersion', 0);
  // On a version bump, re-save every shipped song so improvements (like the
  // two-hand arrangements) reach installs that already had the old version.
  // Chunk progress lives in its own table keyed by songId:chunkId, so this
  // never touches the user's mastery — only the song's notation.
  const refresh = seededVersion < SEED_VERSION;
  for (const song of SHIPPED) {
    if (refresh || !haveIds.has(song.id)) await saveSong(song);
  }
  if (refresh) await setMeta('seedVersion', SEED_VERSION);
  const active = await getActiveSongId();
  if (!active) await setActiveSongId('ode-to-joy');
}

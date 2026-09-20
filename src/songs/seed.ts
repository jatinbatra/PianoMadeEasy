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
import auraLea from '../../songs/aura-lea.json';
import auClair from '../../songs/au-clair-de-la-lune.json';
import yankee from '../../songs/yankee-doodle.json';
import frere from '../../songs/frere-jacques.json';
import oldMac from '../../songs/old-macdonald.json';
import ohSusanna from '../../songs/oh-susanna.json';
import hotCrossBuns from '../../songs/hot-cross-buns.json';
import ifYoureHappy from '../../songs/if-youre-happy.json';
import wheelsOnTheBus from '../../songs/wheels-on-the-bus.json';
import rowRow from '../../songs/row-row.json';
import silentNight from '../../songs/silent-night.json';
import { loadSongs, saveSong, deleteSong, getActiveSongId, setActiveSongId } from '../db/repo';
import { getMeta, setMeta } from '../db/db';
import type { Song } from '../types/song';

/** Bump when shipped songs change (e.g. two-hand arrangements) so existing
 *  installs refresh them. */
const SEED_VERSION = 5;

/** Shipped song ids removed since an earlier version — deleted from installs
 *  that cached them (e.g. songs that turned out not to be public domain). */
const REMOVED_IDS = ['doe-a-deer', 'rudolph'];

const SHIPPED: Song[] = [
  ode as Song,
  twinkle as Song,
  mary as Song,
  lightlyRow as Song,
  londonBridge as Song,
  auClair as Song,
  frere as Song,
  happy as Song,
  hotCrossBuns as Song,
  yankee as Song,
  oldMac as Song,
  auraLea as Song,
  ohSusanna as Song,
  rowRow as Song,
  wheelsOnTheBus as Song,
  ifYoureHappy as Song,
  jingle as Song,
  silentNight as Song,
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
  if (refresh) {
    // Drop songs that were shipped before but shouldn't be anymore.
    for (const id of REMOVED_IDS) if (haveIds.has(id)) await deleteSong(id);
    await setMeta('seedVersion', SEED_VERSION);
  }
  const active = await getActiveSongId();
  if (!active || REMOVED_IDS.includes(active)) await setActiveSongId('ode-to-joy');
}

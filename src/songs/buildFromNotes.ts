import { parsePitch, pitchClass } from '../midi/notes';
import type { Song, SongChunk, SongNote } from '../types/song';

// Turn plain note letters into a song, so anyone can add a tune without JSON.
// Accepts Western letters (C D E F G A B, with # / b and optional octave) and
// Indian sargam names (Sa Re Ga Ma Pa Dha Ni). Duration suffixes: C*2 (two
// beats), C/2 (half). New line = new chunk (phrase).

const SARGAM: Record<string, string> = {
  sa: 'C', re: 'D', ga: 'E', ma: 'F', pa: 'G', dha: 'A', ni: 'B',
};

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'song';
}

function parseToken(raw: string): SongNote {
  let beats = 1;
  let core = raw.trim();

  const dur = /([*/:])(\d+(?:\.\d+)?)$/.exec(core);
  if (dur) {
    const n = parseFloat(dur[2]);
    beats = dur[1] === '/' ? 1 / n : n; // '*' and ':' multiply, '/' divides
    core = core.slice(0, dur.index);
  }

  const lower = core.toLowerCase();
  let pitch: string;
  if (SARGAM[lower]) {
    pitch = SARGAM[lower] + '4';
  } else {
    // Western: C, F#, Bb, optionally with octave (C5).
    const m = /^([A-Ga-g])([#b]?)(\d?)$/.exec(core);
    if (!m) throw new Error(`"${raw}" isn't a note. Use letters like C, F#, or names like Sa, Re, Ga.`);
    pitch = m[1].toUpperCase() + m[2] + (m[3] || '4');
  }

  try {
    parsePitch(pitch);
  } catch {
    throw new Error(`"${raw}" isn't a playable note.`);
  }
  if (!(beats > 0)) throw new Error(`"${raw}" has a bad length.`);
  return { pitch, beats };
}

function requiresFromNotes(notes: SongNote[]): string[] {
  const ids = new Set<string>();
  for (const n of notes) {
    const pc = pitchClass(parsePitch(n.pitch));
    ids.add(pc.includes('#') ? `accidental:${pc}` : `find-note:${pc}`);
  }
  return [...ids];
}

export interface BuildOpts {
  title: string;
  bpm?: number;
  youtube?: string;
  notesText: string;
}

export function buildSong({ title, bpm, youtube, notesText }: BuildOpts): Song {
  const t = title.trim();
  if (!t) throw new Error('Give your song a title.');

  const lines = notesText.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) throw new Error('Add some notes — e.g. "C C G G A A G".');

  const chunks: SongChunk[] = lines.map((line, i) => {
    const tokens = line.split(/[\s,|]+/).filter((x) => x && x !== '-');
    const notes = tokens.map(parseToken);
    if (notes.length === 0) throw new Error(`Line ${i + 1} has no notes.`);
    return {
      id: `line-${i + 1}`,
      label: `Phrase ${i + 1}`,
      bars: '',
      requiresAtoms: requiresFromNotes(notes),
      notes,
    };
  });

  return {
    id: `user-${slug(t)}-${Date.now().toString(36)}`,
    title: t,
    attribution: 'Built from notes',
    bpm: bpm && bpm > 0 ? bpm : 90,
    youtube: youtube && youtube.trim() ? youtube.trim() : undefined,
    chunks,
  };
}

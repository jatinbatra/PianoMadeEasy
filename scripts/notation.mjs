// Converts the teacher's "Alphabet Notation" into the app's two-hand song JSON.
//
// The sheet method: RIGHT hand plays the melody (letters in |...| bars), LEFT
// hand plays each bar's chord as a single bass note in C-position. Notes may
// carry accidentals (Bb, F#) and octave marks ( ' = higher, ` = lower). A "-"
// holds the previous note one more beat. Runs of stuck-together capitals
// (CD, DDE) are eighth-note runs.
//
// This is a build-time tool (not shipped in the bundle). Author songs as compact
// specs and run `node scripts/build-songs.mjs` to (re)generate songs/*.json.

const NOTE_TO_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const CHORD_ROOT = { C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', A: 'A', B: 'B', Bb: 'Bb', 'F#': 'F#' };

/** Parse one right-hand bar string like "E D C D" or "CD EF" or "G’ E D C". */
export function parseBar(bar, baseOctave = 4) {
  const notes = [];
  const tokens = bar.trim().split(/\s+/).filter(Boolean);
  for (const tok of tokens) {
    if (tok === '-' || tok === '—') {
      // Hold: extend the previous note by a beat.
      if (notes.length) notes[notes.length - 1].beats += 1;
      continue;
    }
    // A token may hold several stuck-together notes (CD, DDE). Walk characters.
    const sub = [];
    let i = 0;
    while (i < tok.length) {
      const ch = tok[i];
      if (NOTE_TO_PC[ch] !== undefined) {
        sub.push({ letter: ch, acc: '', oct: baseOctave });
        i += 1;
      } else if (ch === '#' || ch === 'b') {
        if (sub.length) sub[sub.length - 1].acc = ch;
        i += 1;
      } else if (ch === "'" || ch === '’' || ch === '‘' || ch === '`' || ch === '´') {
        if (sub.length) {
          const up = ch === "'" || ch === '’';
          sub[sub.length - 1].oct += up ? 1 : -1;
        }
        i += 1;
      } else if (ch === '(' || ch === ')') {
        i += 1; // grace/optional note markers — keep the note, drop the paren
      } else {
        i += 1; // ignore anything else
      }
    }
    // A run of >1 notes in one token = eighth notes (0.5 beat each), else 1 beat.
    const beats = sub.length > 1 ? 0.5 : 1;
    for (const s of sub) notes.push({ pitch: `${s.letter}${s.acc}${s.oct}`, beats });
  }
  return notes;
}

/** Split a "|a|b|c|" bar string into an array of bar strings. */
export function splitBars(rh) {
  return rh
    .split('|')
    .map((b) => b.trim())
    .filter((b) => b.length > 0);
}

const ACCIDENTAL_ATOM = { 'C#': 'accidental:C#', 'D#': 'accidental:D#', 'F#': 'accidental:F#', 'G#': 'accidental:G#', 'A#': 'accidental:A#' };
// Flats map to their sharp-named atom.
const FLAT_TO_SHARP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };

function atomsFor(notes) {
  const set = new Set();
  for (const n of notes) {
    const m = /^([A-G])([#b]?)/.exec(n.pitch);
    if (!m) continue;
    const [, letter, acc] = m;
    if (!acc) set.add(`find-note:${letter}`);
    else {
      const name = acc === 'b' ? FLAT_TO_SHARP[letter + 'b'] : letter + '#';
      if (ACCIDENTAL_ATOM[name]) set.add(ACCIDENTAL_ATOM[name]);
      set.add(`find-note:${letter}`);
    }
  }
  return [...set];
}

const BASS_OCTAVE = 3;
function chordBass(chord) {
  const root = CHORD_ROOT[chord] || chord.replace(/m|maj|min|7/g, '');
  return `${root}${BASS_OCTAVE}`;
}

/**
 * Build one chunk from a compact spec:
 *   { id, label, bars, rh, chords, lhFingers?, fingers?, lyrics? }
 * rh: "|E D C D | E E E - | ...|"   chords: "C G G C" (one per bar)
 */
export function buildChunk(spec, baseOctave = 4) {
  const bars = splitBars(spec.rh);
  const chords = spec.chords ? spec.chords.trim().split(/\s+/) : [];
  const lhFingers = spec.lhFingers ? spec.lhFingers.trim().split(/\s+/).map(Number) : [];
  const fingers = spec.fingers ? spec.fingers.trim().split(/\s+/).map(Number) : [];
  const lyrics = spec.lyrics ? spec.lyrics.trim().split(/\s+/) : [];

  const notes = [];
  const leftHand = [];
  let fi = 0;
  let li = 0;
  bars.forEach((bar, bi) => {
    const barNotes = parseBar(bar, baseOctave);
    // An all-rest bar (e.g. "- - - -") carries no melody — skip it entirely so
    // the two hands stay aligned (no chord is emitted for it either).
    if (barNotes.length === 0) return;
    const barBeats = barNotes.reduce((s, n) => s + n.beats, 0) || 4;
    for (const n of barNotes) {
      const note = { pitch: n.pitch, beats: n.beats };
      if (fi < fingers.length && !Number.isNaN(fingers[fi])) note.finger = fingers[fi];
      if (li < lyrics.length) note.lyric = lyrics[li];
      fi += 1;
      li += 1;
      notes.push(note);
    }
    const chord = chords[bi] ?? chords[chords.length - 1];
    if (chord) {
      leftHand.push({
        pitch: chordBass(chord),
        chord,
        beats: barBeats,
        ...(lhFingers[bi] != null && !Number.isNaN(lhFingers[bi]) ? { finger: lhFingers[bi] } : {}),
      });
    }
  });

  return {
    id: spec.id,
    label: spec.label,
    bars: spec.bars,
    requiresAtoms: spec.requiresAtoms ?? atomsFor(notes),
    notes,
    ...(leftHand.length ? { leftHand } : {}),
  };
}

export function buildSong(spec) {
  return {
    id: spec.id,
    title: spec.title,
    attribution: spec.attribution,
    ...(spec.youtube ? { youtube: spec.youtube } : {}),
    bpm: spec.bpm,
    chunks: spec.chunks.map((c) => buildChunk(c, spec.baseOctave ?? 4)),
  };
}

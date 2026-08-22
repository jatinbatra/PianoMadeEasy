import type { Atom } from '../types/atom';

/**
 * The curriculum: small, testable skills with MIDI/mic pass conditions. Ordered
 * to teach gently — find a few notes, start reading them, add steps and skips,
 * then chords and a scale — with real songs every session in between. Kept
 * deliberately easy (short reps, forgiving thresholds, plain-language theory)
 * so it never tips into "I want to give up".
 *
 * Each atom carries two teach angles; a double failure shows the *other* one.
 */
export const ATOMS: Atom[] = [
  // ---- The white keys, by their landmarks ----
  {
    id: 'find-note:C',
    label: 'Find C',
    prerequisites: [],
    prompt: 'Play any C',
    teach: [
      { title: 'C hides left of the two black keys', body: 'Find a pair of two black keys. The white key just to the LEFT is C.' },
      { title: 'Every C is home base', body: 'The keyboard repeats in octaves. Any C works — they all feel the same under your hand.' },
    ],
    test: { kind: 'find-note', target: 'C', reps: 3, threshold: { noteAccuracy: 1 } },
  },
  {
    id: 'find-note:D',
    label: 'Find D',
    prerequisites: ['find-note:C'],
    prompt: 'Play any D',
    teach: [
      { title: 'D nestles between the two black keys', body: 'The white key snug BETWEEN the pair of two black keys is D.' },
      { title: 'One step right of C', body: 'From C, move to the very next white key on the right — that is D.' },
    ],
    test: { kind: 'find-note', target: 'D', reps: 3, threshold: { noteAccuracy: 1 } },
  },
  {
    id: 'find-note:E',
    label: 'Find E',
    prerequisites: ['find-note:D'],
    prompt: 'Play any E',
    teach: [
      { title: 'E sits right of the two black keys', body: 'The white key just to the RIGHT of the pair of two black keys is E.' },
      { title: 'C, D, E', body: 'Count up three white keys from C: C, D, E — the far side of the two-black-key group.' },
    ],
    test: { kind: 'find-note', target: 'E', reps: 3, threshold: { noteAccuracy: 1 } },
  },

  // ---- First taste of reading ----
  {
    id: 'read-note:C',
    label: 'Read middle C',
    prerequisites: ['find-note:C'],
    prompt: 'Play the note you see',
    teach: [
      { title: 'This is how C looks on paper', body: 'Middle C sits just below the staff, on its own little line. See it, then play any C.' },
      { title: 'Reading is just matching', body: 'You already know where C is. Reading just adds the picture — see it, play it.' },
    ],
    test: { kind: 'read-note', pitch: 'C4', reps: 2, threshold: { noteAccuracy: 1 } },
  },

  {
    id: 'find-note:F',
    label: 'Find F',
    prerequisites: ['find-note:E'],
    prompt: 'Play any F',
    teach: [
      { title: 'F leans left of the three black keys', body: 'Find the group of THREE black keys. The white key just to the LEFT is F.' },
      { title: 'F starts the second group', body: 'After E, the next white key F begins the run toward the three black keys.' },
    ],
    test: { kind: 'find-note', target: 'F', reps: 3, threshold: { noteAccuracy: 1 } },
  },
  {
    id: 'find-note:G',
    label: 'Find G',
    prerequisites: ['find-note:F'],
    prompt: 'Play any G',
    teach: [
      { title: 'G is between the first two of three', body: 'In the group of three black keys, the white key between the first two is G.' },
      { title: 'One step right of F', body: 'G is the next white key to the right of F.' },
    ],
    test: { kind: 'find-note', target: 'G', reps: 3, threshold: { noteAccuracy: 1 } },
  },
  {
    id: 'read-note:D',
    label: 'Read D',
    prerequisites: ['read-note:C', 'find-note:D'],
    prompt: 'Play the note you see',
    teach: [
      { title: 'D sits just under the bottom line', body: 'One step up from middle C. See it, play any D.' },
      { title: 'Notes climb as they rise', body: 'Higher on the staff means higher on the keyboard. D is one nudge above C.' },
    ],
    test: { kind: 'read-note', pitch: 'D4', reps: 2, threshold: { noteAccuracy: 1 } },
  },
  {
    id: 'read-note:E',
    label: 'Read E',
    prerequisites: ['read-note:D', 'find-note:E'],
    prompt: 'Play the note you see',
    teach: [
      { title: 'E rests on the bottom line', body: 'The lowest line of the staff is E. See it, play any E.' },
      { title: 'Your first line note', body: 'When a note sits ON a line (not below), the bottom line is E.' },
    ],
    test: { kind: 'read-note', pitch: 'E4', reps: 2, threshold: { noteAccuracy: 1 } },
  },

  // ---- Complete the naturals ----
  {
    id: 'find-note:A',
    label: 'Find A',
    prerequisites: ['find-note:G'],
    prompt: 'Play any A',
    teach: [
      { title: 'A is between the last two of three', body: 'In the group of three black keys, A is the white key between the last two.' },
      { title: 'Two steps right of G', body: 'G, then A — keep walking up the white keys.' },
    ],
    test: { kind: 'find-note', target: 'A', reps: 3, threshold: { noteAccuracy: 1 } },
  },
  {
    id: 'find-note:B',
    label: 'Find B',
    prerequisites: ['find-note:A'],
    prompt: 'Play any B',
    teach: [
      { title: 'B sits right of the three black keys', body: 'The white key just to the RIGHT of the group of three black keys is B.' },
      { title: 'Right before the next C', body: 'B is the last white key before the pattern repeats at C.' },
    ],
    test: { kind: 'find-note', target: 'B', reps: 3, threshold: { noteAccuracy: 1 } },
  },

  // ---- Distance between notes: steps and skips ----
  {
    id: 'interval:step-up-from-C',
    label: 'A step (2nd)',
    prerequisites: ['find-note:C', 'find-note:D'],
    prompt: 'Play C, then the very next key up',
    teach: [
      { title: 'A step is next-door', body: 'The distance between two notes is an interval. A "step" (a 2nd) is right next door: C to D.' },
      { title: 'No gaps', body: 'Steps touch — no key skipped. C then D is one step up.' },
    ],
    test: { kind: 'sequence', pitches: ['C4', 'D4'], ignoreOctave: true, threshold: { noteAccuracy: 1 } },
  },
  {
    id: 'interval:third-up-from-C',
    label: 'A skip (3rd)',
    prerequisites: ['find-note:C', 'find-note:E'],
    prompt: 'Play C, then the E above it',
    teach: [
      { title: 'A skip hops over one key', body: 'A "third" skips one white key: C → (skip D) → E. Skips sound sweeter together.' },
      { title: 'Skip a key', body: 'From C, jump over the next white key and land on the one after — that leap is a third.' },
    ],
    test: { kind: 'sequence', pitches: ['C4', 'E4'], ignoreOctave: true, threshold: { noteAccuracy: 1 } },
  },

  // ---- Chords: notes stacked ----
  {
    id: 'chord:C-major-root',
    label: 'C major chord',
    prerequisites: ['find-note:C', 'find-note:E', 'find-note:G'],
    prompt: 'Play C, E and G together',
    teach: [
      { title: 'A chord is skips stacked up', body: 'Press C, E and G at once (skip, skip). Three notes together make a chord — this bright one is C major.' },
      { title: 'Thumb, middle, pinky', body: 'Thumb on C, skip to E, skip to G. Press all three at the same moment.' },
    ],
    test: { kind: 'chord', pitches: ['C4', 'E4', 'G4'], ignoreOctave: true, windowMs: 220, threshold: { noteAccuracy: 1, timingAccuracy: 1 } },
  },
  {
    id: 'chord:G-major-root',
    label: 'G major chord',
    prerequisites: ['find-note:G', 'find-note:B', 'find-note:D'],
    prompt: 'Play G, B and D together',
    teach: [
      { title: 'Same shape, moved over', body: 'Start on G instead of C: G, skip to B, skip to D. Same bright major shape, new home.' },
      { title: 'The chord that pulls home', body: 'G major loves to lead back to C major — you will feel it in songs.' },
    ],
    test: { kind: 'chord', pitches: ['G4', 'B4', 'D5'], ignoreOctave: true, windowMs: 220, threshold: { noteAccuracy: 1, timingAccuracy: 1 } },
  },
  {
    id: 'chord:A-minor-root',
    label: 'A minor chord',
    prerequisites: ['find-note:A', 'find-note:C', 'find-note:E'],
    prompt: 'Play A, C and E together',
    teach: [
      { title: 'Minor = the softer, sadder colour', body: 'A, C, E together is A minor. Same stacking, but it sounds wistful instead of bright.' },
      { title: 'Bright vs. tender', body: 'Major sounds happy; minor sounds tender. Play A-C-E and hear the difference from C major.' },
    ],
    test: { kind: 'chord', pitches: ['A4', 'C5', 'E5'], ignoreOctave: true, windowMs: 220, threshold: { noteAccuracy: 1, timingAccuracy: 1 } },
  },

  // ---- A whole scale ----
  {
    id: 'scale:C-major-right-hand',
    label: 'C major scale',
    prerequisites: ['find-note:C', 'find-note:D', 'find-note:E', 'find-note:F', 'find-note:G', 'find-note:A', 'find-note:B'],
    prompt: 'Walk up every white key from C to C',
    teach: [
      { title: 'Eight white keys, straight up', body: 'A scale is just steps in a row: C D E F G A B C. Every white key, no black ones.' },
      { title: 'The alphabet of a song', body: 'Most simple songs live inside this scale. Learn the ladder and songs get easier.' },
    ],
    test: {
      kind: 'sequence',
      pitches: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
      ignoreOctave: true,
      threshold: { noteAccuracy: 0.85 },
    },
  },
];

export const ATOM_BY_ID: Record<string, Atom> = Object.fromEntries(ATOMS.map((a) => [a.id, a]));

import type { Atom } from '../types/atom';

/**
 * The ordered curriculum. Each atom is one testable thing with a MIDI pass
 * condition. Order + prerequisites define the ladder; the scheduler decides
 * what to actually practice on a given day.
 *
 * Teach angles are deliberately different explanations of the same thing — the
 * scheduler shows a *new* angle after a double failure, which is the specific
 * fix for "I feel like I'm repeating lesson one forever".
 */
export const ATOMS: Atom[] = [
  {
    id: 'find-note:C',
    label: 'Find C',
    prerequisites: [],
    prompt: 'Play any C',
    teach: [
      { title: 'C sits left of two black keys', body: 'Find a pair of two black keys. The white key just to the LEFT of them is C.' },
      { title: 'Middle C anchor', body: 'The C nearest the middle of the keyboard is “middle C”. Every octave repeats — any C counts.' },
    ],
    test: { kind: 'find-note', target: 'C', reps: 3, threshold: { noteAccuracy: 1 } },
  },
  {
    id: 'find-note:D',
    label: 'Find D',
    prerequisites: ['find-note:C'],
    prompt: 'Play any D',
    teach: [
      { title: 'D is between the two black keys', body: 'The white key nestled BETWEEN the pair of two black keys is D.' },
      { title: 'One right of C', body: 'D is the very next white key to the right of C.' },
    ],
    test: { kind: 'find-note', target: 'D', reps: 3, threshold: { noteAccuracy: 1 } },
  },
  {
    id: 'find-note:E',
    label: 'Find E',
    prerequisites: ['find-note:D'],
    prompt: 'Play any E',
    teach: [
      { title: 'E sits right of two black keys', body: 'The white key just to the RIGHT of the pair of two black keys is E.' },
      { title: 'Two right of C', body: 'C, D, then E — the third white key in the group.' },
    ],
    test: { kind: 'find-note', target: 'E', reps: 3, threshold: { noteAccuracy: 1 } },
  },
  {
    id: 'find-note:F',
    label: 'Find F',
    prerequisites: ['find-note:E'],
    prompt: 'Play any F',
    teach: [
      { title: 'F sits left of three black keys', body: 'Find the group of THREE black keys. The white key just to the LEFT is F.' },
      { title: 'F starts the second group', body: 'After E comes F — the start of the run up to the three-black-key group.' },
    ],
    test: { kind: 'find-note', target: 'F', reps: 3, threshold: { noteAccuracy: 1 } },
  },
  {
    id: 'find-note:G',
    label: 'Find G',
    prerequisites: ['find-note:F'],
    prompt: 'Play any G',
    teach: [
      { title: 'G is between the first two of three black keys', body: 'In the group of three black keys, the white key between the first two is G.' },
      { title: 'One right of F', body: 'G is the next white key to the right of F.' },
    ],
    test: { kind: 'find-note', target: 'G', reps: 3, threshold: { noteAccuracy: 1 } },
  },
  {
    id: 'interval:third-up-from-C',
    label: 'A third above C',
    prerequisites: ['find-note:C', 'find-note:E'],
    prompt: 'Play C, then the E above it',
    teach: [
      { title: 'A third skips one letter', body: 'An interval is the gap between two notes. A “third” skips one letter: C → (skip D) → E.' },
      { title: 'Skip a key', body: 'From C, skip the white key next door (D) and land on the one after (E). That leap is a third.' },
    ],
    test: { kind: 'sequence', pitches: ['C4', 'E4'], ignoreOctave: true, threshold: { noteAccuracy: 1 } },
  },
  {
    id: 'chord:C-major-root',
    label: 'C major chord',
    prerequisites: ['find-note:C', 'find-note:E', 'find-note:G'],
    prompt: 'Play C, E and G together',
    teach: [
      { title: 'A chord is notes at once', body: 'Press C, E and G at the same time. Three notes together = a chord. This one is C major.' },
      { title: 'Skip a key, twice', body: 'Thumb on C, skip D to E, skip F to G. Press all three at once.' },
    ],
    test: { kind: 'chord', pitches: ['C4', 'E4', 'G4'], ignoreOctave: true, windowMs: 200, threshold: { noteAccuracy: 1, timingAccuracy: 1 } },
  },
];

export const ATOM_BY_ID: Record<string, Atom> = Object.fromEntries(ATOMS.map((a) => [a.id, a]));

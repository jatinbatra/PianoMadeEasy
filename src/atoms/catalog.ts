import type { Atom } from '../types/atom';

/**
 * The curriculum — a real road from "where is C" toward playing music. Ordered
 * to teach gently: find the keys, start reading them, meet the black keys, learn
 * distances, stack chords, run scales, and feel rhythm — always octave-agnostic
 * so it's playable on the on-screen piano too. Short reps, forgiving thresholds,
 * two teach angles each (a double failure shows the other one). The scheduler
 * picks ONE thing per session; a long catalog just means a longer, richer road.
 */

const N1 = { noteAccuracy: 1 } as const;

export const ATOMS: Atom[] = [
  // ============ The white keys ============
  {
    id: 'find-note:C',
    label: 'Find C',
    prerequisites: [],
    prompt: 'Play any C',
    teach: [
      { title: 'C hides left of the two black keys', body: 'Find a pair of two black keys. The white key just to the LEFT is C.' },
      { title: 'Every C is home base', body: 'The keyboard repeats in octaves. Any C works — they all feel the same under your hand.' },
    ],
    test: { kind: 'find-note', target: 'C', reps: 3, threshold: N1 },
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
    test: { kind: 'find-note', target: 'D', reps: 3, threshold: N1 },
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
    test: { kind: 'find-note', target: 'E', reps: 3, threshold: N1 },
  },
  {
    id: 'read-note:C',
    label: 'Read middle C',
    prerequisites: ['find-note:C'],
    prompt: 'Play the note you see',
    teach: [
      { title: 'This is how C looks on paper', body: 'Middle C sits just below the staff, on its own little line. See it, then play any C.' },
      { title: 'Reading is just matching', body: 'You already know where C is. Reading just adds the picture — see it, play it.' },
    ],
    test: { kind: 'read-note', pitch: 'C4', reps: 2, threshold: N1 },
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
    test: { kind: 'find-note', target: 'F', reps: 3, threshold: N1 },
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
    test: { kind: 'find-note', target: 'G', reps: 3, threshold: N1 },
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
    test: { kind: 'read-note', pitch: 'D4', reps: 2, threshold: N1 },
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
    test: { kind: 'read-note', pitch: 'E4', reps: 2, threshold: N1 },
  },
  {
    id: 'find-note:A',
    label: 'Find A',
    prerequisites: ['find-note:G'],
    prompt: 'Play any A',
    teach: [
      { title: 'A is between the last two of three', body: 'In the group of three black keys, A is the white key between the last two.' },
      { title: 'Two steps right of G', body: 'G, then A — keep walking up the white keys.' },
    ],
    test: { kind: 'find-note', target: 'A', reps: 3, threshold: N1 },
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
    test: { kind: 'find-note', target: 'B', reps: 3, threshold: N1 },
  },
  {
    id: 'read-note:F',
    label: 'Read F',
    prerequisites: ['read-note:E', 'find-note:F'],
    prompt: 'Play the note you see',
    teach: [
      { title: 'F sits in the first space', body: 'Just above the bottom line, in the first gap, is F.' },
      { title: 'Line then space', body: 'E is on the bottom line; F is the space right above it.' },
    ],
    test: { kind: 'read-note', pitch: 'F4', reps: 2, threshold: N1 },
  },
  {
    id: 'read-note:G',
    label: 'Read G',
    prerequisites: ['read-note:F', 'find-note:G'],
    prompt: 'Play the note you see',
    teach: [
      { title: 'G rides the second line', body: 'The second line from the bottom is G — the line the treble clef curls around.' },
      { title: 'That’s why it’s the “G clef”', body: 'The fancy treble symbol loops around the G line. See it, play any G.' },
    ],
    test: { kind: 'read-note', pitch: 'G4', reps: 2, threshold: N1 },
  },

  // ============ The black keys (sharps & flats) ============
  {
    id: 'accidental:F#',
    label: 'Find F♯',
    prerequisites: ['find-note:F', 'find-note:G'],
    prompt: 'Play the black key just right of F',
    teach: [
      { title: 'Black keys are sharps and flats', body: 'The black key just to the RIGHT of F is F-sharp (F♯). “Sharp” means one step higher.' },
      { title: 'Same key, two names', body: 'That black key is F♯ going up, or G♭ coming down — same key, two names.' },
    ],
    test: { kind: 'find-note', target: 'F#', reps: 2, threshold: N1 },
  },
  {
    id: 'accidental:C#',
    label: 'Find C♯',
    prerequisites: ['find-note:C', 'find-note:D'],
    prompt: 'Play the black key just right of C',
    teach: [
      { title: 'C-sharp is the first black key', body: 'The black key just RIGHT of C is C♯ — the first of the pair of two black keys.' },
      { title: 'Up a half-step', body: 'A sharp nudges a note up by the smallest distance: one key, black or white.' },
    ],
    test: { kind: 'find-note', target: 'C#', reps: 2, threshold: N1 },
  },
  {
    id: 'accidental:G#',
    label: 'Find G♯',
    prerequisites: ['find-note:G', 'find-note:A'],
    prompt: 'Play the black key just right of G',
    teach: [
      { title: 'G-sharp sits between G and A', body: 'The black key just RIGHT of G is G♯ — the middle of the three black keys.' },
      { title: 'Or A-flat', body: 'Coming down from A it’s A♭. Same black key.' },
    ],
    test: { kind: 'find-note', target: 'G#', reps: 2, threshold: N1 },
  },
  {
    id: 'accidental:D#',
    label: 'Find D♯',
    prerequisites: ['find-note:D', 'find-note:E', 'accidental:C#'],
    prompt: 'Play the black key just right of D',
    teach: [
      { title: 'D-sharp is the second of the pair', body: 'The black key just RIGHT of D is D♯ — the second of the two black keys.' },
      { title: 'Or E-flat', body: 'Coming down from E it’s E♭. Same black key.' },
    ],
    test: { kind: 'find-note', target: 'D#', reps: 2, threshold: N1 },
  },
  {
    id: 'accidental:A#',
    label: 'Find A♯',
    prerequisites: ['find-note:A', 'find-note:B', 'accidental:G#'],
    prompt: 'Play the black key just right of A',
    teach: [
      { title: 'A-sharp is the last of the three', body: 'The black key just RIGHT of A is A♯ — the last of the three black keys.' },
      { title: 'Or B-flat', body: 'Coming down from B it’s B♭ — you’ll see this one a lot in songs.' },
    ],
    test: { kind: 'find-note', target: 'A#', reps: 2, threshold: N1 },
  },

  // ============ Distances (intervals) ============
  {
    id: 'interval:step-up-from-C',
    label: 'A step (2nd)',
    prerequisites: ['find-note:C', 'find-note:D'],
    prompt: 'Play C, then the very next key up',
    teach: [
      { title: 'A step is next-door', body: 'The distance between two notes is an interval. A “step” (a 2nd) is right next door: C to D.' },
      { title: 'No gaps', body: 'Steps touch — no key skipped. C then D is one step up.' },
    ],
    test: { kind: 'sequence', pitches: ['C4', 'D4'], ignoreOctave: true, threshold: N1 },
  },
  {
    id: 'interval:third-up-from-C',
    label: 'A skip (3rd)',
    prerequisites: ['find-note:C', 'find-note:E'],
    prompt: 'Play C, then the E above it',
    teach: [
      { title: 'A skip hops over one key', body: 'A “third” skips one white key: C → (skip D) → E. Skips sound sweeter together.' },
      { title: 'Skip a key', body: 'From C, jump over the next white key and land on the one after — that leap is a third.' },
    ],
    test: { kind: 'sequence', pitches: ['C4', 'E4'], ignoreOctave: true, threshold: N1 },
  },
  {
    id: 'interval:fourth-up-from-C',
    label: 'A fourth',
    prerequisites: ['find-note:C', 'find-note:F'],
    prompt: 'Play C, then F',
    teach: [
      { title: 'Count four letters', body: 'C-D-E-F is a fourth: count the start and end letters. It sounds strong and open.' },
      { title: 'Here comes the bride', body: 'A fourth is the “Here Comes the Bride” leap — C up to F.' },
    ],
    test: { kind: 'sequence', pitches: ['C4', 'F4'], ignoreOctave: true, threshold: N1 },
  },
  {
    id: 'interval:fifth-up-from-C',
    label: 'A fifth',
    prerequisites: ['find-note:C', 'find-note:G'],
    prompt: 'Play C, then G',
    teach: [
      { title: 'Count five letters', body: 'C-D-E-F-G is a fifth — a big, stable, powerful-sounding jump.' },
      { title: 'Star Wars opening', body: 'That heroic “dum… DUM” at the start of Star Wars is a fifth: C up to G.' },
    ],
    test: { kind: 'sequence', pitches: ['C4', 'G4'], ignoreOctave: true, threshold: N1 },
  },
  {
    id: 'read-note:A',
    label: 'Read A',
    prerequisites: ['read-note:G', 'find-note:A'],
    prompt: 'Play the note you see',
    teach: [
      { title: 'A sits in the second space', body: 'The gap between the second and third lines is A.' },
      { title: 'Climbing the staff', body: 'E, F, G, A — line, space, line, space, moving up.' },
    ],
    test: { kind: 'read-note', pitch: 'A4', reps: 2, threshold: N1 },
  },
  {
    id: 'read-note:B',
    label: 'Read B',
    prerequisites: ['read-note:A', 'find-note:B'],
    prompt: 'Play the note you see',
    teach: [
      { title: 'B is the middle line', body: 'The exact middle line of the five is B.' },
      { title: 'Halfway home', body: 'B sits in the centre of the staff — a handy landmark.' },
    ],
    test: { kind: 'read-note', pitch: 'B4', reps: 2, threshold: N1 },
  },

  // ============ Chords ============
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
    id: 'chord:F-major',
    label: 'F major chord',
    prerequisites: ['find-note:F', 'find-note:A', 'find-note:C', 'chord:C-major-root'],
    prompt: 'Play F, A and C together',
    teach: [
      { title: 'Same shape from F', body: 'F, skip to A, skip to C. The bright major shape, starting on F.' },
      { title: 'The “away” chord', body: 'In many songs F is where the tune drifts before it comes home to C.' },
    ],
    test: { kind: 'chord', pitches: ['F4', 'A4', 'C5'], ignoreOctave: true, windowMs: 220, threshold: { noteAccuracy: 1, timingAccuracy: 1 } },
  },
  {
    id: 'chord:G-major-root',
    label: 'G major chord',
    prerequisites: ['find-note:G', 'find-note:B', 'find-note:D', 'chord:C-major-root'],
    prompt: 'Play G, B and D together',
    teach: [
      { title: 'Same shape, moved to G', body: 'Start on G: G, skip to B, skip to D. Same bright major shape, new home.' },
      { title: 'The chord that pulls home', body: 'G major loves to lead back to C major — you will feel it in songs.' },
    ],
    test: { kind: 'chord', pitches: ['G4', 'B4', 'D5'], ignoreOctave: true, windowMs: 220, threshold: { noteAccuracy: 1, timingAccuracy: 1 } },
  },
  {
    id: 'chord:A-minor-root',
    label: 'A minor chord',
    prerequisites: ['find-note:A', 'find-note:C', 'find-note:E', 'chord:C-major-root'],
    prompt: 'Play A, C and E together',
    teach: [
      { title: 'Minor = the softer, sadder colour', body: 'A, C, E together is A minor. Same stacking, but it sounds wistful instead of bright.' },
      { title: 'Bright vs. tender', body: 'Major sounds happy; minor sounds tender. Play A-C-E and hear the difference from C major.' },
    ],
    test: { kind: 'chord', pitches: ['A4', 'C5', 'E5'], ignoreOctave: true, windowMs: 220, threshold: { noteAccuracy: 1, timingAccuracy: 1 } },
  },
  {
    id: 'chord:D-minor',
    label: 'D minor chord',
    prerequisites: ['find-note:D', 'find-note:F', 'find-note:A', 'chord:A-minor-root'],
    prompt: 'Play D, F and A together',
    teach: [
      { title: 'Another tender chord', body: 'D, F, A stacked is D minor — one of the most soulful sounds in music.' },
      { title: 'Skip shape from D', body: 'D, skip to F, skip to A. Because of the black keys around it, it lands minor.' },
    ],
    test: { kind: 'chord', pitches: ['D4', 'F4', 'A4'], ignoreOctave: true, windowMs: 220, threshold: { noteAccuracy: 1, timingAccuracy: 1 } },
  },
  {
    id: 'chord:E-minor',
    label: 'E minor chord',
    prerequisites: ['find-note:E', 'find-note:G', 'find-note:B', 'chord:A-minor-root'],
    prompt: 'Play E, G and B together',
    teach: [
      { title: 'E minor — dark and easy', body: 'E, G, B together. All white keys, a rich minor colour.' },
      { title: 'Skip shape from E', body: 'E, skip to G, skip to B. Press all three at once.' },
    ],
    test: { kind: 'chord', pitches: ['E4', 'G4', 'B4'], ignoreOctave: true, windowMs: 220, threshold: { noteAccuracy: 1, timingAccuracy: 1 } },
  },

  // ============ Scales ============
  {
    id: 'scale:C-major-right-hand',
    label: 'C major scale',
    prerequisites: ['find-note:C', 'find-note:D', 'find-note:E', 'find-note:F', 'find-note:G', 'find-note:A', 'find-note:B'],
    prompt: 'Walk up every white key from C to C',
    teach: [
      { title: 'Eight white keys, straight up', body: 'A scale is just steps in a row: C D E F G A B C. Every white key, no black ones.' },
      { title: 'The alphabet of a song', body: 'Most simple songs live inside this scale. Learn the ladder and songs get easier.' },
    ],
    test: { kind: 'sequence', pitches: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], ignoreOctave: true, threshold: { noteAccuracy: 0.85 } },
  },
  {
    id: 'scale:G-major-right-hand',
    label: 'G major scale',
    prerequisites: ['scale:C-major-right-hand', 'accidental:F#'],
    prompt: 'Play G up to G — with one sharp',
    teach: [
      { title: 'G major has one black key', body: 'G A B C D E F♯ G. Everything white except F♯ — the black key right of F.' },
      { title: 'One sharp changes the mood', body: 'That single F♯ is what makes G major sound bright and complete instead of odd.' },
    ],
    test: { kind: 'sequence', pitches: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'], ignoreOctave: true, threshold: { noteAccuracy: 0.85 } },
  },
  {
    id: 'scale:F-major-right-hand',
    label: 'F major scale',
    prerequisites: ['scale:C-major-right-hand', 'accidental:A#'],
    prompt: 'Play F up to F — with one flat',
    teach: [
      { title: 'F major has one flat', body: 'F G A B♭ C D E F. One black key: B♭ (the black key left of B).' },
      { title: 'Flats lower a note', body: 'B♭ means B stepped down one key. It keeps F major sounding smooth.' },
    ],
    test: { kind: 'sequence', pitches: ['F4', 'G4', 'A4', 'A#4', 'C5', 'D5', 'E5', 'F5'], ignoreOctave: true, threshold: { noteAccuracy: 0.85 } },
  },

  // ============ Rhythm ============
  {
    id: 'rhythm:steady-quarters',
    label: 'Steady beats',
    prerequisites: ['find-note:C'],
    prompt: 'Play C four times, evenly',
    teach: [
      { title: 'Even is the whole game', body: 'Tap C four times like a clock: steady, equal gaps. Press ▶ Hear it to feel the pulse first.' },
      { title: 'Rhythm before speed', body: 'Don’t rush. Four even beats matter more than fast ones. Match the ticking.' },
    ],
    test: { kind: 'sequence', pitches: ['C4', 'C4', 'C4', 'C4'], beats: [1, 1, 1, 1], bpm: 60, ignoreOctave: true, threshold: { noteAccuracy: 1, timingAccuracy: 0.5 } },
  },
  {
    id: 'rhythm:eighth-notes',
    label: 'Double-time',
    prerequisites: ['rhythm:steady-quarters'],
    prompt: 'Play C eight times, evenly and quicker',
    teach: [
      { title: 'Twice as many, still even', body: 'Eighth notes are two taps per beat. Press ▶ Hear it, then keep them perfectly even.' },
      { title: 'Split the beat', body: 'Say “1-and-2-and” — a tap on every number and every “and”.' },
    ],
    test: { kind: 'sequence', pitches: ['C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4'], beats: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], bpm: 60, ignoreOctave: true, threshold: { noteAccuracy: 1, timingAccuracy: 0.5 } },
  },
];

export const ATOM_BY_ID: Record<string, Atom> = Object.fromEntries(ATOMS.map((a) => [a.id, a]));

// Short, plain-English music-theory lessons — original text, structured like a
// beginner theory course. Each lesson is a few bite-size slides so it never
// feels like a wall. Visuals are drawn by TheoryArt via the `art` key.

export type ArtKey =
  | 'treble'
  | 'bass'
  | 'ledger'
  | 'durations'
  | 'timesig'
  | 'rests'
  | 'dots'
  | 'accidentals'
  | 'halfwhole'
  | 'majorscale'
  | 'intervals'
  | 'triad';

export interface Slide {
  heading: string;
  body: string;
  art?: ArtKey;
}

export interface Lesson {
  id: string;
  title: string;
  blurb: string;
  icon: string;
  slides: Slide[];
}

export interface Category {
  name: string;
  lessons: Lesson[];
}

export const THEORY: Category[] = [
  {
    name: 'The basics',
    lessons: [
      {
        id: 'staff-clefs',
        title: 'The Staff, Clefs & Ledger Lines',
        blurb: 'Where notes live, and how the two clefs split the piano.',
        icon: '𝄞',
        slides: [
          {
            heading: 'The staff',
            body: 'Music is written on a staff: five lines and the four spaces between them. The higher a note sits on the staff, the higher it sounds.',
            art: 'treble',
          },
          {
            heading: 'The treble clef',
            body: 'The treble clef (𝄞) marks the higher notes — usually your right hand. Its curl wraps around the G line, so it’s also called the “G clef.”',
            art: 'treble',
          },
          {
            heading: 'The bass clef',
            body: 'The bass clef (𝄢) marks the lower notes — usually your left hand. Its two dots sit around the F line, so it’s the “F clef.”',
            art: 'bass',
          },
          {
            heading: 'Ledger lines',
            body: 'A note too high or low for the staff gets its own tiny line — a ledger line. Middle C sits on one ledger line, right between the two clefs.',
            art: 'ledger',
          },
        ],
      },
      {
        id: 'note-duration',
        title: 'Note Duration',
        blurb: 'How long each note is held.',
        icon: '♩',
        slides: [
          {
            heading: 'Notes have length',
            body: 'A note’s shape tells you how long to hold it. An open note-head lasts longer; filling it in and adding a stem and flags makes it shorter.',
            art: 'durations',
          },
          {
            heading: 'The four you’ll use most',
            body: 'Whole note = 4 beats. Half note = 2 beats. Quarter note = 1 beat. Eighth note = half a beat. Each one is worth half of the one before it.',
            art: 'durations',
          },
          {
            heading: 'Flags and beams',
            body: 'A single flag halves a note (eighth → sixteenth). When eighths sit together they’re joined with a beam instead of separate flags — easier to read.',
          },
        ],
      },
      {
        id: 'measures-time',
        title: 'Measures & Time Signature',
        blurb: 'How beats are grouped into bars.',
        icon: '𝄀',
        slides: [
          {
            heading: 'Bars (measures)',
            body: 'The staff is chopped into equal chunks by vertical bar lines. Each chunk is a measure, and every measure holds the same number of beats.',
          },
          {
            heading: 'The time signature',
            body: 'Two stacked numbers at the start tell you the beat. The top number = how many beats per measure. The bottom = which note gets one beat.',
            art: 'timesig',
          },
          {
            heading: '4/4 — the common one',
            body: '4/4 means four beats per bar, and a quarter note = one beat. Count “1 2 3 4” per bar. Most of your songs — Mary, Ode to Joy — are in 4/4.',
            art: 'timesig',
          },
        ],
      },
      {
        id: 'rests',
        title: 'Rest Duration',
        blurb: 'Silence is written down too.',
        icon: '𝄽',
        slides: [
          {
            heading: 'A rest is a timed silence',
            body: 'Rests are just like notes, but you play nothing. They have the same lengths — whole, half, quarter, eighth — so the beat keeps going.',
            art: 'rests',
          },
          {
            heading: 'Keep counting',
            body: 'Don’t stop counting during a rest — hold the empty beats in your head. In this app a “-” after a note means “hold / rest for one more beat.”',
            art: 'rests',
          },
        ],
      },
      {
        id: 'dots-ties',
        title: 'Dots & Ties',
        blurb: 'Two ways to stretch a note.',
        icon: '♩.',
        slides: [
          {
            heading: 'A dot adds half',
            body: 'A dot after a note adds half of that note’s length. A dotted half note = 2 + 1 = 3 beats. A dotted quarter = 1 + ½ = 1½ beats.',
            art: 'dots',
          },
          {
            heading: 'A tie joins two notes',
            body: 'A curved tie links two notes of the same pitch into one longer sound — play the first, hold through the second. Handy across a bar line.',
            art: 'dots',
          },
        ],
      },
      {
        id: 'steps-accidentals',
        title: 'Steps & Accidentals',
        blurb: 'Half steps, whole steps, sharps and flats.',
        icon: '♯',
        slides: [
          {
            heading: 'Half step',
            body: 'A half step is the smallest move on the piano — to the very next key, black or white. E to F is a half step (no key between them).',
            art: 'halfwhole',
          },
          {
            heading: 'Whole step',
            body: 'A whole step is two half steps — you skip one key. C to D is a whole step, hopping over the black key between them.',
            art: 'halfwhole',
          },
          {
            heading: 'Sharps and flats',
            body: 'A sharp (♯) raises a note a half step; a flat (♭) lowers it a half step. A natural (♮) cancels either. Those are mostly the black keys.',
            art: 'accidentals',
          },
        ],
      },
    ],
  },
  {
    name: 'Scales & keys',
    lessons: [
      {
        id: 'major-scale',
        title: 'The Major Scale',
        blurb: 'The DO-RE-MI pattern behind most songs.',
        icon: '🎼',
        slides: [
          {
            heading: 'A ladder of steps',
            body: 'A major scale is eight notes going up, using a fixed pattern of whole (W) and half (H) steps: W W H W W W H. That pattern is what makes it sound “major.”',
            art: 'majorscale',
          },
          {
            heading: 'C major — all white keys',
            body: 'Start on C and follow the pattern: C D E F G A B C. It lands entirely on white keys — that’s why C major is where everyone begins.',
            art: 'majorscale',
          },
          {
            heading: 'DO RE MI',
            body: 'Those eight notes are the solfège you’ve seen: DO RE MI FA SOL LA SI DO. Same ladder, sung instead of spelled.',
          },
        ],
      },
    ],
  },
  {
    name: 'Chords',
    lessons: [
      {
        id: 'triads',
        title: 'Triads (Basic Chords)',
        blurb: 'Three notes that make a chord.',
        icon: '𝄞',
        slides: [
          {
            heading: 'Stack in thirds',
            body: 'A triad is three notes played together: a root, then skip a letter, then skip again. C–E–G is a C chord. That “skip one” gap is called a third.',
            art: 'triad',
          },
          {
            heading: 'Major vs minor',
            body: 'C–E–G sounds bright — a major chord. Lower the middle note a half step (C–E♭–G) and it sounds sad — a minor chord. The middle note sets the mood.',
            art: 'triad',
          },
          {
            heading: 'Your left hand',
            body: 'In your songs the left hand often plays just the chord’s bottom note (the root) — a “C” chord becomes a single low C. That’s the two-hand method your sheets use.',
          },
        ],
      },
    ],
  },
];

export function allLessons(): Lesson[] {
  return THEORY.flatMap((c) => c.lessons);
}

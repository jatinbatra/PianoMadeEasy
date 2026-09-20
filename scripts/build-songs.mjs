// Regenerates the two-hand song JSONs from the teacher's Alphabet Notation.
// Run: node scripts/build-songs.mjs
//
// Notes are transcribed from the uploaded homework sheets. Chords are the
// left-hand bass line the sheet marks above each bar. Fingering/lyrics are
// best-effort where the sheet gives them. All public domain.

import { writeFileSync, readFileSync } from 'fs';
import { buildSong } from './notation.mjs';

const yt = (q) => `https://www.youtube.com/results?search_query=${q.replace(/ /g, '+')}+easy+piano+both+hands+tutorial`;

const SONGS = [
  {
    id: 'mary-had-a-little-lamb',
    title: 'Mary Had a Little Lamb',
    attribution: 'Traditional melody, public domain. Two-hand arrangement in your teacher’s notation.',
    youtube: yt('Mary Had a Little Lamb'),
    bpm: 90,
    chunks: [
      { id: 'a1', label: 'Line 1', bars: '1-4', chords: 'C G G C', lhFingers: '5 1 1 5',
        rh: '|E D C D | E E E - | D D D - | E G G - |',
        fingers: '3 2 1 2 3 3 3 2 2 2 3 5 5',
        lyrics: 'MA- RY HAD A LIT- TLE LAMB LIT- TLE LAMB LIT- TLE LAMB' },
      { id: 'a2', label: 'Line 2', bars: '5-8', chords: 'C G G C', lhFingers: '5 1 1 5',
        rh: '|E D C D | E E E C | D D E D | C - - - |',
        fingers: '3 2 1 2 3 3 3 1 2 2 3 2 1',
        lyrics: 'MA- RY HAD A LIT- TLE LAMB ITS FLEECE WAS WHITE AS SNOW' },
    ],
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    attribution: 'Beethoven, public domain. Two-hand arrangement in your teacher’s notation.',
    youtube: yt('Ode to Joy'),
    bpm: 100,
    chunks: [
      { id: 'a1', label: 'Opening', bars: '1-4', chords: 'C G C G', lhFingers: '5 1 5 1',
        rh: '|E E F G | G F E D | C C D E | E - D D|',
        fingers: '3 3 4 5 5 4 3 2 1 1 2 3 3 2 2', lyrics: '' },
      { id: 'a2', label: 'Answer', bars: '5-8', chords: 'C G C C', lhFingers: '5 1 5 5',
        rh: '|E E F G | G F E D | C C D E | D - C C|',
        fingers: '3 3 4 5 5 4 3 2 1 1 2 3 2 1 1' },
      { id: 'b1', label: 'Middle', bars: '9-12', chords: 'G C G C', lhFingers: '1 5 1 5',
        rh: '|D - E C| D F E C| D F E D| C - D -|',
        fingers: '2 3 1 2 4 3 1 2 4 3 2 1 2' },
      { id: 'b2', label: 'Return', bars: '13-16', chords: 'C G C C', lhFingers: '5 1 5 5',
        rh: '|E E F G | G F E D | C C D E | D - C C|',
        fingers: '3 3 4 5 5 4 3 2 1 1 2 3 2 1 1' },
    ],
  },
  {
    id: 'twinkle-twinkle',
    title: 'Twinkle Twinkle Little Star',
    attribution: 'Traditional (Mozart variations base), public domain. Two-hand arrangement.',
    youtube: yt('Twinkle Twinkle Little Star'),
    bpm: 100,
    chunks: [
      { id: 'a1', label: 'Twinkle twinkle little star', bars: '1-4', chords: 'C F C G',
        rh: '|C C G G| A A G - | F F E E | D D C - |',
        fingers: '1 1 5 5 5 5 4 3 4 3 3 2 2 1',
        lyrics: 'TWIN- KLE TWIN- KLE LIT- TLE STAR HOW I WON- DER WHAT YOU ARE' },
      { id: 'a2', label: 'Up above the world so high', bars: '5-8', chords: 'C G C G',
        rh: '|G G F F | E E D - | G G F F | E D C - |',
        fingers: '5 5 4 4 3 3 2 5 5 4 4 3 2 1',
        lyrics: 'UP A- BOVE THE WORLD SO HIGH LIKE A DIA- MOND IN THE SKY' },
    ],
  },
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    attribution: 'Melody now public domain. Two-hand arrangement in your teacher’s notation.',
    youtube: yt('Happy Birthday'),
    bpm: 100,
    chunks: [
      { id: 'a1', label: 'Happy birthday to you', bars: '1-4', chords: 'C F C Bb',
        rh: '|C C D C | F E - - | C C D C | G F - - |',
        fingers: '1 1 2 1 4 3 1 1 2 1 5 4',
        lyrics: 'HAP- PY BIRTH- DAY TO YOU HAP- PY BIRTH- DAY TO YOU' },
      { id: 'a2', label: 'Happy birthday dear ___', bars: '5-8', chords: 'C F Bb C',
        rh: '|C C A F | E D - - | Bb Bb A F| G F - - |',
        fingers: '1 1 5 4 3 2 1 4 4 3 1 2 1',
        lyrics: 'HAP- PY BIRTH- DAY DEAR YOU HAP- PY BIRTH- DAY TO YOU' },
    ],
  },
  {
    id: 'aura-lea',
    title: 'Aura Lea',
    attribution: 'W. W. Fosdick / George Poulton, 1861 — public domain (“Love Me Tender” melody).',
    youtube: yt('Aura Lea'),
    bpm: 90,
    chunks: [
      { id: 'a1', label: 'Line 1', bars: '1-4', chords: 'F Bb C F',
        rh: '|C F E F| G D G - | F E D E| F - - - |',
        fingers: '1 4 3 4 5 2 5 4 3 2 3 4' },
      { id: 'a2', label: 'Line 2', bars: '5-8', chords: 'A Bb C F',
        rh: '|C F E F| G D G - | F E A G| F - - - |',
        fingers: '1 4 3 4 5 2 5 4 3 5 4 3' },
      { id: 'b1', label: 'Bridge', bars: '9-12', chords: 'F F C F',
        rh: '|A A A - | A A A - | A G F G | A - - - |',
        fingers: '3 3 3 3 3 3 3 2 1 2 3' },
      { id: 'b2', label: 'Ending', bars: '13-16', chords: 'F G Bb C',
        rh: '|A A Bb A| G D G - | F E D E| F - - - |',
        fingers: '3 3 4 3 2 1 5 4 3 2 3 4' },
    ],
  },
  {
    id: 'au-clair-de-la-lune',
    title: 'Au Clair de la Lune',
    attribution: 'Traditional French folk song, public domain. A classic first two-hand piece.',
    youtube: yt('Au Clair de la Lune'),
    bpm: 96,
    chunks: [
      { id: 'a1', label: 'Line 1', bars: '1-4', chords: 'C C G C',
        rh: '|C C C D | E - D - | C E D D | C - - - |',
        fingers: '1 1 1 2 3 2 1 3 2 2 1' },
      { id: 'a2', label: 'Line 2', bars: '5-8', chords: 'C C G C',
        rh: '|C C C D | E - D - | C E D D | C - - - |',
        fingers: '1 1 1 2 3 2 1 3 2 2 1' },
    ],
  },
  {
    id: 'yankee-doodle',
    title: 'Yankee Doodle',
    attribution: 'Traditional American tune, public domain. Two-hand arrangement.',
    youtube: yt('Yankee Doodle'),
    bpm: 112,
    chunks: [
      { id: 'a1', label: 'Yankee Doodle went to town', bars: '1-4', chords: 'C C G C',
        rh: '|C C D E | C E D - | C C D E | C - B - |',
        fingers: '1 1 2 3 1 3 2 1 1 2 3 1 5' },
      { id: 'a2', label: 'Stuck a feather in his cap', bars: '5-8', chords: 'C F G C',
        rh: '|C C D E | F E D C | B G A B | C - - - |',
        fingers: '1 1 2 3 4 3 2 1 5 3 4 5 1' },
    ],
  },
  {
    id: 'frere-jacques',
    title: 'Frère Jacques',
    attribution: 'Traditional French round, public domain. Two-hand arrangement.',
    youtube: yt('Frere Jacques'),
    bpm: 100,
    chunks: [
      { id: 'a1', label: 'Frère Jacques', bars: '1-4', chords: 'C C C C',
        rh: '|C D E C | C D E C | E F G - | E F G - |',
        fingers: '1 2 3 1 1 2 3 1 3 4 5 3 4 5' },
      { id: 'a2', label: 'Sonnez les matines', bars: '5-8', chords: 'C G C C',
        rh: '|G A G F | E - C - | C G C - | C - - - |',
        fingers: '5 5 4 4 3 1 1 5 1 1' },
    ],
  },
  {
    id: 'old-macdonald',
    title: 'Old MacDonald Had a Farm',
    attribution: 'Traditional nursery song, public domain. Two-hand arrangement.',
    youtube: yt('Old MacDonald Had a Farm'),
    bpm: 108,
    chunks: [
      { id: 'a1', label: 'Old MacDonald had a farm', bars: '1-4', chords: 'C C G C',
        rh: '|G G G D | E E D - | B B A A | G - - - |',
        fingers: '5 5 5 2 3 3 2 5 5 4 4 3' },
      { id: 'a2', label: 'And on that farm he had a cow', bars: '5-8', chords: 'C C G C',
        rh: '|G G G D | E E D - | B B A A | G - - - |',
        fingers: '5 5 5 2 3 3 2 5 5 4 4 3' },
    ],
  },
  {
    id: 'oh-susanna',
    title: 'Oh! Susanna',
    attribution: 'Stephen Foster, 1848 — public domain. Two-hand arrangement.',
    youtube: yt('Oh Susanna'),
    bpm: 116,
    chunks: [
      { id: 'a1', label: 'I come from Alabama', bars: '1-4', chords: 'C G C C',
        rh: '|C D E G | G A G E | C D E E | D C D - |',
        fingers: '1 2 3 5 5 5 5 3 1 2 3 3 2 1 2' },
      { id: 'a2', label: 'With my banjo on my knee', bars: '5-8', chords: 'C G C C',
        rh: '|C D E G | G A G E | C D E E | D D C - |',
        fingers: '1 2 3 5 5 5 5 3 1 2 3 3 2 2 1' },
    ],
  },
  {
    id: 'hot-cross-buns',
    title: 'Hot Cross Buns',
    attribution: 'Traditional nursery rhyme, public domain. Two-hand arrangement.',
    youtube: yt('Hot Cross Buns'),
    bpm: 100,
    chunks: [
      { id: 'a1', label: 'Hot cross buns', bars: '1-2', chords: 'E C',
        rh: '|E D C - | E D C - |', fingers: '3 2 1 3 2 1',
        lyrics: 'HOT CROSS BUNS HOT CROSS BUNS' },
      { id: 'a2', label: 'One a penny', bars: '3-4', chords: 'C G',
        rh: '|C C C C | D D D D |', fingers: '1 1 1 1 2 2 2 2',
        lyrics: 'ONE A PEN- NY TWO A PEN- NY' },
      { id: 'a3', label: 'Hot cross buns', bars: '5-6', chords: 'E C',
        rh: '|E D C - | E D C - |', fingers: '3 2 1 3 2 1',
        lyrics: 'HOT CROSS BUNS' },
    ],
  },
  {
    id: 'if-youre-happy',
    title: 'If You’re Happy and You Know It',
    attribution: 'Traditional, public domain. Two-hand arrangement.',
    youtube: yt('If You are Happy and You Know It'),
    bpm: 110,
    chunks: [
      { id: 'a1', label: 'If you’re happy and you know it, clap your hands', bars: '1-6', chords: 'C F C Bb',
        rh: '|C C | F F | F F | F F | E F | G - |', fingers: '1 1 4 4 4 4 4 4 3 4 5',
        lyrics: 'IF YOU’RE HAP- PY AND YOU KNOW IT CLAP YOUR HANDS' },
      { id: 'a2', label: 'Second line', bars: '7-12', chords: 'C G E D',
        rh: '|C C | G G | G G | G G | F G | A - |', fingers: '1 1 4 4 4 4 4 4 3 4 5',
        lyrics: 'IF YOU’RE HAP- PY AND YOU KNOW IT CLAP YOUR HANDS' },
      { id: 'b1', label: 'If you’re happy and you know it then your face', bars: '13-18', chords: 'C G F A',
        rh: '|C C | Bb Bb| Bb Bb | A - | A A | G G |', fingers: '1 1 4 4 4 4 3 3 3 2 2',
        lyrics: 'THEN YOUR FACE WILL SURE- LY SHOW IT IF YOU’RE' },
      { id: 'b2', label: 'Ending', bars: '19-22', chords: 'D C Bb F',
        rh: '|F F | E E | E E | E E | D E | F - |', fingers: '1 1 3 3 3 3 3 3 2 3 4',
        lyrics: 'HAP- PY AND YOU KNOW IT CLAP YOUR HANDS' },
    ],
  },
  {
    id: 'wheels-on-the-bus',
    title: 'The Wheels on the Bus',
    attribution: 'Traditional, public domain. Two-hand arrangement (G position).',
    youtube: yt('Wheels on the Bus'),
    bpm: 110,
    chunks: [
      { id: 'a1', label: 'The wheels on the bus go round and round', bars: '1-4', chords: 'C C G C',
        rh: "|G C C C | E G E C - | D B G - | G E C - |", fingers: '1 2 2 3 3 5 3 1 5 3 1 5 3 1',
        lyrics: 'THE WHEELS ON THE BUS GO ROUND AND ROUND ROUND AND ROUND ROUND AND ROUND' },
      { id: 'a2', label: 'All through the town', bars: '5-8', chords: 'C C G C',
        rh: "|G C C C | E G E C - | D - G - | C - - - |", fingers: '1 2 2 3 3 5 3 1 5 1 3',
        lyrics: 'THE WHEELS ON THE BUS GO ROUND AND ROUND ALL THROUGH THE TOWN' },
    ],
  },
  {
    id: 'row-row',
    title: 'Row, Row, Row Your Boat',
    attribution: 'Traditional round, public domain. Two-hand arrangement (G position).',
    youtube: yt('Row Row Row Your Boat'),
    bpm: 100,
    chunks: [
      { id: 'a1', label: 'Row, row, row your boat', bars: '1-4', chords: 'G D G D',
        rh: '|G - - | G - - | G - A | B - - |', fingers: '1 1 1 2 3',
        lyrics: 'ROW ROW ROW YOUR BOAT' },
      { id: 'a2', label: 'Gently down the stream', bars: '5-8', chords: 'G G G G',
        rh: '|B - A | B - C | D - - | D - - |', fingers: '3 2 3 4 5 5',
        lyrics: 'GENT- LY DOWN THE STREAM' },
      { id: 'b1', label: 'Merrily merrily', bars: '9-12', chords: 'D G G D',
        rh: "|G G G | D D D | B B B | G - - |", fingers: '5 5 5 3 3 3 2 2 2 1',
        lyrics: 'MER- RI- LY MER- RI- LY MER- RI- LY MER- RI- LY' },
      { id: 'b2', label: 'Life is but a dream', bars: '13-16', chords: 'G D G',
        rh: '|D - C | B - A | G - - | - - - |', fingers: '5 4 3 2 1',
        lyrics: 'LIFE IS BUT A DREAM' },
    ],
  },
  {
    id: 'jingle-bells',
    title: 'Jingle Bells',
    attribution: 'James Lord Pierpont, 1857 — public domain. Two-hand arrangement.',
    youtube: yt('Jingle Bells'),
    bpm: 120,
    chunks: [
      { id: 'a1', label: 'Jingle bells, jingle bells', bars: '1-4', chords: 'C C C C',
        rh: '|E E E - | E E E - | E G C D | E - - - |', fingers: '3 3 3 3 3 3 3 5 1 2 3',
        lyrics: 'JIN- GLE BELLS JIN- GLE BELLS JIN- GLE ALL THE WAY' },
      { id: 'a2', label: 'Oh what fun it is to ride', bars: '5-8', chords: 'D C D G',
        rh: '|F F F F | F E E E | E D D E | D - G - |', fingers: '4 4 4 4 4 3 3 3 3 2 2 3 2 5',
        lyrics: 'OH WHAT FUN IT IS TO RIDE IN A ONE- HORSE O- PEN SLEIGH HEY' },
      { id: 'b1', label: 'Jingle bells again', bars: '9-12', chords: 'C C C C',
        rh: '|E E E - | E E E - | E G C D | E - - - |', fingers: '3 3 3 3 3 3 3 5 1 2 3',
        lyrics: 'JIN- GLE BELLS JIN- GLE BELLS JIN- GLE ALL THE WAY' },
      { id: 'b2', label: 'The finish', bars: '13-16', chords: 'G C D C',
        rh: '|F F F F | F E E E | G G F D | C - - - |', fingers: '4 4 4 4 4 3 3 3 5 5 4 2 1',
        lyrics: 'OH WHAT FUN IT IS TO RIDE IN A ONE- HORSE O- PEN SLEIGH' },
    ],
  },
  {
    id: 'silent-night',
    title: 'Silent Night',
    attribution: 'Franz Gruber, 1818 — public domain. Two-hand arrangement.',
    youtube: yt('Silent Night'),
    bpm: 80,
    chunks: [
      { id: 'a1', label: 'Silent night, holy night', bars: '1-4', chords: 'C C F C',
        rh: '|G A G|E - - | G A G | E - - |', fingers: '2 3 2 1 2 3 2 1',
        lyrics: 'SI- LENT NIGHT HO- LY NIGHT' },
      { id: 'a2', label: 'All is calm, all is bright', bars: '5-8', chords: 'F C C C',
        rh: '|A - A|C E B A|G A G|E - - |', fingers: '3 3 5 4 3 2 3 2 1',
        lyrics: 'ALL IS CALM ALL IS BRIGHT' },
    ],
  },
];

let report = [];
for (const spec of SONGS) {
  const song = buildSong(spec);
  // Validate beat alignment (RH vs LH) per chunk.
  for (const c of song.chunks) {
    if (!c.leftHand) continue;
    const rb = c.notes.reduce((s, n) => s + n.beats, 0);
    const lb = c.leftHand.reduce((s, n) => s + n.beats, 0);
    if (Math.abs(rb - lb) > 0.01) report.push(`  ! ${song.id}/${c.id} beats RH ${rb} vs LH ${lb}`);
  }
  writeFileSync(`songs/${song.id}.json`, JSON.stringify(song, null, 2) + '\n');
  report.push(`✓ ${song.id}: ${song.chunks.length} chunks`);
}

// Validate every requiresAtoms exists in the catalog.
const catalog = readFileSync('src/atoms/catalog.ts', 'utf8');
const atomIds = new Set([...catalog.matchAll(/id: '([^']+)'/g)].map((m) => m[1]));
for (const spec of SONGS) {
  const song = buildSong(spec);
  for (const c of song.chunks) for (const a of c.requiresAtoms) if (!atomIds.has(a)) report.push(`  ! ${song.id}/${c.id} unknown atom ${a}`);
}

console.log(report.join('\n'));
console.log(`\nGenerated ${SONGS.length} songs.`);

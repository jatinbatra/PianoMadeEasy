import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Keyboard } from '../Keyboard';
import { Staff } from '../Staff';
import { MicListening } from '../MicListening';
import { BlockChrome } from './BlockChrome';
import { useCountdown } from '../useCountdown';
import { pitchClass, type PitchClass } from '../../midi/notes';
import { MidiRecorder } from '../../midi/recorder';
import { playNote, playMelody, playChord } from '../../audio/synth';
import { evaluateTest, expectedNotes } from '../../atoms/evaluate';
import type { Input } from '../../input/useInput';
import type { Atom } from '../../types/atom';
import type { ScoreResult } from '../../scoring/score';

/** The black-key group a natural note is described against ("left of the two
 *  black keys"). Empty for the black keys themselves. */
function landmarksFor(pc: PitchClass): PitchClass[] {
  const letter = pc[0];
  if (pc.includes('#')) return [];
  if ('CDE'.includes(letter)) return ['C#', 'D#'];
  if ('FGAB'.includes(letter)) return ['F#', 'G#', 'A#'];
  return [];
}

interface Props {
  atom: Atom;
  title: string;
  teach?: ReactNode;
  seconds: number;
  input: Input;
  blockIndex: number;
  blockCount: number;
  /** result === null means unscored (untethered, or a chord under mic). */
  onFinish: (atomId: string, result: ScoreResult | null) => void;
}

/**
 * Tests one atom over MIDI or mic. Records everything and scores the whole take
 * at the end. A chord can't be verified by the (monophonic) mic, so under mic a
 * chord test is shown but left unscored.
 */
export function AtomTestBlock({ atom, title, teach, seconds, input, blockIndex, blockCount, onFinish }: Props) {
  const test = atom.test;
  const expected = useRef(expectedNotes(test)).current;
  const targetPcs = useRef(expected.map(pitchClass)).current;

  // Can we objectively score this test with the current input? Chords need a
  // real keyboard (mic can't hear them; on-screen taps aren't simultaneous).
  const canScore =
    input.mode === 'midi' || ((input.mode === 'mic' || input.mode === 'touch') && test.kind !== 'chord');

  const recorder = useRef<MidiRecorder>(new MidiRecorder());
  const [played, setPlayed] = useState<number | null>(null);
  const [cursor, setCursor] = useState(0);
  const cursorRef = useRef(0);
  cursorRef.current = cursor;
  const [chordHits, setChordHits] = useState<Set<PitchClass>>(new Set());
  const chordRef = useRef<Set<PitchClass>>(new Set());
  const [done, setDone] = useState(false);
  const [rounds, setRounds] = useState(0);
  const roundsRef = useRef(0);
  const locked = useRef(false);
  const finished = useRef(false);

  // How many clean reps end this block. Enough to prove it, then move on — no
  // waiting out the timer. Scales a little with the session length; the timer
  // is only a fallback if you wander off.
  const targetRounds = Math.max(2, Math.min(6, Math.round(seconds / 40)));

  function finish() {
    if (finished.current) return;
    finished.current = true;
    const events = recorder.current.stop();
    onFinish(atom.id, canScore ? evaluateTest(test, events) : null);
  }

  const remaining = useCountdown(seconds, finish);

  // A round is done — flash ✓ and tally it. Once you've hit it enough times we
  // move straight on to the next exercise; otherwise reset for another go.
  function roundComplete() {
    locked.current = true;
    setDone(true);
    const n = roundsRef.current + 1;
    roundsRef.current = n;
    setRounds(n);
    setTimeout(() => {
      if (n >= targetRounds) {
        finish();
        return;
      }
      setDone(false);
      cursorRef.current = 0;
      setCursor(0);
      chordRef.current = new Set();
      setChordHits(new Set());
      locked.current = false;
    }, 800);
  }

  // Record + drive live feedback (only when we can score).
  useEffect(() => {
    if (!canScore) return;
    recorder.current.start();
    const unsub = input.subscribe((n) => {
      recorder.current.add(n.note, n.velocity, n.on);
      if (!n.on || locked.current) return;
      setPlayed(n.note);
      const pc = pitchClass(n.note);

      if (test.kind === 'chord') {
        if (targetPcs.includes(pc)) {
          chordRef.current.add(pc);
          setChordHits(new Set(chordRef.current));
          if (chordRef.current.size >= expected.length) roundComplete();
        }
      } else if (pc === targetPcs[cursorRef.current % targetPcs.length]) {
        const nextC = cursorRef.current + 1;
        cursorRef.current = nextC;
        setCursor(nextC);
        if (nextC >= expected.length) roundComplete();
      }
    });
    return unsub;
    // Depend on the STABLE subscribe fn, not the input object (which is a new
    // reference every render) — otherwise the recorder restarts on each render
    // and drops the notes just played.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.subscribe, canScore]);

  const highlight: PitchClass[] =
    test.kind === 'chord' ? targetPcs : [targetPcs[cursor % targetPcs.length]];

  // Faint landmark hints: light up the black-key group the lesson refers to,
  // so "left of the two black keys" connects to the picture.
  const hints: PitchClass[] =
    test.kind === 'find-note' || test.kind === 'read-note' ? landmarksFor(targetPcs[0]) : [];

  const progress =
    test.kind === 'chord'
      ? `${chordHits.size}/${expected.length} notes`
      : `${Math.min(cursor, expected.length)}/${expected.length}`;

  function hear() {
    if (test.kind === 'chord') {
      playChord(expected);
    } else if (test.kind === 'sequence') {
      const bpm = test.bpm ?? 90;
      const beatMs = (60 / bpm) * 1000;
      playMelody(expected.map((m, i) => ({ midi: m, durMs: (test.beats?.[i] ?? 1) * beatMs })));
    } else {
      playNote(expected[0], 700);
    }
  }

  const unscoredMsg =
    test.kind === 'chord'
      ? 'Chords need a real keyboard — play it, then Next'
      : 'Play along — no score without input';

  return (
    <BlockChrome title={title} remaining={remaining} blockIndex={blockIndex} blockCount={blockCount} onSkip={finish}>
      {teach && <div className="teach">{teach}</div>}

      <div className="prompt">
        <div className="prompt-kicker">{canScore ? atom.prompt : 'Play along'}</div>
        {test.kind === 'read-note' ? (
          <div className={done ? 'good' : ''}>
            <Staff pitch={test.pitch} />
          </div>
        ) : (
          <div className={'prompt-note' + (done ? ' good' : '')}>
            {test.kind === 'chord'
              ? test.pitches.map((p) => p.replace(/\d/, '')).join(' ')
              : targetPcs[cursor % targetPcs.length]}
          </div>
        )}
        {done ? (
          <div className="prompt-feedback good">
            {rounds >= targetRounds ? '✓ Got it — moving on' : `✓ Nice · ${rounds} of ${targetRounds}`}
          </div>
        ) : (
          <div className="prompt-feedback">
            {canScore ? (rounds > 0 ? `${progress} · ${rounds} of ${targetRounds}` : progress) : unscoredMsg}
          </div>
        )}
      </div>

      <button className="hear-btn" onClick={hear}>
        ▶ {test.kind === 'chord' ? 'Hear the chord' : test.kind === 'sequence' ? 'Hear it' : 'Hear this note'}
      </button>

      <MicListening input={input} />

      <Keyboard highlight={highlight} hints={hints} played={played} onTap={input.tapNote} />

      {canScore && (
        <div className="heard-row">
          <span className="legend">
            <span className="sw target" /> play this
            <span className="sw played" /> what it heard
          </span>
          {played != null && (
            <span className="heard">
              Heard: <strong>{pitchClass(played)}</strong>{' '}
              {test.kind !== 'chord' && (pitchClass(played) === targetPcs[cursor % targetPcs.length] ? '✓' : '✗')}
            </span>
          )}
        </div>
      )}

      {!canScore && !done && (
        <button className="btn-secondary big" onClick={finish}>
          Got it — next
        </button>
      )}
    </BlockChrome>
  );
}

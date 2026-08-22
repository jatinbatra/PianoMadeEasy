import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Keyboard } from '../Keyboard';
import { BlockChrome } from './BlockChrome';
import { useCountdown } from '../useCountdown';
import { pitchClass, type PitchClass } from '../../midi/notes';
import { MidiRecorder } from '../../midi/recorder';
import { evaluateTest, expectedNotes } from '../../atoms/evaluate';
import type { UseMidi } from '../../midi/useMidi';
import type { Atom } from '../../types/atom';
import type { ScoreResult } from '../../scoring/score';

interface Props {
  atom: Atom;
  title: string;
  /** Teach content shown above the test (focus block); omit for recall. */
  teach?: ReactNode;
  seconds: number;
  midi: UseMidi;
  blockIndex: number;
  blockCount: number;
  /** result === null means untethered (unverified — atom strength not updated). */
  onFinish: (atomId: string, result: ScoreResult | null) => void;
}

/**
 * Tests one atom over MIDI. Records everything and scores the whole take at the
 * end (never self-assessment). Live cursor/highlighting is just feedback. In
 * untethered mode it shows the material and moves on, reporting null.
 */
export function AtomTestBlock({ atom, title, teach, seconds, midi, blockIndex, blockCount, onFinish }: Props) {
  const test = atom.test;
  const expected = useRef(expectedNotes(test)).current;
  const targetPcs = useRef(expected.map(pitchClass)).current;
  const connected = midi.mode === 'connected';

  const recorder = useRef<MidiRecorder>(new MidiRecorder());
  const [played, setPlayed] = useState<number | null>(null);
  const [cursor, setCursor] = useState(0); // for find-note reps & sequences
  const cursorRef = useRef(0);
  cursorRef.current = cursor;
  const [chordHits, setChordHits] = useState<Set<PitchClass>>(new Set());
  const chordRef = useRef<Set<PitchClass>>(new Set());
  const [done, setDone] = useState(false);
  const finished = useRef(false);

  function finish() {
    if (finished.current) return;
    finished.current = true;
    const events = recorder.current.stop();
    onFinish(atom.id, connected ? evaluateTest(test, events) : null);
  }

  const remaining = useCountdown(seconds, finish);

  // Record + drive live feedback.
  useEffect(() => {
    recorder.current.start();
    const unsub = midi.subscribe((n) => {
      recorder.current.add(n.note, n.velocity, n.on);
      if (!n.on) return;
      setPlayed(n.note);
      const pc = pitchClass(n.note);

      if (test.kind === 'chord') {
        if (targetPcs.includes(pc)) {
          chordRef.current.add(pc);
          setChordHits(new Set(chordRef.current));
          if (chordRef.current.size >= expected.length) completeSoon();
        }
      } else {
        // find-note (reps) or sequence: advance in order.
        if (pc === targetPcs[cursorRef.current % targetPcs.length]) {
          const next = cursorRef.current + 1;
          cursorRef.current = next;
          setCursor(next);
          if (next >= expected.length) completeSoon();
        }
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [midi]);

  function completeSoon() {
    setDone(true);
    setTimeout(finish, 700);
  }

  // Untethered auto-advance for sequences so it plays along.
  useEffect(() => {
    if (connected || test.kind !== 'sequence') return;
    const id = setTimeout(() => {
      const next = cursorRef.current + 1;
      cursorRef.current = next;
      setCursor(next);
      if (next >= expected.length) finish();
    }, 900);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, cursor]);

  // What to highlight right now.
  const highlight: PitchClass[] =
    test.kind === 'chord' ? targetPcs : [targetPcs[cursor % targetPcs.length]];

  const progress =
    test.kind === 'chord'
      ? `${chordHits.size}/${expected.length} notes`
      : `${Math.min(cursor, expected.length)}/${expected.length}`;

  return (
    <BlockChrome title={title} remaining={remaining} blockIndex={blockIndex} blockCount={blockCount}>
      {teach && <div className="teach">{teach}</div>}

      <div className="prompt">
        <div className="prompt-kicker">{connected ? atom.prompt : 'Play along'}</div>
        <div className={'prompt-note' + (done ? ' good' : '')}>
          {test.kind === 'chord' ? test.pitches.map((p) => p.replace(/\d/, '')).join(' ') : targetPcs[cursor % targetPcs.length]}
        </div>
        {done ? (
          <div className="prompt-feedback good">Nice.</div>
        ) : (
          <div className="prompt-feedback">{connected ? progress : 'No score without a keyboard'}</div>
        )}
      </div>

      <Keyboard highlight={highlight} played={played} />

      {!connected && test.kind !== 'sequence' && !done && (
        <button
          className="btn-secondary big"
          onClick={() => {
            if (test.kind === 'chord') {
              finish();
            } else {
              const next = cursor + 1;
              setCursor(next);
              if (next >= expected.length) finish();
            }
          }}
        >
          Got it — next
        </button>
      )}
    </BlockChrome>
  );
}

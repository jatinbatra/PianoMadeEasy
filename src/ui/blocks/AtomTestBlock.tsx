import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Keyboard } from '../Keyboard';
import { Staff } from '../Staff';
import { BlockChrome } from './BlockChrome';
import { useCountdown } from '../useCountdown';
import { pitchClass, type PitchClass } from '../../midi/notes';
import { MidiRecorder } from '../../midi/recorder';
import { evaluateTest, expectedNotes } from '../../atoms/evaluate';
import type { Input } from '../../input/useInput';
import type { Atom } from '../../types/atom';
import type { ScoreResult } from '../../scoring/score';

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
  const finished = useRef(false);

  function finish() {
    if (finished.current) return;
    finished.current = true;
    const events = recorder.current.stop();
    onFinish(atom.id, canScore ? evaluateTest(test, events) : null);
  }

  const remaining = useCountdown(seconds, finish);

  function completeSoon() {
    setDone(true);
    setTimeout(finish, 700);
  }

  // Record + drive live feedback (only when we can score).
  useEffect(() => {
    if (!canScore) return;
    recorder.current.start();
    const unsub = input.subscribe((n) => {
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
      } else if (pc === targetPcs[cursorRef.current % targetPcs.length]) {
        const nextC = cursorRef.current + 1;
        cursorRef.current = nextC;
        setCursor(nextC);
        if (nextC >= expected.length) completeSoon();
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, canScore]);

  const highlight: PitchClass[] =
    test.kind === 'chord' ? targetPcs : [targetPcs[cursor % targetPcs.length]];

  const progress =
    test.kind === 'chord'
      ? `${chordHits.size}/${expected.length} notes`
      : `${Math.min(cursor, expected.length)}/${expected.length}`;

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
          <div className="prompt-feedback good">Nice.</div>
        ) : (
          <div className="prompt-feedback">{canScore ? progress : unscoredMsg}</div>
        )}
      </div>

      <Keyboard highlight={highlight} played={played} onTap={input.tapNote} />

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

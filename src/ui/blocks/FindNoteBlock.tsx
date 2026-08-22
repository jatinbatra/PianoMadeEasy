import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Keyboard } from '../Keyboard';
import { BlockChrome } from './BlockChrome';
import { useCountdown } from '../useCountdown';
import { pitchClass, type PitchClass } from '../../midi/notes';
import type { UseMidi } from '../../midi/useMidi';

export interface FindNoteStats {
  presented: number;
  hit: number;
}

interface Props {
  title: string;
  /** Optional teach content shown above the prompt (lesson mode). */
  teach?: ReactNode;
  targets: PitchClass[];
  seconds: number;
  midi: UseMidi;
  blockIndex: number;
  blockCount: number;
  onFinish: (stats: FindNoteStats) => void;
}

/**
 * "Find this note." Used for the warm-up recall check and the Find-F lesson.
 * Connected: MIDI verifies the answer — we never ask him to self-assess.
 * Untethered: shows the target + keyboard and a Got-it tap; nothing is scored.
 */
export function FindNoteBlock({
  title,
  teach,
  targets,
  seconds,
  midi,
  blockIndex,
  blockCount,
  onFinish,
}: Props) {
  const [index, setIndex] = useState(0);
  const [played, setPlayed] = useState<number | null>(null);
  const [good, setGood] = useState(false);

  const target = targets[index % targets.length];
  const targetRef = useRef(target);
  targetRef.current = target;

  const hit = useRef(0);
  const presented = useRef(0);
  const locked = useRef(false);

  const remaining = useCountdown(seconds, () =>
    onFinish({ presented: presented.current, hit: hit.current }),
  );

  function advance(correct: boolean) {
    presented.current += 1;
    if (correct) hit.current += 1;
    setGood(false);
    setPlayed(null);
    setIndex((i) => i + 1);
  }

  // Listen for played notes (connected mode only).
  useEffect(() => {
    const unsub = midi.subscribe((n) => {
      if (!n.on) return;
      setPlayed(n.note);
      if (locked.current) return;
      if (pitchClass(n.note) === targetRef.current) {
        locked.current = true;
        setGood(true);
        setTimeout(() => {
          advance(true);
          locked.current = false;
        }, 650);
      }
    });
    return unsub;
  }, [midi]);

  const connected = midi.mode === 'connected';

  return (
    <BlockChrome
      title={title}
      remaining={remaining}
      blockIndex={blockIndex}
      blockCount={blockCount}
    >
      {teach && <div className="teach">{teach}</div>}

      <div className="prompt">
        <div className="prompt-kicker">Find this note</div>
        <div className={'prompt-note' + (good ? ' good' : '')}>{target}</div>
        {good && <div className="prompt-feedback good">Yes — that's {target}!</div>}
        {!good && connected && played != null && pitchClass(played) !== target && (
          <div className="prompt-feedback">That was {pitchClass(played)} — try again</div>
        )}
      </div>

      <Keyboard target={target} played={played} />

      {!connected && (
        <button className="btn-secondary big" onClick={() => advance(false)}>
          Got it — next note
        </button>
      )}
    </BlockChrome>
  );
}

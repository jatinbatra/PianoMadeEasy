import { useEffect, useRef, useState } from 'react';
import { FindNoteBlock, type FindNoteStats } from './blocks/FindNoteBlock';
import { SongBlock } from './blocks/SongBlock';
import type { UseMidi } from '../midi/useMidi';
import type { SessionResult } from '../types';
import { localDateKey } from '../db/repo';
import {
  PHASE0_BLOCKS,
  WARMUP_TARGETS,
  LESSON_TEST_TARGETS,
  PHASE0_CHUNK,
  PHASE0_SONG,
} from '../session/phase0';

interface Props {
  midi: UseMidi;
  isFirstSession: boolean;
  onComplete: (result: SessionResult) => void;
  onQuit: () => void;
}

const COUNT = PHASE0_BLOCKS.length;

/** Runs the three-block Phase 0 session and reports one SessionResult. */
export function SessionRunner({ midi, isFirstSession, onComplete, onQuit }: Props) {
  const [step, setStep] = useState(0);
  const startedAt = useRef(Date.now());
  const notesPlayed = useRef(0);
  const totalHit = useRef(0);
  const totalPresented = useRef(0);

  // Count every key pressed across the whole session (survives block changes).
  useEffect(() => {
    const unsub = midi.subscribe((n) => {
      if (n.on) notesPlayed.current += 1;
    });
    return unsub;
  }, [midi]);

  function finishBlock(stats: FindNoteStats) {
    totalHit.current += stats.hit;
    totalPresented.current += stats.presented;
    if (step < COUNT - 1) {
      setStep((s) => s + 1);
    } else {
      const connected = midi.mode === 'connected';
      onComplete({
        date: localDateKey(),
        startedAt: startedAt.current,
        finishedAt: Date.now(),
        mode: connected ? 'connected' : 'untethered',
        notesPlayed: notesPlayed.current,
        accuracy:
          connected && totalPresented.current > 0
            ? totalHit.current / totalPresented.current
            : null,
      });
    }
  }

  return (
    <div className="session">
      <button className="quit" onClick={onQuit} aria-label="End session">
        ✕
      </button>

      {step === 0 && (
        <FindNoteBlock
          key="recall"
          title={isFirstSession ? 'Warm-up' : 'Quick recall'}
          targets={WARMUP_TARGETS}
          seconds={PHASE0_BLOCKS[0].seconds}
          midi={midi}
          blockIndex={0}
          blockCount={COUNT}
          onFinish={finishBlock}
        />
      )}

      {step === 1 && (
        <FindNoteBlock
          key="lesson"
          title="Find F"
          teach={
            <>
              <p className="teach-lead">
                Look for the group of <strong>three black keys</strong>. The white key
                just to the <strong>left</strong> of them is <strong>F</strong>.
              </p>
              <p className="teach-sub">Play any F you can find. Do it a few times.</p>
            </>
          }
          targets={LESSON_TEST_TARGETS}
          seconds={PHASE0_BLOCKS[1].seconds}
          midi={midi}
          blockIndex={1}
          blockCount={COUNT}
          onFinish={finishBlock}
        />
      )}

      {step === 2 && (
        <SongBlock
          key="song"
          chunk={PHASE0_CHUNK}
          bpm={PHASE0_SONG.bpm}
          seconds={PHASE0_BLOCKS[2].seconds}
          midi={midi}
          blockIndex={2}
          blockCount={COUNT}
          onFinish={finishBlock}
        />
      )}
    </div>
  );
}

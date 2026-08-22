import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AtomTestBlock } from './blocks/AtomTestBlock';
import { SongBlock } from './blocks/SongBlock';
import type { UseMidi } from '../midi/useMidi';
import type { SessionResult } from '../types';
import type { Atom } from '../types/atom';
import type { ScoreResult } from '../scoring/score';
import type { DayPlan } from '../atoms/scheduler';
import { localDateKey } from '../db/repo';
import type { Song, SongChunk } from '../types/song';
import type { ChunkAttempt } from '../songs/ladder';
import type { SessionLength } from '../session/lengths';

export interface AtomOutcome {
  atomId: string;
  result: ScoreResult | null;
}

interface Props {
  midi: UseMidi;
  plan: DayPlan;
  length: SessionLength;
  song: Song;
  chunk: SongChunk;
  onComplete: (result: SessionResult, outcomes: AtomOutcome[], chunk: ChunkAttempt | null) => void;
  onQuit: () => void;
}

interface AtomStep {
  type: 'atom';
  atom: Atom;
  title: string;
  teach?: ReactNode;
  seconds: number;
}
interface SongStep {
  type: 'song';
  seconds: number;
}
type Step = AtomStep | SongStep;

function teachNode(atom: Atom, index: number, reteach: boolean): ReactNode {
  const angle = atom.teach[Math.min(index, atom.teach.length - 1)];
  return (
    <>
      {reteach && <p className="teach-retry">Let's try that a different way.</p>}
      <p className="teach-lead">{angle.title}</p>
      <p className="teach-sub">{angle.body}</p>
    </>
  );
}

/** Builds the three-part session (recall → new/current skill → song) from the
 *  plan. Only the durations scale with session length. */
function buildSteps(plan: DayPlan, length: SessionLength): Step[] {
  const steps: Step[] = [];

  // Block 1 — recall (fight decay). Warm-up on a cold start with nothing to recall.
  if (plan.recall.length > 0) {
    const each = Math.max(15, Math.floor(length.recall / plan.recall.length));
    for (const atom of plan.recall) {
      steps.push({ type: 'atom', atom, title: 'Quick recall', seconds: each });
    }
  } else if (plan.focus) {
    steps.push({ type: 'atom', atom: plan.focus.atom, title: 'Warm-up', seconds: length.recall });
  }

  // Block 2 — new / current skill.
  if (plan.focus) {
    steps.push({
      type: 'atom',
      atom: plan.focus.atom,
      title: plan.focus.mode === 'reteach' ? 'Let’s nail this one' : 'New skill',
      teach: teachNode(plan.focus.atom, plan.focus.teachIndex, plan.focus.mode === 'reteach'),
      seconds: length.focus,
    });
  } else if (plan.recall.length > 0) {
    // Consolidating: a second pass over what's slipping instead of new material.
    const each = Math.max(15, Math.floor(length.focus / plan.recall.length));
    for (const atom of plan.recall) {
      steps.push({ type: 'atom', atom, title: 'Consolidate', seconds: each });
    }
  }

  // Block 3 — song time, always last.
  steps.push({ type: 'song', seconds: length.song });
  return steps;
}

/** Runs the atom-driven session and reports the result plus per-atom outcomes. */
export function SessionRunner({ midi, plan, length, song, chunk, onComplete, onQuit }: Props) {
  const steps = useMemo(() => buildSteps(plan, length), [plan, length]);
  const [i, setI] = useState(0);
  const startedAt = useRef(Date.now());
  const notesPlayed = useRef(0);
  const outcomes = useRef<AtomOutcome[]>([]);
  const chunkAttempt = useRef<ChunkAttempt | null>(null);

  useEffect(() => {
    const unsub = midi.subscribe((n) => {
      if (n.on) notesPlayed.current += 1;
    });
    return unsub;
  }, [midi]);

  function next() {
    if (i < steps.length - 1) {
      setI((v) => v + 1);
    } else {
      const connected = midi.mode === 'connected';
      const scored = outcomes.current.filter((o) => o.result != null).map((o) => o.result!);
      const accuracy =
        connected && scored.length > 0
          ? scored.reduce((s, r) => s + r.noteAccuracy, 0) / scored.length
          : null;
      onComplete(
        {
          date: localDateKey(),
          startedAt: startedAt.current,
          finishedAt: Date.now(),
          mode: connected ? 'connected' : 'untethered',
          notesPlayed: notesPlayed.current,
          accuracy,
        },
        outcomes.current,
        chunkAttempt.current,
      );
    }
  }

  function handleAtom(atomId: string, result: ScoreResult | null) {
    outcomes.current.push({ atomId, result });
    next();
  }

  const step = steps[i];

  return (
    <div className="session">
      <button className="quit" onClick={onQuit} aria-label="End session">
        ✕
      </button>

      {step.type === 'atom' ? (
        <AtomTestBlock
          key={`${i}-${step.atom.id}`}
          atom={step.atom}
          title={step.title}
          teach={step.teach}
          seconds={step.seconds}
          midi={midi}
          blockIndex={i}
          blockCount={steps.length}
          onFinish={handleAtom}
        />
      ) : (
        <SongBlock
          key={`${i}-song`}
          chunk={chunk}
          songTitle={song.title}
          bpm={song.bpm}
          seconds={step.seconds}
          midi={midi}
          blockIndex={i}
          blockCount={steps.length}
          onFinish={(attempt) => {
            chunkAttempt.current = attempt;
            next();
          }}
        />
      )}
    </div>
  );
}

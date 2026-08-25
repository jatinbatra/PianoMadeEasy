import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AtomTestBlock } from './blocks/AtomTestBlock';
import { SongBlock } from './blocks/SongBlock';
import type { Input } from '../input/useInput';
import type { SessionResult } from '../types';
import type { Atom } from '../types/atom';
import type { ScoreResult } from '../scoring/score';
import type { DayPlan, FocusPlan } from '../atoms/scheduler';
import { localDateKey } from '../db/repo';
import type { Song, SongChunk } from '../types/song';
import type { ChunkAttempt } from '../songs/ladder';
import type { SessionLength } from '../session/lengths';

export interface AtomOutcome {
  atomId: string;
  result: ScoreResult | null;
}

export interface ChunkOutcome {
  chunkId: string;
  attempt: ChunkAttempt | null;
}

interface Props {
  input: Input;
  plan: DayPlan;
  length: SessionLength;
  song: Song;
  chunks: SongChunk[];
  onComplete: (result: SessionResult, outcomes: AtomOutcome[], chunks: ChunkOutcome[]) => void;
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
  chunk: SongChunk;
  seconds: number;
}
type Step = AtomStep | SongStep;

function teachNode(atom: Atom, index: number, reteach: boolean, motivation?: string): ReactNode {
  const angle = atom.teach[Math.min(index, atom.teach.length - 1)];
  return (
    <>
      {reteach && <p className="teach-retry">Let's try that a different way.</p>}
      <p className="teach-lead">{angle.title}</p>
      <p className="teach-sub">{angle.body}</p>
      {motivation && <p className="teach-why">{motivation}</p>}
    </>
  );
}

/** "Why am I learning this?" — tie the skill to the song he's working toward. */
function motivationFor(atom: Atom, song: Song): string | undefined {
  const chunk = song.chunks.find((c) => c.requiresAtoms.includes(atom.id));
  if (chunk) return `You’ll use this in ${song.title} — ${chunk.label.replace(/—.*$/, '').trim()}.`;
  return undefined;
}

function skillStep(f: FocusPlan, song: Song, seconds: number): AtomStep {
  return {
    type: 'atom',
    atom: f.atom,
    title: f.mode === 'reteach' ? 'Let’s nail this one' : f.atom.label,
    teach: teachNode(f.atom, f.teachIndex, f.mode === 'reteach', motivationFor(f.atom, song)),
    seconds,
  };
}

/**
 * Build the session: recall → skills → song. Longer sessions cover MORE — more
 * skill blocks (from the scheduler's queue) and more song chunks — not just one
 * lesson stretched out.
 */
function buildSteps(plan: DayPlan, length: SessionLength, song: Song, chunks: SongChunk[]): Step[] {
  const steps: Step[] = [];

  // Recall — fight decay, leads the session.
  if (plan.recall.length > 0) {
    const each = Math.max(20, Math.floor(length.recall / plan.recall.length));
    for (const atom of plan.recall) steps.push({ type: 'atom', atom, title: 'Quick recall', seconds: each });
  }

  // Skills — one block per queued skill, up to this length's count.
  const skills = plan.focusQueue.slice(0, Math.max(1, length.focusCount));
  for (const f of skills) steps.push(skillStep(f, song, length.focusEach));

  // Safety: if the plan had nothing to teach or recall, at least warm up.
  if (steps.length === 0 && plan.focusQueue[0]) steps.push(skillStep(plan.focusQueue[0], song, length.focusEach));

  // Song — always ends the session; more chunks in a longer sitting.
  for (let s = 0; s < length.songCount; s++) {
    steps.push({ type: 'song', chunk: chunks[s % chunks.length], seconds: length.songEach });
  }
  return steps;
}

/** Runs the session and reports the result plus per-atom and per-chunk outcomes. */
export function SessionRunner({ input, plan, length, song, chunks, onComplete, onQuit }: Props) {
  const steps = useMemo(() => buildSteps(plan, length, song, chunks), [plan, length, song, chunks]);
  const [i, setI] = useState(0);
  const startedAt = useRef(Date.now());
  const notesPlayed = useRef(0);
  const outcomes = useRef<AtomOutcome[]>([]);
  const chunkOutcomes = useRef<ChunkOutcome[]>([]);

  useEffect(() => {
    const unsub = input.subscribe((n) => {
      if (n.on) notesPlayed.current += 1;
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.subscribe]);

  function next() {
    if (i < steps.length - 1) {
      setI((v) => v + 1);
    } else {
      const scored = outcomes.current.filter((o) => o.result != null).map((o) => o.result!);
      const accuracy =
        input.scored && scored.length > 0 ? scored.reduce((s, r) => s + r.noteAccuracy, 0) / scored.length : null;
      const mode =
        input.mode === 'midi'
          ? 'connected'
          : input.mode === 'mic'
            ? 'mic'
            : input.mode === 'touch'
              ? 'touch'
              : 'untethered';
      onComplete(
        {
          date: localDateKey(),
          startedAt: startedAt.current,
          finishedAt: Date.now(),
          mode,
          notesPlayed: notesPlayed.current,
          accuracy,
        },
        outcomes.current,
        chunkOutcomes.current,
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
          input={input}
          blockIndex={i}
          blockCount={steps.length}
          onFinish={handleAtom}
        />
      ) : (
        <SongBlock
          key={`${i}-song-${step.chunk.id}`}
          chunk={step.chunk}
          songTitle={song.title}
          songYoutube={song.youtube}
          bpm={song.bpm}
          seconds={step.seconds}
          input={input}
          blockIndex={i}
          blockCount={steps.length}
          onFinish={(attempt) => {
            chunkOutcomes.current.push({ chunkId: step.chunk.id, attempt });
            next();
          }}
        />
      )}
    </div>
  );
}

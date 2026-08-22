import { useEffect, useRef, useState } from 'react';
import { Keyboard } from '../Keyboard';
import { BlockChrome } from './BlockChrome';
import { useCountdown } from '../useCountdown';
import { pitchClass, parsePitch, noteName } from '../../midi/notes';
import type { UseMidi } from '../../midi/useMidi';
import type { SongChunk } from '../../types/song';
import type { FindNoteStats } from './FindNoteBlock';

interface Props {
  chunk: SongChunk;
  bpm: number;
  seconds: number;
  midi: UseMidi;
  blockIndex: number;
  blockCount: number;
  onFinish: (stats: FindNoteStats) => void;
}

/**
 * Song time — always the last thing he feels. Connected: step through the melody
 * note-by-note, advancing on the right note (MIDI-verified). Untethered: it
 * plays along at half tempo so he can follow, unscored. Loops until time is up.
 */
export function SongBlock({ chunk, bpm, seconds, midi, blockIndex, blockCount, onFinish }: Props) {
  const notes = chunk.notes;
  const [cursor, setCursor] = useState(0);
  const [played, setPlayed] = useState<number | null>(null);
  const hit = useRef(0);
  const presented = useRef(0);

  const target = notes[cursor % notes.length];
  const targetMidi = parsePitch(target.pitch);
  const targetPc = pitchClass(targetMidi);
  const targetRef = useRef(targetPc);
  targetRef.current = targetPc;

  const remaining = useCountdown(seconds, () =>
    onFinish({ presented: presented.current, hit: hit.current }),
  );

  const connected = midi.mode === 'connected';

  // Connected: advance on the correct note.
  useEffect(() => {
    if (!connected) return;
    const unsub = midi.subscribe((n) => {
      if (!n.on) return;
      setPlayed(n.note);
      if (pitchClass(n.note) === targetRef.current) {
        hit.current += 1;
        presented.current += 1;
        setCursor((c) => c + 1);
      }
    });
    return unsub;
  }, [midi, connected]);

  // Untethered: play along at half tempo so it's followable.
  useEffect(() => {
    if (connected) return;
    const beatMs = (60 / bpm) * 1000 * 2; // half speed
    const ms = target.beats * beatMs;
    const id = setTimeout(() => {
      presented.current += 1;
      setCursor((c) => c + 1);
    }, ms);
    return () => clearTimeout(id);
  }, [connected, cursor, bpm, target.beats]);

  // A small window of upcoming notes around the cursor.
  const window = notes.map((n, i) => ({ n, i })).slice(
    Math.max(0, (cursor % notes.length) - 1),
    (cursor % notes.length) + 6,
  );

  return (
    <BlockChrome title="Song time" remaining={remaining} blockIndex={blockIndex} blockCount={blockCount}>
      <div className="song-label">{chunk.label}</div>

      <div className="song-strip" aria-hidden="true">
        {window.map(({ n, i }) => (
          <span key={i} className={'song-note' + (i === cursor % notes.length ? ' current' : '')}>
            {n.pitch.replace(/\d/, '')}
          </span>
        ))}
      </div>

      <div className="prompt">
        <div className="prompt-kicker">{connected ? 'Play' : 'Follow along'}</div>
        <div className="prompt-note">{noteName(targetMidi).replace(/\d/, '')}</div>
      </div>

      <Keyboard target={targetPc} played={played} />

      {!connected && (
        <p className="hint">No keyboard connected — this counts for your streak. Play along on any piano.</p>
      )}
    </BlockChrome>
  );
}

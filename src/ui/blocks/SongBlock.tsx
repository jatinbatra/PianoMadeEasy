import { useEffect, useRef, useState } from 'react';
import { Keyboard } from '../Keyboard';
import { BlockChrome } from './BlockChrome';
import { useCountdown } from '../useCountdown';
import { pitchClass, parsePitch, noteName } from '../../midi/notes';
import { MidiRecorder } from '../../midi/recorder';
import { scoreChunk } from '../../songs/scoreChunk';
import type { ChunkAttempt } from '../../songs/ladder';
import type { UseMidi } from '../../midi/useMidi';
import type { SongChunk } from '../../types/song';

interface Props {
  chunk: SongChunk;
  songTitle: string;
  bpm: number;
  seconds: number;
  midi: UseMidi;
  blockIndex: number;
  blockCount: number;
  /** attempt === null when untethered (unscored). */
  onFinish: (attempt: ChunkAttempt | null) => void;
}

/**
 * Song time — always the last thing he feels. Connected: step through the melody
 * note-by-note (advancing on the right note) while recording the take, then
 * score it for accuracy + tempo. Untethered: plays along at half tempo, unscored.
 */
export function SongBlock({ chunk, songTitle, bpm, seconds, midi, blockIndex, blockCount, onFinish }: Props) {
  const notes = chunk.notes;
  const [cursor, setCursor] = useState(0);
  const [played, setPlayed] = useState<number | null>(null);
  const recorder = useRef<MidiRecorder>(new MidiRecorder());
  const finished = useRef(false);

  const target = notes[cursor % notes.length];
  const targetMidi = parsePitch(target.pitch);
  const targetPc = pitchClass(targetMidi);
  const targetRef = useRef(targetPc);
  targetRef.current = targetPc;

  const connected = midi.mode === 'connected';

  function finish() {
    if (finished.current) return;
    finished.current = true;
    const events = recorder.current.stop();
    onFinish(connected ? scoreChunk(chunk, events) : null);
  }

  const remaining = useCountdown(seconds, finish);

  // Connected: record everything, advance the cursor on the correct note.
  useEffect(() => {
    if (!connected) return;
    recorder.current.start();
    const unsub = midi.subscribe((n) => {
      recorder.current.add(n.note, n.velocity, n.on);
      if (!n.on) return;
      setPlayed(n.note);
      if (pitchClass(n.note) === targetRef.current) setCursor((c) => c + 1);
    });
    return unsub;
  }, [midi, connected]);

  // Untethered: play along at half tempo so it's followable.
  useEffect(() => {
    if (connected) return;
    const beatMs = (60 / bpm) * 1000 * 2;
    const id = setTimeout(() => setCursor((c) => c + 1), target.beats * beatMs);
    return () => clearTimeout(id);
  }, [connected, cursor, bpm, target.beats]);

  const pos = cursor % notes.length;
  const window = notes.map((n, i) => ({ n, i })).slice(Math.max(0, pos - 1), pos + 6);

  return (
    <BlockChrome title="Song time" remaining={remaining} blockIndex={blockIndex} blockCount={blockCount} onSkip={finish}>
      <div className="song-label">
        {songTitle} — {chunk.label}
      </div>

      <div className="song-strip" aria-hidden="true">
        {window.map(({ n, i }) => (
          <span key={i} className={'song-note' + (i === pos ? ' current' : '')}>
            {n.pitch.replace(/\d/, '')}
          </span>
        ))}
      </div>

      <div className="prompt">
        <div className="prompt-kicker">{connected ? 'Play' : 'Follow along'}</div>
        <div className="prompt-note">{noteName(targetMidi).replace(/\d/, '')}</div>
      </div>

      <Keyboard highlight={[targetPc]} played={played} />

      {!connected && (
        <p className="hint">No keyboard connected — this counts for your streak. Play along on any piano.</p>
      )}
    </BlockChrome>
  );
}

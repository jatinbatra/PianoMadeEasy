import { useEffect, useRef, useState } from 'react';
import { Keyboard } from '../Keyboard';
import { BlockChrome } from './BlockChrome';
import { useCountdown } from '../useCountdown';
import { pitchClass, parsePitch, noteName } from '../../midi/notes';
import { playMelody } from '../../audio/synth';
import { Metronome, metronomeSupported } from '../../audio/metronome';
import { youtubeLink } from '../../songs/links';
import { MicListening } from '../MicListening';
import { MidiRecorder } from '../../midi/recorder';
import { scoreChunk } from '../../songs/scoreChunk';
import { practiceTempo, type ChunkAttempt } from '../../songs/ladder';
import type { ChunkProgress } from '../../types/chunk';
import type { Input } from '../../input/useInput';
import type { SongChunk } from '../../types/song';

interface Props {
  chunk: SongChunk;
  songTitle: string;
  songYoutube?: string;
  bpm: number;
  chunkProgress?: ChunkProgress;
  seconds: number;
  input: Input;
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
export function SongBlock({ chunk, songTitle, songYoutube, bpm, chunkProgress, seconds, input, blockIndex, blockCount, onFinish }: Props) {
  const notes = chunk.notes;
  const tempo = practiceTempo(chunkProgress, bpm);
  const metro = useRef<Metronome>(new Metronome());
  const [metroOn, setMetroOn] = useState(false);
  const [pulse, setPulse] = useState(-1);

  function toggleMetro() {
    if (metro.current.running) {
      metro.current.stop();
      setMetroOn(false);
      setPulse(-1);
    } else {
      metro.current.start(tempo.playbackBpm, { onBeat: (b) => setPulse(b) });
      setMetroOn(true);
    }
  }

  // Never leave a click running when the block ends.
  useEffect(() => () => metro.current.stop(), []);
  const [cursor, setCursor] = useState(0);
  const [played, setPlayed] = useState<number | null>(null);
  const recorder = useRef<MidiRecorder>(new MidiRecorder());
  const finished = useRef(false);

  const target = notes[cursor % notes.length];
  const targetMidi = parsePitch(target.pitch);
  const targetPc = pitchClass(targetMidi);
  const targetRef = useRef(targetPc);
  targetRef.current = targetPc;

  const scored = input.scored;

  function finish() {
    if (finished.current) return;
    finished.current = true;
    const events = recorder.current.stop();
    onFinish(scored ? scoreChunk(chunk, events) : null);
  }

  const remaining = useCountdown(seconds, finish);

  // Scored (MIDI or mic): record everything, advance the cursor on the right note.
  useEffect(() => {
    if (!scored) return;
    recorder.current.start();
    const unsub = input.subscribe((n) => {
      recorder.current.add(n.note, n.velocity, n.on);
      if (!n.on) return;
      setPlayed(n.note);
      if (pitchClass(n.note) === targetRef.current) setCursor((c) => c + 1);
    });
    return unsub;
    // Stable subscribe fn, not the input object — see AtomTestBlock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.subscribe, scored]);

  // Untethered: play along at half tempo so it's followable.
  useEffect(() => {
    if (scored) return;
    const beatMs = (60 / bpm) * 1000 * 2;
    const id = setTimeout(() => setCursor((c) => c + 1), target.beats * beatMs);
    return () => clearTimeout(id);
  }, [scored, cursor, bpm, target.beats]);

  const pos = cursor % notes.length;
  const window = notes.map((n, i) => ({ n, i })).slice(Math.max(0, pos - 1), pos + 6);

  return (
    <BlockChrome title="Song time" remaining={remaining} blockIndex={blockIndex} blockCount={blockCount} onSkip={finish}>
      <div className="song-label">
        {songTitle} — {chunk.label}
      </div>

      <div className="song-actions-row">
        <button
          className="hear-btn"
          onClick={() => {
            const beatMs = (60 / tempo.playbackBpm) * 1000;
            playMelody(notes.map((n) => ({ midi: parsePitch(n.pitch), durMs: n.beats * beatMs })));
          }}
        >
          ▶ Hear it {tempo.owned ? 'faster' : `at ${tempo.playbackBpm} BPM`}
        </button>
        {metronomeSupported && (
          <button className={'hear-btn metro-btn' + (metroOn ? ' on' : '')} onClick={toggleMetro}>
            {metroOn ? '■ Metronome' : '● Metronome'}
          </button>
        )}
        <a
          className="yt-link"
          href={youtubeLink({ title: songTitle, youtube: songYoutube })}
          target="_blank"
          rel="noopener noreferrer"
        >
          ▶ Watch on YouTube
        </a>
      </div>

      {metroOn && (
        <div className="metro-dots" aria-hidden="true">
          {[0, 1, 2, 3].map((b) => (
            <span key={b} className={'metro-dot' + (b === pulse ? ' hit' : '') + (b === 0 ? ' down' : '')} />
          ))}
        </div>
      )}

      <div className="tempo-line">
        {tempo.owned ? (
          <>Owned ✓ — now push it: goal <strong>{tempo.goalBpm}</strong> BPM</>
        ) : tempo.bestBpm > 0 ? (
          <>Your best clean <strong>{tempo.bestBpm}</strong> · reach <strong>{tempo.goalBpm}</strong> BPM</>
        ) : (
          <>Learning speed — clean it up, then we speed up to <strong>{tempo.goalBpm}</strong> BPM</>
        )}
      </div>

      <div className="song-strip" aria-hidden="true">
        {window.map(({ n, i }) => (
          <span key={i} className={'song-note' + (i === pos ? ' current' : '')}>
            {n.pitch.replace(/\d/, '')}
          </span>
        ))}
      </div>

      <div className="prompt">
        <div className="prompt-kicker">{scored ? 'Play' : 'Follow along'}</div>
        <div className="prompt-note">{noteName(targetMidi).replace(/\d/, '')}</div>
      </div>

      <MicListening input={input} />

      <Keyboard highlight={[targetPc]} played={played} onTap={input.tapNote} />

      {scored && (
        <div className="heard-row">
          <span className="legend">
            <span className="sw target" /> play this
            <span className="sw played" /> what it heard
          </span>
          {played != null && (
            <span className="heard">
              Heard: <strong>{pitchClass(played)}</strong> {pitchClass(played) === targetPc ? '✓' : '✗'}
            </span>
          )}
        </div>
      )}

      {!scored && (
        <p className="hint">No input — this still counts for your streak. Play along on any piano.</p>
      )}
    </BlockChrome>
  );
}

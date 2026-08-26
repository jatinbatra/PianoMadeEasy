import { useState } from 'react';
import { parseSong } from '../songs/importSong';
import { buildSong } from '../songs/buildFromNotes';
import { youtubeLink } from '../songs/links';
import { ownedCount, type ChunkProgressMap } from '../songs/ladder';
import { saveSong, deleteSong, setActiveSongId } from '../db/repo';
import type { Song } from '../types/song';

interface Props {
  songs: Song[];
  activeSongId: string | null;
  chunkMap: ChunkProgressMap;
  onChanged: () => Promise<void> | void;
  onBack: () => void;
}

const EXAMPLE = `{
  "id": "my-song",
  "title": "My Song",
  "bpm": 90,
  "chunks": [
    { "id": "c1", "label": "Intro", "bars": "1-2",
      "requiresAtoms": ["find-note:C"],
      "notes": [ {"pitch":"C4","beats":1}, {"pitch":"E4","beats":1} ] }
  ]
}`;

type Mode = 'none' | 'builder' | 'json';

/** The song library. Kept off the home screen so "start" stays a zero-decision. */
export function SongLibrary({ songs, activeSongId, chunkMap, onChanged, onBack }: Props) {
  const [mode, setMode] = useState<Mode>('none');
  const [error, setError] = useState<string | null>(null);
  // Builder fields.
  const [bTitle, setBTitle] = useState('');
  const [bBpm, setBBpm] = useState('90');
  const [bYoutube, setBYoutube] = useState('');
  const [bNotes, setBNotes] = useState('');
  // JSON field.
  const [text, setText] = useState('');

  function reset() {
    setMode('none');
    setError(null);
  }

  async function useSong(id: string) {
    await setActiveSongId(id);
    await onChanged();
  }

  async function remove(id: string) {
    await deleteSong(id);
    await onChanged();
  }

  async function save(song: Song) {
    await saveSong(song);
    await setActiveSongId(song.id);
    setBTitle('');
    setBNotes('');
    setBYoutube('');
    setText('');
    reset();
    await onChanged();
  }

  async function addFromBuilder() {
    setError(null);
    try {
      await save(buildSong({ title: bTitle, bpm: Number(bBpm), youtube: bYoutube, notesText: bNotes }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not build that song.');
    }
  }

  async function addFromJson() {
    setError(null);
    try {
      await save(parseSong(text));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not import that song.');
    }
  }

  return (
    <div className="library">
      <header className="lib-head">
        <button className="link-btn" onClick={onBack}>
          ← Back
        </button>
        <h1>Songs</h1>
      </header>

      <ul className="song-list">
        {songs.map((s) => {
          const owned = ownedCount(s, chunkMap);
          const active = s.id === activeSongId;
          return (
            <li key={s.id} className={'song-row' + (active ? ' active' : '')}>
              <div className="song-info">
                <div className="song-name">{s.title}</div>
                <div className="song-meta">
                  {owned} of {s.chunks.length} chunks owned{active ? ' · practicing now' : ''}
                </div>
                <a className="yt-link" href={youtubeLink(s)} target="_blank" rel="noopener noreferrer">
                  ▶ Watch on YouTube
                </a>
              </div>
              <div className="song-actions">
                {!active && (
                  <button className="btn-secondary" onClick={() => useSong(s.id)}>
                    Use
                  </button>
                )}
                <button className="link-btn danger" onClick={() => remove(s.id)} aria-label={`Delete ${s.title}`}>
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {mode === 'none' && (
        <button className="btn-secondary big" onClick={() => setMode('builder')}>
          + Add a song
        </button>
      )}

      {mode === 'builder' && (
        <div className="add-song">
          <p className="hint">
            Type the notes and it becomes a song. Watch a tutorial, jot the letters, paste them here.
            Only add music you have the right to use — it stays on your device.
          </p>
          <input className="time-input wide" placeholder="Title" value={bTitle} onChange={(e) => setBTitle(e.target.value)} />
          <div className="builder-row">
            <input className="time-input" placeholder="bpm" value={bBpm} onChange={(e) => setBBpm(e.target.value)} inputMode="numeric" />
            <input className="time-input wide" placeholder="YouTube link (optional)" value={bYoutube} onChange={(e) => setBYoutube(e.target.value)} />
          </div>
          <textarea
            className="song-input"
            value={bNotes}
            onChange={(e) => setBNotes(e.target.value)}
            placeholder={'One phrase per line. Try:\nC C G G A A G\nF F E E D D C\n\nUse letters (C, F#, Bb) or sargam (Sa Re Ga).\nLonger note: C*2   Shorter: C/2'}
            rows={7}
            spellCheck={false}
          />
          {error && <p className="error-line">{error}</p>}
          <div className="add-actions">
            <button className="btn-primary small" onClick={addFromBuilder}>
              Create song
            </button>
            <button className="link-btn" onClick={reset}>
              Cancel
            </button>
            <button className="link-btn" onClick={() => { setMode('json'); setError(null); }}>
              Paste JSON instead
            </button>
          </div>
        </div>
      )}

      {mode === 'json' && (
        <div className="add-song">
          <p className="hint">
            Advanced: paste a song in JSON (see <code>songs/README.md</code>). You can include a
            <code> "youtube"</code> link too.
          </p>
          <textarea
            className="song-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={EXAMPLE}
            rows={10}
            spellCheck={false}
          />
          {error && <p className="error-line">{error}</p>}
          <div className="add-actions">
            <button className="btn-primary small" onClick={addFromJson}>
              Import
            </button>
            <button className="link-btn" onClick={reset}>
              Cancel
            </button>
            <button className="link-btn" onClick={() => { setMode('builder'); setError(null); }}>
              ← Back to note builder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

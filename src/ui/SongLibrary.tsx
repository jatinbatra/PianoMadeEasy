import { useState } from 'react';
import { parseSong } from '../songs/importSong';
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

/** The song library. Kept off the home screen so "start" stays a zero-decision. */
export function SongLibrary({ songs, activeSongId, chunkMap, onChanged, onBack }: Props) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function useSong(id: string) {
    await setActiveSongId(id);
    await onChanged();
  }

  async function remove(id: string) {
    await deleteSong(id);
    await onChanged();
  }

  async function add() {
    setError(null);
    try {
      const song = parseSong(text);
      await saveSong(song);
      await setActiveSongId(song.id);
      setText('');
      setAdding(false);
      await onChanged();
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

      {adding ? (
        <div className="add-song">
          <p className="hint">
            Paste a song in JSON. See the format in <code>songs/README.md</code>. Don't paste
            copyrighted sheet music into a shared repo — this stays on your device.
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
            <button className="btn-primary small" onClick={add}>
              Import
            </button>
            <button className="link-btn" onClick={() => { setAdding(false); setError(null); }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className="btn-secondary big" onClick={() => setAdding(true)}>
          + Add a song
        </button>
      )}
    </div>
  );
}

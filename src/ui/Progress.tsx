import { Heatmap } from './Heatmap';
import { ATOMS } from '../atoms/catalog';
import { isDecayed } from '../atoms/sm2';
import { ownedCount } from '../songs/ladder';
import { localDateKey } from '../db/repo';
import { shiftDay } from '../streak/streak';
import type { ProgressMap } from '../atoms/scheduler';
import type { ChunkProgressMap } from '../songs/ladder';
import type { Song } from '../types/song';
import type { PracticeDay, SessionResult } from '../types';

interface Props {
  days: PracticeDay[];
  progress: ProgressMap;
  songs: Song[];
  chunkMap: ChunkProgressMap;
  sessions: SessionResult[];
  onBack: () => void;
}

/** The history + progress view: honest, measured, at a glance. Skills live in
 *  the Path tab — here we only summarise them. */
export function Progress({ days, progress, songs, chunkMap, sessions, onBack }: Props) {
  const today = localDateKey();
  const weekStart = shiftDay(today, -6);
  const thisWeek = days.filter((d) => d.date >= weekStart);
  const weekMinutes = thisWeek.reduce((s, d) => s + d.minutes, 0);

  // This week's real playing: notes struck and the fastest clean tempo landed.
  const weekSessions = sessions.filter((s) => s.date >= weekStart);
  const weekNotes = weekSessions.reduce((s, r) => s + (r.notesPlayed ?? 0), 0);
  const chunksOwned = songs.reduce((s, song) => s + ownedCount(song, chunkMap), 0);
  const fastest = Object.values(chunkMap).reduce((m, cp) => Math.max(m, Math.round(cp.maxCleanTempo || 0)), 0);

  const learned = ATOMS.filter((a) => progress[a.id]?.introduced).length;
  const due = ATOMS.filter((a) => {
    const p = progress[a.id];
    return p?.introduced && isDecayed(p, today);
  }).length;

  return (
    <div className="progress-screen">
      <header className="lib-head">
        <button className="link-btn" onClick={onBack}>
          ← Back
        </button>
        <h1>Progress</h1>
      </header>

      <section className="card">
        <h3>This week</h3>
        <div className="recap">
          <div className="recap-tile">
            <span className="recap-num">{thisWeek.length}</span>
            <span className="recap-cap">day{thisWeek.length === 1 ? '' : 's'} shown up</span>
          </div>
          <div className="recap-tile">
            <span className="recap-num">{weekMinutes}</span>
            <span className="recap-cap">minutes played</span>
          </div>
          <div className="recap-tile">
            <span className="recap-num">{weekNotes}</span>
            <span className="recap-cap">notes struck</span>
          </div>
          <div className="recap-tile">
            <span className="recap-num">{chunksOwned}</span>
            <span className="recap-cap">chunks owned</span>
          </div>
        </div>
        <p className="hint">
          {fastest > 0
            ? `Fastest you've played anything clean: ${fastest} BPM.`
            : thisWeek.length > 0
              ? 'Keep at it — clean a chunk at tempo and your best speed shows up here.'
              : 'A single five-minute sitting starts this week off.'}
        </p>
      </section>

      <section className="card">
        <h3>Practice days</h3>
        <Heatmap days={days} />
        <p className="hm-legend">
          <span className="hm-cell verified" /> scored &nbsp;
          <span className="hm-cell unverified" /> no keyboard &nbsp;
          <span className="hm-cell none" /> missed
        </p>
      </section>

      <section className="card">
        <h3>Skills</h3>
        <p className="week-line">
          <strong>{learned}</strong> learned · <strong>{due}</strong> due for review ·{' '}
          <strong>{ATOMS.length - learned}</strong> still ahead
        </p>
        <p className="hint">See the whole road in the Path tab.</p>
      </section>

      <section className="card">
        <h3>Songs</h3>
        <ul className="song-progress">
          {songs.map((s) => {
            const owned = ownedCount(s, chunkMap);
            return (
              <li key={s.id}>
                <div className="sp-head">
                  <span>{s.title}</span>
                  <span className="song-meta">
                    {owned}/{s.chunks.length}
                  </span>
                </div>
                <div className="sp-bar">
                  <div className="sp-fill" style={{ width: `${(owned / s.chunks.length) * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

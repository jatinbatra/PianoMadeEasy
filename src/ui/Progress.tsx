import { Heatmap } from './Heatmap';
import { ATOMS } from '../atoms/catalog';
import { isDecayed } from '../atoms/sm2';
import { ownedCount } from '../songs/ladder';
import { localDateKey } from '../db/repo';
import { shiftDay } from '../streak/streak';
import type { ProgressMap } from '../atoms/scheduler';
import type { ChunkProgressMap } from '../songs/ladder';
import type { Song } from '../types/song';
import type { PracticeDay } from '../types';

interface Props {
  days: PracticeDay[];
  progress: ProgressMap;
  songs: Song[];
  chunkMap: ChunkProgressMap;
  onBack: () => void;
}

/** The history + progress view: honest, measured, at a glance. Skills live in
 *  the Path tab — here we only summarise them. */
export function Progress({ days, progress, songs, chunkMap, onBack }: Props) {
  const today = localDateKey();
  const weekStart = shiftDay(today, -6);
  const thisWeek = days.filter((d) => d.date >= weekStart);
  const weekMinutes = thisWeek.reduce((s, d) => s + d.minutes, 0);

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
        <p className="week-line">
          <strong>{thisWeek.length}</strong> day{thisWeek.length === 1 ? '' : 's'} practiced ·{' '}
          <strong>{weekMinutes}</strong> min
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

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

type SkillState = 'strong' | 'due' | 'stuck' | 'next' | 'locked';

function skillState(atomId: string, progress: ProgressMap): SkillState {
  const p = progress[atomId];
  const today = localDateKey();
  if (p?.introduced) {
    if (p.consecutiveFailures >= 2) return 'stuck';
    return isDecayed(p, today) ? 'due' : 'strong';
  }
  const atom = ATOMS.find((a) => a.id === atomId)!;
  const ready = atom.prerequisites.every((pid) => {
    const pp = progress[pid];
    return pp?.introduced && pp.repetitions >= 1;
  });
  return ready ? 'next' : 'locked';
}

const STATE_LABEL: Record<SkillState, string> = {
  strong: 'strong',
  due: 'review due',
  stuck: 'needs work',
  next: 'up next',
  locked: 'locked',
};

/** The history + progress view: honest, measured, at a glance. */
export function Progress({ days, progress, songs, chunkMap, onBack }: Props) {
  // This week (last 7 days).
  const weekStart = shiftDay(localDateKey(), -6);
  const thisWeek = days.filter((d) => d.date >= weekStart);
  const weekMinutes = thisWeek.reduce((s, d) => s + d.minutes, 0);

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
        <ul className="skill-list">
          {ATOMS.map((a) => {
            const st = skillState(a.id, progress);
            return (
              <li key={a.id} className="skill-row">
                <span className="skill-name">{a.label}</span>
                <span className={`pill ${st}`}>{STATE_LABEL[st]}</span>
              </li>
            );
          })}
        </ul>
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

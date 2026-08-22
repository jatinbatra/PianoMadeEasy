import type { UseMidi } from '../midi/useMidi';
import { MidiStatus } from './MidiStatus';
import type { StreakInfo } from '../streak/streak';

interface HeroMetric {
  title: string;
  owned: number;
  total: number;
}

interface Props {
  midi: UseMidi;
  streak: StreakInfo;
  skillsLearned: number;
  hero: HeroMetric | null;
  onStart: () => void;
  onOpenSongs: () => void;
}

/** Zero decisions on open. One primary button, always. */
export function Home({ midi, streak, skillsLearned, hero, onStart, onOpenSongs }: Props) {
  return (
    <div className="home">
      <div className="brand">JatinSitDown</div>

      {/* Hero metric — the one number that should make progress feel real. */}
      {hero && (
        <div className="hero-metric">
          <div className="hero-song">{hero.title}</div>
          <div className="hero-count">
            {hero.owned} <span>of {hero.total}</span>
          </div>
          <div className="hero-label">chunks owned</div>
        </div>
      )}

      <div className="streak">
        <div className="streak-num">{streak.current}</div>
        <div className="streak-label">
          day{streak.current === 1 ? '' : 's'} in a row{streak.current > 0 ? ' 🔥' : ''}
        </div>
      </div>

      {streak.missedYesterday && <p className="nudge">Yesterday got away. Five minutes puts you back.</p>}

      {streak.practicedToday ? (
        <>
          <p className="done-line">Today's done. Nice.</p>
          <button className="btn-primary" onClick={onStart}>
            Practice again
          </button>
        </>
      ) : (
        <button className="btn-primary" onClick={onStart}>
          Start today's session
          <span className="btn-sub">5 minutes</span>
        </button>
      )}

      {skillsLearned > 0 && (
        <p className="skills-line">{skillsLearned} skill{skillsLearned === 1 ? '' : 's'} learned</p>
      )}

      <MidiStatus midi={midi} />

      <button className="link-btn" onClick={onOpenSongs}>
        Songs
      </button>
    </div>
  );
}

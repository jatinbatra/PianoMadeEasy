import type { Input } from '../input/useInput';
import { InputStatus } from './InputStatus';
import type { StreakInfo } from '../streak/streak';

interface HeroMetric {
  title: string;
  owned: number;
  total: number;
}

interface Props {
  input: Input;
  streak: StreakInfo;
  skillsLearned: number;
  hero: HeroMetric | null;
  /** Plain-language lines describing today's session. */
  previewLines: string[];
  onStart: (minutes: number) => void;
  onOpenProgress: () => void;
  onOpenSongs: () => void;
}

/** Zero decisions on open. One primary button (5 min), always. */
export function Home({ input, streak, skillsLearned, hero, previewLines, onStart, onOpenProgress, onOpenSongs }: Props) {
  return (
    <div className="home">
      <div className="brand">JatinSitDown</div>

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

      {streak.freezeActive && <p className="freeze-line">Streak safe — your weekly skip has you covered.</p>}
      {streak.missedYesterday && <p className="nudge">Yesterday got away. Five minutes puts you back.</p>}

      {/* Today's plan preview so it's clear what "Start" will do. */}
      {previewLines.length > 0 && (
        <ol className="plan-preview">
          {previewLines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      )}

      {streak.practicedToday ? (
        <>
          <p className="done-line">Today's done. Nice.</p>
          <button className="btn-primary" onClick={() => onStart(5)}>
            Practice again
            <span className="btn-sub">5 minutes</span>
          </button>
        </>
      ) : (
        <button className="btn-primary" onClick={() => onStart(5)}>
          Start today's session
          <span className="btn-sub">5 minutes</span>
        </button>
      )}

      <div className="length-row">
        <span className="length-label">or go longer:</span>
        {[10, 30, 60].map((m) => (
          <button key={m} className="length-chip" onClick={() => onStart(m)}>
            {m} min
          </button>
        ))}
      </div>

      {skillsLearned > 0 && (
        <p className="skills-line">{skillsLearned} skill{skillsLearned === 1 ? '' : 's'} learned</p>
      )}

      <InputStatus input={input} />

      <div className="home-links">
        <button className="link-btn" onClick={onOpenProgress}>
          Progress
        </button>
        <button className="link-btn" onClick={onOpenSongs}>
          Songs
        </button>
      </div>
    </div>
  );
}

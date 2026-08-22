import type { UseMidi } from '../midi/useMidi';
import { MidiStatus } from './MidiStatus';
import type { StreakInfo } from '../streak/streak';

interface Props {
  midi: UseMidi;
  streak: StreakInfo;
  onStart: () => void;
}

/** Zero decisions on open. One primary button, always. */
export function Home({ midi, streak, onStart }: Props) {
  return (
    <div className="home">
      <div className="brand">Piano Made Easy</div>

      <div className="streak">
        <div className="streak-num">{streak.current}</div>
        <div className="streak-label">
          day{streak.current === 1 ? '' : 's'} in a row{streak.current > 0 ? ' 🔥' : ''}
        </div>
      </div>

      {streak.missedYesterday && (
        <p className="nudge">Yesterday got away. Five minutes puts you back.</p>
      )}

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

      <MidiStatus midi={midi} />
    </div>
  );
}

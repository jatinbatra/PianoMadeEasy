import type { SessionResult } from '../types';
import type { StreakInfo } from '../streak/streak';

interface Props {
  result: SessionResult;
  streak: StreakInfo;
  atomsStrengthened: number;
  onHome: () => void;
}

/** Honest post-session summary. Measured, never inflated. */
export function Summary({ result, streak, atomsStrengthened, onHome }: Props) {
  const connected = result.mode === 'connected';
  const acc = result.accuracy != null ? Math.round(result.accuracy * 100) : null;

  return (
    <div className="summary">
      <h1>Day logged ✓</h1>
      <div className="streak-inline">{streak.current}-day streak</div>

      <ul className="stats">
        <li>
          <span className="stat-num">{result.notesPlayed}</span>
          <span className="stat-label">notes played</span>
        </li>
        {connected && acc != null ? (
          <li>
            <span className="stat-num">{acc}%</span>
            <span className="stat-label">notes correct</span>
          </li>
        ) : (
          <li>
            <span className="stat-num">—</span>
            <span className="stat-label">unverified (no keyboard)</span>
          </li>
        )}
        {connected && (
          <li>
            <span className="stat-num">{atomsStrengthened}</span>
            <span className="stat-label">skills strengthened</span>
          </li>
        )}
      </ul>

      {!connected && (
        <p className="hint">
          Practiced without the cable — it still counts. Plug in the Yamaha next time to
          track accuracy.
        </p>
      )}

      <button className="btn-primary" onClick={onHome}>
        Done
      </button>
    </div>
  );
}

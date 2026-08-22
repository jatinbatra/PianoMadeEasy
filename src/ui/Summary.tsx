import type { SessionResult } from '../types';
import type { StreakInfo } from '../streak/streak';

interface Props {
  result: SessionResult;
  streak: StreakInfo;
  atomsStrengthened: number;
  chunkOwned: boolean;
  onHome: () => void;
}

/** Honest post-session summary. Measured, never inflated. */
export function Summary({ result, streak, atomsStrengthened, chunkOwned, onHome }: Props) {
  const scored = result.mode !== 'untethered';
  const viaMic = result.mode === 'mic';
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
        {scored && acc != null ? (
          <li>
            <span className="stat-num">{acc}%</span>
            <span className="stat-label">notes correct{viaMic ? ' (mic)' : ''}</span>
          </li>
        ) : (
          <li>
            <span className="stat-num">—</span>
            <span className="stat-label">unscored (no input)</span>
          </li>
        )}
        {scored && (
          <li>
            <span className="stat-num">{atomsStrengthened}</span>
            <span className="stat-label">skills strengthened</span>
          </li>
        )}
      </ul>

      {chunkOwned && <p className="chunk-owned">🎉 New chunk owned — played clean at tempo twice!</p>}

      {!scored && (
        <p className="hint">
          Practiced without input — it still counts. Turn on the mic (or plug in the Yamaha)
          next time to track accuracy.
        </p>
      )}
      {viaMic && <p className="hint">Scored by mic — great for single notes. Chords need the keyboard.</p>}

      <button className="btn-primary" onClick={onHome}>
        Done
      </button>
    </div>
  );
}

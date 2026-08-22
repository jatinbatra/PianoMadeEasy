import { localDateKey } from '../db/repo';
import { shiftDay } from '../streak/streak';
import type { PracticeDay } from '../types';

/** A calendar heatmap of practice days — the last ~13 weeks. */
export function Heatmap({ days }: { days: PracticeDay[] }) {
  const verifiedByDate = new Map(days.map((d) => [d.date, d.verified]));
  const today = localDateKey();

  const WEEKS = 13;
  const total = WEEKS * 7;

  // Start on the Sunday of the earliest week in range.
  let start = shiftDay(today, -(total - 1));
  const startDow = new Date(start + 'T00:00:00').getDay();
  start = shiftDay(start, -startDow);

  const cells: { date: string; state: 'none' | 'verified' | 'unverified' | 'future' }[] = [];
  let cursor = start;
  // Render full weeks until we pass today.
  while (cursor <= today || cells.length % 7 !== 0) {
    let state: 'none' | 'verified' | 'unverified' | 'future' = 'none';
    if (cursor > today) state = 'future';
    else if (verifiedByDate.has(cursor)) state = verifiedByDate.get(cursor) ? 'verified' : 'unverified';
    cells.push({ date: cursor, state });
    cursor = shiftDay(cursor, 1);
  }

  return (
    <div className="heatmap" role="img" aria-label="Calendar of practice days">
      {cells.map((c) => (
        <span key={c.date} className={`hm-cell ${c.state}`} title={c.date} />
      ))}
    </div>
  );
}

import { localDateKey } from '../db/repo';
import { ATOMS } from './catalog';
import { isDecayed, isDue, needsReteach, newAtomProgress, type AtomProgress } from './sm2';
import type { Atom } from '../types/atom';

export type ProgressMap = Record<string, AtomProgress>;

export interface FocusPlan {
  atom: Atom;
  /** 'teach' introduces a new atom; 'reteach' fires after a double failure. */
  mode: 'teach' | 'reteach';
  /** Which teach angle to show. Rotates on re-teach so the explanation changes. */
  teachIndex: number;
}

export interface DayPlan {
  /** Atoms to re-check first (fight decay), most overdue first. */
  recall: Atom[];
  /** The primary new/current skill (queue[0]), or null when nothing applies. */
  focus: FocusPlan | null;
  /** Ordered skills to practice this session; longer sessions use more of it. */
  focusQueue: FocusPlan[];
  /** True when we're holding off on new material to consolidate. */
  consolidating: boolean;
  decayedCount: number;
}

/** How many atoms the recall block covers, by session length. Phase 1 = 5 min. */
export const RECALL_LIMIT = 3;

function get(map: ProgressMap, id: string, today: string): AtomProgress {
  return map[id] ?? newAtomProgress(id, today);
}

/** A prerequisite counts as satisfied once it's been passed at least once. */
function prereqsMet(atom: Atom, map: ProgressMap, today: string): boolean {
  return atom.prerequisites.every((pid) => {
    const p = get(map, pid, today);
    return p.introduced && p.repetitions >= 1;
  });
}

/**
 * Decide the day's plan. Encodes the anti-decay rules directly:
 *  - a stuck atom (2+ failures) is re-taught with a *different* angle, not re-tested;
 *  - no new atom while more than 3 atoms are decayed — consolidate first;
 *  - recall always leads, focus always ends the teaching part.
 */
export function buildPlan(
  map: ProgressMap,
  today: string = localDateKey(),
  recallLimit: number = RECALL_LIMIT,
): DayPlan {
  const introduced = ATOMS.filter((a) => get(map, a.id, today).introduced);

  const decayed = introduced.filter((a) => isDecayed(get(map, a.id, today), today));
  const decayedCount = decayed.length;

  const dueSorted = introduced
    .filter((a) => isDue(get(map, a.id, today), today))
    .sort((x, y) => get(map, x.id, today).dueDate.localeCompare(get(map, y.id, today).dueDate));
  const recall = dueSorted.slice(0, recallLimit);

  const consolidating = decayedCount > 3;
  const queue: FocusPlan[] = [];
  const add = (atom: Atom, mode: FocusPlan['mode'] = 'teach', teachIndex = 0) => {
    if (!queue.some((f) => f.atom.id === atom.id)) queue.push({ atom, mode, teachIndex });
  };

  // 1) Anything stuck gets re-taught first, with a fresh angle.
  const stuck = ATOMS.find((a) => needsReteach(get(map, a.id, today)));
  if (stuck) {
    const cf = get(map, stuck.id, today).consecutiveFailures;
    add(stuck, 'reteach', Math.min(cf - 1, stuck.teach.length - 1));
  }

  // 2) New material — unless we're consolidating (too much has decayed).
  if (!consolidating) {
    for (const a of ATOMS) {
      if (queue.length >= 8) break;
      if (!get(map, a.id, today).introduced && prereqsMet(a, map, today)) add(a);
    }
  }

  // 3) Fill the rest with review of what's due (past recall) then any known atom.
  for (const a of dueSorted) {
    if (queue.length >= 8) break;
    add(a);
  }
  if (queue.length === 0 && dueSorted[0]) add(dueSorted[0]);

  return {
    recall,
    focus: queue[0] ?? null,
    focusQueue: queue,
    consolidating,
    decayedCount,
  };
}

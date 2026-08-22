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
  /** The one new/current skill for today, or null when consolidating. */
  focus: FocusPlan | null;
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

  const recall = introduced
    .filter((a) => isDue(get(map, a.id, today), today))
    .sort((x, y) => get(map, x.id, today).dueDate.localeCompare(get(map, y.id, today).dueDate))
    .slice(0, recallLimit);

  // 1) Anything stuck gets re-taught, with a fresh angle, before anything new.
  //    A stuck atom may never have passed yet ("stuck on lesson one"), so scan
  //    all atoms, not just introduced ones.
  const stuck = ATOMS.find((a) => needsReteach(get(map, a.id, today)));
  if (stuck) {
    const cf = get(map, stuck.id, today).consecutiveFailures;
    return {
      recall,
      focus: { atom: stuck, mode: 'reteach', teachIndex: Math.min(cf - 1, stuck.teach.length - 1) },
      consolidating: false,
      decayedCount,
    };
  }

  // 2) Too much decay: hold new material, consolidate what's slipping.
  if (decayedCount > 3) {
    return { recall, focus: null, consolidating: true, decayedCount };
  }

  // 3) Otherwise introduce the next atom whose prerequisites are met.
  const next = ATOMS.find((a) => !get(map, a.id, today).introduced && prereqsMet(a, map, today));
  if (next) {
    return { recall, focus: { atom: next, mode: 'teach', teachIndex: 0 }, consolidating: false, decayedCount };
  }

  // 4) Nothing new to learn — reinforce the most-overdue known atom, if any.
  const reinforce = recall[0] ?? null;
  return {
    recall,
    focus: reinforce ? { atom: reinforce, mode: 'teach', teachIndex: 0 } : null,
    consolidating: false,
    decayedCount,
  };
}

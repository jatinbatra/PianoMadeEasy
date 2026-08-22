import { describe, it, expect } from 'vitest';
import { buildPlan, type ProgressMap } from './scheduler';
import { newAtomProgress, review } from './sm2';

const TODAY = '2026-08-22';

/** Build a progress map with the given atoms already learned (passed once today). */
function learned(ids: string[], today = TODAY): ProgressMap {
  const map: ProgressMap = {};
  for (const id of ids) map[id] = review(newAtomProgress(id, today), 5, today);
  return map;
}

describe('buildPlan', () => {
  it('introduces find-note:C first when nothing is learned', () => {
    const plan = buildPlan({}, TODAY);
    expect(plan.focus?.mode).toBe('teach');
    expect(plan.focus?.atom.id).toBe('find-note:C');
    expect(plan.recall).toHaveLength(0);
  });

  it('unlocks the next atom only after its prerequisite is met', () => {
    const plan = buildPlan(learned(['find-note:C']), TODAY);
    expect(plan.focus?.atom.id).toBe('find-note:D');
  });

  it('does not offer an interval until both its notes are known', () => {
    // C learned but not E: the third-above-C interval must stay locked.
    const plan = buildPlan(learned(['find-note:C']), TODAY);
    expect(plan.focus?.atom.id).not.toBe('interval:third-up-from-C');
  });

  it('re-teaches a stuck atom with a new angle instead of testing it', () => {
    let map = learned(['find-note:C']);
    map['find-note:D'] = newAtomProgress('find-note:D', TODAY);
    map['find-note:D'] = review(map['find-note:D'], 1, TODAY); // fail 1
    map['find-note:D'] = review(map['find-note:D'], 1, TODAY); // fail 2 -> stuck
    const plan = buildPlan(map, TODAY);
    expect(plan.focus?.mode).toBe('reteach');
    expect(plan.focus?.atom.id).toBe('find-note:D');
    expect(plan.focus?.teachIndex).toBe(1); // rotated to a different explanation
  });

  it('consolidates (no new atom) when more than 3 atoms are decayed', () => {
    // Learn 5 notes yesterday so they are all overdue today.
    const yesterday = '2026-08-20';
    const map = learned(['find-note:C', 'find-note:D', 'find-note:E', 'find-note:F', 'find-note:G'], yesterday);
    const plan = buildPlan(map, TODAY);
    expect(plan.decayedCount).toBeGreaterThan(3);
    expect(plan.consolidating).toBe(true);
    expect(plan.focus).toBeNull();
    expect(plan.recall.length).toBeGreaterThan(0);
  });
});

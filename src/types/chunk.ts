/** Per-chunk mastery state. A chunk is "owned" once played clean at tempo on
 *  two separate days — that's the unit the hero metric counts. */
export interface ChunkProgress {
  /** `${songId}:${chunkId}` — primary key. */
  key: string;
  songId: string;
  chunkId: string;
  reps: number;
  /** Best note-accuracy seen, 0–1. */
  bestAccuracy: number;
  /** Fastest tempo (bpm) played cleanly. */
  maxCleanTempo: number;
  /** Distinct dates played clean at target tempo. */
  cleanDays: string[];
  owned: boolean;
  /** ms epoch of the last write — for last-write-wins sync (Phase 3). */
  updatedAt: number;
}

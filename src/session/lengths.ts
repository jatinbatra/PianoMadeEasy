/** Session lengths. Five minutes is the default and a full day for the streak,
 *  identical to an hour. Longer sessions cover MORE — more skills and more of
 *  the song — not just one lesson stretched out. */
export interface SessionLength {
  minutes: 5 | 10 | 30 | 60;
  /** Seconds for the recall block. */
  recall: number;
  /** Seconds per skill block, and how many skill blocks. */
  focusEach: number;
  focusCount: number;
  /** Seconds per song block, and how many (distinct chunks). */
  songEach: number;
  songCount: number;
  /** How many atoms the recall block covers. */
  recallLimit: number;
}

export const LENGTHS: SessionLength[] = [
  { minutes: 5, recall: 60, focusEach: 120, focusCount: 1, songEach: 120, songCount: 1, recallLimit: 3 },
  { minutes: 10, recall: 90, focusEach: 130, focusCount: 2, songEach: 150, songCount: 2, recallLimit: 4 },
  { minutes: 30, recall: 240, focusEach: 180, focusCount: 4, songEach: 200, songCount: 3, recallLimit: 6 },
  { minutes: 60, recall: 360, focusEach: 220, focusCount: 6, songEach: 230, songCount: 5, recallLimit: 8 },
];

export const DEFAULT_LENGTH = LENGTHS[0];

export function lengthFor(minutes: number): SessionLength {
  return LENGTHS.find((l) => l.minutes === minutes) ?? DEFAULT_LENGTH;
}

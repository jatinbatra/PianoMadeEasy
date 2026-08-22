/** Session lengths. Five minutes is the default and a full day for the streak,
 *  identical to an hour. Only the block durations scale. */
export interface SessionLength {
  minutes: 5 | 10 | 30 | 60;
  /** Seconds for each block. */
  recall: number;
  focus: number;
  song: number;
  /** How many atoms the recall block covers at this length. */
  recallLimit: number;
}

export const LENGTHS: SessionLength[] = [
  { minutes: 5, recall: 60, focus: 120, song: 120, recallLimit: 3 },
  { minutes: 10, recall: 90, focus: 240, song: 270, recallLimit: 4 },
  { minutes: 30, recall: 240, focus: 720, song: 840, recallLimit: 6 },
  { minutes: 60, recall: 360, focus: 1500, song: 1740, recallLimit: 8 },
];

export const DEFAULT_LENGTH = LENGTHS[0];

export function lengthFor(minutes: number): SessionLength {
  return LENGTHS.find((l) => l.minutes === minutes) ?? DEFAULT_LENGTH;
}

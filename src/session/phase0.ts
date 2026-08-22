import type { SessionBlock } from '../types';
import type { PitchClass } from '../midi/notes';
import type { Song } from '../types/song';
import songData from '../../songs/mary-had-a-little-lamb.json';

/**
 * The one hardcoded 5-minute session for Phase 0. Same three-part shape every
 * session will have: recall (fight decay) -> new skill -> song (always last).
 * In Phase 1 this gets replaced by a scheduler over skill atoms.
 */
export const PHASE0_BLOCKS: SessionBlock[] = [
  { kind: 'recall', title: 'Warm-up', seconds: 60 },
  { kind: 'lesson', title: 'Find F', seconds: 120 },
  { kind: 'song', title: 'Song time', seconds: 120 },
];

/**
 * Notes the warm-up asks him to find. On the very first-ever session there's
 * nothing to "recall", so this is framed as a warm-up over the keys the day
 * uses — same MIDI check, no scary "recall" language.
 */
export const WARMUP_TARGETS: PitchClass[] = ['C', 'D', 'E', 'F', 'G'];

/** The single atom taught in Phase 0. */
export const LESSON_TARGET: PitchClass = 'F';

/** Repeated find-F prompts within the lesson's test portion. */
export const LESSON_TEST_TARGETS: PitchClass[] = ['F', 'F', 'F'];

export const PHASE0_SONG: Song = songData as Song;

/** Phase 0 practices the first phrase of the song. */
export const PHASE0_CHUNK = PHASE0_SONG.chunks[0];

export const PHASE0_TOTAL_SECONDS = PHASE0_BLOCKS.reduce((s, b) => s + b.seconds, 0);

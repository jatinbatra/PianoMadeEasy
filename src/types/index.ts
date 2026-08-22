// Shared types. Phase 0 uses a subset; atom/song shapes are stubbed here so
// Phases 1–3 slot in without a restructure.

/** A single MIDI note-on or note-off, timestamped relative to capture start. */
export interface NoteEvent {
  /** MIDI note number, 0–127. Middle C (C4) is 60. */
  note: number;
  /** 0–127; 0 velocity note-on is treated as note-off per MIDI spec. */
  velocity: number;
  /** true = note-on (key pressed), false = note-off (key released). */
  on: boolean;
  /** ms since the recorder / capture started. */
  time: number;
}

export type InputMode = 'connected' | 'mic' | 'touch' | 'untethered';

export type BlockKind = 'recall' | 'lesson' | 'song';

/** A block within a session (recall check / new skill / song time). */
export interface SessionBlock {
  kind: BlockKind;
  /** Human title shown at the top of the block. */
  title: string;
  /** Planned duration in seconds. */
  seconds: number;
}

/** The result of one completed (or ended) session, persisted to IndexedDB. */
export interface SessionResult {
  id?: number;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  startedAt: number;
  finishedAt: number;
  mode: InputMode;
  /** Total MIDI note-on events seen during the session. */
  notesPlayed: number;
  /**
   * 0–1 correct-note ratio for the parts we could measure. Only meaningful in
   * connected mode; null when untethered (we don't self-assess).
   */
  accuracy: number | null;
}

/** One practiced calendar day — the unit the streak is built from. */
export interface PracticeDay {
  /** YYYY-MM-DD, primary key. */
  date: string;
  /** false when the day was logged in untethered mode (no MIDI verification). */
  verified: boolean;
  minutes: number;
  completedAt: number;
}

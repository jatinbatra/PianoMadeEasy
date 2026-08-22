import type { NoteEvent } from '../types';

/**
 * Captures a timed sequence of MIDI note events for later scoring.
 *
 * Deliberately dumb and self-contained: it just accumulates events with
 * millisecond-relative timestamps. Scoring (Phase 1) reads the array back out.
 * Because the buffer lives here and not in a MIDI callback closure, a device
 * disconnect/reconnect mid-session never drops what was already captured.
 */
export class MidiRecorder {
  private events: NoteEvent[] = [];
  private startTime = 0;
  private recording = false;

  start(): void {
    this.events = [];
    this.startTime = performance.now();
    this.recording = true;
  }

  stop(): NoteEvent[] {
    this.recording = false;
    return this.getEvents();
  }

  get isRecording(): boolean {
    return this.recording;
  }

  /** Feed a raw MIDI message in. No-op unless started. */
  add(note: number, velocity: number, on: boolean): void {
    if (!this.recording) return;
    this.events.push({
      note,
      velocity,
      on,
      time: performance.now() - this.startTime,
    });
  }

  /** A copy of the captured events so far. */
  getEvents(): NoteEvent[] {
    return [...this.events];
  }

  /** Count of note-on events (velocity > 0) — i.e. keys actually pressed. */
  get noteOnCount(): number {
    return this.events.filter((e) => e.on && e.velocity > 0).length;
  }
}

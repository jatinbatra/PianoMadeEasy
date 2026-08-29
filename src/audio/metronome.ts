import { audio } from './synth';

/**
 * A small look-ahead metronome. A steady tick with an accented downbeat every
 * `beatsPerBar`, scheduled on the Web Audio clock so it stays rock-solid even
 * when the main thread is busy. Optionally counts in a bar of ticks and then
 * calls `onStart` — the "one, two, ready, play" ritual before song time.
 */
export class Metronome {
  private ctx = audio();
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextTick = 0;
  private beat = 0;
  private bpm = 80;
  private beatsPerBar = 4;
  private onBeat?: (beatInBar: number) => void;

  get running(): boolean {
    return this.timer != null;
  }

  start(bpm: number, opts: { beatsPerBar?: number; onBeat?: (b: number) => void } = {}): void {
    this.stop();
    this.ctx = audio();
    this.bpm = Math.max(30, bpm);
    this.beatsPerBar = opts.beatsPerBar ?? 4;
    this.onBeat = opts.onBeat;
    this.beat = 0;
    this.nextTick = this.ctx.currentTime + 0.1;
    // 25ms scheduler with a 100ms look-ahead window.
    this.timer = setInterval(() => this.schedule(), 25);
  }

  stop(): void {
    if (this.timer != null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private schedule(): void {
    const secondsPerBeat = 60 / this.bpm;
    while (this.nextTick < this.ctx.currentTime + 0.1) {
      const accent = this.beat % this.beatsPerBar === 0;
      this.click(this.nextTick, accent);
      if (this.onBeat) {
        const b = this.beat % this.beatsPerBar;
        const delay = Math.max(0, (this.nextTick - this.ctx.currentTime) * 1000);
        setTimeout(() => this.onBeat?.(b), delay);
      }
      this.nextTick += secondsPerBeat;
      this.beat += 1;
    }
  }

  private click(at: number, accent: boolean): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.value = accent ? 1600 : 1000;
    const peak = accent ? 0.32 : 0.18;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(peak, at + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(at);
    osc.stop(at + 0.06);
  }
}

export const metronomeSupported = typeof AudioContext !== 'undefined';

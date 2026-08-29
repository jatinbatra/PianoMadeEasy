// A tiny Web Audio synth so the on-screen keyboard actually makes sound. Lets
// anyone play (and be scored) with no hardware at all — great for sharing with
// a friend who doesn't own a piano.

let ctx: AudioContext | null = null;

/** The one shared AudioContext (created on first sound, resumed if suspended). */
export function audio(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Play a soft, piano-ish note for a MIDI number. */
export function playNote(midi: number, durationMs = 600): void {
  const c = audio();
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const now = c.currentTime;
  const dur = durationMs / 1000;

  const gain = c.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  gain.connect(c.destination);

  // A fundamental plus a quiet octave for a little warmth.
  const a = c.createOscillator();
  a.type = 'triangle';
  a.frequency.value = freq;
  const b = c.createOscillator();
  b.type = 'sine';
  b.frequency.value = freq * 2;
  const bGain = c.createGain();
  bGain.gain.value = 0.3;
  a.connect(gain);
  b.connect(bGain).connect(gain);

  a.start(now);
  b.start(now);
  a.stop(now + dur + 0.05);
  b.stop(now + dur + 0.05);
}

/** Play several notes at once (a chord). */
export function playChord(midis: number[], durationMs = 900): void {
  for (const m of midis) playNote(m, durationMs);
}

/** Play a melody in sequence so the learner can hear the tempo and shape. */
export function playMelody(notes: { midi: number; durMs: number }[]): void {
  let t = 0;
  for (const n of notes) {
    const at = t;
    setTimeout(() => playNote(n.midi, Math.max(180, n.durMs * 0.92)), at);
    t += n.durMs;
  }
}

export const synthSupported = typeof AudioContext !== 'undefined';

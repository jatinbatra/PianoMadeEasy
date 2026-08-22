// Monophonic pitch detection via normalized autocorrelation. Good enough for
// one piano note at a time — which is exactly the mic use case. It cannot hear
// chords; callers must treat chord tests as unverified under mic.

/**
 * Estimate the fundamental frequency (Hz) of a time-domain buffer.
 * Returns -1 when the signal is too quiet or no clear pitch is found.
 */
export function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;

  // Gate on loudness (RMS) so silence/room noise doesn't produce ghost notes.
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  // Trim to the loud region.
  let start = 0;
  let end = SIZE - 1;
  const threshold = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) start = i;
    else break;
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < threshold) end = SIZE - i;
    else break;
  }
  const trimmed = buffer.slice(start, end);
  const n = trimmed.length;

  const c = new Float32Array(n).fill(0);
  for (let lag = 0; lag < n; lag++) {
    for (let i = 0; i < n - lag; i++) c[lag] += trimmed[i] * trimmed[i + lag];
  }

  // First rising edge after the initial dip.
  let d = 0;
  while (d < n - 1 && c[d] > c[d + 1]) d++;

  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < n; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  let T0 = maxpos;
  if (T0 <= 0) return -1;

  // Parabolic interpolation for a sub-sample estimate.
  const x1 = c[T0 - 1] ?? 0;
  const x2 = c[T0];
  const x3 = c[T0 + 1] ?? 0;
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 -= b / (2 * a);

  const freq = sampleRate / T0;
  if (freq < 40 || freq > 2100) return -1; // outside a sane piano range
  return freq;
}

/** Nearest MIDI note number for a frequency (A4 = 440 Hz = note 69). */
export function freqToMidi(freq: number): number {
  return Math.round(69 + 12 * Math.log2(freq / 440));
}

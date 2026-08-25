// Monophonic pitch detection via the McLeod Pitch Method (normalized square
// difference function). More robust than plain autocorrelation: it gives a
// "clarity" score we can gate on, so room noise and weak signals don't produce
// ghost notes, and it locks onto the fundamental rather than an octave.
// Still one-note-at-a-time — it cannot resolve chords.

/** Clarity below this isn't a confident pitch. Loose enough for a laptop mic
 *  a few feet from the piano, tight enough to reject room noise. */
const CLARITY_GATE = 0.78;
/** RMS below this is treated as silence. Low so a quiet built-in mic still registers. */
const RMS_GATE = 0.0035;

/**
 * Estimate fundamental frequency (Hz) of a time-domain buffer, or -1 when there
 * is no confident pitch.
 */
export function detectPitch(buf: Float32Array, sampleRate: number): number {
  const size = buf.length;

  let rms = 0;
  for (let i = 0; i < size; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / size);
  if (rms < RMS_GATE) return -1;

  // Only search lags inside a sane piano range (~40 Hz to ~2.1 kHz).
  const minTau = Math.max(2, Math.floor(sampleRate / 2100));
  const maxTau = Math.min(size - 1, Math.floor(sampleRate / 40));

  const nsdf = new Float32Array(maxTau + 1);
  let globalMax = 0;
  for (let tau = minTau; tau <= maxTau; tau++) {
    let acf = 0;
    let div = 0;
    for (let i = 0; i < size - tau; i++) {
      acf += buf[i] * buf[i + tau];
      div += buf[i] * buf[i] + buf[i + tau] * buf[i + tau];
    }
    const v = div > 0 ? (2 * acf) / div : 0;
    nsdf[tau] = v;
    if (v > globalMax) globalMax = v;
  }

  if (globalMax < CLARITY_GATE) return -1;

  // First local maximum that clears most of the global peak = the fundamental.
  const threshold = 0.85 * globalMax;
  let peak = -1;
  for (let tau = minTau + 1; tau < maxTau; tau++) {
    if (nsdf[tau] > threshold && nsdf[tau] > nsdf[tau - 1] && nsdf[tau] >= nsdf[tau + 1]) {
      peak = tau;
      break;
    }
  }
  if (peak < 0) return -1;

  // Parabolic interpolation for a sub-sample period estimate.
  const x1 = nsdf[peak - 1];
  const x2 = nsdf[peak];
  const x3 = nsdf[peak + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  let tau = peak;
  if (a) tau -= b / (2 * a);

  const freq = sampleRate / tau;
  if (freq < 40 || freq > 2100) return -1;
  return freq;
}

/** Nearest MIDI note number for a frequency (A4 = 440 Hz = note 69). */
export function freqToMidi(freq: number): number {
  return Math.round(69 + 12 * Math.log2(freq / 440));
}

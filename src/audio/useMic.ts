import { useCallback, useRef, useState } from 'react';
import { autoCorrelate, freqToMidi } from './pitchDetect';
import type { LiveNote } from '../midi/useMidi';

type NoteListener = (n: LiveNote) => void;

export interface UseMic {
  supported: boolean;
  enabled: boolean;
  /** 0–1 input level, for a live meter. */
  level: number;
  lastNote: LiveNote | null;
  enable: () => Promise<void>;
  disable: () => void;
  subscribe: (fn: NoteListener) => () => void;
}

// Detection tuning: require a few stable frames before firing a note-on so a
// single clear note is reported, not the attack transient.
const STABLE_FRAMES = 2;
const SILENCE_FRAMES = 3;

/**
 * Microphone note input: listens through the device mic, detects one note at a
 * time, and emits the same LiveNote events MIDI does — so scoring, the keyboard
 * display, and the session flow all work with no cable. Monophonic only.
 */
export function useMic(): UseMic {
  const [supported] = useState(
    () => typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof AudioContext !== 'undefined',
  );
  const [enabled, setEnabled] = useState(false);
  const [level, setLevel] = useState(0);
  const [lastNote, setLastNote] = useState<LiveNote | null>(null);

  const listeners = useRef<Set<NoteListener>>(new Set());
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const emit = useCallback((n: LiveNote) => {
    if (n.on) setLastNote(n);
    for (const fn of listeners.current) fn(n);
  }, []);

  const enable = useCallback(async () => {
    if (!supported || enabled) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    streamRef.current = stream;
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    const buf = new Float32Array(analyser.fftSize);
    let sounding: number | null = null;
    let candidate: number | null = null;
    let candidateCount = 0;
    let silence = 0;

    const tick = () => {
      analyser.getFloatTimeDomainData(buf);
      let rms = 0;
      for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
      setLevel(Math.min(1, Math.sqrt(rms / buf.length) * 6));

      const freq = autoCorrelate(buf, ctx.sampleRate);
      const note = freq > 0 ? freqToMidi(freq) : null;

      if (note === null) {
        silence += 1;
        if (silence >= SILENCE_FRAMES && sounding !== null) {
          emit({ note: sounding, velocity: 0, on: false });
          sounding = null;
          candidate = null;
          candidateCount = 0;
        }
      } else {
        silence = 0;
        if (note === sounding) {
          // still holding the same note
        } else {
          if (note === candidate) candidateCount += 1;
          else {
            candidate = note;
            candidateCount = 1;
          }
          if (candidateCount >= STABLE_FRAMES) {
            if (sounding !== null) emit({ note: sounding, velocity: 0, on: false });
            emit({ note, velocity: 90, on: true });
            sounding = note;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    setEnabled(true);
  }, [supported, enabled, emit]);

  const disable = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close();
    ctxRef.current = null;
    setEnabled(false);
    setLevel(0);
  }, []);

  const subscribe = useCallback((fn: NoteListener) => {
    listeners.current.add(fn);
    return () => {
      listeners.current.delete(fn);
    };
  }, []);

  return { supported, enabled, level, lastNote, enable, disable, subscribe };
}

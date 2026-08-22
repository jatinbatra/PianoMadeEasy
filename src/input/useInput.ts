import { useCallback, useEffect, useRef, useState } from 'react';
import { useMidi, type LiveNote } from '../midi/useMidi';
import { useMic } from '../audio/useMic';
import { playNote, synthSupported } from '../audio/synth';

export type InputMode = 'midi' | 'mic' | 'touch' | 'untethered';

type NoteListener = (n: LiveNote) => void;

export interface Input {
  mode: InputMode;
  /** True when notes are being measured (MIDI / mic / on-screen taps). */
  scored: boolean;
  midiSupported: boolean;
  midiRequesting: boolean;
  micSupported: boolean;
  micEnabled: boolean;
  micLevel: number;
  touchSupported: boolean;
  devices: string[];
  lastNote: LiveNote | null;
  subscribe: (fn: NoteListener) => () => void;
  enableMic: () => Promise<void>;
  disableMic: () => void;
  /** Play + register a note from the on-screen keyboard. */
  tapNote: (note: number) => void;
}

/**
 * One input surface. Priority: a real MIDI keyboard, else the mic, else the
 * on-screen piano (always available, makes sound, and is scored) — so anyone
 * can play with no hardware at all.
 */
export function useInput(): Input {
  const midi = useMidi();
  const mic = useMic();

  const base: InputMode = synthSupported ? 'touch' : 'untethered';
  const mode: InputMode = midi.mode === 'connected' ? 'midi' : mic.enabled ? 'mic' : base;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const listeners = useRef<Set<NoteListener>>(new Set());
  const [touchNote, setTouchNote] = useState<LiveNote | null>(null);
  const offTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emitAll = useCallback((n: LiveNote) => {
    for (const fn of listeners.current) fn(n);
  }, []);

  // Forward events from whichever *sensor* source is currently active.
  useEffect(() => {
    const un1 = midi.subscribe((n) => {
      if (modeRef.current === 'midi') emitAll(n);
    });
    const un2 = mic.subscribe((n) => {
      if (modeRef.current === 'mic') emitAll(n);
    });
    return () => {
      un1();
      un2();
    };
  }, [midi, mic, emitAll]);

  const tapNote = useCallback(
    (note: number) => {
      playNote(note);
      const on: LiveNote = { note, velocity: 100, on: true };
      setTouchNote(on);
      emitAll(on);
      if (offTimer.current) clearTimeout(offTimer.current);
      offTimer.current = setTimeout(() => emitAll({ note, velocity: 0, on: false }), 250);
    },
    [emitAll],
  );

  const subscribe = useCallback((fn: NoteListener) => {
    listeners.current.add(fn);
    return () => {
      listeners.current.delete(fn);
    };
  }, []);

  const lastNote = mode === 'midi' ? midi.lastNote : mode === 'mic' ? mic.lastNote : touchNote;

  return {
    mode,
    scored: mode !== 'untethered',
    midiSupported: midi.supported,
    midiRequesting: midi.state === 'requesting',
    micSupported: mic.supported,
    micEnabled: mic.enabled,
    micLevel: mic.level,
    touchSupported: synthSupported,
    devices: midi.devices,
    lastNote,
    subscribe,
    enableMic: mic.enable,
    disableMic: mic.disable,
    tapNote,
  };
}

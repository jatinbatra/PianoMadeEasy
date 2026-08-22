import { useCallback, useEffect, useRef } from 'react';
import { useMidi, type LiveNote } from '../midi/useMidi';
import { useMic } from '../audio/useMic';

export type InputMode = 'midi' | 'mic' | 'untethered';

type NoteListener = (n: LiveNote) => void;

export interface Input {
  mode: InputMode;
  /** True when notes are being measured (MIDI or mic) — i.e. scoreable. */
  scored: boolean;
  midiSupported: boolean;
  midiRequesting: boolean;
  micSupported: boolean;
  micEnabled: boolean;
  micLevel: number;
  devices: string[];
  lastNote: LiveNote | null;
  subscribe: (fn: NoteListener) => () => void;
  enableMic: () => Promise<void>;
  disableMic: () => void;
}

/**
 * One input surface for the whole app. MIDI wins when a keyboard is attached;
 * otherwise the mic can be turned on to score single notes; otherwise it's
 * untethered (counts the day, no scoring). Blocks just call subscribe().
 */
export function useInput(): Input {
  const midi = useMidi();
  const mic = useMic();

  const mode: InputMode = midi.mode === 'connected' ? 'midi' : mic.enabled ? 'mic' : 'untethered';
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const listeners = useRef<Set<NoteListener>>(new Set());

  // Forward events from whichever source is currently active.
  useEffect(() => {
    const un1 = midi.subscribe((n) => {
      if (modeRef.current === 'midi') for (const fn of listeners.current) fn(n);
    });
    const un2 = mic.subscribe((n) => {
      if (modeRef.current === 'mic') for (const fn of listeners.current) fn(n);
    });
    return () => {
      un1();
      un2();
    };
  }, [midi, mic]);

  const subscribe = useCallback((fn: NoteListener) => {
    listeners.current.add(fn);
    return () => {
      listeners.current.delete(fn);
    };
  }, []);

  const lastNote = mode === 'midi' ? midi.lastNote : mode === 'mic' ? mic.lastNote : null;

  return {
    mode,
    scored: mode !== 'untethered',
    midiSupported: midi.supported,
    midiRequesting: midi.state === 'requesting',
    micSupported: mic.supported,
    micEnabled: mic.enabled,
    micLevel: mic.level,
    devices: midi.devices,
    lastNote,
    subscribe,
    enableMic: mic.enable,
    disableMic: mic.disable,
  };
}

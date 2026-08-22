import { useCallback, useEffect, useRef, useState } from 'react';
import type { InputMode } from '../types';

export type MidiState = 'unsupported' | 'idle' | 'requesting' | 'denied' | 'ready';

/** A parsed note event handed to subscribers. */
export interface LiveNote {
  note: number;
  velocity: number;
  on: boolean;
}

type NoteListener = (n: LiveNote) => void;

export interface UseMidi {
  /** Web MIDI API present in this browser at all (false on iOS Safari). */
  supported: boolean;
  state: MidiState;
  /** connected = >=1 input device attached; untethered = none. */
  mode: InputMode;
  devices: string[];
  /** Most recent note-on, for the live "you played…" display. */
  lastNote: LiveNote | null;
  /** Ask the browser for MIDI permission. Safe to call more than once. */
  requestAccess: () => Promise<void>;
  /** Register a note listener. Returns an unsubscribe fn. */
  subscribe: (fn: NoteListener) => () => void;
}

function parseMidiMessage(data: Uint8Array): LiveNote | null {
  const status = data[0] & 0xf0;
  const note = data[1];
  const velocity = data[2] ?? 0;
  if (status === 0x90) {
    // Note-on; velocity 0 is a note-off per the MIDI spec.
    return { note, velocity, on: velocity > 0 };
  }
  if (status === 0x80) {
    return { note, velocity, on: false };
  }
  return null;
}

/**
 * Single source of truth for MIDI in the app. Handles the two realities we
 * must design around: (1) the browser may not support Web MIDI (iOS), in which
 * case we run untethered; (2) the device is unplugged and replugged constantly,
 * which must never throw or lose a listener.
 */
export function useMidi(): UseMidi {
  const [supported] = useState(() => typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator);
  const [state, setState] = useState<MidiState>(() => (supported ? 'idle' : 'unsupported'));
  const [devices, setDevices] = useState<string[]>([]);
  const [lastNote, setLastNote] = useState<LiveNote | null>(null);

  const accessRef = useRef<MIDIAccess | null>(null);
  const listenersRef = useRef<Set<NoteListener>>(new Set());

  const handleMessage = useCallback((event: MIDIMessageEvent) => {
    if (!event.data) return;
    const parsed = parseMidiMessage(event.data);
    if (!parsed) return;
    if (parsed.on) setLastNote(parsed);
    for (const fn of listenersRef.current) fn(parsed);
  }, []);

  // (Re)wire every input's onmidimessage and refresh the device list. Called on
  // initial access and on every statechange (plug / unplug).
  const wireInputs = useCallback(
    (access: MIDIAccess) => {
      const names: string[] = [];
      access.inputs.forEach((input) => {
        input.onmidimessage = handleMessage;
        names.push(input.name ?? 'MIDI device');
      });
      setDevices(names);
    },
    [handleMessage],
  );

  const requestAccess = useCallback(async () => {
    if (!supported) {
      setState('unsupported');
      return;
    }
    setState('requesting');
    try {
      const access = await navigator.requestMIDIAccess({ sysex: false });
      accessRef.current = access;
      access.onstatechange = () => wireInputs(access);
      wireInputs(access);
      setState('ready');
    } catch {
      setState('denied');
    }
  }, [supported, wireInputs]);

  // Auto-request on mount so the app "just works" without a connect button.
  useEffect(() => {
    if (supported) void requestAccess();
    return () => {
      const access = accessRef.current;
      if (access) {
        access.onstatechange = null;
        access.inputs.forEach((i) => (i.onmidimessage = null));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscribe = useCallback((fn: NoteListener) => {
    listenersRef.current.add(fn);
    return () => {
      listenersRef.current.delete(fn);
    };
  }, []);

  const mode: InputMode = devices.length > 0 ? 'connected' : 'untethered';

  return { supported, state, mode, devices, lastNote, requestAccess, subscribe };
}

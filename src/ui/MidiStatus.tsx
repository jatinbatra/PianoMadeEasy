import type { UseMidi } from '../midi/useMidi';

/**
 * A small honest status chip. It never blocks anything — untethered is a valid
 * way to practice, so the copy is neutral, not an error.
 */
export function MidiStatus({ midi }: { midi: UseMidi }) {
  let label: string;
  let tone: 'connected' | 'untethered' | 'wait';

  if (!midi.supported) {
    label = 'No MIDI in this browser — untethered mode';
    tone = 'untethered';
  } else if (midi.state === 'requesting') {
    label = 'Looking for your keyboard…';
    tone = 'wait';
  } else if (midi.mode === 'connected') {
    label = `Connected: ${midi.devices[0]}`;
    tone = 'connected';
  } else {
    label = 'No keyboard detected — untethered mode';
    tone = 'untethered';
  }

  return (
    <div className={`midi-chip ${tone}`}>
      <span className="dot" aria-hidden="true" />
      {label}
    </div>
  );
}

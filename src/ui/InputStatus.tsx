import type { Input } from '../input/useInput';

/**
 * Honest input status. Untethered is never an error — but if the mic is
 * available we offer it, so a laptop with no cable can still be scored.
 */
export function InputStatus({ input }: { input: Input }) {
  if (input.mode === 'midi') {
    return (
      <div className="midi-chip connected">
        <span className="dot" aria-hidden="true" />
        Connected: {input.devices[0]}
      </div>
    );
  }

  if (input.mode === 'mic') {
    return (
      <div className="mic-status">
        <div className="midi-chip mic">
          <span className="dot" aria-hidden="true" />
          Listening through the mic
        </div>
        <div className="mic-meter" aria-hidden="true">
          <div className="mic-fill" style={{ width: `${Math.round(input.micLevel * 100)}%` }} />
        </div>
        <button className="link-btn" onClick={input.disableMic}>
          Turn off mic
        </button>
      </div>
    );
  }

  // Touch (on-screen piano) — the default when there's no keyboard or mic.
  if (input.mode === 'touch') {
    return (
      <div className="mic-status">
        <div className="midi-chip mic">
          <span className="dot" aria-hidden="true" />
          On-screen piano — tap the keys to play
        </div>
        {input.micSupported && (
          <button className="btn-quiet" onClick={() => void input.enableMic()}>
            or use the microphone
          </button>
        )}
        <p className="mic-hint">
          {input.midiRequesting ? 'Looking for your keyboard…' : 'Plug in a keyboard any time for the real feel.'}
        </p>
      </div>
    );
  }

  // No audio at all (rare) — untethered.
  return (
    <div className="mic-status">
      <div className="midi-chip untethered">
        <span className="dot" aria-hidden="true" />
        No input — sessions still count for your streak
      </div>
    </div>
  );
}

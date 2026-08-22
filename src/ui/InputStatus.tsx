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

  // Untethered.
  return (
    <div className="mic-status">
      <div className="midi-chip untethered">
        <span className="dot" aria-hidden="true" />
        {input.midiRequesting ? 'Looking for your keyboard…' : 'No keyboard detected'}
      </div>
      {input.micSupported && (
        <button className="btn-secondary" onClick={() => void input.enableMic()}>
          🎤 Use microphone instead
        </button>
      )}
      <p className="mic-hint">No cable? Let the app listen and score you through the mic.</p>
    </div>
  );
}

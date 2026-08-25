import type { Input } from '../input/useInput';

/** In-session mic control: a live meter when the mic is on, or a one-tap way to
 *  turn it on (so you don't have to go back to the home screen). */
export function MicListening({ input }: { input: Input }) {
  if (input.mode === 'mic') {
    const pct = Math.min(100, Math.round(input.micLevel * 100));
    const hearing = pct > 6;
    return (
      <div className="mic-listening">
        <div className="mic-meter">
          <div className="mic-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="mic-listening-label">
          {hearing ? '🎤 Listening…' : 'Play a note — close and clear'}
        </span>
      </div>
    );
  }

  // Touch mode with a mic available: offer to switch on the spot.
  if (input.mode === 'touch' && input.micSupported) {
    return (
      <button className="hear-btn" onClick={() => void input.enableMic()}>
        🎤 Play a real piano? Turn on the mic
      </button>
    );
  }

  return null;
}

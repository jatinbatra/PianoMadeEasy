import type { Input } from '../input/useInput';

/** A tiny live meter shown during a session when the mic is the input, so it's
 *  obvious whether sound is getting in (and how loud). */
export function MicListening({ input }: { input: Input }) {
  if (input.mode !== 'mic') return null;
  const pct = Math.min(100, Math.round(input.micLevel * 100));
  const hearing = pct > 6;
  return (
    <div className="mic-listening">
      <div className="mic-meter">
        <div className="mic-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="mic-listening-label">
        {hearing ? '🎤 Listening…' : 'Play a note, close and clear'}
      </span>
    </div>
  );
}

import { useMemo, useState, type ReactNode } from 'react';
import { Keyboard } from './Keyboard';
import { noteName } from '../midi/notes';
import type { Input } from '../input/useInput';
import type { StreakInfo } from '../streak/streak';

interface HeroMetric {
  title: string;
  owned: number;
  total: number;
}

interface Props {
  input: Input;
  streak: StreakInfo;
  skillsLearned: number;
  hero: HeroMetric | null;
  previewLines: string[];
  onStart: (minutes: number) => void;
  onOpenProgress: () => void;
  onOpenSongs: () => void;
  onOpenSettings: () => void;
  onOpenPath: () => void;
  onOpenFreePlay: () => void;
  installSlot?: ReactNode;
}

const INVITATIONS = [
  'It’s grey out. Come play.',
  'Rain’s on. Five minutes.',
  'The mountain’s hidden today. Play anyway.',
  'Cold out there — warm in here.',
  'Home from the walk. Sit down.',
];

/** Home: a lit window. One clear action, an honest line, a quiet tab bar. */
export function Home({
  input,
  streak,
  skillsLearned,
  hero,
  previewLines,
  onStart,
  onOpenProgress,
  onOpenSongs,
  onOpenSettings,
  onOpenPath,
  onOpenFreePlay,
  installSlot,
}: Props) {
  const invite = useMemo(() => INVITATIONS[Math.floor(Math.random() * INVITATIONS.length)], []);
  const done = streak.practicedToday;
  const [lastKey, setLastKey] = useState<number | null>(null);

  return (
    <div className="home">
      <header className="masthead">
        <div className="mark">JatinSitDown</div>
        <div className="streak-chip" title="Day streak">
          <span className="flame">{streak.current > 0 ? '🔥' : '·'}</span>
          {streak.current}
        </div>
      </header>

      <div className="home-main">
        <h1 className="invite">{done ? 'That’s today, done.' : invite}</h1>

        {streak.freezeActive && <p className="freeze-line">Streak safe — your weekly skip has you covered.</p>}
        {streak.missedYesterday && <p className="nudge">Yesterday got away. Five minutes puts you back.</p>}

        <div className="today">
          <div className="today-head">
            <span>Today</span>
            <span className="today-sub">shaped by where you are</span>
          </div>
          <ol className="plan">
            {previewLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
          {hero && (
            <div className="song-progress-line">
              {hero.title} · {hero.owned}/{hero.total} chunks
              {skillsLearned > 0 ? ` · ${skillsLearned} skills` : ''}
            </div>
          )}
        </div>

        <div className="home-keys">
          <div className="home-keys-cap">
            {lastKey != null ? `That’s ${noteName(lastKey).replace(/\d/, '')}` : 'Warm up your fingers — tap a key'}
          </div>
          <Keyboard
            octaves={1}
            played={lastKey}
            onTap={(m) => {
              input.tapNote(m);
              setLastKey(m);
            }}
          />
        </div>
      </div>

      <div className="home-cta">
        <button className="btn-primary" onClick={() => onStart(5)}>
          <span>{done ? 'Play again' : 'Start today’s session'}</span>
          <span className="btn-sub">5 minutes · counts as a full day</span>
        </button>
        <div className="length-row">
          <span className="length-label">more time?</span>
          {[10, 30, 60].map((m) => (
            <button key={m} className="length-chip" onClick={() => onStart(m)}>
              {m}
            </button>
          ))}
          <button className="length-chip ghost" onClick={onOpenFreePlay}>
            free play
          </button>
        </div>
        <div className="input-note">{inputLabel(input)}</div>
      </div>

      {installSlot}

      <nav className="tabbar">
        <button onClick={onOpenPath}>Path</button>
        <button onClick={onOpenProgress}>Progress</button>
        <button onClick={onOpenSongs}>Songs</button>
        <button onClick={onOpenSettings}>Settings</button>
      </nav>
    </div>
  );
}

function inputLabel(input: Input): string {
  if (input.mode === 'midi') return `Keyboard: ${input.devices[0] ?? 'connected'}`;
  if (input.mode === 'mic') return 'Listening through the mic';
  if (input.mode === 'touch') return 'Tap the on-screen piano — or plug in a keyboard';
  return 'No input — sessions still count';
}

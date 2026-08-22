import { useCallback, useEffect, useState } from 'react';
import { useMidi } from './midi/useMidi';
import { Home } from './ui/Home';
import { SessionRunner } from './ui/SessionRunner';
import { Summary } from './ui/Summary';
import { computeStreak, type StreakInfo } from './streak/streak';
import { getAllDays, logPracticeDay, saveSession } from './db/repo';
import { getMeta, setMeta } from './db/db';
import type { SessionResult } from './types';

type Screen = 'home' | 'session' | 'summary';

export function App() {
  const midi = useMidi();
  const [screen, setScreen] = useState<Screen>('home');
  const [streak, setStreak] = useState<StreakInfo>({
    current: 0,
    practicedToday: false,
    missedYesterday: false,
  });
  const [lastResult, setLastResult] = useState<SessionResult | null>(null);
  const [isFirstSession, setIsFirstSession] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const refreshStreak = useCallback(async () => {
    const days = await getAllDays();
    setStreak(computeStreak(days));
    setIsFirstSession(days.length === 0);
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshStreak();
      const first = await getMeta<boolean>('everStarted', true);
      setIsFirstSession((prev) => prev && first);
      setLoaded(true);
    })();
  }, [refreshStreak]);

  const handleStart = useCallback(() => {
    void setMeta('everStarted', false);
    setScreen('session');
  }, []);

  const handleComplete = useCallback(
    async (result: SessionResult) => {
      // Write to IndexedDB first — the practiced day must survive anything.
      await saveSession(result);
      await logPracticeDay(result.mode, Math.round((result.finishedAt - result.startedAt) / 60000));
      await refreshStreak();
      setLastResult(result);
      setScreen('summary');
    },
    [refreshStreak],
  );

  if (!loaded) return <div className="loading">…</div>;

  return (
    <main className="app">
      {screen === 'home' && <Home midi={midi} streak={streak} onStart={handleStart} />}
      {screen === 'session' && (
        <SessionRunner
          midi={midi}
          isFirstSession={isFirstSession}
          onComplete={handleComplete}
          onQuit={() => setScreen('home')}
        />
      )}
      {screen === 'summary' && lastResult && (
        <Summary result={lastResult} streak={streak} onHome={() => setScreen('home')} />
      )}
    </main>
  );
}

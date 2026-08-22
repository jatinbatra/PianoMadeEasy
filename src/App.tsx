import { useCallback, useEffect, useState } from 'react';
import { useMidi } from './midi/useMidi';
import { Home } from './ui/Home';
import { SessionRunner, type AtomOutcome } from './ui/SessionRunner';
import { Summary } from './ui/Summary';
import { computeStreak, type StreakInfo } from './streak/streak';
import { getAllDays, logPracticeDay, saveSession, loadProgressMap, saveProgress, localDateKey } from './db/repo';
import { buildPlan, type DayPlan, type ProgressMap } from './atoms/scheduler';
import { review, qualityFromScore, newAtomProgress } from './atoms/sm2';
import type { SessionResult } from './types';

type Screen = 'home' | 'session' | 'summary';

export function App() {
  const midi = useMidi();
  const [screen, setScreen] = useState<Screen>('home');
  const [streak, setStreak] = useState<StreakInfo>({ current: 0, practicedToday: false, missedYesterday: false });
  const [progress, setProgress] = useState<ProgressMap>({});
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [lastResult, setLastResult] = useState<SessionResult | null>(null);
  const [lastGains, setLastGains] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const [days, map] = await Promise.all([getAllDays(), loadProgressMap()]);
    setStreak(computeStreak(days));
    setProgress(map);
  }, []);

  useEffect(() => {
    void (async () => {
      await refresh();
      setLoaded(true);
    })();
  }, [refresh]);

  const handleStart = useCallback(() => {
    setPlan(buildPlan(progress, localDateKey()));
    setScreen('session');
  }, [progress]);

  const handleComplete = useCallback(
    async (result: SessionResult, outcomes: AtomOutcome[]) => {
      const today = localDateKey();
      const map: ProgressMap = { ...progress };
      let gains = 0;

      // Update atom strengths from MIDI-measured outcomes only (never untethered).
      for (const o of outcomes) {
        if (!o.result) continue;
        const prev = map[o.atomId] ?? newAtomProgress(o.atomId, today);
        const updated = review(prev, qualityFromScore(o.result), today);
        if (updated.repetitions > prev.repetitions) gains += 1;
        map[o.atomId] = updated;
        await saveProgress(updated);
      }

      await saveSession(result);
      await logPracticeDay(result.mode, Math.round((result.finishedAt - result.startedAt) / 60000));
      await refresh();
      setProgress(map);
      setLastResult(result);
      setLastGains(gains);
      setScreen('summary');
    },
    [progress, refresh],
  );

  if (!loaded) return <div className="loading">…</div>;

  const skillsLearned = Object.values(progress).filter((p) => p.introduced).length;

  return (
    <main className="app">
      {screen === 'home' && (
        <Home midi={midi} streak={streak} skillsLearned={skillsLearned} onStart={handleStart} />
      )}
      {screen === 'session' && plan && (
        <SessionRunner midi={midi} plan={plan} onComplete={handleComplete} onQuit={() => setScreen('home')} />
      )}
      {screen === 'summary' && lastResult && (
        <Summary result={lastResult} streak={streak} atomsStrengthened={lastGains} onHome={() => setScreen('home')} />
      )}
    </main>
  );
}

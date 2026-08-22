import { useCallback, useEffect, useState } from 'react';
import { useInput } from './input/useInput';
import { Home } from './ui/Home';
import { SessionRunner, type AtomOutcome } from './ui/SessionRunner';
import { Summary } from './ui/Summary';
import { SongLibrary } from './ui/SongLibrary';
import { Progress } from './ui/Progress';
import { computeStreak, type StreakInfo } from './streak/streak';
import {
  getAllDays,
  logPracticeDay,
  saveSession,
  loadProgressMap,
  saveProgress,
  localDateKey,
  loadSongs,
  loadChunkProgressMap,
  getActiveSongId,
  saveChunkProgress,
} from './db/repo';
import { buildPlan, type DayPlan, type ProgressMap } from './atoms/scheduler';
import { review, qualityFromScore, newAtomProgress } from './atoms/sm2';
import { seedSongsIfEmpty } from './songs/seed';
import { lengthFor, DEFAULT_LENGTH, type SessionLength } from './session/lengths';
import { pickChunk, ownedCount, newChunkProgress, updateChunkProgress, chunkKey, type ChunkProgressMap, type ChunkAttempt } from './songs/ladder';
import type { Song, SongChunk } from './types/song';
import type { SessionResult, PracticeDay } from './types';

type Screen = 'home' | 'session' | 'summary' | 'songs' | 'progress';

export function App() {
  const input = useInput();
  const [screen, setScreen] = useState<Screen>('home');
  const [streak, setStreak] = useState<StreakInfo>({ current: 0, practicedToday: false, missedYesterday: false, freezeActive: false });
  const [days, setDays] = useState<PracticeDay[]>([]);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [chunkMap, setChunkMap] = useState<ChunkProgressMap>({});
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [sessionLength, setSessionLength] = useState<SessionLength>(DEFAULT_LENGTH);
  const [sessionSong, setSessionSong] = useState<{ song: Song; chunk: SongChunk } | null>(null);
  const [lastResult, setLastResult] = useState<SessionResult | null>(null);
  const [lastGains, setLastGains] = useState(0);
  const [lastChunkOwned, setLastChunkOwned] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const [days, atomMap, songList, chunks, activeId] = await Promise.all([
      getAllDays(),
      loadProgressMap(),
      loadSongs(),
      loadChunkProgressMap(),
      getActiveSongId(),
    ]);
    setStreak(computeStreak(days));
    setDays(days);
    setProgress(atomMap);
    setSongs(songList);
    setChunkMap(chunks);
    setActiveSong(songList.find((s) => s.id === activeId) ?? songList[0] ?? null);
  }, []);

  useEffect(() => {
    void (async () => {
      await seedSongsIfEmpty();
      await refresh();
      setLoaded(true);
    })();
  }, [refresh]);

  const handleStart = useCallback(
    (minutes: number) => {
      const length = lengthFor(minutes);
      setSessionLength(length);
      setPlan(buildPlan(progress, localDateKey(), length.recallLimit));
      if (activeSong) setSessionSong({ song: activeSong, chunk: pickChunk(activeSong, chunkMap, progress) });
      setScreen('session');
    },
    [progress, activeSong, chunkMap],
  );

  const handleComplete = useCallback(
    async (result: SessionResult, outcomes: AtomOutcome[], chunkAttempt: ChunkAttempt | null) => {
      const today = localDateKey();
      const map: ProgressMap = { ...progress };
      let gains = 0;

      for (const o of outcomes) {
        if (!o.result) continue;
        const prev = map[o.atomId] ?? newAtomProgress(o.atomId, today);
        const updated = review(prev, qualityFromScore(o.result), today);
        if (updated.repetitions > prev.repetitions) gains += 1;
        map[o.atomId] = updated;
        await saveProgress(updated);
      }

      // Chunk mastery — MIDI-measured only.
      let chunkOwned = false;
      const cMap = { ...chunkMap };
      if (chunkAttempt && sessionSong) {
        const { song, chunk } = sessionSong;
        const key = chunkKey(song.id, chunk.id);
        const prev = cMap[key] ?? newChunkProgress(song.id, chunk.id);
        const updated = updateChunkProgress(prev, chunkAttempt, song.bpm, today);
        chunkOwned = updated.owned && !prev.owned;
        cMap[key] = updated;
        await saveChunkProgress(updated);
      }

      await saveSession(result);
      await logPracticeDay(result.mode, Math.round((result.finishedAt - result.startedAt) / 60000));
      await refresh();
      setProgress(map);
      setChunkMap(cMap);
      setLastResult(result);
      setLastGains(gains);
      setLastChunkOwned(chunkOwned);
      setScreen('summary');
    },
    [progress, chunkMap, sessionSong, refresh],
  );

  if (!loaded) return <div className="loading">…</div>;

  const skillsLearned = Object.values(progress).filter((p) => p.introduced).length;
  const heroChunks = activeSong
    ? { title: activeSong.title, owned: ownedCount(activeSong, chunkMap), total: activeSong.chunks.length }
    : null;

  // Plain-language preview of what "Start" will do today.
  const previewPlan = buildPlan(progress, localDateKey(), DEFAULT_LENGTH.recallLimit);
  const previewLines: string[] = [
    previewPlan.recall.length > 0
      ? `Warm up ${previewPlan.recall.length} skill${previewPlan.recall.length === 1 ? '' : 's'} you've learned`
      : 'Quick warm-up',
    previewPlan.focus
      ? `${previewPlan.focus.mode === 'reteach' ? 'Revisit' : 'Learn'}: ${previewPlan.focus.atom.label}`
      : 'Lock in what’s slipping',
    `Play ${activeSong?.title ?? 'a song'}`,
  ];

  return (
    <main className="app">
      {screen === 'home' && (
        <Home
          input={input}
          streak={streak}
          skillsLearned={skillsLearned}
          hero={heroChunks}
          previewLines={previewLines}
          onStart={handleStart}
          onOpenProgress={() => setScreen('progress')}
          onOpenSongs={() => setScreen('songs')}
        />
      )}
      {screen === 'session' && plan && sessionSong && (
        <SessionRunner
          input={input}
          plan={plan}
          length={sessionLength}
          song={sessionSong.song}
          chunk={sessionSong.chunk}
          onComplete={handleComplete}
          onQuit={() => setScreen('home')}
        />
      )}
      {screen === 'summary' && lastResult && (
        <Summary
          result={lastResult}
          streak={streak}
          atomsStrengthened={lastGains}
          chunkOwned={lastChunkOwned}
          onHome={() => setScreen('home')}
        />
      )}
      {screen === 'progress' && (
        <Progress
          days={days}
          progress={progress}
          songs={songs}
          chunkMap={chunkMap}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'songs' && (
        <SongLibrary
          songs={songs}
          activeSongId={activeSong?.id ?? null}
          chunkMap={chunkMap}
          onChanged={refresh}
          onBack={() => setScreen('home')}
        />
      )}
    </main>
  );
}

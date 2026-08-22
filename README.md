# JatinSitDown

A piano practice PWA built to fight the one real problem: **showing up.** The
name is the whole idea — you're always out walking, so the app is one nudge to
*sit down* at the keys. It
opens to a single button — *Start today's session* — runs a 5-minute session,
measures what you played over MIDI, and tracks your streak. Missing a day is
never a failure screen.

> **Status: Phase 0.** MIDI + one hardcoded 5-minute session (warm-up → Find F →
> song time) + streak + offline PWA + device-local storage. No cloud sync,
> scoring engine, atom scheduler, or 7 Years yet — those are Phases 1–3 below.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (streak logic)
npm run build      # production build into dist/
```

Use **Chrome or Edge** — they support the Web MIDI API. Plug the Yamaha in via
USB TO HOST; the app finds it automatically. No keyboard? It runs in
**untethered mode** — the session still counts for your streak, it just doesn't
score you.

## Deploy (Vercel via GitHub)

1. Push this repo to GitHub (already done if you're reading this there).
2. Go to [vercel.com](https://vercel.com) → **Add New… → Project** → import this
   repo.
3. Vercel auto-detects Vite from `vercel.json` — just click **Deploy**. No
   settings to change.
4. You get a live URL. Open it in Chrome on your laptop and on your Android
   phone, then **Install** (browser menu → *Install app* / *Add to Home
   screen*).

That's it — it now opens from your home screen and runs fully offline.
`npm run deploy` is a CLI alternative if you ever want it.

## MIDI support (platform reality)

| Platform | Web MIDI | Best mode |
|---|---|---|
| Chrome / Edge desktop | ✅ full | Connected (keyboard) — full scoring |
| Chrome Android (USB-C OTG → keyboard) | ✅ | Connected (keyboard) — full scoring |
| iOS Safari | ❌ never | Mic or untethered |

**Input modes, chosen automatically:**

1. **Keyboard (MIDI)** — a keyboard is attached: full, exact scoring, chords included.
2. **Microphone** — no cable? Tap *use the microphone* and the app listens and
   scores the note you play. Monophonic, so **chords can't be checked by mic**.
3. **On-screen piano** — no hardware at all? Tap the keys on screen; they make
   sound and are scored. Anyone can play — handy for sharing with a friend who
   doesn't own a piano.
4. **Untethered** — a rare fallback (no audio support): the session still runs
   and the day still counts, just unscored.

A day practiced in any mode **counts for the streak.** The app never asks you to
self-assess — it measures, or it counts the day and moves on.

## Songs

The app is the engine; you load the songs. See [`songs/README.md`](songs/README.md)
for the JSON format. One public-domain example ships (`Mary Had a Little Lamb`).
Do **not** commit copyrighted arrangements — 7 Years and Bollywood songs are for
you to import locally (Phase 2).

## Roadmap

- **Phase 1** — skill-atom model, SM-2 spaced repetition, MIDI scoring module
  (with tests), re-teach-on-double-failure.
- **Phase 2** — song importer, chunk ladder, 7 Years, hero metric
  ("7 Years — 3 of 11 chunks owned").
- **Phase 3** — Supabase sync (laptop ↔ phone), longer sessions (10/30/60),
  weekly recap, calendar heatmap, practice-time notifications, streak freeze.
- **Phase 4 (future path, not built)** — mic-based pitch detection for an
  acoustic piano; on-demand plain-language explanations.

## Tech

Vite + React + TypeScript · Web MIDI API · IndexedDB (Dexie) · vite-plugin-pwa.

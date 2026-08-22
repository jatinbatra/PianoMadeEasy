# Songs

The app is the engine; **you** load the songs. This folder holds song data in a
small JSON format. One public-domain example ships here as the format reference:
`mary-had-a-little-lamb.json`.

## Copyright

**Do not commit copyrighted sheet music or full arrangements to this repo.**
7 Years, Bollywood songs, etc. are for *you* to import/enter locally (Phase 2
ships the importer). Only public-domain examples live in git.

## Format

```jsonc
{
  "id": "kebab-case-id",
  "title": "Display Title",
  "attribution": "Where this came from / why it's OK to ship",
  "bpm": 90,
  "chunks": [
    {
      "id": "phrase-1",
      "label": "Human label shown while practicing",
      "bars": "1-2",
      "requiresAtoms": ["find-note:E", "find-note:D"],  // skills this chunk needs
      "notes": [
        { "pitch": "E4", "beats": 1 },                  // "E4" = the E above middle C
        { "pitch": "C4", "beats": 2 }
      ],
      "chords": [                                        // optional
        { "symbol": "C", "pitches": ["C4", "E4", "G4"], "beats": 4 }
      ]
    }
  ]
}
```

- **pitch**: scientific pitch notation. Middle C is `C4`. Sharps use `#` (`F#3`).
- **beats**: length in beats at the song's `bpm`.
- **chunks**: ordered 4–8 bar pieces. A chunk unlocks when its `requiresAtoms`
  are strong enough (Phase 2), and is "owned" once played clean twice at target
  tempo on separate days.

Add a song by dropping a new JSON file here (and, from Phase 2, importing it in
the app).

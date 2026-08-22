// Scoring — Phase 1. Everything else depends on this being correct, so it lands
// with unit tests. Stubbed here now to reserve the module boundary.
//
// Intended shape:
//   score(expected: SongNote[], recorded: NoteEvent[], threshold): {
//     noteAccuracy: number;  // 0–1 correct pitches in order
//     timingAccuracy: number; // 0–1 within timing tolerance
//     pass: boolean;          // meets the atom's threshold
//   }
export {};

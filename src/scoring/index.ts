// Scoring — takes an expected note sequence + a recorded MIDI sequence and
// returns note accuracy, timing accuracy, and pass/fail. Everything else in the
// app depends on this being correct, so it's covered by score.test.ts.
export * from './score';

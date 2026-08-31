import { useState } from 'react';
import { Keyboard } from './Keyboard';
import { toSheet } from '../songs/hands';
import { playHands, playSong } from '../audio/play';
import { playNote } from '../audio/synth';
import { youtubeLink } from '../songs/links';
import type { Song } from '../types/song';

/**
 * A read-only songbook page: the whole song laid out in the teacher's notation
 * (both hands, chords, fingers, note letters, lyrics), with buttons to hear it.
 * No scoring, no drills, no timer — just read, listen, and play it yourself.
 */
export function SongSheet({ song, onBack, onPractice }: { song: Song; onBack: () => void; onPractice?: () => void }) {
  const [tapped, setTapped] = useState<number | null>(null);
  const anyTwoHand = song.chunks.some((c) => (c.leftHand?.length ?? 0) > 0);

  return (
    <div className="sheetpage">
      <header className="lib-head">
        <button className="link-btn" onClick={onBack}>
          ← Back
        </button>
        <h1>{song.title}</h1>
      </header>

      <div className="sheetpage-actions">
        <button className="btn-secondary" onClick={() => playSong(song)}>
          ▶ Hear the whole song{anyTwoHand ? ' (both hands)' : ''}
        </button>
        <a className="yt-link" href={youtubeLink(song)} target="_blank" rel="noopener noreferrer">
          ▶ Watch on YouTube
        </a>
      </div>

      {anyTwoHand && (
        <p className="sheet-legend-top">
          <span className="tl-blue">chord</span> = left hand · <b>number</b> = which finger · <b>letter</b> = note ·{' '}
          “-” = hold
        </p>
      )}

      {song.chunks.map((chunk) => {
        const bars = toSheet(chunk);
        const hasLyrics = chunk.notes.some((n) => n.lyric);
        return (
          <section key={chunk.id} className="sheetpage-line">
            <div className="sheetline-head">
              <span className="sheetline-label">{chunk.label}</span>
              <button className="link-btn hear-line" onClick={() => playHands(chunk, song.bpm)}>
                ▶ Hear this line
              </button>
            </div>
            <div className="tsheet-scroll">
              <div className="tsheet">
                {bars.map((bar, bi) => {
                  const prev = bi > 0 ? bars[bi - 1].chord : undefined;
                  const showChord = bar.chord && bar.chord !== prev;
                  return (
                    <div key={bi} className="tbar">
                      <div className="tbar-head">
                        <span className="tbar-fing">{showChord ? (bar.bassFinger ?? ' ') : ' '}</span>
                        <span className="tbar-chord">{showChord ? bar.chord : ' '}</span>
                      </div>
                      <div className="tbar-row">
                        {bar.cells.map((c, ci) => (
                          <span key={ci} className={'tcell' + (c.hold ? ' hold' : '')}>
                            <span className="tcell-fing">{c.finger ?? ' '}</span>
                            <span className="tcell-note">{c.letter}</span>
                          </span>
                        ))}
                      </div>
                      {hasLyrics && (
                        <div className="tbar-lyrics">
                          {bar.cells.map((c, ci) => (
                            <span key={ci} className="tcell-lyric">
                              {c.lyric ?? ' '}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      <div className="sheetpage-keys">
        <div className="sheetpage-keys-cap">
          {tapped != null ? 'Tap the keys to hear them' : 'Try the keys — tap to hear each note'}
        </div>
        <Keyboard
          onTap={(m) => {
            playNote(m);
            setTapped(m);
          }}
          played={tapped}
        />
      </div>

      {onPractice && (
        <button className="link-btn practice-instead" onClick={onPractice}>
          Or practice this with scoring →
        </button>
      )}
    </div>
  );
}

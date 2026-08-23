import { ATOMS } from '../atoms/catalog';
import { isDecayed } from '../atoms/sm2';
import { localDateKey } from '../db/repo';
import type { ProgressMap } from '../atoms/scheduler';
import type { Atom } from '../types/atom';

type State = 'strong' | 'due' | 'stuck' | 'next' | 'locked';

const LABEL: Record<State, string> = {
  strong: 'learned',
  due: 'review due',
  stuck: 'needs work',
  next: 'up next',
  locked: 'soon',
};

function stateOf(atom: Atom, progress: ProgressMap): State {
  const p = progress[atom.id];
  if (p?.introduced) {
    if (p.consecutiveFailures >= 2) return 'stuck';
    return isDecayed(p, localDateKey()) ? 'due' : 'strong';
  }
  const ready = atom.prerequisites.every((pid) => {
    const pp = progress[pid];
    return pp?.introduced && pp.repetitions >= 1;
  });
  return ready ? 'next' : 'locked';
}

interface Stage {
  title: string;
  blurb: string;
  match: (id: string) => boolean;
}

const STAGES: Stage[] = [
  { title: 'The white keys', blurb: 'Where every note lives under your hands.', match: (id) => id.startsWith('find-note') },
  { title: 'The black keys', blurb: 'Sharps and flats — the notes between the notes.', match: (id) => id.startsWith('accidental') },
  { title: 'Reading music', blurb: 'See a note on the staff, then play it.', match: (id) => id.startsWith('read-note') },
  { title: 'Distances', blurb: 'Steps, skips, and bigger leaps between notes.', match: (id) => id.startsWith('interval') },
  { title: 'Chords', blurb: 'Notes stacked together — the colour of a song.', match: (id) => id.startsWith('chord') },
  { title: 'Arpeggios', blurb: 'Chords rolled out — how chords turn into melody.', match: (id) => id.startsWith('arpeggio') },
  { title: 'Scales', blurb: 'The ladders songs are built from.', match: (id) => id.startsWith('scale') },
  { title: 'Rhythm', blurb: 'Playing in time — the pulse under everything.', match: (id) => id.startsWith('rhythm') },
];

/** The whole curriculum, visible: what you'll learn, in order, and where you are. */
export function Path({ progress, onBack }: { progress: ProgressMap; onBack: () => void }) {
  return (
    <div className="progress-screen">
      <header className="lib-head">
        <button className="link-btn" onClick={onBack}>
          ← Back
        </button>
        <h1>Your path</h1>
      </header>
      <p className="path-intro">
        Every session pulls from here automatically — you never have to choose. This is just so you
        can see the whole road.
      </p>

      {STAGES.map((stage) => {
        const atoms = ATOMS.filter((a) => stage.match(a.id));
        if (atoms.length === 0) return null;
        const done = atoms.filter((a) => stateOf(a, progress) === 'strong').length;
        return (
          <section className="card stage" key={stage.title}>
            <div className="stage-head">
              <h3>{stage.title}</h3>
              <span className="song-meta">
                {done}/{atoms.length}
              </span>
            </div>
            <p className="stage-blurb">{stage.blurb}</p>
            <ul className="path-list">
              {atoms.map((a) => {
                const st = stateOf(a, progress);
                return (
                  <li key={a.id} className={'path-row ' + st}>
                    <span className="path-mark" aria-hidden="true" />
                    <span className="path-body">
                      <span className="path-name">{a.label}</span>
                      <span className="path-concept">{a.teach[0].title}</span>
                    </span>
                    <span className={`pill ${st}`}>{LABEL[st]}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

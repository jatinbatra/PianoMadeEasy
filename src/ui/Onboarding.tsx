import { useState } from 'react';

const KEY = 'jsd:onboarded';

/** Has the one-time intro already been seen on this device? */
export function needsOnboarding(): boolean {
  try {
    return localStorage.getItem(KEY) !== '1';
  } catch {
    return false; // storage blocked — don't nag, just skip
  }
}

function markDone(): void {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
}

interface Slide {
  kicker: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    kicker: 'The whole idea',
    title: 'Just sit down.',
    body: 'The hard part of piano isn’t your fingers — it’s showing up. So there are no choices to make. One button, five minutes, and today counts. That’s a full streak day.',
  },
  {
    kicker: 'How it works',
    title: 'It listens. You play.',
    body: 'Plug in a keyboard, turn on the mic for a real piano, or tap the on-screen keys. It scores what it actually hears — you’ll never be asked “did you get it right?”',
  },
  {
    kicker: 'Every single time',
    title: 'You always end on a song.',
    body: 'A short warm-up, one new skill, then real song time — every session. You own the song one small chunk at a time, and it speeds up as you get better.',
  },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const slide = SLIDES[i];

  function finish() {
    markDone();
    onDone();
  }

  return (
    <div className="onb">
      <div className="onb-card">
        <button className="onb-skip" onClick={finish}>
          Skip
        </button>

        <div className="onb-body">
          <div className="onb-kicker">{slide.kicker}</div>
          <h1 className="onb-title">{slide.title}</h1>
          <p className="onb-text">{slide.body}</p>
        </div>

        <div className="onb-dots" aria-hidden="true">
          {SLIDES.map((_, d) => (
            <span key={d} className={'onb-dot' + (d === i ? ' on' : '')} />
          ))}
        </div>

        <button className="btn-primary onb-next" onClick={() => (last ? finish() : setI(i + 1))}>
          {last ? 'Let’s sit down →' : 'Next'}
        </button>
      </div>
    </div>
  );
}

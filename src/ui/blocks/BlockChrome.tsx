import type { ReactNode } from 'react';

interface Props {
  title: string;
  /** Seconds left in this block. */
  remaining: number;
  blockIndex: number;
  blockCount: number;
  children: ReactNode;
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/** Shared frame around each block: title, block progress dots, and the timer. */
export function BlockChrome({ title, remaining, blockIndex, blockCount, children }: Props) {
  return (
    <div className="block">
      <header className="block-head">
        <div className="block-dots" aria-label={`Block ${blockIndex + 1} of ${blockCount}`}>
          {Array.from({ length: blockCount }, (_, i) => (
            <span key={i} className={'dot' + (i <= blockIndex ? ' on' : '')} />
          ))}
        </div>
        <h2 className="block-title">{title}</h2>
        <div className="block-timer" aria-live="off">{fmt(remaining)}</div>
      </header>
      <div className="block-body">{children}</div>
    </div>
  );
}

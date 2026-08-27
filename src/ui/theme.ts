/**
 * Theme choice: follow the device ('system') or pin light/dark. The pinned
 * choice writes a `data-theme` attribute on <html> that the CSS honours over
 * the `prefers-color-scheme` media query. Stored in localStorage (not the DB)
 * so it applies instantly on first paint, before React mounts.
 */
export type ThemeChoice = 'system' | 'light' | 'dark';

const KEY = 'jsd:theme';

export function getTheme(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* private mode / blocked storage — fall through to system */
  }
  return 'system';
}

export function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;
  if (choice === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', choice);
  try {
    if (choice === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    /* ignore — the attribute is still applied for this session */
  }
}

/** Apply the saved choice as early as possible to avoid a theme flash. */
export function initTheme(): void {
  applyTheme(getTheme());
}

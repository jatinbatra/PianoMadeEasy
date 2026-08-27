/**
 * Add-to-home-screen plumbing. The browser fires `beforeinstallprompt` once,
 * often before React has mounted, so we capture it at module load and let the
 * UI subscribe. Only Chromium-family browsers fire it; elsewhere `canInstall`
 * stays false and the prompt simply never shows.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const subs = new Set<() => void>();

function emit() {
  for (const fn of subs) fn();
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    emit();
  });
}

export function canInstall(): boolean {
  return deferred != null;
}

export function subscribeInstall(fn: () => void): () => void {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  emit();
  return outcome === 'accepted';
}

/** Already running as an installed app? Then never show the invite. */
export function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

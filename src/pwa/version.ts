// Build stamp injected by Vite at build time (see vite.config.ts).
declare const __BUILD_ID__: string;

export const BUILD_ID: string = typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev';

/**
 * The nuclear "get the newest version now" button. Updates and drops the
 * service worker, deletes every cache, then reloads — so a stale, cached PWA
 * can never keep showing an old build.
 */
export async function forceUpdate(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    /* ignore — reload anyway */
  }
  // Cache-bust the navigation so the very next load can't be served from cache.
  location.replace(location.pathname + '?v=' + Date.now());
}

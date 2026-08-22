import { getMeta, setMeta } from '../db/db';
import { hasPracticedToday, localDateKey } from '../db/repo';

// Practice reminders. This is a best-effort *local* notification: it fires when
// the app is open (or its tab/PWA is alive) at/after the set time on a day not
// yet practiced. True server push (background when fully closed) needs a push
// service + VAPID keys — a later addition; this already serves the daily nudge.

export const notifySupported = typeof Notification !== 'undefined';

export async function getReminderTime(): Promise<string | null> {
  return getMeta<string | null>('reminderTime', null);
}

/** Ask permission and store the time (HH:MM). Returns why if it couldn't. */
export async function enableReminder(time: string): Promise<'ok' | 'unsupported' | 'denied'> {
  if (!notifySupported) return 'unsupported';
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return 'denied';
  await setMeta('reminderTime', time);
  return 'ok';
}

export async function disableReminder(): Promise<void> {
  await setMeta('reminderTime', null);
}

/** Fire the nudge once/day if it's past the set time and today isn't practiced. */
export async function maybeNotify(): Promise<void> {
  if (!notifySupported || Notification.permission !== 'granted') return;
  const time = await getReminderTime();
  if (!time) return;
  if (await hasPracticedToday()) return;

  const today = localDateKey();
  const last = await getMeta<string>('reminderLast', '');
  if (last === today) return;

  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  const past = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
  if (!past) return;

  new Notification('JatinSitDown', { body: 'Five minutes at the keys?', tag: 'practice-reminder' });
  await setMeta('reminderLast', today);
}

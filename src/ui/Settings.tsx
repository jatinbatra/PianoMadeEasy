import { useEffect, useRef, useState } from 'react';
import { notifySupported, getReminderTime, enableReminder, disableReminder } from '../notify/notify';
import { supabase, supabaseEnabled } from '../sync/supabase';
import { syncNow } from '../sync/sync';
import { exportAll, importAll, localDateKey } from '../db/repo';
import { getTheme, applyTheme, type ThemeChoice } from './theme';

export function Settings({ onBack, onSynced }: { onBack: () => void; onSynced: () => void }) {
  const [time, setTime] = useState('18:00');
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [account, setAccount] = useState<string | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const [dataMsg, setDataMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [theme, setThemeState] = useState<ThemeChoice>('system');

  useEffect(() => {
    setThemeState(getTheme());
    void (async () => {
      const t = await getReminderTime();
      if (t) {
        setTime(t);
        setReminderOn(true);
      }
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        setAccount(data.user?.email ?? null);
      }
    })();
  }, []);

  async function toggleReminder() {
    if (reminderOn) {
      await disableReminder();
      setReminderOn(false);
      setReminderMsg('Reminders off.');
    } else {
      const r = await enableReminder(time);
      if (r === 'ok') {
        setReminderOn(true);
        setReminderMsg(`Reminder set for ${time}.`);
      } else if (r === 'denied') setReminderMsg('Notifications were blocked in the browser.');
      else setReminderMsg("This browser can't show notifications.");
    }
  }

  async function sendLink() {
    if (!supabase || !email) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    setSyncMsg(error ? error.message : `Magic link sent to ${email}. Open it on this device.`);
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setAccount(null);
    setSyncMsg('Signed out.');
  }

  async function doSync() {
    setSyncMsg('Syncing…');
    const r = await syncNow();
    setSyncMsg(r.synced ? 'Synced.' : r.reason === 'signed-out' ? 'Sign in first.' : 'Sync not configured.');
    if (r.synced) onSynced();
  }

  async function downloadBackup() {
    try {
      const data = await exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jatinsitdown-backup-${localDateKey()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      const n = data.days.length;
      setDataMsg(`Saved a backup of ${n} practice ${n === 1 ? 'day' : 'days'} and all your songs.`);
    } catch {
      setDataMsg("Couldn't make a backup just now.");
    }
  }

  function chooseTheme(choice: ThemeChoice) {
    setThemeState(choice);
    applyTheme(choice);
  }

  async function restoreBackup(file: File) {
    setDataMsg('Restoring…');
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await importAll(parsed);
      setDataMsg('Restored. Your progress is back.');
      onSynced();
    } catch (e) {
      setDataMsg(e instanceof Error ? e.message : "That file couldn't be read.");
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="progress-screen">
      <header className="lib-head">
        <button className="link-btn" onClick={onBack}>
          ← Back
        </button>
        <h1>Settings</h1>
      </header>

      <section className="card">
        <h3>Practice reminder</h3>
        {notifySupported ? (
          <div className="settings-row">
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="time-input" />
            <button className="btn-secondary" onClick={toggleReminder}>
              {reminderOn ? 'Turn off' : 'Turn on'}
            </button>
          </div>
        ) : (
          <p className="hint">This browser can't show notifications.</p>
        )}
        {reminderMsg && <p className="hint">{reminderMsg}</p>}
      </section>

      <section className="card">
        <h3>Sync (laptop ↔ phone)</h3>
        {!supabaseEnabled ? (
          <p className="hint">
            Not set up. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, run{' '}
            <code>supabase/schema.sql</code>, and redeploy to sync across devices.
          </p>
        ) : account ? (
          <div className="settings-col">
            <p className="hint">Signed in as {account}</p>
            <div className="settings-row">
              <button className="btn-secondary" onClick={doSync}>
                Sync now
              </button>
              <button className="link-btn" onClick={signOut}>
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="settings-col">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="time-input"
            />
            <button className="btn-secondary" onClick={sendLink}>
              Send magic link
            </button>
          </div>
        )}
        {syncMsg && <p className="hint">{syncMsg}</p>}
      </section>

      <section className="card">
        <h3>Appearance</h3>
        <div className="seg">
          {(['system', 'light', 'dark'] as ThemeChoice[]).map((c) => (
            <button
              key={c}
              className={'seg-btn' + (theme === c ? ' active' : '')}
              onClick={() => chooseTheme(c)}
            >
              {c === 'system' ? 'Auto' : c === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
        <p className="hint">“Auto” follows your device. Rainy-night dark, foggy-day light.</p>
      </section>

      <section className="card">
        <h3>Your data</h3>
        <p className="hint">
          Everything lives on this device. Save a backup file now and then — then you can restore your
          streak and songs on a new phone or after clearing the browser.
        </p>
        <div className="settings-row">
          <button className="btn-secondary" onClick={downloadBackup}>
            Download backup
          </button>
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
            Restore from file
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void restoreBackup(f);
          }}
        />
        {dataMsg && <p className="hint">{dataMsg}</p>}
      </section>

      <section className="card">
        <h3>About</h3>
        <p className="hint">
          Your streak, progress and songs stay on this device. The mic listens in real time and is never
          recorded. See the Privacy Policy and Terms in the project for the full detail.
        </p>
        <a
          className="btn-secondary"
          href="mailto:jatindecoded@gmail.com?subject=JatinSitDown%20feedback&body=What%20happened%3A%0A%0AWhat%20I%20expected%3A%0A%0ADevice%2Fbrowser%3A"
        >
          Send feedback
        </a>
      </section>
    </div>
  );
}

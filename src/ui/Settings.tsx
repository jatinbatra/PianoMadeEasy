import { useEffect, useState } from 'react';
import { notifySupported, getReminderTime, enableReminder, disableReminder } from '../notify/notify';
import { supabase, supabaseEnabled } from '../sync/supabase';
import { syncNow } from '../sync/sync';

export function Settings({ onBack, onSynced }: { onBack: () => void; onSynced: () => void }) {
  const [time, setTime] = useState('18:00');
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [account, setAccount] = useState<string | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  useEffect(() => {
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
        <h3>About</h3>
        <p className="hint">
          Your streak, progress and songs stay on this device. The mic listens in real time and is never
          recorded. See the Privacy Policy and Terms in the project for the full detail.
        </p>
        <p className="hint">Questions or feedback: jatindecoded@gmail.com</p>
      </section>
    </div>
  );
}

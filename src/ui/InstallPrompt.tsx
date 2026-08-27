import { useEffect, useState } from 'react';
import { canInstall, subscribeInstall, promptInstall, isStandalone } from '../pwa/install';

const DISMISS_KEY = 'jsd:install-dismissed';

function dismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * A quiet "add to your home screen" invite — only when the browser actually
 * offers it, never in an already-installed window, and gone for good once
 * dismissed. One tap from the home screen is one fewer reason not to sit down.
 */
export function InstallPrompt() {
  const [available, setAvailable] = useState(canInstall());
  const [gone, setGone] = useState(dismissed());

  useEffect(() => subscribeInstall(() => setAvailable(canInstall())), []);

  if (!available || gone || isStandalone()) return null;

  function close() {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setGone(true);
  }

  async function install() {
    const accepted = await promptInstall();
    if (accepted) setGone(true);
  }

  return (
    <div className="install-invite">
      <span className="install-text">Add JatinSitDown to your home screen — one tap to start.</span>
      <div className="install-actions">
        <button className="btn-secondary install-yes" onClick={install}>
          Add
        </button>
        <button className="link-btn" onClick={close} aria-label="Dismiss">
          Not now
        </button>
      </div>
    </div>
  );
}

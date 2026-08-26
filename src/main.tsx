import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './ui/ErrorBoundary';
import './styles.css';

// Crash reporting — only when a DSN is configured, and lazy-loaded so the
// Sentry SDK isn't in the bundle for anyone who hasn't set it up.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (sentryDsn) {
  void import('@sentry/react')
    .then((Sentry) => Sentry.init({ dsn: sentryDsn, tracesSampleRate: 0 }))
    .catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

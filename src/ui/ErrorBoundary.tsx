import { Component, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/** Last line of defence: a crash shows a friendly recover screen, never blank. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="crash">
          <h1>Something hiccuped</h1>
          <p>Your streak and progress are safe on this device.</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch() {
    // intentionally no-op: the UI shows the error inline
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page">
          <div className="empty-state">
            <div className="icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p className="muted">
              {this.state.error.message ?? "Unknown error"}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

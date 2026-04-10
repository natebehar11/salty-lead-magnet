'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Label shown in the fallback UI to indicate which panel failed */
  panelName: string;
}

interface State {
  hasError: boolean;
}

export default class PlannerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[PlannerErrorBoundary:${this.props.panelName}]`, error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <p className="font-display text-lg text-salty-deep-teal mb-2">
            Something went wrong
          </p>
          <p className="font-body text-sm text-salty-slate/50 mb-4">
            The {this.props.panelName} ran into an issue. Try again.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 rounded-xl bg-salty-deep-teal text-white font-body text-sm hover:bg-salty-deep-teal/90 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

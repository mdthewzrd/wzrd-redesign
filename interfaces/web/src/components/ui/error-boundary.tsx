import React, { Component, type ErrorInfo as ReactErrorInfo, type ReactNode } from 'react';
import { XCircle, AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ReactErrorInfo;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo?: ReactErrorInfo) => void;
  showDetails?: boolean;
}

export class ErrorBoundary extends Component<Props, ErrorBoundaryState> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ReactErrorInfo) {
    // Call onError prop if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-6 min-h-[400px]">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-destructive/10">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>

            <div className="space-y-4 text-left">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Something went wrong
              </h2>

              <p className="text-muted-foreground mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>

              {this.props.showDetails && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-accent hover:text-accent/80">
                    Error Details
                  </summary>
                  <div className="mt-2 p-4 rounded-lg bg-secondary/30 text-sm">
                    {this.state.errorInfo?.componentStack && (
                      <div className="mt-2">
                        <p className="font-medium text-destructive mb-1">Component Stack</p>
                        <pre className="whitespace-pre-wrap break-all text-xs overflow-auto max-h-48">
                          <code>{this.state.errorInfo.componentStack}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-6 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

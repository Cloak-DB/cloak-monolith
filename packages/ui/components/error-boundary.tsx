'use client';

import * as React from 'react';
import { Button } from './button';
import { Alert, AlertTitle, AlertDescription } from './alert';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  resetError,
}: ErrorBoundaryFallbackProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Alert variant="error">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            <p className="mb-4">{error.message}</p>
            <div className="flex gap-2">
              <Button onClick={resetError} variant="outline">
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="outline"
              >
                Go Home
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 rounded-lg border-2 border-black bg-gray-50 p-4">
            <p className="font-mono text-xs font-bold mb-2">Stack Trace:</p>
            <pre className="font-mono text-xs whitespace-pre-wrap overflow-auto max-h-64">
              {error.stack}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Page error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

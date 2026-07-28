'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-destructive/30 p-8 text-center bg-destructive/5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight">Something went wrong</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            An unexpected error occurred while processing this request.
          </p>
          {this.state.error && (
            <pre className="mt-4 max-h-[100px] w-full overflow-auto rounded-md bg-muted p-3 text-left text-xs font-mono text-muted-foreground">
              {this.state.error.message}
            </pre>
          )}
          <Button onClick={this.handleReset} className="mt-6" variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

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
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[3px] border border-dashed border-rule-strong p-8 text-center bg-paper-raised">
          <div className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-destructive">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink">Something went wrong</h3>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            An unexpected error occurred while processing this request.
          </p>
          {this.state.error && (
            <pre className="mt-4 max-h-[100px] w-full overflow-auto rounded-[3px] border border-rule bg-paper-deep p-3 text-left text-xs font-label text-ink-muted">
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

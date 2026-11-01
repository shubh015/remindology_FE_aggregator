import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex w-full rounded-md border bg-paper-raised px-4 py-3 text-sm leading-relaxed transition-colors',
          'placeholder:text-ink-faint',
          'focus:outline-none focus:ring-1 focus:ring-ink focus:border-ink',
          'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
          error
            ? 'border-destructive focus:ring-destructive'
            : 'border-input',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };

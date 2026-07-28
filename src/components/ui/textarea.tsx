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
          'flex w-full rounded-xl border bg-background/60 px-4 py-3 text-sm leading-relaxed shadow-sm transition-colors',
          'placeholder:text-muted-foreground/50',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40',
          'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
          error
            ? 'border-destructive focus:ring-destructive/30'
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

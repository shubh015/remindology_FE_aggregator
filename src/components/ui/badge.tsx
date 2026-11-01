import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-[2px] border px-2 py-0.5 font-label text-[10.5px] font-medium uppercase tracking-[0.12em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-ink bg-ink text-paper": variant === 'default',
          "border-rule bg-paper-gray text-ink-soft": variant === 'secondary',
          "border-[oklch(52%_.16_35/.3)] bg-[oklch(52%_.16_35/.1)] text-[oklch(52%_.16_35)]": variant === 'destructive',
          "border-rule-strong bg-transparent text-ink-muted": variant === 'outline',
          "border-rule-strong bg-paper-gray text-ink": variant === 'success',
          "border-gold/55 bg-gold/15 text-ink": variant === 'warning',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };

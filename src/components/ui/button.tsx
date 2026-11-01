import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": variant === 'default',
            "border border-destructive/35 bg-transparent text-destructive hover:bg-destructive/8 hover:border-destructive/60": variant === 'destructive',
            "border border-rule-strong bg-transparent text-ink hover:border-ink hover:bg-paper-deep": variant === 'outline',
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === 'secondary',
            "hover:bg-accent hover:text-accent-foreground": variant === 'ghost',
            "text-primary underline-offset-4 hover:underline": variant === 'link',
          },
          {
            "h-9 px-4 py-2": size === 'default',
            "h-8 rounded-[6px] px-3 text-xs": size === 'sm',
            "h-10 rounded-[6px] px-8": size === 'lg',
            "h-9 w-9": size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };

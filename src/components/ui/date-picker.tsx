'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar, fromISO } from '@/components/ui/calendar';

interface DatePickerProps {
  value?: string;                 // ISO YYYY-MM-DD
  onChange: (iso: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  invalid?: boolean;
}

function formatLabel(iso?: string): string | null {
  const d = fromISO(iso);
  if (!d) return null;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

export function DatePicker({ value, onChange, min, max, placeholder = 'Select a date', id, className, invalid }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const label = formatLabel(value);

  return (
    <div className="relative" ref={rootRef}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 text-sm transition-colors',
          'hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring/40 cursor-pointer',
          invalid ? 'border-destructive' : 'border-input',
          className,
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className={cn('flex-1 text-left', label ? 'text-foreground' : 'text-muted-foreground')}>
          {label ?? placeholder}
        </span>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2 rounded-2xl border border-border bg-popover p-3 shadow-xl shadow-primary/10"
          role="dialog"
        >
          <Calendar
            value={value}
            min={min}
            max={max}
            onSelect={(iso) => {
              onChange(iso);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

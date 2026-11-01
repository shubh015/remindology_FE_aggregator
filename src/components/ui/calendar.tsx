'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Date helpers (timezone-safe, no external deps) ────────────────
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISO(s?: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface CalendarProps {
  /** Selected date, ISO string YYYY-MM-DD */
  value?: string;
  onSelect: (iso: string) => void;
  /** Earliest selectable date, ISO string */
  min?: string;
  /** Latest selectable date, ISO string */
  max?: string;
  className?: string;
}

export function Calendar({ value, onSelect, min, max, className }: CalendarProps) {
  const selected = fromISO(value);
  const minDate = fromISO(min);
  const maxDate = fromISO(max);
  const today = new Date();

  // The month currently displayed — defaults to selected date, else today
  const [view, setView] = useState(() => {
    const base = selected ?? today;
    return { year: base.getFullYear(), month: base.getMonth() };
  });

  const firstOfMonth = new Date(view.year, view.month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  // Build a 6-row (42-cell) grid so height never jumps between months
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.year, view.month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);

  function shiftMonth(delta: number) {
    setView(v => {
      const m = v.month + delta;
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  }

  function isDisabled(d: Date) {
    if (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
    return false;
  }

  return (
    <div className={cn('w-[280px] select-none', className)}>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="h-8 w-8 flex items-center justify-center rounded-md text-ink-muted hover:bg-paper-gray hover:text-ink transition-colors cursor-pointer"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-ink">
          {MONTHS[view.month]} {view.year}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="h-8 w-8 flex items-center justify-center rounded-md text-ink-muted hover:bg-paper-gray hover:text-ink transition-colors cursor-pointer"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(w => (
          <div key={w} className="h-8 flex items-center justify-center font-label text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-muted">
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="h-9" />;
          const isSelected = selected && sameDay(d, selected);
          const isToday = sameDay(d, today);
          const disabled = isDisabled(d);
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(toISO(d))}
              className={cn(
                'h-9 rounded-[3px] text-sm font-medium tabular-nums flex items-center justify-center transition-colors cursor-pointer',
                isSelected && 'bg-ink text-paper font-semibold hover:bg-ink',
                !isSelected && isToday && 'text-ink font-semibold ring-1 ring-gold',
                !isSelected && !isToday && 'text-ink-soft hover:bg-paper-gray',
                disabled && 'opacity-30 pointer-events-none',
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

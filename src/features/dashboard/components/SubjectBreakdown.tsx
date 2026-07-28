'use client';

import { LayoutGrid } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { activeSubjects } from '@/features/dashboard/utils/content-insights';
import type { ContentStats, SubjectKey } from '@/features/dashboard/utils/content-insights';

// Hex colours for inline styles (Tailwind purges dynamic classes)
const SUBJECT_HEX: Record<SubjectKey, string> = {
  GS1:              '#8B5CF6',
  GS2:              '#3B82F6',
  GS3:              '#10B981',
  GS4:              '#F59E0B',
  'Current Affairs': '#F43F5E',
  Essay:            '#6366F1',
  CSAT:             '#14B8A6',
  General:          '#94A3B8',
};

interface SubjectBreakdownProps {
  stats: ContentStats | null;
  isLoading: boolean;
}

export function SubjectBreakdown({ stats, isLoading }: SubjectBreakdownProps) {
  const subjects  = stats ? activeSubjects(stats.subjectCounts) : [];
  const total     = subjects.reduce((s, x) => s + x.count, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <LayoutGrid className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Coverage Map</h3>
            <p className="text-[10px] text-muted-foreground">Materials by paper</p>
          </div>
        </div>
        {!isLoading && total > 0 && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/8 text-primary">
            {total} total
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2.5 flex-1">
          <Skeleton className="h-3 w-full rounded-full" />
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-9 w-full rounded-xl" />)}
        </div>
      ) : subjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4 text-center gap-2">
          <LayoutGrid className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">Upload content to see your coverage map.</p>
        </div>
      ) : (
        <>
          {/* Stacked distribution bar */}
          <div className="flex h-2.5 w-full rounded-full overflow-hidden gap-px">
            {subjects.map(({ key, count }) => (
              <div
                key={key}
                className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${(count / total) * 100}%`,
                  background: SUBJECT_HEX[key],
                  minWidth: 4,
                }}
                title={`${key}: ${count}`}
              />
            ))}
          </div>

          {/* Subject rows */}
          <div className="space-y-1.5 flex-1">
            {subjects.map(({ key, count, meta }) => {
              const pct = Math.round((count / total) * 100);
              const hex = SUBJECT_HEX[key];
              return (
                <div
                  key={key}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors hover:bg-secondary/50"
                  style={{ border: `1px solid ${hex}18` }}
                >
                  {/* Colour dot */}
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: hex }} />

                  {/* Label */}
                  <span className="text-xs font-semibold text-foreground flex-1 truncate">{meta.label}</span>

                  {/* Pill bar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-14 h-1.5 rounded-full overflow-hidden bg-secondary">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: hex }}
                      />
                    </div>
                    <span className="text-[11px] font-bold w-7 text-right tabular-nums" style={{ color: hex }}>
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend dots row */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {subjects.map(({ key, meta }) => (
              <span key={key} className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: SUBJECT_HEX[key] }} />
                {meta.label.replace('GS Paper ', 'GS').replace('Current Affairs', 'CA')}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

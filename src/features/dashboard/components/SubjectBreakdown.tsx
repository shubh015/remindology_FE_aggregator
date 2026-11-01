'use client';

import { LayoutGrid } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { activeSubjects } from '@/features/dashboard/utils/content-insights';
import type { ContentStats } from '@/features/dashboard/utils/content-insights';

// Monochrome ramp for the stacked distribution bar — segments differ by
// tone only (ordered by position), every subject row is styled identically.
const BAR_SHADES = [
  'var(--color-ink)',
  'var(--color-ink-muted)',
  'var(--color-ink-faint)',
  'oklch(78% 0 0)',
  'oklch(86% 0 0)',
];

interface SubjectBreakdownProps {
  stats: ContentStats | null;
  isLoading: boolean;
}

export function SubjectBreakdown({ stats, isLoading }: SubjectBreakdownProps) {
  const subjects  = stats ? activeSubjects(stats.subjectCounts) : [];
  const total     = subjects.reduce((s, x) => s + x.count, 0);

  return (
    <div className="ks-card p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[3px] border border-rule bg-paper-deep">
            <LayoutGrid className="h-4 w-4 text-ink" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Coverage Map</h3>
            <p className="font-label text-[10px] uppercase tracking-[0.12em] text-ink-muted">Materials by paper</p>
          </div>
        </div>
        {!isLoading && total > 0 && (
          <span className="ks-tag tabular-nums">
            {total} total
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2.5 flex-1">
          <Skeleton className="h-3 w-full rounded-full" />
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-9 w-full" />)}
        </div>
      ) : subjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4 text-center gap-2">
          <LayoutGrid className="h-8 w-8 text-ink-faint" />
          <p className="text-xs text-ink-muted">Upload content to see your coverage map.</p>
        </div>
      ) : (
        <>
          {/* Stacked distribution bar */}
          <div className="flex h-2.5 w-full rounded-full overflow-hidden gap-px">
            {subjects.map(({ key, count }, i) => (
              <div
                key={key}
                className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${(count / total) * 100}%`,
                  background: BAR_SHADES[Math.min(i, BAR_SHADES.length - 1)],
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
              return (
                <div
                  key={key}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-[2px] border border-rule transition-colors hover:bg-paper-deep"
                >

                  {/* Label */}
                  <span className="text-xs font-semibold text-ink flex-1 truncate">{meta.label}</span>

                  {/* Pill bar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-14 h-1.5 rounded-full overflow-hidden bg-paper-gray">
                      <div
                        className="h-full rounded-full bg-ink transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold w-7 text-right tabular-nums text-ink">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend dots row */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-rule">
            {subjects.map(({ key, meta }, i) => (
              <span key={key} className="flex items-center gap-1 font-label text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: BAR_SHADES[Math.min(i, BAR_SHADES.length - 1)] }} />
                {meta.label.replace('GS Paper ', 'GS').replace('Current Affairs', 'CA')}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

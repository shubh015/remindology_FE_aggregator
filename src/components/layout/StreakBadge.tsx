'use client';

import { useAuthStore } from '@/store/use-auth-store';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StreakBadge() {
  const streak = useAuthStore((s) => s.user?.streak);

  if (!streak) return null;

  const active = streak.isActiveToday;

  return (
    <div className="mx-4 mb-3">
      <div className="flex items-center gap-3 rounded-[2px] border border-rule bg-paper-raised px-3 py-2.5">
        <span className={cn('ks-tag shrink-0 px-1.5', active && 'ks-tag-gold')}>
          <Flame className={cn('h-3.5 w-3.5', active ? 'text-gold-deep' : 'text-ink-faint')} />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-ink leading-tight">
            {streak.current > 0
              ? `${streak.current} day${streak.current !== 1 ? 's' : ''} streak`
              : 'Start your streak!'}
          </p>
          <p className="font-label text-[10px] uppercase tracking-[0.12em] text-ink-muted leading-tight mt-0.5">
            {active ? 'Active today ✓' : `Best: ${streak.longest} day${streak.longest !== 1 ? 's' : ''}`}
          </p>
        </div>

        {streak.current >= 7 && (
          <span className="ks-tag shrink-0 tabular-nums">
            🔥 {streak.current}
          </span>
        )}
      </div>
    </div>
  );
}

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
      <div className="flex items-center gap-3 rounded-xl bg-secondary/60 px-3 py-2.5">
        <div className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
          active ? 'bg-orange-500/15 text-orange-500' : 'bg-secondary text-muted-foreground/40',
        )}>
          <Flame className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground leading-tight">
            {streak.current > 0
              ? `${streak.current} day${streak.current !== 1 ? 's' : ''} streak`
              : 'Start your streak!'}
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight">
            {active ? 'Active today ✓' : `Best: ${streak.longest} day${streak.longest !== 1 ? 's' : ''}`}
          </p>
        </div>

        {streak.current >= 7 && (
          <span
            className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316' }}
          >
            🔥 {streak.current}
          </span>
        )}
      </div>
    </div>
  );
}

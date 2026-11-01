'use client';

import { FileText, Brain, AlertTriangle, Flame } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContentStats } from '@/features/dashboard/utils/content-insights';

interface StatsRowProps {
  stats: ContentStats | null;
  isLoading: boolean;
  weakZoneCount?: number;
  streakCompleted?: boolean;
}

interface StatCardProps {
  label: string;
  value: string | number;
  desc: string;
  icon: React.ElementType;
  /** Draw attention (vermilion icon) — used for weak topics only */
  alert?: boolean;
  isLoading: boolean;
}

function StatCard({ label, value, desc, icon: Icon, alert, isLoading }: StatCardProps) {
  return (
    <div className="ks-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-label text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted mb-2.5">{label}</p>
          {isLoading ? (
            <Skeleton className="h-9 w-16 mb-1.5" />
          ) : (
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-ink leading-none mb-2">{value}</p>
          )}
          <p className="text-xs text-ink-muted leading-snug">{desc}</p>
        </div>
        <Icon className={alert ? 'h-4 w-4 shrink-0 text-[oklch(52%_.16_35)]' : 'h-4 w-4 shrink-0 text-ink-muted'} />
      </div>
    </div>
  );
}

export function StatsRow({ stats, isLoading, weakZoneCount = 0, streakCompleted = false }: StatsRowProps) {
  const cards: StatCardProps[] = [
    {
      label: 'Study Materials',
      value: stats?.total ?? 0,
      desc: stats?.processing ? `${stats.processing} being analysed` : 'Content indexed',
      icon: FileText,
      isLoading,
    },
    {
      label: 'AI Analyses',
      value: stats?.completed ?? 0,
      desc: `${stats?.completionRate ?? 0}% completion rate`,
      icon: Brain,
      isLoading,
    },
    {
      label: 'Weak Topics',
      value: weakZoneCount,
      desc: weakZoneCount > 0 ? 'Need focused practice' : 'All zones healthy',
      icon: AlertTriangle,
      alert: weakZoneCount > 0,
      isLoading,
    },
    {
      label: "Today's Streak",
      value: streakCompleted ? '✓' : '–',
      desc: streakCompleted ? 'Completed · Keep going!' : 'Daily challenge pending',
      icon: Flame,
      isLoading,
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => <StatCard key={c.label} {...c} />)}
    </div>
  );
}

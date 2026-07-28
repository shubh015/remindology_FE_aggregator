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
  accentColor: string;
  accentBg: string;
  isLoading: boolean;
}

function StatCard({ label, value, desc, icon: Icon, accentColor, accentBg, isLoading }: StatCardProps) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-4 overflow-hidden hover:shadow-sm transition-shadow">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: accentColor }} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
          {isLoading ? (
            <Skeleton className="h-9 w-16 mb-1.5" />
          ) : (
            <p className="text-2xl font-bold tracking-tight text-foreground leading-none mb-1.5">{value}</p>
          )}
          <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: accentBg }}>
          <Icon className="h-5 w-5" style={{ color: accentColor }} />
        </div>
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
      accentColor: '#7C3AED',
      accentBg: 'rgba(124,58,237,0.1)',
      isLoading,
    },
    {
      label: 'AI Analyses',
      value: stats?.completed ?? 0,
      desc: `${stats?.completionRate ?? 0}% completion rate`,
      icon: Brain,
      accentColor: '#10B981',
      accentBg: 'rgba(16,185,129,0.1)',
      isLoading,
    },
    {
      label: 'Weak Topics',
      value: weakZoneCount,
      desc: weakZoneCount > 0 ? 'Need focused practice' : 'All zones healthy',
      icon: AlertTriangle,
      accentColor: weakZoneCount > 0 ? '#F43F5E' : '#10B981',
      accentBg: weakZoneCount > 0 ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)',
      isLoading,
    },
    {
      label: "Today's Streak",
      value: streakCompleted ? '✓' : '–',
      desc: streakCompleted ? 'Completed · Keep going!' : 'Daily challenge pending',
      icon: Flame,
      accentColor: streakCompleted ? '#10B981' : '#F97316',
      accentBg: streakCompleted ? 'rgba(16,185,129,0.1)' : 'rgba(249,115,22,0.1)',
      isLoading,
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => <StatCard key={c.label} {...c} />)}
    </div>
  );
}

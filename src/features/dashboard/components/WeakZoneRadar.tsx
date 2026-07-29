'use client';

import Link from 'next/link';
import { AlertTriangle, CheckCircle2, TrendingDown, Zap, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeakZones } from '@/features/analytics/hooks/use-weak-zones';
import type { WeakZoneLabel } from '@/types/features';

const LABEL_CONFIG: Record<WeakZoneLabel, {
  color: string; bar: string; textColor: string; bg: string; icon: React.ElementType;
}> = {
  Critical:        { color: '#F43F5E', bar: '#F43F5E', textColor: 'text-rose-600',   bg: 'rgba(244,63,94,0.1)',   icon: AlertTriangle },
  Weak:            { color: '#FB923C', bar: '#FB923C', textColor: 'text-orange-600', bg: 'rgba(251,146,60,0.1)',  icon: TrendingDown  },
  'Needs Practice':{ color: '#F59E0B', bar: '#F59E0B', textColor: 'text-amber-600',  bg: 'rgba(245,158,11,0.1)', icon: Zap           },
  Good:            { color: '#10B981', bar: '#10B981', textColor: 'text-emerald-600',bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2  },
};

export function WeakZoneRadar() {
  const { data: zones, isLoading } = useWeakZones();

  const criticalCount = zones?.filter(z => z.label === 'Critical').length ?? 0;
  const weakCount     = zones?.filter(z => z.label === 'Weak').length ?? 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
            <Target className="h-4 w-4 text-rose-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Weak Zone Tracker</h3>
            <p className="text-[10px] text-muted-foreground">AI performance analysis</p>
          </div>
        </div>
        {!isLoading && zones && zones.length > 0 && (
          <Link href="/daily-challenge" className="text-[11px] font-bold text-primary hover:underline">
            Practice →
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
        </div>
      ) : !zones || zones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-5 text-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-sm font-semibold text-foreground">All zones healthy!</p>
          <p className="text-xs text-muted-foreground leading-snug max-w-[160px]">
            Attempt MCQs to surface your weak areas.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {zones.slice(0, 5).map((zone) => {
            const cfg = LABEL_CONFIG[zone.label] ?? LABEL_CONFIG['Needs Practice'];
            const Icon = cfg.icon;
            return (
              <div key={zone.topicName} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded" style={{ background: cfg.bg }}>
                      <Icon className="h-3 w-3" style={{ color: cfg.color }} />
                    </div>
                    <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">{zone.topicName}</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-2" style={{ background: cfg.bg, color: cfg.color }}>
                    {zone.wrongRatePct}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${zone.wrongRatePct}%`, background: cfg.bar }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer summary */}
      {!isLoading && zones && (criticalCount > 0 || weakCount > 0) && (
        <div className="flex items-center gap-3 pt-3 border-t border-border">
          {criticalCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-rose-500/10 text-rose-600">
              {criticalCount} critical
            </span>
          )}
          {weakCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-orange-500/10 text-orange-600">
              {weakCount} weak
            </span>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { AlertTriangle, CheckCircle2, TrendingDown, Zap, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeakZones } from '@/features/analytics/hooks/use-weak-zones';
import type { WeakZoneLabel } from '@/types/features';

// Monochrome: severity reads from the label/icon and bar tone, not hue.
// Vermilion is reserved for "Critical" only.
const ALERT = 'oklch(52% .16 35)';
const LABEL_CONFIG: Record<WeakZoneLabel, {
  color: string; bar: string; tagClass: string; icon: React.ElementType;
}> = {
  Critical:        { color: ALERT,                     bar: ALERT,                     tagClass: 'ks-tag-alert',   icon: AlertTriangle },
  Weak:            { color: 'var(--color-ink)',        bar: 'var(--color-ink)',        tagClass: '',               icon: TrendingDown  },
  'Needs Practice':{ color: 'var(--color-ink-muted)',  bar: 'var(--color-ink-muted)',  tagClass: 'ks-tag-outline', icon: Zap           },
  Good:            { color: 'var(--color-ink-muted)',  bar: 'var(--color-ink-faint)',  tagClass: 'ks-tag-outline', icon: CheckCircle2  },
};

export function WeakZoneRadar() {
  const { data: zones, isLoading } = useWeakZones();

  const criticalCount = zones?.filter(z => z.label === 'Critical').length ?? 0;
  const weakCount     = zones?.filter(z => z.label === 'Weak').length ?? 0;

  return (
    <div className="ks-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[3px] border border-rule bg-paper-deep">
            <Target className="h-4 w-4 text-ink" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Weak Zone Tracker</h3>
            <p className="font-label text-[10px] uppercase tracking-[0.12em] text-ink-muted">AI performance analysis</p>
          </div>
        </div>
        {!isLoading && zones && zones.length > 0 && (
          <Link href="/daily-challenge" className="font-label text-[11px] text-ink underline decoration-rule-strong underline-offset-4 hover:decoration-ink">
            Practice →
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : !zones || zones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-5 text-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-rule bg-paper-deep">
            <CheckCircle2 className="h-5 w-5 text-ink" />
          </div>
          <p className="text-sm font-semibold text-ink">All zones healthy!</p>
          <p className="text-xs text-ink-muted leading-snug max-w-[160px]">
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
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: cfg.color }} />
                    <span className="text-xs font-semibold text-ink truncate max-w-[120px]">{zone.topicName}</span>
                  </div>
                  <span className={`ks-tag ${cfg.tagClass} shrink-0 ml-2 tabular-nums`}>
                    {zone.wrongRatePct}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full overflow-hidden bg-paper-gray">
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
        <div className="flex items-center gap-3 pt-3 border-t border-rule">
          {criticalCount > 0 && (
            <span className="ks-tag ks-tag-alert">
              {criticalCount} critical
            </span>
          )}
          {weakCount > 0 && (
            <span className="ks-tag">
              {weakCount} weak
            </span>
          )}
        </div>
      )}
    </div>
  );
}

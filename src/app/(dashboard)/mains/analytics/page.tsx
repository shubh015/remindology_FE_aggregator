'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useMainsAnalytics } from '@/features/mains/hooks/use-mains';
import { cn } from '@/lib/utils';
import {
  PenLine, TrendingUp, TrendingDown, Trophy, Clock,
  AlertCircle, ChevronLeft, BarChart3,
} from 'lucide-react';
import type { MainsAnalyticsTrend, MainsAnalyticsByTopic } from '@/types/features';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtPct(n: number) {
  return `${n.toFixed(1)}%`;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="ks-card p-5 !flex flex-col gap-3">
      <div className={cn('flex h-8 w-8 items-center justify-center rounded-[3px]', accent)}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-2xl font-semibold tabular-nums text-ink leading-none">{value}</p>
        {sub && <p className="font-label text-[10px] uppercase tracking-[0.14em] text-ink-muted mt-1">{sub}</p>}
      </div>
      <p className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">{label}</p>
    </div>
  );
}

// ── Score trend chart (pure SVG, no deps) ────────────────────────────────────

const CHART_W = 600;
const CHART_H = 200;
const PAD = { top: 20, right: 20, bottom: 36, left: 44 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;

function TrendChart({ data }: { data: MainsAnalyticsTrend[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) return null;

  const xStep = data.length > 1 ? PLOT_W / (data.length - 1) : PLOT_W / 2;
  const toX = (i: number) => PAD.left + (data.length > 1 ? i * xStep : PLOT_W / 2);
  const toY = (pct: number) => PAD.top + PLOT_H - (pct / 100) * PLOT_H;

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.pct), d }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(PAD.top + PLOT_H).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(PAD.top + PLOT_H).toFixed(1)} Z`;

  // Y-axis gridlines at 0, 25, 50, 75, 100
  const yTicks = [0, 25, 50, 75, 100];

  const hoveredPoint = hovered !== null ? points[hovered] : null;

  return (
    <div className="ks-card !block p-5">
      <p className="text-sm font-semibold text-ink mb-4">Score trend</p>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full"
          style={{ minWidth: 280, height: 'auto', aspectRatio: `${CHART_W}/${CHART_H}` }}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Y gridlines + labels */}
          {yTicks.map((tick) => {
            const y = toY(tick);
            return (
              <g key={tick}>
                <line
                  x1={PAD.left} y1={y} x2={CHART_W - PAD.right} y2={y}
                  stroke="currentColor" strokeOpacity={0.07} strokeWidth={1}
                />
                <text
                  x={PAD.left - 6} y={y + 4}
                  textAnchor="end" fontSize={9} fill="currentColor" opacity={0.4}
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="var(--color-ink)" opacity={0.05} />

          {/* Line */}
          <path d={linePath} fill="none" stroke="var(--color-ink)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {/* Dots + hover targets */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x} cy={p.y} r={14}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(i)}
              />
              <circle
                cx={p.x} cy={p.y} r={hovered === i ? 5 : 3.5}
                fill={hovered === i ? 'var(--color-ink)' : 'var(--color-paper-raised)'}
                stroke="var(--color-ink)"
                strokeWidth={2}
                style={{ transition: 'r 0.1s' }}
              />
            </g>
          ))}

          {/* X-axis date labels — show max 6 evenly */}
          {points
            .filter((_, i) => {
              if (data.length <= 6) return true;
              const step = Math.ceil(data.length / 5);
              return i % step === 0 || i === data.length - 1;
            })
            .map((p, _, arr) => (
              <text
                key={p.d.date}
                x={p.x}
                y={CHART_H - 6}
                textAnchor={
                  p === arr[0] ? 'start' : p === arr[arr.length - 1] ? 'end' : 'middle'
                }
                fontSize={9}
                fill="currentColor"
                opacity={0.45}
              >
                {fmtDate(p.d.date)}
              </text>
            ))}

          {/* Tooltip */}
          {hoveredPoint && (() => {
            const tx = hoveredPoint.x;
            const ty = hoveredPoint.y;
            const boxW = 110;
            const boxH = 46;
            const boxX = Math.min(tx - boxW / 2, CHART_W - PAD.right - boxW);
            const boxY = ty - boxH - 10 < PAD.top ? ty + 12 : ty - boxH - 10;
            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect
                  x={boxX} y={boxY} width={boxW} height={boxH}
                  rx={2} ry={2}
                  fill="var(--color-ink)"
                />
                <text x={boxX + 8} y={boxY + 16} fontSize={10} fill="var(--color-paper)" opacity={0.7} fontWeight={500}>
                  {hoveredPoint.d.topic}
                </text>
                <text x={boxX + 8} y={boxY + 30} fontSize={11} fill="var(--color-paper)" fontWeight={600}>
                  {hoveredPoint.d.score}/{hoveredPoint.d.outOf} · {fmtPct(hoveredPoint.d.pct)}
                </text>
                <text x={boxX + 8} y={boxY + 42} fontSize={9} fill="var(--color-paper)" opacity={0.55}>
                  {fmtDate(hoveredPoint.d.date)}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

// ── Topic bar ─────────────────────────────────────────────────────────────────

function TopicRow({
  topic, avgPct, count, isWeak, isStrong,
}: MainsAnalyticsByTopic & { isWeak: boolean; isStrong: boolean }) {
  // Monochrome bars; strong topics are the single gold highlight series.
  const barColor = isStrong
    ? 'bg-gold'
    : isWeak
    ? 'bg-ink/30'
    : 'bg-ink';

  const labelColor = 'text-ink';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {isStrong && <span className="ks-tag ks-tag-gold shrink-0">STRONG</span>}
          {isWeak   && <span className="ks-tag ks-tag-alert shrink-0">WEAK</span>}
          <span className={cn('text-sm font-semibold truncate', labelColor)}>{topic}</span>
          <span className="text-[11px] text-ink-muted tabular-nums shrink-0">{count} {count === 1 ? 'answer' : 'answers'}</span>
        </div>
        <span className="text-sm font-semibold tabular-nums text-ink shrink-0">{fmtPct(avgPct)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-paper-gray overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-[width] duration-200 ease-ks', barColor)}
          style={{ width: `${Math.min(avgPct, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MainsAnalyticsPage() {
  const { data, isLoading, isError } = useMainsAnalytics();

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Progress & Analytics"
        action={
          <Link
            href="/mains"
            className="flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink transition-colors duration-150 ease-ks"
          >
            <ChevronLeft className="h-3.5 w-3.5" />Back
          </Link>
        }
      />

      <div className="flex-1 p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-6">

        {isError && (
          <div className="flex items-center gap-3 rounded-[2px] bg-paper-raised border border-rule p-5 text-sm text-[oklch(52%_.16_35)]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Could not load analytics. Please try again.</span>
          </div>
        )}

        {isLoading && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-[2px]" />)}
            </div>
            <Skeleton className="h-56 rounded-[2px]" />
            <Skeleton className="h-48 rounded-[2px]" />
          </>
        )}

        {data && data.totalAnswers === 0 && (
          <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-[3px] border border-rule bg-paper-deep">
              <BarChart3 className="h-6 w-6 text-ink" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-ink">No answers yet</p>
              <p className="text-sm text-ink-muted max-w-xs">
                Submit your first mains answer to see your progress and analytics here.
              </p>
            </div>
            <Link
              href="/mains"
              className="btn-ink btn-sm"
            >
              <PenLine className="h-4 w-4" />
              Start Writing
            </Link>
          </div>
        )}

        {data && data.totalAnswers > 0 && (
          <>
            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Answers submitted"
                value={String(data.totalAnswers)}
                icon={PenLine}
                accent="border border-rule bg-paper-deep text-ink"
              />
              <StatCard
                label="Average score"
                value={fmtPct(data.avgPct)}
                icon={BarChart3}
                accent="border border-rule bg-paper-deep text-ink"
              />
              <StatCard
                label="Best score"
                value={fmtPct(data.bestPct)}
                icon={Trophy}
                accent="border border-rule bg-paper-deep text-ink"
              />
              <StatCard
                label="Time spent"
                value={`${data.totalTimeMins}`}
                sub="minutes"
                icon={Clock}
                accent="border border-rule bg-paper-deep text-ink"
              />
            </div>

            {/* ── Improvement banner ── */}
            {data.improvementPct !== null && (() => {
              const improved = data.improvementPct >= 0;
              return (
                <div
                  className={cn(
                    'flex items-start gap-3 rounded-[2px] border p-4 bg-paper-raised',
                    improved
                      ? 'border-rule'
                      : 'border-[color-mix(in_oklch,var(--color-gold)_55%,transparent)]',
                  )}
                >
                  {improved
                    ? <TrendingUp className="h-5 w-5 text-ink shrink-0 mt-0.5" />
                    : <TrendingDown className="h-5 w-5 text-gold-deep shrink-0 mt-0.5" />}
                  <p className={cn(
                    'text-sm font-medium',
                    improved ? 'text-ink' : 'text-ink-soft',
                  )}>
                    {improved
                      ? `You've improved by +${Math.abs(data.improvementPct).toFixed(1)}% compared to your first attempts 📈`
                      : `Your recent scores are ${Math.abs(data.improvementPct).toFixed(1)}% below your first attempts. Keep going!`}
                  </p>
                </div>
              );
            })()}

            {/* ── Score trend ── */}
            {data.trend.length > 0 && <TrendChart data={data.trend} />}

            {/* ── Topic breakdown ── */}
            {data.byTopic.length > 0 && (
              <div className="ks-card !block p-5 space-y-4">
                <p className="text-sm font-semibold text-ink">Performance by topic</p>
                <div className="space-y-4">
                  {[...data.byTopic]
                    .sort((a, b) => b.avgPct - a.avgPct)
                    .map((t) => (
                      <TopicRow
                        key={t.topic}
                        {...t}
                        isWeak={data.weakAreas.includes(t.topic)}
                        isStrong={data.strongAreas.includes(t.topic)}
                      />
                    ))}
                </div>
                {(data.weakAreas.length > 0 || data.strongAreas.length > 0) && (
                  <div className="pt-2 border-t border-rule flex flex-wrap gap-4 text-xs text-ink-muted">
                    {data.strongAreas.length > 0 && (
                      <span>
                        <span className="font-semibold text-ink">Strong: </span>
                        {data.strongAreas.join(', ')}
                      </span>
                    )}
                    {data.weakAreas.length > 0 && (
                      <span>
                        <span className="font-semibold text-[oklch(52%_.16_35)]">Needs work: </span>
                        {data.weakAreas.join(', ')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

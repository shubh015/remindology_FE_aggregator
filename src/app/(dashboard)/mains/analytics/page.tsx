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
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', accent)}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
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
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-semibold text-foreground mb-4">Score trend</p>
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
          <path d={areaPath} fill="url(#trendGrad)" opacity={0.15} />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#7C3AED" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

          {/* Gradient def */}
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
            </linearGradient>
          </defs>

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
                fill={hovered === i ? '#7C3AED' : '#fff'}
                stroke="#7C3AED"
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
                  rx={6} ry={6}
                  fill="#1e1b4b" opacity={0.92}
                />
                <text x={boxX + 8} y={boxY + 16} fontSize={10} fill="#c4b5fd" fontWeight={600}>
                  {hoveredPoint.d.topic}
                </text>
                <text x={boxX + 8} y={boxY + 30} fontSize={11} fill="#ffffff" fontWeight={700}>
                  {hoveredPoint.d.score}/{hoveredPoint.d.outOf} · {fmtPct(hoveredPoint.d.pct)}
                </text>
                <text x={boxX + 8} y={boxY + 42} fontSize={9} fill="#a5b4fc" opacity={0.8}>
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
  const barColor = isStrong
    ? 'bg-emerald-500'
    : isWeak
    ? 'bg-red-500'
    : 'bg-violet-500';

  const labelColor = isStrong
    ? 'text-emerald-600 dark:text-emerald-400'
    : isWeak
    ? 'text-red-500'
    : 'text-foreground';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {isStrong && <span className="text-[10px] font-bold text-emerald-500 shrink-0">STRONG</span>}
          {isWeak   && <span className="text-[10px] font-bold text-red-500 shrink-0">WEAK</span>}
          <span className={cn('text-sm font-semibold truncate', labelColor)}>{topic}</span>
          <span className="text-[10px] text-muted-foreground shrink-0">{count} {count === 1 ? 'answer' : 'answers'}</span>
        </div>
        <span className="text-sm font-bold text-foreground shrink-0">{fmtPct(avgPct)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', barColor)}
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
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />Back
          </Link>
        }
      />

      <div className="flex-1 p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-6">

        {isError && (
          <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 border border-destructive/20 p-5 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Could not load analytics. Please try again.</span>
          </div>
        )}

        {isLoading && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            </div>
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </>
        )}

        {data && data.totalAnswers === 0 && (
          <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">No answers yet</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Submit your first mains answer to see your progress and analytics here.
              </p>
            </div>
            <Link
              href="/mains"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
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
                accent="bg-violet-500/10 text-violet-500"
              />
              <StatCard
                label="Average score"
                value={fmtPct(data.avgPct)}
                icon={BarChart3}
                accent="bg-blue-500/10 text-blue-500"
              />
              <StatCard
                label="Best score"
                value={fmtPct(data.bestPct)}
                icon={Trophy}
                accent="bg-amber-500/10 text-amber-500"
              />
              <StatCard
                label="Time spent"
                value={`${data.totalTimeMins}`}
                sub="minutes"
                icon={Clock}
                accent="bg-emerald-500/10 text-emerald-500"
              />
            </div>

            {/* ── Improvement banner ── */}
            {data.improvementPct !== null && (() => {
              const improved = data.improvementPct >= 0;
              return (
                <div
                  className={cn(
                    'flex items-start gap-3 rounded-2xl border p-4',
                    improved
                      ? 'bg-emerald-500/8 border-emerald-500/20'
                      : 'bg-amber-500/8 border-amber-500/20',
                  )}
                >
                  {improved
                    ? <TrendingUp className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    : <TrendingDown className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />}
                  <p className={cn(
                    'text-sm font-medium',
                    improved ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400',
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
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <p className="text-sm font-semibold text-foreground">Performance by topic</p>
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
                  <div className="pt-2 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {data.strongAreas.length > 0 && (
                      <span>
                        <span className="font-bold text-emerald-500">Strong: </span>
                        {data.strongAreas.join(', ')}
                      </span>
                    )}
                    {data.weakAreas.length > 0 && (
                      <span>
                        <span className="font-bold text-red-500">Needs work: </span>
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

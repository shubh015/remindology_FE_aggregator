'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import { useMCQAnalytics } from '@/features/analytics/hooks/use-weak-zones';
import { cn } from '@/lib/utils';
import {
  Target, CheckCircle2, Clock, BarChart3,
  AlertCircle, BookOpenCheck, TrendingUp,
} from 'lucide-react';
import type { McqAnalyticsTrend, McqAnalyticsByTopic } from '@/types/features';

// ── Helpers ───────────────────────────────────────────────────────

function fmtPct(n: number) {
  return `${n.toFixed(1)}%`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function accuracyColor(pct: number): string {
  if (pct >= 70) return 'bg-ink';
  if (pct >= 50) return 'bg-ink/60';
  return 'bg-ink/30';
}

function accuracyTextColor(pct: number): string {
  if (pct >= 70) return 'text-ink';
  if (pct >= 50) return 'text-ink-soft';
  return 'text-[oklch(52%_.16_35)]';
}

// ── Stat tile ─────────────────────────────────────────────────────

function StatTile({
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
        {sub && <p className="text-[11px] text-ink-muted mt-0.5">{sub}</p>}
      </div>
      <p className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">{label}</p>
    </div>
  );
}

// ── SVG Trend chart ────────────────────────────────────────────────

const CHART_W = 600;
const CHART_H = 200;
const PAD = { top: 20, right: 20, bottom: 36, left: 44 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;

function TrendChart({ data }: { data: McqAnalyticsTrend[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) return null;

  const toX = (i: number) =>
    PAD.left + (data.length > 1 ? (i / (data.length - 1)) * PLOT_W : PLOT_W / 2);
  const toY = (pct: number) => PAD.top + PLOT_H - (pct / 100) * PLOT_H;

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.accuracyPct), d }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1].x.toFixed(1)} ${(PAD.top + PLOT_H).toFixed(1)}` +
    ` L ${pts[0].x.toFixed(1)} ${(PAD.top + PLOT_H).toFixed(1)} Z`;

  const yTicks = [0, 25, 50, 75, 100];
  const hoveredPt = hovered !== null ? pts[hovered] : null;

  return (
    <div className="ks-card !block p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-ink" />
        <p className="text-sm font-semibold text-ink">Daily accuracy trend</p>
      </div>
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="w-full"
          style={{ minWidth: 280, height: 'auto', aspectRatio: `${CHART_W}/${CHART_H}` }}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Y gridlines */}
          {yTicks.map((tick) => {
            const y = toY(tick);
            return (
              <g key={tick}>
                <line x1={PAD.left} y1={y} x2={CHART_W - PAD.right} y2={y}
                  stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
                <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={9}
                  fill="currentColor" opacity={0.4}>{tick}</text>
              </g>
            );
          })}

          {/* Area + line */}
          <path d={areaPath} fill="var(--color-ink)" opacity={0.05} />
          <path d={linePath} fill="none" stroke="var(--color-ink)" strokeWidth={2}
            strokeLinejoin="round" strokeLinecap="round" />

          {/* Dots */}
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={14} fill="transparent"
                style={{ cursor: 'pointer' }} onMouseEnter={() => setHovered(i)} />
              <circle cx={p.x} cy={p.y} r={hovered === i ? 5 : 3.5}
                fill={hovered === i ? 'var(--color-gold)' : 'var(--color-paper-raised)'}
                stroke={hovered === i ? 'var(--color-gold-deep)' : 'var(--color-ink)'} strokeWidth={2} style={{ transition: 'r 0.1s' }} />
            </g>
          ))}

          {/* X labels */}
          {pts
            .filter((_, i) => {
              if (data.length <= 6) return true;
              const step = Math.ceil(data.length / 5);
              return i % step === 0 || i === data.length - 1;
            })
            .map((p, _, arr) => (
              <text key={p.d.date} x={p.x} y={CHART_H - 6}
                textAnchor={p === arr[0] ? 'start' : p === arr[arr.length - 1] ? 'end' : 'middle'}
                fontSize={9} fill="currentColor" opacity={0.45}>
                {fmtDate(p.d.date)}
              </text>
            ))}

          {/* Tooltip */}
          {hoveredPt && (() => {
            const bw = 120, bh = 46;
            const bx = Math.min(hoveredPt.x - bw / 2, CHART_W - PAD.right - bw);
            const by = hoveredPt.y - bh - 10 < PAD.top ? hoveredPt.y + 12 : hoveredPt.y - bh - 10;
            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect x={bx} y={by} width={bw} height={bh} rx={2} fill="var(--color-ink)" />
                <text x={bx + 8} y={by + 16} fontSize={10} fill="var(--color-paper)" opacity={0.7} fontWeight={500}>
                  {fmtDate(hoveredPt.d.date)}
                </text>
                <text x={bx + 8} y={by + 31} fontSize={11} fill="var(--color-paper)" fontWeight={600}>
                  {hoveredPt.d.correct}/{hoveredPt.d.total} · {fmtPct(hoveredPt.d.accuracyPct)}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

// ── GS Paper bars ─────────────────────────────────────────────────

function PaperBar({ paper, correct, total, accuracyPct }: {
  paper: string; correct: number; total: number; accuracyPct: number;
}) {
  const barClass = accuracyColor(accuracyPct);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-label text-xs text-ink">{paper}</span>
          <span className="text-[11px] text-ink-muted tabular-nums">{correct}/{total} correct</span>
        </div>
        <span className={cn('text-xs font-semibold tabular-nums', accuracyTextColor(accuracyPct))}>
          {fmtPct(accuracyPct)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-paper-gray overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-[width] duration-200 ease-ks', barClass)}
          style={{ width: `${Math.min(accuracyPct, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ── Topic table row ────────────────────────────────────────────────

function TopicRow({ row, weakTopics, strongTopics }: {
  row: McqAnalyticsByTopic;
  weakTopics: Set<string>;
  strongTopics: Set<string>;
}) {
  const isWeak   = weakTopics.has(row.topic);
  const isStrong = strongTopics.has(row.topic);
  return (
    <tr className="border-b border-rule last:border-0 hover:bg-paper-deep transition-colors duration-150 ease-ks">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">{row.topic}</span>
          {isWeak   && <span className="ks-tag ks-tag-alert">WEAK</span>}
          {isStrong && <span className="ks-tag ks-tag-ink">STRONG</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-center text-ink-soft font-medium tabular-nums">{row.total}</td>
      <td className="px-4 py-3 text-sm text-center text-ink-soft font-medium tabular-nums">{row.correct}</td>
      <td className="px-4 py-3 text-right">
        <span className={cn('text-sm font-semibold tabular-nums', accuracyTextColor(row.accuracyPct))}>
          {fmtPct(row.accuracyPct)}
        </span>
      </td>
    </tr>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function SubjectMCQsPage() {
  const { data, isLoading, isError } = useMCQAnalytics();

  const weakSet   = new Set(data?.weakAreas.map((a) => a.topic)   ?? []);
  const strongSet = new Set(data?.strongAreas.map((a) => a.topic) ?? []);

  const sortedTopics = data
    ? [...data.byTopic].sort((a, b) => a.accuracyPct - b.accuracyPct)
    : [];

  return (
    <div className="flex-1 flex flex-col">
      <Header title="MCQ Analytics" />

      <div className="flex-1 p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-6">

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-3 rounded-[2px] bg-paper-raised border border-rule p-5 text-sm text-[oklch(52%_.16_35)]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Could not load analytics. Please try again.</span>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-[2px]" />)}
            </div>
            <Skeleton className="h-48 rounded-[2px]" />
            <Skeleton className="h-56 rounded-[2px]" />
            <Skeleton className="h-48 rounded-[2px]" />
          </>
        )}

        {/* Empty state */}
        {data && data.overall.totalAttempted === 0 && (
          <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-[3px] border border-rule bg-paper-deep">
              <BookOpenCheck className="h-6 w-6 text-ink" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-ink">Not enough data yet</p>
              <p className="text-sm text-ink-muted max-w-sm">
                Answer MCQs in the Contents section to start tracking your accuracy and progress.
              </p>
            </div>
          </div>
        )}

        {/* ── Analytics content ── */}
        {data && data.overall.totalAttempted > 0 && (
          <>
            {/* 1. Stat tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatTile
                label="Questions attempted"
                value={String(data.overall.totalAttempted)}
                icon={BookOpenCheck}
                accent="border border-rule bg-paper-deep text-ink"
              />
              <StatTile
                label="Accuracy"
                value={fmtPct(data.overall.accuracyPct)}
                icon={Target}
                accent="border border-rule bg-paper-deep text-ink"
              />
              <StatTile
                label="Correct answers"
                value={String(data.overall.totalCorrect)}
                icon={CheckCircle2}
                accent="border border-rule bg-paper-deep text-ink"
              />
              <StatTile
                label="Avg time / question"
                value={`${data.overall.avgTimeSecs.toFixed(1)}s`}
                icon={Clock}
                accent="border border-rule bg-paper-deep text-ink"
              />
            </div>

            {/* 2. Accuracy by GS Paper */}
            {data.byPaper.length > 0 && (
              <div className="ks-card !block p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-ink" />
                  <p className="text-sm font-semibold text-ink">Accuracy by GS Paper</p>
                </div>
                <div className="space-y-4">
                  {data.byPaper.map((p) => (
                    <PaperBar key={p.paper} {...p} />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Daily trend */}
            {data.trend.length > 1 && <TrendChart data={data.trend} />}

            {/* 4. Weak + Strong areas */}
            {(data.weakAreas.length > 0 || data.strongAreas.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {data.weakAreas.length > 0 && (
                  <div className="ks-card !block p-5 space-y-3">
                    <p className="font-label text-[11px] uppercase tracking-[0.14em] text-[oklch(52%_.16_35)]">
                      Weak Areas &lt;50% accuracy
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.weakAreas.map((a) => (
                        <span
                          key={a.topic}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-semibold bg-paper-deep text-ink border border-rule"
                        >
                          {a.topic}
                          <span className="font-label font-normal text-ink-muted tabular-nums">{fmtPct(a.accuracyPct)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {data.strongAreas.length > 0 && (
                  <div className="ks-card !block p-5 space-y-3">
                    <p className="font-label text-[11px] uppercase tracking-[0.14em] text-ink">
                      Strong Areas ≥70% accuracy
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.strongAreas.map((a) => (
                        <span
                          key={a.topic}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-semibold bg-paper-deep text-ink border border-rule"
                        >
                          {a.topic}
                          <span className="font-label font-normal text-ink-muted tabular-nums">{fmtPct(a.accuracyPct)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. Topic breakdown table */}
            {sortedTopics.length > 0 && (
              <div className="ks-card !block">
                <div className="px-5 py-4 border-b border-rule">
                  <p className="text-sm font-semibold text-ink">Topic breakdown</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">Sorted by accuracy — weakest first</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-rule bg-paper-deep">
                        <th className="text-left px-4 py-3 font-label text-[11px] font-normal uppercase tracking-[0.14em] text-ink-muted">Topic</th>
                        <th className="text-center px-4 py-3 font-label text-[11px] font-normal uppercase tracking-[0.14em] text-ink-muted">Attempted</th>
                        <th className="text-center px-4 py-3 font-label text-[11px] font-normal uppercase tracking-[0.14em] text-ink-muted">Correct</th>
                        <th className="text-right px-4 py-3 font-label text-[11px] font-normal uppercase tracking-[0.14em] text-ink-muted">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTopics.map((row) => (
                        <TopicRow
                          key={row.topic}
                          row={row}
                          weakTopics={weakSet}
                          strongTopics={strongSet}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

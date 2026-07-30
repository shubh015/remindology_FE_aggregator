'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useTodaysCurrentAffairs,
  useRecentCurrentAffairs,
  useCurrentAffairsByMonth,
  useFilteredArticles,
} from '@/features/current-affairs/hooks/use-current-affairs';
import {
  Newspaper, Search, X, AlertCircle, ChevronRight,
  CalendarDays, BookOpen, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CurrentAffairsArticle } from '@/types/features';

// ── Constants ─────────────────────────────────────────────────────

const MIDNIGHT  = '#09091F';
const TEXT_GRAD = {
  background: 'linear-gradient(135deg, #A78BFA, #E879F9)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent',
};
const BORDER_D = '1px solid rgba(124,58,237,0.2)';

const GS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  GS1: { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',  border: 'rgba(124,58,237,0.25)', label: 'GS1 · Indian Heritage & Society' },
  GS2: { color: '#0891B2', bg: 'rgba(8,145,178,0.1)',   border: 'rgba(8,145,178,0.25)',  label: 'GS2 · Polity & International' },
  GS3: { color: '#059669', bg: 'rgba(5,150,105,0.1)',   border: 'rgba(5,150,105,0.25)',  label: 'GS3 · Economy & Environment' },
  GS4: { color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   border: 'rgba(220,38,38,0.25)',  label: 'GS4 · Ethics & Integrity' },
};

type ViewMode = 'today' | 'recent' | 'archive';

function getMonthOptions() {
  const opts: { label: string; year: number; month: number; key: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    opts.push({
      label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      key: `${d.getFullYear()}-${d.getMonth() + 1}`,
    });
  }
  return opts;
}

// ── Skeleton card ─────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="h-[3px] bg-muted" />
      <div className="p-6 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-12 rounded-full bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted" />
        </div>
        <div className="h-6 w-full rounded bg-muted" />
        <div className="h-6 w-4/5 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted/70" />
        <div className="h-4 w-3/4 rounded bg-muted/70" />
        <div className="h-4 w-2/3 rounded bg-muted/50" />
      </div>
    </div>
  );
}

// ── Article card ──────────────────────────────────────────────────

function ArticleCard({ article }: { article: CurrentAffairsArticle }) {
  const primaryGS   = article.gsPaperTags[0];
  const gsCfg       = primaryGS ? GS_CONFIG[primaryGS] : null;
  const accentColor = gsCfg?.color ?? '#7C3AED';

  const dateStr = article.publishedDate
    ? new Date(article.publishedDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '';

  return (
    <Link
      href={`/current-affairs/${article.id}`}
      className="group block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Colored top accent */}
      <div className="h-[3px]" style={{ background: accentColor }} />

      <div className="p-6 flex flex-col h-full">
        {/* GS tags + date */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-1.5">
            {article.gsPaperTags.map((tag) => {
              const cfg = GS_CONFIG[tag];
              return cfg ? (
                <span
                  key={tag}
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                >
                  {tag}
                </span>
              ) : null;
            })}
          </div>
          {dateStr && (
            <span className="text-[10px] text-muted-foreground shrink-0">{dateStr}</span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-[15px] font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
          {article.title}
        </h2>

        {/* Summary */}
        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3 flex-1 mb-4">
          {article.summary}
        </p>

        {/* Footer: topic chips + key facts count + arrow */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/60">
          <div className="flex gap-1.5 flex-wrap">
            {article.topicTags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-primary shrink-0">
            {article.keyFacts.length > 0 && (
              <span className="text-[10px] text-muted-foreground mr-1">
                {article.keyFacts.length} facts
              </span>
            )}
            Read more
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Empty state ───────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered?: boolean }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-16 text-center gap-4">
      <Newspaper className="h-12 w-12 text-muted-foreground/25" />
      <div>
        <p className="text-sm font-semibold text-foreground">
          {filtered ? 'No articles match your filters' : 'No articles yet'}
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          {filtered
            ? 'Try clearing a filter to see more articles.'
            : 'Our AI pipeline processes new articles every morning at 6 AM IST.'}
        </p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function CurrentAffairsPublicPage() {
  const [view, setView]                   = useState<ViewMode>('today');
  const [paperFilter, setPaperFilter]     = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const monthOptions                      = useMemo(() => getMonthOptions(), []);
  const [archiveMonth, setArchiveMonth]   = useState(monthOptions[0]);

  const todayQ   = useTodaysCurrentAffairs();
  const recentQ  = useRecentCurrentAffairs(40);
  const archiveQ = useCurrentAffairsByMonth(archiveMonth.year, archiveMonth.month);

  const rawArticles =
    view === 'today'  ? todayQ.data  :
    view === 'recent' ? recentQ.data :
    archiveQ.data;

  const isLoading =
    view === 'today'  ? todayQ.isLoading  :
    view === 'recent' ? recentQ.isLoading :
    archiveQ.isLoading;

  const isError =
    view === 'today'  ? todayQ.isError  :
    view === 'recent' ? recentQ.isError :
    archiveQ.isError;

  const filtered   = useFilteredArticles(rawArticles, paperFilter, subjectSearch);
  const totalCount = filtered.length;
  const hasFilter  = !!(paperFilter || subjectSearch);

  const todayFull = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div style={{ color: '#1A1836' }}>

      {/* ── Dark hero ── */}
      <section className="relative overflow-hidden" style={{ background: MIDNIGHT }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.1) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%', right: '-5%',
            transform: 'translateY(-50%)',
            width: 500, height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 68%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-16">
          <div className="max-w-2xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-5"
              style={{
                background: 'rgba(124,58,237,0.18)',
                border: '1px solid rgba(124,58,237,0.35)',
                color: '#C4B5FD',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: '#34D399' }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#34D399' }} />
              </span>
              Updated Daily · Free for Everyone
            </div>

            <h1
              className="font-extrabold tracking-tight mb-3"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.1, color: '#F0EEFF' }}
            >
              Current Affairs <span style={TEXT_GRAD}>Digest</span>
            </h1>
            <p style={{ color: 'rgba(196,181,253,0.65)', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: 520 }}>
              AI-curated news for UPSC, SSC &amp; State PSC aspirants — tagged by GS paper,
              with key facts and mains angles. Published every morning.
            </p>

            {/* Stats strip */}
            <div className="flex items-center gap-6 mt-6">
              {[
                { v: 'Daily', l: 'New articles' },
                { v: 'GS1–4', l: 'Paper tagged' },
                { v: 'Free', l: 'No sign-up needed' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-extrabold text-base text-white">{s.v}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'rgba(196,181,253,0.45)' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Content area ── */}
      <section style={{ background: '#F5F4FF', minHeight: '60vh' }}>
        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* ── Filter card ── */}
          <div className="rounded-2xl border border-border bg-white shadow-sm p-5 mb-8 space-y-5">

            {/* Row 1: view tabs + date + article count */}
            <div className="flex flex-wrap items-center justify-between gap-4">

              {/* View tabs */}
              <div className="flex items-center gap-1 bg-secondary/70 rounded-xl p-1">
                {(
                  [
                    { id: 'today',   label: 'Today',   Icon: Newspaper    },
                    { id: 'recent',  label: 'Recent',  Icon: CalendarDays },
                    { id: 'archive', label: 'Archive', Icon: CalendarDays },
                  ] as { id: ViewMode; label: string; Icon: React.ElementType }[]
                ).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                      view === id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Date + count */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:block">{todayFull}</span>
                {!isLoading && rawArticles && rawArticles.length > 0 && (
                  <span
                    className="text-[11px] font-bold px-3 py-1 rounded-full"
                    style={{
                      background: 'rgba(124,58,237,0.08)',
                      color: '#7C3AED',
                      border: '1px solid rgba(124,58,237,0.15)',
                    }}
                  >
                    {totalCount} article{totalCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Month picker (archive mode) */}
            {view === 'archive' && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">Month:</span>
                {monthOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setArchiveMonth(opt)}
                    className={cn(
                      'shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap',
                      archiveMonth.key === opt.key
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-border" />

            {/* Row 2: GS chips + search */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">GS Paper:</span>

              <div className="flex gap-1.5 flex-wrap">
                {(['All', 'GS1', 'GS2', 'GS3', 'GS4'] as const).map((p) => {
                  const cfg      = p !== 'All' ? GS_CONFIG[p] : null;
                  const isActive = p === 'All' ? !paperFilter : paperFilter === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPaperFilter(p === 'All' ? '' : paperFilter === p ? '' : p)}
                      className={cn(
                        'text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer',
                        isActive
                          ? 'text-white border-transparent'
                          : 'text-muted-foreground border-border bg-background hover:border-primary/30 hover:text-foreground',
                      )}
                      style={isActive ? {
                        background: cfg ? cfg.color : '#7C3AED',
                      } : {}}
                      title={cfg?.label}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Topic search */}
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 min-w-45 ml-auto">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  placeholder="Search topics…"
                  className="text-xs bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none flex-1 min-w-0"
                />
                {subjectSearch && (
                  <button
                    onClick={() => setSubjectSearch('')}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {hasFilter && (
                <button
                  onClick={() => { setPaperFilter(''); setSubjectSearch(''); }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-destructive hover:underline cursor-pointer"
                >
                  <X className="h-3 w-3" />Clear
                </button>
              )}
            </div>
          </div>

          {/* ── GS legend ── */}
          {!isLoading && !isError && !hasFilter && (
            <div className="flex flex-wrap gap-3 mb-6">
              {Object.entries(GS_CONFIG).map(([key, cfg]) => (
                <div
                  key={key}
                  className="flex items-center gap-1.5 text-[11px] font-medium"
                  style={{ color: '#6B63A0' }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: cfg.color }}
                  />
                  <span className="font-bold" style={{ color: cfg.color }}>{key}</span>
                  <span className="hidden sm:inline">— {cfg.label.split(' · ')[1]}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Articles ── */}
          {isError ? (
            <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 border border-destructive/20 p-5 text-sm text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Could not load articles</p>
                <p className="text-xs mt-0.5 opacity-80">The pipeline may still be processing — check back shortly after 6 AM IST.</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start">
              {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start">
              {filtered.length === 0
                ? <EmptyState filtered={hasFilter} />
                : filtered.map((a) => <ArticleCard key={a.id} article={a} />)
              }
            </div>
          )}

          {/* ── Sign-up nudge at bottom ── */}
          {!isLoading && !isError && filtered.length > 0 && (
            <div
              className="mt-12 rounded-2xl overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 50%, #C026D3 100%)' }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />
              <div className="relative px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-white font-bold text-base">Want the full prep toolkit?</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Sign up free — get Mains angles, AI Mentor access, MCQs &amp; personalised study plans.
                  </p>
                </div>
                <Link
                  href="/signup"
                  className="shrink-0 inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm hover:opacity-95 transition-opacity"
                  style={{ background: '#FFFFFF', color: '#7C3AED', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

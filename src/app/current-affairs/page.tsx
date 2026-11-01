'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  useRecentCurrentAffairs,
  useCurrentAffairsByMonth,
  useFilteredArticles,
  useCurrentAffairsSearch,
} from '@/features/current-affairs/hooks/use-current-affairs';
import { useAuthStore } from '@/store/use-auth-store';
import {
  Newspaper, Search, X, AlertCircle,
  CalendarDays, ArrowRight, BookOpen, Zap, Layers, ChevronDown, Loader2, MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CurrentAffairsArticle } from '@/types/features';

// ── Constants ─────────────────────────────────────────────────────

// Monochrome: GS papers differ by label only.
const GS_CONFIG: Record<string, { label: string }> = {
  GS1: { label: 'GS1 · Indian Heritage & Society' },
  GS2: { label: 'GS2 · Polity & International' },
  GS3: { label: 'GS3 · Economy & Environment' },
  GS4: { label: 'GS4 · Ethics & Integrity' },
};


type ViewMode = 'recent' | 'archive';

const PAGE_SIZE = 10;

// ── Timezone helper ───────────────────────────────────────────────
// Backend stores dates as UTC timestamps (e.g. 2026-07-25T18:30:00Z = 2026-07-26 IST midnight).
// Always extract the IST (UTC+5:30) calendar date, not the raw UTC date.
function toISTDateKey(isoStr: string): string {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr.slice(0, 10);
  const istMs = d.getTime() + (5 * 60 + 30) * 60 * 1000;
  return new Date(istMs).toISOString().slice(0, 10);
}

// ── Group helpers ─────────────────────────────────────────────────

interface DateGroup {
  dateKey: string;          // YYYY-MM-DD
  displayDate: string;      // "31 July 2026"
  dayOfWeek: string;        // "Thursday"
  articles: CurrentAffairsArticle[];
  gsPapers: string[];       // unique, sorted
  totalFacts: number;
  hasMCQ: boolean;
}

function groupByDate(articles: CurrentAffairsArticle[]): DateGroup[] {
  const map = new Map<string, CurrentAffairsArticle[]>();
  for (const a of articles) {
    const key = a.publishedDate ? toISTDateKey(a.publishedDate) : 'unknown';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => {
      const d = new Date(`${key}T00:00:00`);
      const allGS = items.flatMap((a) => a.gsPaperTags);
      const uniqueGS = Array.from(new Set(allGS)).sort();
      const totalFacts = items.reduce(
        (acc, a) => acc + a.keyFacts.length + (a.enrichedData?.prelimsFacts?.length ?? 0), 0,
      );
      return {
        dateKey:     key,
        displayDate: isNaN(d.getTime()) ? key : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        dayOfWeek:   isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { weekday: 'long' }),
        articles:    items,
        gsPapers:    uniqueGS,
        totalFacts,
        hasMCQ:      items.some((a) => (a.practiceQuestions?.length ?? 0) > 0),
      };
    });
}

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
    <div className="ks-card animate-pulse" aria-hidden="true">
      <div className="ks-card-visual h-24" />
      <div className="ks-card-body">
        <div className="ks-card-head">
          <div className="h-5 w-10 rounded-[2px] bg-paper-gray" />
          <div className="h-5 w-10 rounded-[2px] bg-paper-gray" />
          <div className="h-5 w-10 rounded-[2px] bg-paper-gray" />
        </div>
        <div className="h-4 w-2/3 rounded-[2px] bg-paper-gray" />
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded-[2px] bg-paper-deep" />
          <div className="h-3 w-4/5 rounded-[2px] bg-paper-deep" />
          <div className="h-3 w-3/4 rounded-[2px] bg-paper-deep" />
        </div>
        <div className="h-3 w-24 rounded-[2px] bg-paper-deep" />
      </div>
    </div>
  );
}

// ── Date card ─────────────────────────────────────────────────────
// One card per calendar date — shows all articles for that day as a digest tile

function DateCard({ group }: { group: DateGroup }) {
  // Top 6 unique topic tags across all articles
  const allTopics = Array.from(
    new Set(group.articles.flatMap((a) => a.topicTags)),
  ).slice(0, 5);

  // First 3 article titles as a preview list
  const titlePreview = group.articles.slice(0, 3);

  // Big date numerals for the visual strip
  const d = new Date(`${group.dateKey}T00:00:00`);
  const valid = !isNaN(d.getTime());
  const dayNum = valid ? d.toLocaleDateString('en-IN', { day: '2-digit' }) : '';
  const monthShort = valid ? d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : group.dateKey;

  return (
    <Link href={`/current-affairs/date/${group.dateKey}`} className="ks-card">
      <div className="ks-card-visual h-24 justify-start gap-3 px-[18px]">
        <span className="font-display font-light text-[3.75rem] leading-none text-ink tabular-nums">
          {dayNum}
        </span>
        <span className="flex flex-col">
          <span className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">{group.dayOfWeek}</span>
          <span className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">{monthShort}</span>
        </span>
      </div>

      <div className="ks-card-body">
        {/* GS paper tags */}
        {group.gsPapers.some((tag) => GS_CONFIG[tag]) && (
          <div className="ks-card-head">
            {group.gsPapers.map((tag) =>
              GS_CONFIG[tag] ? <span key={tag} className="ks-tag">{tag}</span> : null,
            )}
          </div>
        )}

        <h3 className="ks-card-title">{group.displayDate}</h3>

        <span className="ks-card-meta inline-flex items-center gap-1.5">
          <Layers className="h-3 w-3" />
          {group.articles.length} {group.articles.length === 1 ? 'story' : 'stories'}
        </span>

        {/* Article title preview */}
        <ul className="ks-card-desc space-y-1" style={{ listStyle: 'none', padding: 0 }}>
          {titlePreview.map((a) => (
            <li key={a.id} className="flex items-start gap-2">
              <span aria-hidden="true" className="shrink-0 text-ink-faint">–</span>
              <span className="line-clamp-1">{a.title}</span>
            </li>
          ))}
          {group.articles.length > 3 && (
            <li className="pl-4 text-ink-muted">
              +{group.articles.length - 3} more stories
            </li>
          )}
        </ul>

        {/* Topic tags */}
        {allTopics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTopics.map((tag) => (
              <span key={tag} className="ks-tag ks-tag-outline">{tag}</span>
            ))}
          </div>
        )}

        {/* Stats */}
        {(group.totalFacts > 0 || group.hasMCQ) && (
          <span className="ks-card-meta flex items-center gap-3">
            {group.totalFacts > 0 && (
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {group.totalFacts} facts
              </span>
            )}
            {group.hasMCQ && (
              <span className="inline-flex items-center gap-1">
                <Zap className="h-3 w-3" />
                MCQ
              </span>
            )}
          </span>
        )}

        <span className="ks-card-link">Study</span>
      </div>
    </Link>
  );
}

// ── Empty state ───────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered?: boolean }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-[2px] border border-dashed border-rule-strong bg-paper-raised p-16 text-center gap-4">
      <Newspaper className="h-10 w-10 text-ink-faint" />
      <div>
        <p className="text-sm font-semibold text-ink">
          {filtered ? 'No articles match your filters' : 'No articles yet'}
        </p>
        <p className="text-xs text-ink-muted mt-1 max-w-xs mx-auto">
          {filtered
            ? 'Try clearing a filter to see more articles.'
            : 'Our AI pipeline processes new articles every morning at 6 AM IST.'}
        </p>
      </div>
    </div>
  );
}

// ── Individual article card (search results) ──────────────────────

function ArticleCard({ article }: { article: CurrentAffairsArticle }) {
  const dateLabel = article.publishedDate
    ? new Date(`${toISTDateKey(article.publishedDate)}T00:00:00`).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '';

  const gsTags = article.gsPaperTags.slice(0, 2).filter((tag) => GS_CONFIG[tag]);
  const topicTags = article.topicTags.slice(0, 4);

  return (
    <Link href={`/current-affairs/${article.id}`} className="ks-card">
      <div className="ks-card-body">
        {(gsTags.length > 0 || topicTags.length > 0) && (
          <div className="ks-card-head">
            {gsTags.map((tag) => (
              <span key={tag} className="ks-tag">{tag}</span>
            ))}
            {topicTags.map((tag) => (
              <span key={tag} className="ks-tag ks-tag-outline">{tag}</span>
            ))}
          </div>
        )}

        <h3 className="ks-card-title line-clamp-2">{article.title}</h3>

        {article.summary && (
          <p className="ks-card-desc line-clamp-3">{article.summary}</p>
        )}

        {dateLabel && <span className="ks-card-meta">{dateLabel}</span>}

        <span className="ks-card-link">Read</span>
      </div>
    </Link>
  );
}

// ── Search empty state ────────────────────────────────────────────

function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-[2px] border border-dashed border-rule-strong bg-paper-raised p-16 text-center gap-4">
      <Search className="h-10 w-10 text-ink-faint" />
      <div>
        <p className="text-sm font-semibold text-ink">
          No articles found for &quot;{query}&quot;
        </p>
        <p className="text-xs text-ink-muted mt-1 max-w-xs mx-auto">
          Try a different search term, or browse by date below.
        </p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function CurrentAffairsPublicPage() {
  const [view, setView]                   = useState<ViewMode>('recent');
  const [paperFilter, setPaperFilter]     = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [visibleCount, setVisibleCount]   = useState(PAGE_SIZE);
  const monthOptions                      = useMemo(() => getMonthOptions(), []);
  const [archiveMonth, setArchiveMonth]   = useState(monthOptions[0]);

  // Search state
  const [searchQuery,    setSearchQuery]    = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const isSearchMode = debouncedSearch.length >= 2;

  const userExam = useAuthStore((s) => s.user?.target_exam ?? s.user?.targetExam);

  // Fetch 150 articles upfront — enough for ~10–15 date groups without extra API calls
  const recentQ  = useRecentCurrentAffairs(150, userExam);
  const archiveQ = useCurrentAffairsByMonth(archiveMonth.year, archiveMonth.month, userExam);
  const searchQ  = useCurrentAffairsSearch(debouncedSearch, userExam);

  const rawArticles = view === 'recent' ? recentQ.data : archiveQ.data;
  const isLoading   = view === 'recent' ? recentQ.isLoading : archiveQ.isLoading;
  const isError     = view === 'recent' ? recentQ.isError   : archiveQ.isError;

  const filtered   = useFilteredArticles(rawArticles, paperFilter, subjectSearch);
  const dateGroups = useMemo(() => groupByDate(filtered), [filtered]);
  const hasFilter  = !!(paperFilter || subjectSearch);

  // When filters are active show everything; otherwise paginate
  const visibleGroups = hasFilter ? dateGroups : dateGroups.slice(0, visibleCount);
  const hasMore       = !hasFilter && visibleCount < dateGroups.length;

  // Reset pagination when view or filters change
  const handleViewChange = (v: ViewMode) => { setView(v); setVisibleCount(PAGE_SIZE); };
  const handleFilterChange = (paper: string, search: string) => {
    setPaperFilter(paper); setSubjectSearch(search);
  };

  const todayFull = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });


  const chipCls = (active: boolean) => cn(
    'chip cursor-pointer transition-colors duration-150 ease-ks',
    active
      ? 'bg-ink text-paper border-ink'
      : 'hover:border-ink hover:text-ink',
  );

  return (
    <div className="text-ink-soft">

      {/* ── Hero ── */}
      <section className="bg-background border-b border-rule">
        <div className="ks-container pt-14 pb-14">
          <div className="max-w-2xl">
            {/* Badge */}
            <p className="eyebrow mb-5">
              <span className="eyebrow-dot" />
              Updated Daily · Free for Everyone
            </p>

            <h1 className="doc-title mb-4">Current Affairs Digest</h1>
            <p className="doc-lede">
              AI-curated news for UPSC, SSC &amp; State PSC aspirants — tagged by GS paper,
              with key facts and mains angles. Published every morning.
            </p>

            {/* Stats strip */}
            <div className="flex items-center gap-8 mt-7">
              {[
                { v: 'Daily', l: 'New articles' },
                { v: 'GS1–4', l: 'Paper tagged' },
                { v: 'Free', l: 'No sign-up needed' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-semibold text-base text-ink">{s.v}</div>
                  <div className="font-label text-[11px] uppercase tracking-[0.14em] mt-0.5 text-ink-muted">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Places in News CTA */}
            <Link
              href="/current-affairs/places-in-news"
              className="btn-ink btn-sm mt-7 group"
            >
              <MapPin className="h-4 w-4 shrink-0" />
              Explore Places in the News on a map
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-150 ease-ks group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Content area ── */}
      <section className="bg-paper" style={{ minHeight: '60vh' }}>
        <div className="ks-container py-10">

          {/* ── Places in News promo banner ── */}
          <Link
            href="/current-affairs/places-in-news"
            className="ks-card group flex! flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 sm:p-7 mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 h-9 w-9 rounded-[3px] border border-rule bg-paper-deep flex items-center justify-center">
                <MapPin className="h-4 w-4 text-ink" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="ks-tag ks-tag-gold">NEW</span>
                  <span className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                    Places in the News
                  </span>
                </div>
                <p className="font-semibold text-ink" style={{ fontSize: '1.05rem', lineHeight: 1.3 }}>
                  Every border dispute, summit &amp; disaster — mapped.
                </p>
                <p className="text-sm mt-1 text-ink-muted" style={{ maxWidth: 440 }}>
                  See where the news is actually happening, grouped by day, with a live map view.
                </p>
              </div>
            </div>

            <span className="ks-card-link shrink-0 mt-0!">
              Explore the map
            </span>
          </Link>

          {/* ── Filter card ── */}
          <div className="rounded-[2px] border border-rule bg-paper-raised p-5 mb-8 space-y-5">

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles… e.g. 'budget', 'ISRO mission'"
                className="w-full pl-10 pr-10 py-2.5 text-sm text-ink rounded-[3px] border border-rule-strong bg-paper placeholder:text-ink-muted focus:outline-none focus:border-ink transition-colors duration-150 ease-ks"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setDebouncedSearch(''); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters — hidden while search is active */}
            {!isSearchMode && (
              <>
                {/* Row 1: view tabs + date + article count */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    {(
                      [
                        { id: 'recent',  label: 'Latest',  Icon: Newspaper    },
                        { id: 'archive', label: 'Archive', Icon: CalendarDays },
                      ] as { id: ViewMode; label: string; Icon: React.ElementType }[]
                    ).map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        onClick={() => handleViewChange(id)}
                        className={cn(chipCls(view === id), 'h-8 px-3.5')}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted hidden sm:block">{todayFull}</span>
                    {!isLoading && dateGroups.length > 0 && (
                      <span className="ks-tag">
                        {hasMore
                          ? `${visibleCount} of ${dateGroups.length} days`
                          : `${dateGroups.length} day${dateGroups.length !== 1 ? 's' : ''}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Month picker (archive mode) */}
                {view === 'archive' && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted shrink-0">Month:</span>
                    {monthOptions.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setArchiveMonth(opt)}
                        className={cn(chipCls(archiveMonth.key === opt.key), 'shrink-0')}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="border-t border-rule" />

                {/* Row 2: GS chips + topic filter */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">GS Paper:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {(['All', 'GS1', 'GS2', 'GS3', 'GS4'] as const).map((p) => {
                      const cfg      = p !== 'All' ? GS_CONFIG[p] : null;
                      const isActive = p === 'All' ? !paperFilter : paperFilter === p;
                      return (
                        <button
                          key={p}
                          onClick={() => handleFilterChange(p === 'All' ? '' : paperFilter === p ? '' : p, subjectSearch)}
                          className={chipCls(isActive)}
                          title={cfg?.label}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 rounded-[3px] border border-rule-strong bg-paper px-3 py-1.5 min-w-45 ml-auto focus-within:border-ink transition-colors duration-150 ease-ks">
                    <Search className="h-3.5 w-3.5 text-ink-muted shrink-0" />
                    <input
                      type="text"
                      value={subjectSearch}
                      onChange={(e) => handleFilterChange(paperFilter, e.target.value)}
                      placeholder="Filter by topic…"
                      className="text-xs bg-transparent text-ink placeholder:text-ink-muted focus:outline-none flex-1 min-w-0"
                    />
                    {subjectSearch && (
                      <button onClick={() => handleFilterChange(paperFilter, '')} className="text-ink-muted hover:text-ink cursor-pointer">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  {hasFilter && (
                    <button
                      onClick={() => handleFilterChange('', '')}
                      className="flex items-center gap-1 font-label text-[11px] uppercase tracking-[0.1em] text-ink-muted hover:text-ink underline underline-offset-4 decoration-rule-strong cursor-pointer"
                    >
                      <X className="h-3 w-3" />Clear
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Search results ── */}
          {isSearchMode ? (
            <div>
              <div className="ks-group-head">
                <h2 className="ks-group-title flex items-center gap-2">
                  {searchQ.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />
                  ) : (
                    <Search className="h-4 w-4 text-ink-muted" />
                  )}
                  {searchQ.isLoading
                    ? `Searching for "${debouncedSearch}"…`
                    : searchQ.data?.length
                    ? `${searchQ.data.length} result${searchQ.data.length !== 1 ? 's' : ''} for "${debouncedSearch}"`
                    : `Results for "${debouncedSearch}"`}
                </h2>
              </div>
              {searchQ.isError ? (
                <div className="flex items-center gap-3 rounded-[2px] border border-[oklch(52%_.16_35_/_.3)] bg-paper-raised p-5 text-sm text-[oklch(52%_.16_35)]">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>Search failed — please try again.</span>
                </div>
              ) : searchQ.isLoading ? (
                <div className="ks-card-grid">
                  {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
                </div>
              ) : (searchQ.data?.length ?? 0) === 0 ? (
                <div className="grid gap-5 grid-cols-1">
                  <SearchEmptyState query={debouncedSearch} />
                </div>
              ) : (
                <div className="ks-card-grid">
                  {searchQ.data!.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>

          {/* ── GS legend ── */}
          {!isLoading && !isError && !hasFilter && (
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6">
              {Object.entries(GS_CONFIG).map(([key, cfg]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 text-xs text-ink-muted"
                >
                  <span className="ks-tag">{key}</span>
                  <span className="hidden sm:inline">{cfg.label.split(' · ')[1]}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Articles ── */}
          {isError ? (
            <div className="flex items-center gap-3 rounded-[2px] border border-[oklch(52%_.16_35_/_.3)] bg-paper-raised p-5 text-sm text-[oklch(52%_.16_35)]">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Could not load articles</p>
                <p className="text-xs mt-0.5 text-ink-muted">The pipeline may still be processing — check back shortly after 6 AM IST.</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="ks-card-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <>
              <div className="ks-group-head">
                <h2 className="ks-group-title">
                  {view === 'recent' ? 'Latest digests' : archiveMonth.label}
                </h2>
              </div>
              <div className="ks-card-grid">
                {visibleGroups.length === 0
                  ? <EmptyState filtered={hasFilter} />
                  : visibleGroups.map((g) => <DateCard key={g.dateKey} group={g} />)
                }
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="flex flex-col items-center gap-3 mt-8">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="btn-outline btn-sm"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Load More
                    <span className="ks-tag">
                      {Math.min(PAGE_SIZE, dateGroups.length - visibleCount)} more days
                    </span>
                  </button>
                  <p className="font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                    Showing {visibleCount} of {dateGroups.length} days
                  </p>
                </div>
              )}
            </>
          )}

          {/* ── Sign-up nudge ── */}
          {!isLoading && !isError && dateGroups.length > 0 && (
            <div className="mt-12 rounded-[2px] border border-rule bg-paper-deep">
              <div className="px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-ink font-semibold text-base">Want the full prep toolkit?</p>
                  <p className="text-sm mt-1 text-ink-muted">
                    Sign up free — get Mains angles, AI Mentor access, MCQs &amp; personalised study plans.
                  </p>
                </div>
                <Link
                  href="/signup"
                  className="btn-ink shrink-0"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

            </>
          )}
        </div>
      </section>
    </div>
  );
}

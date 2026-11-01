'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { currentAffairsService } from '@/services/current-affairs.service';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { useAuthStore } from '@/store/use-auth-store';
import type { CurrentAffairsArticle } from '@/types/features';
import {
  ArrowLeft, ExternalLink, BookOpen, ArrowRight,
  AlertCircle, BookMarked, Zap,
} from 'lucide-react';

// ── Design tokens ──────────────────────────────────────────────────

// Monochrome: GS papers differ by label only.
const GS_CONFIG: Record<string, { desc: string }> = {
  GS1: { desc: 'Indian Heritage & Society' },
  GS2: { desc: 'Polity & International' },
  GS3: { desc: 'Economy & Environment' },
  GS4: { desc: 'Ethics & Integrity' },
};

const LABEL = 'font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted';

// ── Inline bold renderer ──────────────────────────────────────────

function RenderFact({ fact }: { fact: string }) {
  const nl    = fact.indexOf('\n');
  const first = nl === -1 ? fact : fact.slice(0, nl);
  const match = first.match(/^([A-Za-z][^:]{1,55}):\s*(.+)/);
  if (match) {
    return (
      <>
        <strong className="font-semibold text-ink">{match[1]}:</strong>{' '}{match[2]}
      </>
    );
  }
  return <>{fact}</>;
}

// ── Single article section (digest card) ─────────────────────────

function ArticleSection({ article, index }: { article: CurrentAffairsArticle; index: number }) {
  const ed = article.enrichedData;
  const whyInNews = ed?.whyInNews || article.summary;
  const previewFacts = article.keyFacts.slice(0, 4);
  const previewPrelims = ed?.prelimsFacts?.slice(0, 4) ?? [];
  const totalFacts = article.keyFacts.length + (ed?.prelimsFacts?.length ?? 0);
  const hasMCQ = (article.practiceQuestions?.length ?? 0) > 0;

  return (
    <article className="ks-card">
      <div className="ks-card-body gap-5! p-6!">

        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            {/* GS chips */}
            <div className="ks-card-head">
              {article.gsPaperTags.map((tag) => {
                const cfg = GS_CONFIG[tag];
                return cfg ? (
                  <span key={tag} className="ks-tag">
                    {tag} · {cfg.desc}
                  </span>
                ) : null;
              })}
            </div>
            <h2 className="ks-card-title text-[1.125rem]!">
              {article.title}
            </h2>
            {article.sourceName && (
              <div className="ks-card-meta flex items-center gap-2">
                <span>{article.sourceName}</span>
                {article.sourceUrl && (
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-ink underline underline-offset-4 decoration-rule-strong hover:decoration-ink"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />Source
                  </a>
                )}
              </div>
            )}
          </div>
          {/* Serial number */}
          <span className="h-8 w-8 rounded-[3px] border border-rule bg-paper-deep flex items-center justify-center font-label text-sm text-ink tabular-nums shrink-0">
            {index + 1}
          </span>
        </div>

        {/* Why in news */}
        {whyInNews && (
          <div>
            <p className={`${LABEL} mb-1.5`}>
              Why in News
            </p>
            {whyInNews.includes('<') ? (
              <div
                className="doc-prose"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(whyInNews) }}
              />
            ) : (
              <p className="doc-prose">
                {whyInNews}
              </p>
            )}
          </div>
        )}

        {/* Prelims quick facts table */}
        {previewPrelims.length > 0 && (
          <div>
            <p className={`${LABEL} mb-2`}>
              Prelims Quick Facts
            </p>
            <div className="rounded-[2px] overflow-hidden border border-rule">
              {previewPrelims.map((f, i) => (
                <div
                  key={i}
                  className={`flex ${i < previewPrelims.length - 1 ? 'border-b border-rule' : ''}`}
                >
                  <div
                    className={`w-5/12 px-3 py-2 text-xs flex items-center text-ink-muted border-r border-rule ${i % 2 === 0 ? 'bg-paper-deep' : ''}`}
                  >
                    {f.label}
                  </div>
                  <div className="flex-1 px-3 py-2 text-[13px] font-semibold flex items-center text-ink">
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key points */}
        {previewFacts.length > 0 && (
          <div>
            <p className={`${LABEL} mb-2`}>
              Key Points
            </p>
            <ul className="space-y-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {previewFacts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="rounded-full shrink-0 mt-2.5 bg-ink-muted"
                    style={{ width: 4, height: 4, flexShrink: 0 }}
                  />
                  {fact.includes('<') ? (
                    <span
                      className="doc-prose text-[0.9375rem]!"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(fact) }}
                    />
                  ) : (
                    <span className="text-[0.9375rem] leading-[1.65] text-ink-soft">
                      <RenderFact fact={fact} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer row: topics + stats */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-rule">
          <div className="flex flex-wrap gap-1.5">
            {article.topicTags.slice(0, 4).map((tag) => (
              <span key={tag} className="ks-tag ks-tag-outline">
                {tag}
              </span>
            ))}
          </div>
          <div className="ks-card-meta flex items-center gap-3">
            {totalFacts > 0 && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {totalFacts} facts
              </span>
            )}
            {hasMCQ && (
              <span className="ks-tag">
                <Zap className="h-2.5 w-2.5" />MCQ
              </span>
            )}
          </div>
        </div>

        {/* ── Deep Dive CTA ── */}
        <Link
          href={`/current-affairs/${article.id}`}
          className="group flex items-center justify-between gap-4 rounded-[2px] border border-rule-strong bg-paper-deep px-5 py-4 transition-colors duration-150 ease-ks hover:border-ink"
        >
          {/* Left: label + subtitle */}
          <div className="space-y-0.5">
            <span className="text-ink font-semibold text-sm">
              Deep Dive
            </span>
            <p className="ks-card-meta">
              {[
                (ed?.keyFeatures?.length ?? 0) > 0 && 'Key Features',
                hasMCQ && 'MCQ Practice',
                (ed?.keyTerms?.length ?? 0) > 0 && 'Key Terms',
                (ed?.wayForward?.length ?? 0) > 0 && 'Way Forward',
              ].filter(Boolean).slice(0, 3).join(' · ')}
              {(!ed?.keyFeatures?.length && !hasMCQ && !ed?.keyTerms?.length) && 'Key Terms · Mains Angles · Way Forward'}
            </p>
          </div>

          {/* Right: label + arrow */}
          <div className="flex items-center gap-3 shrink-0 text-ink">
            <span className="hidden sm:inline-flex items-center gap-1.5 font-label text-xs">
              <BookMarked className="h-3 w-3" />
              Full Analysis
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-150 ease-ks group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>
    </article>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────

function DigestSkeleton() {
  return (
    <>
      <section className="bg-background border-b border-rule">
        <div className="ks-container pt-10 pb-14 space-y-4 animate-pulse">
          <div className="h-3 w-40 rounded-[2px] bg-paper-gray" />
          <div className="h-10 w-64 rounded-[2px] bg-paper-gray" />
          <div className="flex gap-2 mt-2">
            <div className="h-5 w-16 rounded-[2px] bg-paper-gray" />
            <div className="h-5 w-16 rounded-[2px] bg-paper-gray" />
          </div>
        </div>
      </section>
      <section className="bg-paper">
        <div className="ks-container py-10 space-y-5 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="ks-card p-6 space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 rounded-[2px]" />
              </div>
              <Skeleton className="h-6 w-full rounded-[2px]" />
              <Skeleton className="h-4 w-full rounded-[2px]" />
              <Skeleton className="h-4 w-4/5 rounded-[2px]" />
              <Skeleton className="h-4 w-3/4 rounded-[2px]" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export function DailyDigestClient() {
  const { date } = useParams<{ date: string }>();
  const userExam = useAuthStore((s) => s.user?.target_exam);

  const { data: articles, isLoading, isError } = useQuery({
    queryKey: ['current-affairs', 'date', date, userExam ?? null],
    queryFn: () => currentAffairsService.getByDate(date, userExam),
    staleTime: 60 * 60 * 1000,
    retry: false,
    enabled: !!date,
  });

  // Format the date param for display
  const displayDate = (() => {
    const d = new Date(`${date}T00:00:00`);
    if (isNaN(d.getTime())) return date;
    return {
      dayOfWeek: d.toLocaleDateString('en-IN', { weekday: 'long' }),
      full:      d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  })();

  const allGS = Array.from(new Set((articles ?? []).flatMap((a) => a.gsPaperTags))).sort();
  const totalFacts = (articles ?? []).reduce(
    (acc, a) => acc + a.keyFacts.length + (a.enrichedData?.prelimsFacts?.length ?? 0), 0,
  );


  if (isLoading) return <DigestSkeleton />;

  if (isError || !articles) {
    return (
      <section className="bg-paper" style={{ minHeight: '60vh' }}>
        <div className="ks-container py-20 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-[oklch(52%_.16_35)]" />
          <p className="text-lg font-semibold text-ink">No articles found for this date</p>
          <Link
            href="/current-affairs"
            className="btn-ink btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />Back to Current Affairs
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="text-ink-soft">

      {/* ── Hero ── */}
      <section className="bg-background border-b border-rule">
        <div className="ks-container pt-10 pb-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6 text-ink-muted">
            <Link href="/current-affairs" className="hover:text-ink transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Current Affairs
            </Link>
            <span>/</span>
            <span>Daily Digest</span>
          </div>

          {/* Label */}
          <p className="eyebrow mb-4">
            <span className="eyebrow-dot" />
            Daily Current Affairs
          </p>

          {/* Date heading */}
          {typeof displayDate === 'object' ? (
            <>
              <p className="text-sm font-medium mb-1 text-ink-muted">
                {displayDate.dayOfWeek}
              </p>
              <h1 className="doc-title mb-5">
                {displayDate.full}
              </h1>
            </>
          ) : (
            <h1 className="doc-title mb-5">
              {displayDate}
            </h1>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-5">
            <div>
              <span className="font-semibold tabular-nums text-ink text-lg">{articles.length}</span>
              <span className="font-label text-[11px] uppercase tracking-[0.14em] ml-1.5 text-ink-muted">
                {articles.length === 1 ? 'Article' : 'Articles'}
              </span>
            </div>
            {totalFacts > 0 && (
              <div>
                <span className="font-semibold tabular-nums text-ink text-lg">{totalFacts}</span>
                <span className="font-label text-[11px] uppercase tracking-[0.14em] ml-1.5 text-ink-muted">Facts</span>
              </div>
            )}
            {/* GS chips */}
            <div className="flex flex-wrap gap-1.5">
              {allGS.map((tag) =>
                GS_CONFIG[tag] ? <span key={tag} className="ks-tag">{tag}</span> : null,
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Articles ── */}
      <section className="bg-paper">
        <div className="ks-container py-10 space-y-6">
          {articles.map((article, i) => (
            <div key={article.id}>
              <ArticleSection article={article} index={i} />
            </div>
          ))}

          {/* Back + navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-rule">
            <Link
              href="/current-affairs"
              className="btn-outline btn-sm"
            >
              <ArrowLeft className="h-4 w-4" />All Dates
            </Link>
            <Link
              href="/signup"
              className="btn-ink btn-sm"
            >
              Get Full Access
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

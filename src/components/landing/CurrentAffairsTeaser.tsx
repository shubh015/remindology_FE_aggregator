'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { useRecentCurrentAffairs } from '@/features/current-affairs/hooks/use-current-affairs';
import type { CurrentAffairsArticle } from '@/types/features';

function stripHtml(text: string): string {
  return text.includes('<') ? text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : text;
}

// ── Article card ────────────────────────────────────────────────
function ArticleCard({ article }: { article: CurrentAffairsArticle }) {
  const dateStr = article.publishedDate
    ? new Date(article.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '';

  return (
    <Link href={`/current-affairs/${article.id}`} className="ks-card h-full">
      <div className="ks-card-body">
        {/* Tags row */}
        {article.gsPaperTags.length > 0 && (
          <div className="ks-card-head">
            {article.gsPaperTags.map((tag) => (
              <span key={tag} className="ks-tag">{tag}</span>
            ))}
          </div>
        )}

        <h3 className="ks-card-title">{article.title}</h3>

        <p className="ks-card-desc line-clamp-3">{stripHtml(article.summary)}</p>

        <span className="ks-card-meta">
          {article.sourceName || 'News'}{dateStr && ` · ${dateStr}`}
        </span>

        <span className="ks-card-link">Read</span>
      </div>
    </Link>
  );
}

// ── Skeleton card ─────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="ks-card animate-pulse" aria-hidden="true">
      <div className="ks-card-body">
        <div className="ks-card-head">
          <div className="h-5 w-10 rounded-[2px] bg-paper-gray" />
          <div className="h-5 w-10 rounded-[2px] bg-paper-gray" />
        </div>
        <div className="h-5 w-full rounded-[2px] bg-paper-gray" />
        <div className="h-5 w-4/5 rounded-[2px] bg-paper-gray" />
        <div className="h-3 w-full rounded-[2px] bg-paper-deep" />
        <div className="h-3 w-3/4 rounded-[2px] bg-paper-deep" />
      </div>
    </div>
  );
}

export function CurrentAffairsTeaser() {
  const { data: articles, isLoading } = useRecentCurrentAffairs(6);

  const displayArticles = articles?.slice(0, 3) ?? [];

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <section id="current-affairs" className="ks-section">
      <div className="ks-container">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div className="flex flex-col gap-4">
            <span className="eyebrow">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Daily Current Affairs · Free for Everyone
            </span>

            <h2 className="section-title">
              Stay updated.{' '}
              <span className="text-ink-muted">Stay ahead.</span>
            </h2>
            <p className="section-lead">
              AI-curated current affairs for UPSC, SSC &amp; State PSCs —
              GS paper tagged, with key facts and mains angles. Published every morning.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="chip font-label uppercase tracking-[0.08em] text-[11px]">
              <span className="eyebrow-dot" aria-hidden="true" />
              {todayLabel}
            </span>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {isLoading
            ? [1, 2, 3].map((i) => <CardSkeleton key={i} />)
            : displayArticles.length > 0
              ? displayArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))
              : (
                <div className="md:col-span-3 rounded-lg p-10 text-center bg-paper-deep border border-rule">
                  <p className="text-sm font-medium text-ink-muted">
                    Today&apos;s digest is being prepared — check back shortly after 6 AM IST.
                  </p>
                </div>
              )
          }
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <Link href="/current-affairs" className="btn-ink">
            View all articles
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/signup" className="ks-link text-sm font-medium">
            Sign up free for Mains angles, AI Mentor &amp; MCQs →
          </Link>
        </div>
      </div>
    </section>
  );
}

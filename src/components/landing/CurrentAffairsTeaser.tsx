'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays, ChevronRight } from 'lucide-react';
import { useRecentCurrentAffairs } from '@/features/current-affairs/hooks/use-current-affairs';
import type { CurrentAffairsArticle } from '@/types/features';
import { AmbientBlobs } from './AmbientBlobs';

// ── GS paper color map (for accent bars) ────────────────────────
const GS_COLOR: Record<string, string> = {
  GS1: '#7C3AED',
  GS2: '#0891B2',
  GS3: '#059669',
  GS4: '#DC2626',
};

const TEXT_DARK = '#1A1836';
const TEXT_MID = '#6B63A0';
const TEXT_GRAD_LT = {
  background: 'linear-gradient(135deg, #7C3AED, #C026D3)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent',
};
const BORDER_L = '1px solid rgba(124,58,237,0.12)';

function stripHtml(text: string): string {
  return text.includes('<') ? text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : text;
}

// ── Article card ────────────────────────────────────────────────
function ArticleCard({ article }: { article: CurrentAffairsArticle }) {
  const primaryGS = article.gsPaperTags[0];
  const accentColor = primaryGS ? (GS_COLOR[primaryGS] ?? '#7C3AED') : '#7C3AED';
  const dateStr = article.publishedDate
    ? new Date(article.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '';

  return (
    <Link
      href={`/current-affairs/${article.id}`}
      className="group rounded-2xl overflow-hidden flex flex-col h-full transition-shadow duration-500 ease-in-out hover:shadow-xl"
      style={{ background: '#FFFFFF', border: BORDER_L, boxShadow: '0 8px 28px rgba(124,58,237,0.08)' }}
    >
      {/* Accent bar */}
      <div className="h-0.75" style={{ background: accentColor }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {article.gsPaperTags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: `${GS_COLOR[tag] ?? '#7C3AED'}14`,
                color: GS_COLOR[tag] ?? '#7C3AED',
                border: `1px solid ${GS_COLOR[tag] ?? '#7C3AED'}33`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3
          className="text-[14px] font-semibold leading-snug mb-2 flex-1 group-hover:opacity-70 transition-opacity duration-500 ease-in-out"
          style={{ color: TEXT_DARK }}
        >
          {article.title}
        </h3>

        {/* Summary excerpt */}
        <p
          className="text-[12px] leading-relaxed line-clamp-3 mb-3"
          style={{ color: TEXT_MID }}
        >
          {stripHtml(article.summary)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: BORDER_L }}>
          <span className="text-[10px]" style={{ color: '#9CA3AF' }}>
            {article.sourceName || 'News'}{dateStr && ` · ${dateStr}`}
          </span>
          <span
            className="text-[10px] font-semibold flex items-center gap-0.5 group-hover:gap-1 transition-all duration-500 ease-in-out"
            style={{ color: '#7C3AED' }}
          >
            Read <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton card ─────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: '#FFFFFF', border: BORDER_L }}
    >
      <div className="h-[3px]" style={{ background: 'rgba(124,58,237,0.15)' }} />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-4 w-10 rounded-full" style={{ background: 'rgba(124,58,237,0.08)' }} />
          <div className="h-4 w-24 rounded-full" style={{ background: 'rgba(124,58,237,0.08)' }} />
        </div>
        <div className="h-5 w-full rounded" style={{ background: 'rgba(124,58,237,0.08)' }} />
        <div className="h-5 w-4/5 rounded" style={{ background: 'rgba(124,58,237,0.08)' }} />
        <div className="h-3 w-full rounded" style={{ background: 'rgba(124,58,237,0.06)' }} />
        <div className="h-3 w-3/4 rounded" style={{ background: 'rgba(124,58,237,0.06)' }} />
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
    <section
      id="current-affairs"
      className="relative overflow-hidden py-24"
      style={{ background: 'transparent' }}
    >
      <AmbientBlobs palette="sky" />

      <div className="relative max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-4"
              style={{
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.15)',
                color: '#7C3AED',
              }}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Daily Current Affairs · Free for Everyone
            </div>

            <h2
              className="font-bold tracking-tight"
              style={{ fontSize: '2.2rem', color: TEXT_DARK, lineHeight: 1.15 }}
            >
              Stay updated.{' '}
              <span style={TEXT_GRAD_LT}>Stay ahead.</span>
            </h2>
            <p
              className="mt-2"
              style={{ color: TEXT_MID, fontSize: '0.9rem', lineHeight: 1.75, maxWidth: 440 }}
            >
              AI-curated current affairs for UPSC, SSC &amp; State PSCs —
              GS paper tagged, with key facts and mains angles. Published every morning.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-[11px] font-semibold px-3 py-1.5 rounded-full"
              style={{ background: '#FFFFFF', color: TEXT_MID, border: BORDER_L }}
            >
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
                <div
                  className="md:col-span-3 rounded-2xl p-10 text-center"
                  style={{ background: '#F5F4FF', border: BORDER_L }}
                >
                  <p className="text-sm font-semibold" style={{ color: TEXT_MID }}>
                    Today&apos;s digest is being prepared — check back shortly after 6 AM IST.
                  </p>
                </div>
              )
          }
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/current-affairs"
            className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm text-white"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)',
              boxShadow: '0 6px 24px rgba(124,58,237,0.25)',
            }}
          >
            View all articles
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/signup"
            className="text-xs font-semibold hover:underline"
            style={{ color: TEXT_MID }}
          >
            Sign up free for Mains angles, AI Mentor &amp; MCQs →
          </Link>
        </div>
      </div>
    </section>
  );
}
